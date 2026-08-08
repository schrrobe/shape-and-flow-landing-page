import { createTransport, type Transporter } from 'nodemailer'
import { contact, site } from '#shared/site'
import { requestFrom, errorsFor, type ContactRequest } from '../utils/kontakt-eingaben'

/*
 * Accepts the contact form and sends the request to the studio mailbox over SMTP.
 *
 * The only server-side logic of the site. Deliberately without a database and without a
 * third-party API: the request is delivered and then forgotten, so there is no stored data for
 * which a retention period would have to be documented. The credentials come from the
 * environment, see runtimeConfig in nuxt.config.ts and docs/deploy.md.
 *
 * What counts as valid input lives next door in utils/kontakt-eingaben.ts. What stays here is
 * what cannot be had without a server: rate limiting, SMTP and the error responses.
 */

/*
 * One attempt per minute and at most five per hour per IP address.
 *
 * In process memory, not in Redis: a single instance runs behind the host nginx, and a restart
 * may well forget everything — the window is an hour, not a day. With several instances each
 * would count for itself, and then the limit belongs in the reverse proxy.
 */
const attempts = new Map<string, number[]>()
const WINDOW_MS = 60 * 60 * 1000
const MAX_PER_WINDOW = 5
const MIN_GAP_MS = 60 * 1000

function tooFast(ip: string, now: number): boolean {
  const recent = (attempts.get(ip) ?? []).filter(time => now - time < WINDOW_MS)

  // Otherwise the map grows with every IP that ever made a request. Cleaning up on access is
  // enough, because only entries inside the window matter at all.
  for (const [otherIp, times] of attempts) {
    if (times.every(time => now - time >= WINDOW_MS)) attempts.delete(otherIp)
  }

  const last = recent.at(-1)
  if (recent.length >= MAX_PER_WINDOW || (last !== undefined && now - last < MIN_GAP_MS)) {
    attempts.set(ip, recent)
    return true
  }

  attempts.set(ip, [...recent, now])
  return false
}

let transport: Transporter | null = null

export default defineEventHandler(async event => {
  const { smtp } = useRuntimeConfig(event)

  // Without credentials there is no silent failure: the form then says the email address is the
  // way to go. Otherwise the request would be gone and nobody would know.
  if (!smtp.host || !smtp.user || !smtp.password) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Mail delivery not configured',
      data: { reason: 'config' },
    })
  }

  const body = await readBody<Partial<ContactRequest>>(event)

  const request = requestFrom(body)

  // The bot gets a 200. An error message would be feedback a script can calibrate against, and
  // the message is not sent anyway.
  if (request.website) return { ok: true }

  const errors = errorsFor(request)

  if (Object.keys(errors).length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Incomplete input',
      data: { errors },
    })
  }

  if (tooFast(getRequestIP(event, { xForwardedFor: true }) ?? 'unknown', Date.now())) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many requests',
      data: { reason: 'rate' },
    })
  }

  transport ??= createTransport({
    host: smtp.host,
    port: smtp.port,
    // Port 465 speaks TLS from the first connection on, 587 and 25 upgrade via STARTTLS.
    secure: smtp.port === 465,
    auth: { user: smtp.user, pass: smtp.password },
  })

  const lines = [
    // The reply channel goes at the very top, because it is the first decision when reading: it
    // says which of the two lines below it is the address to reply to.
    `Antwort bitte: ${request.replyChannel === 'whatsapp' ? 'per WhatsApp' : 'per E-Mail'}`,
    `Name: ${request.name}`,
    `E-Mail: ${request.email}`,
    `Handy: ${request.mobile || 'keine Angabe'}`,
    `Behandlung: ${request.treatment || 'keine Angabe'}`,
    `Zeitfenster: ${request.timeSlot || 'keine Angabe'}`,
    '',
    request.message,
    '',
    `— gesendet über das Kontaktformular auf ${site.url}`,
  ]

  try {
    await transport.sendMail({
      // The sender is a dedicated address on our own domain and not the enquirer's: a foreign
      // sender address fails SPF and DMARC and lands in spam. The reply still goes to the right
      // place, that is what replyTo is for.
      //
      // The `|| smtp.user` is the fallback for when NUXT_SMTP_ABSENDER is set to an empty value
      // in the env file: without a From address no mail server accepts the message.
      //
      // `absender` and `empfaenger` keep their German names: Nitro derives the environment
      // variable from the key, see the note in runtimeConfig in nuxt.config.ts.
      from: { name: `${site.name} Kontaktformular`, address: smtp.absender || smtp.user },
      to: smtp.empfaenger || contact.email,
      replyTo: { name: request.name, address: request.email },
      subject: `Anfrage über die Website von ${request.name}`,
      text: lines.join('\n'),
    })
  } catch (cause) {
    // The reason belongs in the server log, not in the response: SMTP errors name host and user.
    console.error('[kontakt] SMTP delivery failed', cause)
    throw createError({
      statusCode: 502,
      statusMessage: 'Delivery failed',
      data: { reason: 'delivery' },
    })
  }

  return { ok: true }
})

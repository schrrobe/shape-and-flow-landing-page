/*
 * What arrives from the contact form: clean it, shape it, check it.
 *
 * Sits next to the route rather than inside it, because it is the part without an environment —
 * no SMTP, no request, no clock. What is here can be called as a function and therefore tested;
 * the route next door is then only delivery and error responses.
 *
 * The same rules exist a second time in the browser, in app/components/SfKontaktFormular.vue.
 * That is intentional: there they are the convenience, here they are the check. Whoever changes
 * a rule has to touch both places.
 */

/** Deliberately loose: the address is not checked for existence, only for shape. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i

/*
 * As loose as the email pattern: everything people sprinkle into a phone number when writing it
 * down may be in there; the only check is that enough digits remain afterwards. A real check on
 * area code and length would have to know country rules and would mostly reject valid numbers —
 * the number is read by a human before it is dialled anyway.
 */
const MOBILE_SEPARATORS = /[\s+\-/().]/g
const MOBILE_MIN_DIGITS = 6

export const LIMITS = {
  name: 80,
  email: 120,
  mobile: 30,
  treatment: 60,
  timeSlot: 200,
  message: 3000,
} as const

export type Field = keyof typeof LIMITS

/** The channels a reply can take. Anything else falls back to 'email'. */
export const REPLY_CHANNELS = ['email', 'whatsapp'] as const

export type ReplyChannel = (typeof REPLY_CHANNELS)[number]

export interface ContactRequest {
  name: string
  email: string
  mobile: string
  replyChannel: ReplyChannel
  treatment: string
  timeSlot: string
  message: string
  /** Honeypot: invisible to humans, so only bots fill it in. */
  website: string
}

export function text(value: unknown, field: Field): string {
  // Line breaks and control characters are stripped from anything that could later end up in a
  // mail header. The message body keeps its line breaks.
  const raw = typeof value === 'string' ? value : ''
  const cleaned = field === 'message' ? raw : raw.replace(/[\r\n\t]+/g, ' ')
  return cleaned.trim().slice(0, LIMITS[field])
}

/*
 * The reply channel does not go through `text`: it is not free input but a choice between two
 * known values. Anything not on the list becomes 'email' — the channel whose address has already
 * been validated, and therefore the value where nothing is lost.
 */
export function replyChannelFrom(value: unknown): ReplyChannel {
  return REPLY_CHANNELS.includes(value as ReplyChannel) ? (value as ReplyChannel) : 'email'
}

/**
 * True when, after removing spaces, brackets and separators, only digits are left and there are
 * enough of them. Letters fail this, „+49 (0)176 / 123-4567“ does not.
 */
export function mobileLooksValid(mobile: string): boolean {
  const digitsOnly = mobile.replace(MOBILE_SEPARATORS, '')
  return digitsOnly.length >= MOBILE_MIN_DIGITS && /^\d+$/.test(digitsOnly)
}

/** Builds the request the route works with from the raw request body. */
export function requestFrom(body: Partial<ContactRequest> | null | undefined): ContactRequest {
  return {
    name: text(body?.name, 'name'),
    email: text(body?.email, 'email'),
    mobile: text(body?.mobile, 'mobile'),
    replyChannel: replyChannelFrom(body?.replyChannel),
    treatment: text(body?.treatment, 'treatment'),
    timeSlot: text(body?.timeSlot, 'timeSlot'),
    message: text(body?.message, 'message'),
    // The honeypot shares the length limit with `name`: it has none of its own, because its
    // content never goes anywhere — the only check is whether there is anything in it at all.
    website: text(body?.website, 'name'),
  }
}

/**
 * The field errors for a request, as a mapping field name → message. Empty means: all good.
 * The messages are worded the way they appear below the field in the form.
 */
export function errorsFor(request: ContactRequest): Record<string, string> {
  const errors: Record<string, string> = {}

  if (request.name.length < 2) errors.name = 'Bitte einen Namen angeben.'
  if (!EMAIL_PATTERN.test(request.email))
    errors.email = 'Bitte eine gültige E-Mail-Adresse angeben.'

  /*
   * The number is optional as long as it is only an extra detail. Whoever picks WhatsApp as the
   * reply channel makes it the only way back — then it has to be there and look plausible. A
   * number that is given but nonsensical is flagged even when the reply goes by mail: accepting
   * it silently would mean writing it into the studio mail unchecked.
   */
  if (request.replyChannel === 'whatsapp' && !request.mobile) {
    errors.mobile = 'Für die Antwort per WhatsApp brauchen wir Ihre Handynummer.'
  } else if (request.mobile && !mobileLooksValid(request.mobile)) {
    errors.mobile = 'Bitte eine gültige Handynummer angeben.'
  }

  // No consent checkbox for the request itself: it rests on Art. 6(1)(b) resp. (f) GDPR. A
  // consent without which the form does nothing would not be freely given and therefore not a
  // consent. The choice of reply channel is the special case — there the consent holds, because
  // it can be declined and you still get an answer.
  if (request.message.length < 10) errors.message = 'Bitte mindestens 10 Zeichen schreiben.'

  return errors
}

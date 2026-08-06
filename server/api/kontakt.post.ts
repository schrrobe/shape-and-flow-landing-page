import { createTransport, type Transporter } from 'nodemailer'
import { kontakt, site } from '#shared/site'

/*
 * Nimmt das Kontaktformular an und schickt die Anfrage per SMTP an das Studio-Postfach.
 *
 * Die einzige serverseitige Logik der Website. Bewusst ohne Datenbank und ohne Drittanbieter-API:
 * die Anfrage wird zugestellt und danach vergessen, es gibt also keinen Datenbestand, für den
 * eine Löschfrist zu dokumentieren wäre. Die Zugangsdaten kommen aus der Umgebung, siehe
 * runtimeConfig in nuxt.config.ts und docs/deploy.md.
 */

/** Absichtlich locker: die Adresse wird nicht auf Existenz geprüft, nur auf Form. */
const EMAIL_MUSTER = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i

const GRENZEN = {
  name: 80,
  email: 120,
  behandlung: 60,
  zeitfenster: 200,
  nachricht: 3000,
} as const

type Feld = keyof typeof GRENZEN

interface Anfrage {
  name: string
  email: string
  behandlung: string
  zeitfenster: string
  nachricht: string
  einwilligung: boolean
  /** Honigtopf: für Menschen unsichtbar, deshalb füllen ihn nur Bots aus. */
  webseite: string
}

/*
 * Ein Versuch pro Minute und höchstens fünf pro Stunde je IP-Adresse.
 *
 * Im Prozessspeicher, nicht in Redis: es läuft eine Instanz hinter dem Host-nginx, und ein
 * Neustart darf ruhig alles vergessen — das Fenster ist eine Stunde, nicht ein Tag. Bei mehreren
 * Instanzen zählt jede für sich, dann gehört die Grenze in den Reverse Proxy.
 */
const versuche = new Map<string, number[]>()
const FENSTER_MS = 60 * 60 * 1000
const MAX_PRO_FENSTER = 5
const ABSTAND_MS = 60 * 1000

function zuSchnell(ip: string, jetzt: number): boolean {
  const bisher = (versuche.get(ip) ?? []).filter(zeit => jetzt - zeit < FENSTER_MS)

  // Die Map wächst sonst mit jeder IP, die je angefragt hat. Aufräumen beim Zugriff reicht,
  // weil nur Einträge im Fenster überhaupt eine Rolle spielen.
  for (const [andere, zeiten] of versuche) {
    if (zeiten.every(zeit => jetzt - zeit >= FENSTER_MS)) versuche.delete(andere)
  }

  const letzter = bisher.at(-1)
  if (bisher.length >= MAX_PRO_FENSTER || (letzter !== undefined && jetzt - letzter < ABSTAND_MS)) {
    versuche.set(ip, bisher)
    return true
  }

  versuche.set(ip, [...bisher, jetzt])
  return false
}

function text(wert: unknown, feld: Feld): string {
  // Zeilenumbrüche und Steuerzeichen fliegen aus allem, was später in einem Mail-Header landen
  // könnte. Der Nachrichtentext darf Umbrüche behalten.
  const roh = typeof wert === 'string' ? wert : ''
  const bereinigt = feld === 'nachricht' ? roh : roh.replace(/[\r\n\t]+/g, ' ')
  return bereinigt.trim().slice(0, GRENZEN[feld])
}

let transport: Transporter | null = null

export default defineEventHandler(async event => {
  const { smtp } = useRuntimeConfig(event)

  // Ohne Zugangsdaten gibt es keinen stillen Fehlschlag: das Formular sagt dann, dass die
  // E-Mail-Adresse der Weg ist. Sonst wäre die Anfrage weg und niemand wüsste es.
  if (!smtp.host || !smtp.user || !smtp.password) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Mailversand nicht konfiguriert',
      data: { grund: 'konfiguration' },
    })
  }

  const koerper = await readBody<Partial<Anfrage>>(event)

  const anfrage = {
    name: text(koerper?.name, 'name'),
    email: text(koerper?.email, 'email'),
    behandlung: text(koerper?.behandlung, 'behandlung'),
    zeitfenster: text(koerper?.zeitfenster, 'zeitfenster'),
    nachricht: text(koerper?.nachricht, 'nachricht'),
    einwilligung: koerper?.einwilligung === true,
    webseite: text(koerper?.webseite, 'name'),
  }

  // Der Bot bekommt eine 200. Eine Fehlermeldung wäre eine Rückmeldung, an der sich ein Skript
  // ausrichten kann, und die Nachricht wird ohnehin nicht verschickt.
  if (anfrage.webseite) return { ok: true }

  const fehler: Record<string, string> = {}
  if (anfrage.name.length < 2) fehler.name = 'Bitte einen Namen angeben.'
  if (!EMAIL_MUSTER.test(anfrage.email)) fehler.email = 'Bitte eine gültige E-Mail-Adresse angeben.'
  if (anfrage.nachricht.length < 10) fehler.nachricht = 'Bitte etwas mehr schreiben.'
  if (!anfrage.einwilligung) fehler.einwilligung = 'Ohne Einwilligung können wir nicht antworten.'

  if (Object.keys(fehler).length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Eingaben unvollständig',
      data: { fehler },
    })
  }

  if (zuSchnell(getRequestIP(event, { xForwardedFor: true }) ?? 'unbekannt', Date.now())) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Zu viele Anfragen',
      data: { grund: 'frequenz' },
    })
  }

  transport ??= createTransport({
    host: smtp.host,
    port: smtp.port,
    // Port 465 spricht TLS von der ersten Verbindung an, 587 und 25 steigen per STARTTLS um.
    secure: smtp.port === 465,
    auth: { user: smtp.user, pass: smtp.password },
  })

  const zeilen = [
    `Name: ${anfrage.name}`,
    `E-Mail: ${anfrage.email}`,
    `Behandlung: ${anfrage.behandlung || 'keine Angabe'}`,
    `Zeitfenster: ${anfrage.zeitfenster || 'keine Angabe'}`,
    '',
    anfrage.nachricht,
    '',
    `— gesendet über das Kontaktformular auf ${site.url}`,
  ]

  try {
    await transport.sendMail({
      // Der Absender ist das eigene Postfach, nicht die Adresse der Anfragenden: eine fremde
      // Absenderadresse fällt bei SPF und DMARC durch und landet im Spam. Die Antwort geht
      // trotzdem an die richtige Stelle, dafür ist replyTo da.
      from: { name: `${site.name} Kontaktformular`, address: smtp.absender || smtp.user },
      to: smtp.empfaenger || kontakt.email,
      replyTo: { name: anfrage.name, address: anfrage.email },
      subject: `Anfrage über die Website von ${anfrage.name}`,
      text: zeilen.join('\n'),
    })
  } catch (ursache) {
    // Der Grund gehört ins Serverlog, nicht in die Antwort: SMTP-Fehler nennen Host und
    // Benutzernamen.
    console.error('[kontakt] SMTP-Versand fehlgeschlagen', ursache)
    throw createError({
      statusCode: 502,
      statusMessage: 'Versand fehlgeschlagen',
      data: { grund: 'versand' },
    })
  }

  return { ok: true }
})

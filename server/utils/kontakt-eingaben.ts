/*
 * Was aus dem Kontaktformular ankommt: säubern, in Form bringen, prüfen.
 *
 * Steht neben der Route und nicht in ihr, weil es der Teil ohne Umgebung ist — kein SMTP, kein
 * Request, keine Uhr. Was hier steht, lässt sich als Funktion aufrufen und damit auch prüfen;
 * die Route daneben besteht danach nur noch aus Zustellung und Fehlerantworten.
 *
 * Dieselben Regeln stehen ein zweites Mal im Browser, in app/components/SfKontaktFormular.vue.
 * Das ist Absicht: dort sind sie die Bequemlichkeit, hier sind sie die Prüfung. Wer eine Regel
 * ändert, muss beide Stellen anfassen.
 */

/** Absichtlich locker: die Adresse wird nicht auf Existenz geprüft, nur auf Form. */
const EMAIL_MUSTER = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i

/*
 * Ebenso locker wie beim E-Mail-Muster: alles, was Menschen beim Aufschreiben einer Rufnummer
 * einstreuen, darf drin stehen; geprüft wird nur, dass danach genug Ziffern übrig bleiben. Eine
 * echte Prüfung auf Vorwahl und Länge müsste Länderregeln kennen und würde vor allem gültige
 * Nummern abweisen — die Nummer wird ohnehin von einem Menschen gelesen, bevor sie gewählt wird.
 */
const HANDY_ZIERRAT = /[\s+\-/().]/g
const HANDY_MIN_ZIFFERN = 6

export const GRENZEN = {
  name: 80,
  email: 120,
  handy: 30,
  behandlung: 60,
  zeitfenster: 200,
  nachricht: 3000,
} as const

export type Feld = keyof typeof GRENZEN

/** Die Wege, auf denen geantwortet werden kann. Alles andere fällt auf 'email' zurück. */
export const ANTWORTWEGE = ['email', 'whatsapp'] as const

export type Antwortweg = (typeof ANTWORTWEGE)[number]

export interface Anfrage {
  name: string
  email: string
  handy: string
  antwortweg: Antwortweg
  behandlung: string
  zeitfenster: string
  nachricht: string
  /** Honigtopf: für Menschen unsichtbar, deshalb füllen ihn nur Bots aus. */
  webseite: string
}

export function text(wert: unknown, feld: Feld): string {
  // Zeilenumbrüche und Steuerzeichen fliegen aus allem, was später in einem Mail-Header landen
  // könnte. Der Nachrichtentext darf Umbrüche behalten.
  const roh = typeof wert === 'string' ? wert : ''
  const bereinigt = feld === 'nachricht' ? roh : roh.replace(/[\r\n\t]+/g, ' ')
  return bereinigt.trim().slice(0, GRENZEN[feld])
}

/*
 * Der Antwortweg geht nicht durch `text`: er ist keine Eingabe, sondern eine Wahl aus zwei
 * bekannten Werten. Was nicht in der Liste steht, wird zu 'email' — dem Weg, für den die
 * Adresse ohnehin schon geprüft ist, und damit dem Wert, bei dem nichts verloren geht.
 */
export function antwortwegVon(wert: unknown): Antwortweg {
  return ANTWORTWEGE.includes(wert as Antwortweg) ? (wert as Antwortweg) : 'email'
}

/**
 * Wahr, wenn nach Abzug von Leerzeichen, Klammern und Trennzeichen nur noch Ziffern übrig sind
 * und es genug davon gibt. Buchstaben fallen damit durch, „+49 (0)176 / 123-4567“ nicht.
 */
export function handyPlausibel(handy: string): boolean {
  const nurZiffern = handy.replace(HANDY_ZIERRAT, '')
  return nurZiffern.length >= HANDY_MIN_ZIFFERN && /^\d+$/.test(nurZiffern)
}

/** Baut aus dem rohen Anfragekörper die Anfrage, mit der die Route weiterarbeitet. */
export function anfrageAus(koerper: Partial<Anfrage> | null | undefined): Anfrage {
  return {
    name: text(koerper?.name, 'name'),
    email: text(koerper?.email, 'email'),
    handy: text(koerper?.handy, 'handy'),
    antwortweg: antwortwegVon(koerper?.antwortweg),
    behandlung: text(koerper?.behandlung, 'behandlung'),
    zeitfenster: text(koerper?.zeitfenster, 'zeitfenster'),
    nachricht: text(koerper?.nachricht, 'nachricht'),
    // Der Honigtopf teilt sich die Längengrenze mit `name`: er hat keine eigene, weil sein Inhalt
    // nie irgendwo landet — geprüft wird nur, ob überhaupt etwas drinsteht.
    webseite: text(koerper?.webseite, 'name'),
  }
}

/**
 * Die Feldfehler zu einer Anfrage, als Zuordnung Feldname → Meldung. Leer heißt: in Ordnung.
 * Die Meldungen stehen so, wie sie im Formular unter dem Feld erscheinen.
 */
export function fehlerZu(anfrage: Anfrage): Record<string, string> {
  const fehler: Record<string, string> = {}

  if (anfrage.name.length < 2) fehler.name = 'Bitte einen Namen angeben.'
  if (!EMAIL_MUSTER.test(anfrage.email)) fehler.email = 'Bitte eine gültige E-Mail-Adresse angeben.'

  /*
   * Die Nummer ist freiwillig, solange sie nur eine zusätzliche Angabe ist. Wer die Antwort per
   * WhatsApp wählt, macht sie zum einzigen Rückweg — dann muss sie da sein und plausibel
   * aussehen. Eine angegebene, aber unsinnige Nummer wird auch bei Antwort per Mail beanstandet:
   * sie stumm zu übernehmen hieße, sie ungeprüft in die Studiomail zu schreiben.
   */
  if (anfrage.antwortweg === 'whatsapp' && !anfrage.handy) {
    fehler.handy = 'Für die Antwort per WhatsApp brauchen wir Ihre Handynummer.'
  } else if (anfrage.handy && !handyPlausibel(anfrage.handy)) {
    fehler.handy = 'Bitte eine gültige Handynummer angeben.'
  }

  // Kein Einwilligungsfeld für die Anfrage selbst: sie steht auf Art. 6 Abs. 1 lit. b bzw. f
  // DSGVO. Eine Einwilligung, ohne die das Formular nichts tut, wäre nicht freiwillig und damit
  // keine. Die Wahl des Antwortwegs ist der Sonderfall — dort trägt die Einwilligung, weil man
  // sie abwählen kann und trotzdem eine Antwort bekommt.
  if (anfrage.nachricht.length < 10) fehler.nachricht = 'Bitte etwas mehr schreiben.'

  return fehler
}

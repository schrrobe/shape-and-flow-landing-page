/*
 * Every business fact the site states, in one place.
 *
 * The pages read from here and so does the structured data, which is the point: an address that
 * appears in the footer, on the contact page and in the LocalBusiness JSON-LD is one set of
 * strings, not three that can drift apart.
 *
 * Values marked TODO are placeholders and must be replaced before launch — see
 * docs/launch-checklist.md. Grep for "TODO" to find them all.
 */

export const site = {
  name: 'Shape & Flow',
  /** Used where the ampersand would need escaping or reads badly, e.g. in URLs and alt text. */
  nameAscii: 'Shape and Flow',
  /**
   * Die Inhaberin. Steht dreimal auf der Website — im Impressum als Inhaberin und als
   * Verantwortliche für den Inhalt, in der Datenschutzerklärung als verantwortliche Stelle. Das
   * DDG und die DSGVO verlangen an diesen Stellen denselben Namen; deshalb einer statt drei.
   */
  inhaberin: 'Karin Pospelov',
  tagline: 'Brasilianische Lymphdrainage in Dortmund',
  url: 'https://shapeandflow.de',
} as const

export const adresse = {
  strasse: 'Preinstraße 61',
  plz: '44265',
  ort: 'Dortmund',
  land: 'DE',
  /** Dortmund-Wellinghofen/Hacheney, im Süden der Stadt — für Ortsbezug in Texten. */
  stadtteil: 'Dortmund-Süd',
} as const

/*
 * Bewusst ohne Telefon- und WhatsApp-Nummer: der Kontakt läuft über E-Mail und das
 * Kontaktformular. § 5 DDG verlangt eine schnelle elektronische Kontaktaufnahme, keine
 * Rufnummer (EuGH C-298/07), und ein wa.me-Link würde Daten an WhatsApp Ireland tragen,
 * bevor jemand eine Nachricht abschickt.
 */
export const kontakt = {
  /**
   * Die Adresse, die auf der Website steht — Impressum, Datenschutzerklärung, Footer, mailto-Link
   * und Structured Data — und in der die Anfragen aus dem Kontaktformular landen.
   */
  email: 'hallo@shapeandflow.de',
  /**
   * Absender der Formularmails, nicht für Antworten gedacht: die Antwort geht über Reply-To an
   * die anfragende Person, nicht an dieses Postfach.
   *
   * Eine eigene Adresse und nicht `email`, damit im Postfach auf einen Blick zu sehen ist, was
   * vom eigenen Server kommt und was jemand von Hand geschrieben hat. Sie steht nirgends auf der
   * Website — wer sie anschreibt, hat sie aus einem Mail-Header.
   */
  absenderEmail: 'nicht-antworten@shapeandflow.de',
  /** Adresse der Booking-App. Alle Termin-Schaltflächen zeigen hierher. */
  buchungUrl: 'https://booking.shapeandflow.de',
  /*
   * The social profiles. Without the share parameters the apps append (?igsh=, ?_r=, ?_t=):
   * those belong to the session the link was copied from and have no place in a fixed link.
   *
   * Either can be set to null, which removes it everywhere at once — see sozialeProfile below.
   */
  instagram: 'https://www.instagram.com/shapeandflow.do' as string | null,
  tiktok: 'https://www.tiktok.com/@shapeandflow.do' as string | null,
} as const

/** One social profile as the site renders it. `icon` is the symbol name in SfIcon. */
export interface SozialesProfil {
  name: string
  icon: 'instagram' | 'tiktok'
  url: string
}

/*
 * The profiles that are actually set, in the order they should appear.
 *
 * One list for all three places that name them: the footer, the link tree under /linktree and
 * the sameAs entry in the structured data. Without it, adding a profile would mean touching
 * three files and forgetting one of them.
 */
export const sozialeProfile: SozialesProfil[] = (
  [
    { name: 'Instagram', icon: 'instagram', url: kontakt.instagram },
    { name: 'TikTok', icon: 'tiktok', url: kontakt.tiktok },
  ] satisfies { name: string; icon: SozialesProfil['icon']; url: string | null }[]
).filter((profil): profil is SozialesProfil => profil.url !== null)

/**
 * Keine erfundenen Öffnungszeiten: das Studio arbeitet auf Termin, und das ist auch die
 * Aussage, die in der Website und im Structured Data steht.
 */
export const oeffnungszeiten = {
  modus: 'termin' as const,
  hinweis: 'Termine nach Vereinbarung',
}

export const mailtoUrl = `mailto:${kontakt.email}`

/** Sprungziel des Kontaktformulars. Steht hier, weil vier Seiten darauf verlinken. */
export const formularUrl = '/kontakt#formular'

/** Google-Maps-Suchlink statt Karten-Embed: kein Drittanbieter-Skript, keine Einwilligung nötig. */
export const kartenUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${adresse.strasse}, ${adresse.plz} ${adresse.ort}`,
)}`

/** Der Lizenzhinweis, der auf jeder Seite mit Markennennung stehen muss. */
export const markenhinweis =
  'Jeveauxeffect® und Jeveauxeffect Face® sind eingetragene Marken der Jeveaux Company®. ' +
  'Shape & Flow ist lizenzierter Partner der Jeveaux Company®.'

/**
 * Der Pflicht-Disclaimer aus den Unterlagen des Lizenzgebers. Steht auf jeder Seite, die eine
 * Wirkung beschreibt — inhaltlich verlangt vom Heilmittelwerbegesetz, nicht nur vom Lizenzvertrag.
 */
export const disclaimer =
  'Der Jeveauxeffect® ist eine ästhetische Anwendung im Beauty-Bereich und keine medizinische ' +
  'oder therapeutische Behandlung. Er ersetzt keine ärztliche Maßnahme. Es werden keine ' +
  'Heilversprechen abgegeben. Die beschriebenen Effekte beruhen auf subjektiven Wahrnehmungen; ' +
  'individuelle Ergebnisse können abweichen.'

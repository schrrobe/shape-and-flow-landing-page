/*
 * Die Ratgeberartikel.
 *
 * Als Liste, damit Übersichtsseite, Fußzeile und llms.txt dieselbe Reihenfolge und dieselben Titel
 * verwenden. Ein neuer Artikel braucht einen Eintrag hier und eine Datei unter app/pages/ratgeber/.
 */

export interface Artikel {
  titel: string
  /** Ein Satz für die Übersicht. */
  anriss: string
  route: string
}

export const ratgeber: Artikel[] = [
  {
    titel: 'Wassereinlagerungen: Ursachen und was hilft',
    anriss:
      'Warum sich Flüssigkeit im Gewebe sammelt, was im Alltag dagegen hilft und wann eine '
      + 'Schwellung ärztlich abgeklärt werden sollte.',
    route: '/ratgeber/wassereinlagerungen',
  },
  {
    titel: 'Brasilianische oder medizinische Lymphdrainage?',
    anriss:
      'Ziel, Druck, Verordnung und Kosten im Vergleich. Der Unterschied entscheidet, wo Sie einen '
      + 'Termin brauchen.',
    route: '/ratgeber/brasilianische-vs-medizinische-lymphdrainage',
  },
]

/**
 * Der Eintrag zu einer Route. Damit ein Artikel seinen eigenen Titel von hier liest, statt ihn
 * für Überschrift, Seitentitel und Structured Data drei Mal zu wiederholen.
 */
export function artikelByRoute(route: string): Artikel | undefined {
  return ratgeber.find(a => a.route === route)
}

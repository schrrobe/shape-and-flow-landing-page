/*
 * Die Behandlungen mit Preis und Zielseite.
 *
 * Speist die Teaser auf der Startseite, die Preistabelle, die Navigation und das
 * Service-/Offer-Structured-Data. Eine Behandlung hier ergänzen heißt: sie erscheint überall.
 */

export interface Behandlung {
  slug: string
  /** Markenname mit ®, so wie er rechtlich geschrieben werden muss. */
  name: string
  /** Beschreibender Titel ohne Marke — für Überschriften und Suchmaschinen. */
  titel: string
  /** Ein Satz für Teaser und Structured Data. */
  kurz: string
  preisEuro: number
  /** TODO: Behandlungsdauer in Minuten eintragen; null blendet die Angabe aus. */
  dauerMinuten: number | null
  route: string
}

export const behandlungen: Behandlung[] = [
  {
    slug: 'jeveauxeffect',
    name: 'Jeveauxeffect®',
    titel: 'Brasilianische Lymphdrainage für den Körper',
    kurz:
      'Ästhetische Ganzkörperbehandlung, die Lymphdrainage, Faszienarbeit und Körpermodellierung '
      + 'in einem festen Ablauf verbindet.',
    preisEuro: 150,
    dauerMinuten: null,
    route: '/jeveauxeffect',
  },
  {
    slug: 'lymphdrainage-gesicht',
    name: 'Jeveauxeffect Face®',
    titel: 'Brasilianische Lymphdrainage für das Gesicht',
    kurz:
      'Gesichtsbehandlung mit Fokus auf Entstauung, klarere Konturen und ein frisches, '
      + 'waches Aussehen.',
    preisEuro: 50,
    dauerMinuten: null,
    route: '/lymphdrainage-gesicht',
  },
]

export function behandlungBySlug(slug: string): Behandlung | undefined {
  return behandlungen.find(b => b.slug === slug)
}

/**
 * Die Preisspanne für das LocalBusiness-Structured-Data, im Format "50 - 150 EUR".
 *
 * Abgeleitet und nicht getippt: sonst steht in der Konfiguration eine Spanne, die nach der
 * nächsten Preisänderung hier nicht mehr stimmt.
 */
export const preisSpanne
  = `${Math.min(...behandlungen.map(b => b.preisEuro))} - `
    + `${Math.max(...behandlungen.map(b => b.preisEuro))} EUR`

/** Formatiert einen Preis deutsch: 150 → "150 €". Ganze Beträge ohne Nachkommastellen. */
export function preis(euro: number): string {
  return `${euro.toLocaleString('de-DE')} €`
}

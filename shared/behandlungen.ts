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
      'Ästhetische Ganzkörperbehandlung, die Lymphdrainage, Faszienarbeit und Körpermodellierung ' +
      'in einem festen Ablauf verbindet.',
    preisEuro: 150,
    dauerMinuten: null,
    route: '/jeveauxeffect',
  },
  {
    slug: 'lymphdrainage-gesicht',
    name: 'Jeveauxeffect Face®',
    titel: 'Brasilianische Lymphdrainage für das Gesicht',
    kurz:
      'Gesichtsbehandlung mit Fokus auf Entstauung, klarere Konturen und ein frisches, ' +
      'waches Aussehen.',
    preisEuro: 65,
    dauerMinuten: null,
    route: '/lymphdrainage-gesicht',
  },
]

export function behandlungBySlug(slug: string): Behandlung | undefined {
  return behandlungen.find(b => b.slug === slug)
}

export interface Preisposition {
  slug: string
  /** Name der Position, wie er in der Preistabelle steht. */
  name: string
  /** Ein Satz darunter: was in der Position enthalten ist. */
  hinweis: string
  preisEuro: number
}

/**
 * Kombitermin und Paketpreise.
 *
 * Bewusst getrennt von den Behandlungen: es sind andere Preise für dieselben zwei Behandlungen
 * und deshalb keine eigenen Seiten. Sie erscheinen in der Preistabelle und im Structured Data,
 * der Kombitermin zusätzlich auf der Startseite und in der Navigation. Paketpreise gelten pro
 * Behandlung.
 */
export const preispositionen: Preisposition[] = [
  {
    slug: 'kombi-koerper-gesicht',
    name: 'Jeveauxeffect® und Jeveauxeffect Face®',
    hinweis: 'Körper- und Gesichtsbehandlung zusammen in einem Termin',
    preisEuro: 215,
  },
  {
    slug: 'jeveauxeffect-5er',
    name: 'Jeveauxeffect® 5er Paket',
    hinweis: 'Preis pro Körperbehandlung bei fünf Terminen',
    preisEuro: 130,
  },
  {
    slug: 'jeveauxeffect-10er',
    name: 'Jeveauxeffect® 10er Paket',
    hinweis: 'Preis pro Körperbehandlung bei zehn Terminen',
    preisEuro: 120,
  },
  {
    slug: 'jeveauxeffect-face-5er',
    name: 'Jeveauxeffect Face® 5er Paket',
    hinweis: 'Preis pro Gesichtsbehandlung bei fünf Terminen',
    preisEuro: 59,
  },
  {
    slug: 'jeveauxeffect-face-10er',
    name: 'Jeveauxeffect Face® 10er Paket',
    hinweis: 'Preis pro Gesichtsbehandlung bei zehn Terminen',
    preisEuro: 45,
  },
]

/**
 * Der Kombitermin, der auch außerhalb der Preistabelle auftaucht.
 *
 * Als eigene Konstante, damit Startseite, Navigation und Kontaktformular nicht jede für sich in
 * der Liste suchen — und der Anker der Preistabelle nur an einer Stelle steht.
 */
export const kombitermin = preispositionen.find(p => p.slug === 'kombi-koerper-gesicht')!

/** Anker auf der Preisseite, an dem die Kombi- und Paketpreise stehen. */
export const kombiAnker = '/preise#kombitermin'

/** Alle Preise auf der Seite, Einzelbehandlungen und Pakete. */
const allePreise = [...behandlungen.map(b => b.preisEuro), ...preispositionen.map(p => p.preisEuro)]

/**
 * Die Preisspanne für das LocalBusiness-Structured-Data, im Format "45 - 215 EUR".
 *
 * Abgeleitet und nicht getippt: sonst steht in der Konfiguration eine Spanne, die nach der
 * nächsten Preisänderung hier nicht mehr stimmt.
 */
export const preisSpanne = `${Math.min(...allePreise)} - ${Math.max(...allePreise)} EUR`

/** Formatiert einen Preis deutsch: 150 → "150 €". Ganze Beträge ohne Nachkommastellen. */
export function preis(euro: number): string {
  return `${euro.toLocaleString('de-DE')} €`
}

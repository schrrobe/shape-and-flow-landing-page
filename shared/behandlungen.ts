/*
 * The treatments with price and target page.
 *
 * Feeds the teasers on the home page, the price table, the navigation and the Service/Offer
 * structured data. Adding a treatment here means: it shows up everywhere.
 */

export interface Treatment {
  slug: string
  /** Brand name with ®, spelled the way it legally has to be. */
  name: string
  /** Descriptive title without the brand — for headings and search engines. */
  title: string
  /** One sentence for teasers and structured data. */
  summary: string
  priceEuro: number
  /** TODO: fill in the treatment duration in minutes; null hides the figure. */
  durationMinutes: number | null
  route: string
}

export const treatments: Treatment[] = [
  {
    slug: 'jeveauxeffect',
    name: 'Jeveauxeffect®',
    title: 'Brasilianische Lymphdrainage für den Körper',
    summary:
      'Ästhetische Ganzkörperbehandlung, die Lymphdrainage, Faszienarbeit und Körpermodellierung ' +
      'in einem festen Ablauf verbindet.',
    priceEuro: 150,
    durationMinutes: null,
    route: '/jeveauxeffect',
  },
  {
    slug: 'lymphdrainage-gesicht',
    name: 'Jeveauxeffect Face®',
    title: 'Brasilianische Lymphdrainage für das Gesicht',
    summary:
      'Gesichtsbehandlung mit Fokus auf Entstauung, klarere Konturen und ein frisches, ' +
      'waches Aussehen.',
    priceEuro: 65,
    durationMinutes: null,
    route: '/lymphdrainage-gesicht',
  },
]

export function treatmentBySlug(slug: string): Treatment | undefined {
  return treatments.find(t => t.slug === slug)
}

export interface PriceItem {
  slug: string
  /** Name of the item as it appears in the price table. */
  name: string
  /** One sentence below it: what the item covers. */
  note: string
  priceEuro: number
}

/**
 * Combo appointment and package prices.
 *
 * Deliberately kept apart from the treatments: they are different prices for the same two
 * treatments and therefore have no pages of their own. They appear in the price table and in the
 * structured data, the combo appointment additionally on the home page and in the navigation.
 * Package prices are per treatment.
 */
export const priceItems: PriceItem[] = [
  {
    slug: 'kombi-koerper-gesicht',
    name: 'Jeveauxeffect® und Jeveauxeffect Face®',
    note: 'Körper- und Gesichtsbehandlung zusammen in einem Termin',
    priceEuro: 215,
  },
  {
    slug: 'jeveauxeffect-5er',
    name: 'Jeveauxeffect® 5er Paket',
    note: 'Preis pro Körperbehandlung bei fünf Terminen',
    priceEuro: 130,
  },
  {
    slug: 'jeveauxeffect-10er',
    name: 'Jeveauxeffect® 10er Paket',
    note: 'Preis pro Körperbehandlung bei zehn Terminen',
    priceEuro: 120,
  },
  {
    slug: 'jeveauxeffect-face-5er',
    name: 'Jeveauxeffect Face® 5er Paket',
    note: 'Preis pro Gesichtsbehandlung bei fünf Terminen',
    priceEuro: 59,
  },
  {
    slug: 'jeveauxeffect-face-10er',
    name: 'Jeveauxeffect Face® 10er Paket',
    note: 'Preis pro Gesichtsbehandlung bei zehn Terminen',
    priceEuro: 45,
  },
]

export function priceItemBySlug(slug: string): PriceItem | undefined {
  return priceItems.find(p => p.slug === slug)
}

/**
 * The combo appointment, which also shows up outside the price table.
 *
 * As its own constant so that home page, navigation and contact form do not each search the list
 * for themselves — and so the price table's anchor is written down in one place only.
 */
export const comboAppointment = priceItems.find(p => p.slug === 'kombi-koerper-gesicht')!

/** Anchor on the price page where the combo and package prices sit. */
export const comboAnchor = '/preise#kombitermin'

/** Every price on the site, single treatments and packages. */
const allPrices = [...treatments.map(t => t.priceEuro), ...priceItems.map(p => p.priceEuro)]

/**
 * The price range for the LocalBusiness structured data, formatted as "45 - 215 EUR".
 *
 * Derived rather than typed out: otherwise the configuration would state a range that no longer
 * holds after the next price change here.
 */
export const priceRange = `${Math.min(...allPrices)} - ${Math.max(...allPrices)} EUR`

/** Formats a price the German way: 150 → "150 €". Whole amounts without decimals. */
export function formatPrice(euro: number): string {
  return `${euro.toLocaleString('de-DE')} €`
}

import type { Treatment } from '#shared/behandlungen'
import type { FaqEntry } from '#shared/faq'
import { faqAnswerText } from '#shared/faq'
import { address, site } from '#shared/site'

/*
 * Everything every page needs in the way of metadata, in one call.
 *
 * Without this there would be four blocks of boilerplate on twelve pages, and on the thirteenth
 * one of them would be missing. Title and description travel into <title>, the meta description,
 * the Open Graph tags and the preview image at the same time, so all four always say the same.
 */

export interface PageOptions {
  /** The title for the browser bar and the search results, without the company name at the end. */
  title: string
  /**
   * The last step of the breadcrumb trail. Must match SfSeitenkopf's `title` word for word:
   * Google requires the marked-up trail to be the same as the visible one. Without it, `ogTitle`
   * is used, which on most pages is already the short version.
   */
  shortTitle?: string
  /**
   * The meta description. Google measures it in pixels, not characters: around 150 characters
   * fit, fewer with wide words and prices. The limit is enforced by test/meta-laenge.spec.ts,
   * which re-measures the built line in Arial 14px — the font of the search result.
   */
  description: string
  /**
   * The intermediate steps of the breadcrumb trail, i.e. without the home page and without the
   * current page. The function sets both itself.
   */
  trail?: { name: string; url: string }[]
  /** The label in the preview image. Without it, the company name appears there. */
  ogLabel?: string
  /** Shorter version of the title for the preview image, when the real title is too long there. */
  ogTitle?: string
}

export function usePage(options: PageOptions) {
  const route = useRoute()

  useSeoMeta({
    title: options.title,
    description: options.description,
    ogTitle: `${options.title} | ${site.name}`,
    ogDescription: options.description,
    ogType: 'website',
    ogSiteName: site.name,
    ogLocale: 'de_DE',
    twitterCard: 'summary_large_image',
  })

  defineOgImageComponent('SfOg', {
    title: options.ogTitle ?? options.title,
    description: options.description,
    eyebrow: options.ogLabel ?? site.nameAscii,
  })

  // The home page needs no breadcrumb trail that only points at itself.
  if (route.path !== '/') {
    useSchemaOrg([
      defineBreadcrumb({
        itemListElement: [
          { name: 'Startseite', item: '/' },
          ...(options.trail ?? []).map(step => ({ name: step.name, item: step.url })),
          { name: options.shortTitle ?? options.ogTitle ?? options.title },
        ],
      }),
    ])
  }

  return { route }
}

/**
 * The questions of a page as FAQ structured data.
 *
 * The page itself has to be marked up as a FAQPage, otherwise nuxt-schema-org attaches the
 * questions nowhere: it only links a Question to the page when its WebPage carries the FAQPage
 * type — and it sets that on its own only under /faq. Without this line a sub-page would end up
 * with Question nodes in the JSON-LD that nothing points to.
 */
export function useFaqSchema(entries: FaqEntry[]) {
  useSchemaOrg([
    defineWebPage({ '@type': 'FAQPage' }),
    ...entries.map(entry =>
      defineQuestion({
        name: entry.question,
        acceptedAnswer: faqAnswerText(entry),
      }),
    ),
  ])
}

/**
 * The place suffix every page title needs so local search picks it up. As a function, so that
 * "Dortmund" only lives in shared/site.ts.
 */
export function withCity(title: string): string {
  return `${title} ${address.city}`
}

/**
 * The Service structured data of a treatment, including its price.
 *
 * The price belongs in the offer here and not only in the visible text: only then can Google
 * show it in the search result, and only then do AI agents read it reliably.
 */
export function useTreatmentSchema(treatment: Treatment) {
  useSchemaOrg([
    defineService({
      name: treatment.name,
      description: treatment.summary,
      serviceType: treatment.title,
      category: 'Beauty',
      areaServed: address.city,
      offers: {
        price: treatment.priceEuro,
        priceCurrency: 'EUR',
        availability: 'https://schema.org/InStock',
      },
    }),
  ])
}

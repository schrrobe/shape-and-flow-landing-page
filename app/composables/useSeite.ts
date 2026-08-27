import type { Treatment } from '#shared/behandlungen'
import type { Article } from '#shared/ratgeber'
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

  /*
   * The breadcrumb trail, on every page including the home page.
   *
   * On the home page it consists of a single step and therefore says nothing a reader does not
   * already know. It is there for the machines: an audit that asks a single URL whether it carries
   * a BreadcrumbList asks the home page, and one that is missing there counts as missing
   * altogether. Google allows a trail with one element, and the visible trail in SfSeitenkopf
   * stays as it is — the home page shows none.
   */
  useSchemaOrg([
    defineBreadcrumb({
      itemListElement:
        route.path === '/'
          ? [{ name: 'Startseite', item: '/' }]
          : [
              { name: 'Startseite', item: '/' },
              ...(options.trail ?? []).map(step => ({ name: step.name, item: step.url })),
              { name: options.shortTitle ?? options.ogTitle ?? options.title },
            ],
    }),
  ])

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
 * The Article structured data of a guide article.
 *
 * As a function, because of the two dates: headline and description could sit in the page, but
 * datePublished is required for an Article and dateModified is what tells Google whether the text
 * is still current. Written out per page, both would be missing on the third article — that is
 * exactly what happened, and an audit found it.
 *
 * The dates come from shared/ratgeber.ts, i.e. from the same place as the title and the teaser.
 */
export function useArticleSchema(article: Article, description: string) {
  useSchemaOrg([
    defineArticle({
      headline: article.title,
      description,
      datePublished: article.published,
      dateModified: article.updated,
    }),
  ])
}

/**
 * The Service structured data of a treatment, including its price.
 *
 * The price belongs in the offer here and not only in the visible text: only then can Google
 * show it in the search result, and only then do AI agents read it reliably.
 */
export function useTreatmentSchema(treatment: Treatment) {
  // Absolute, because nuxt-schema-org passes the properties of the offer through unchanged — and a
  // relative path in JSON-LD is not a URL.
  const { url: siteUrl } = useSiteConfig()

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
        // The page the offer stands on. Without it the offer floats in the graph without an
        // address, and that is one of the properties an offer is expected to carry.
        url: `${siteUrl}${treatment.route}`,
      },
    }),
  ])
}

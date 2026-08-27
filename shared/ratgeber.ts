/*
 * The guide articles.
 *
 * As a list, so the overview page, the footer and llms.txt use the same order and the same
 * titles. A new article needs an entry here and a file under app/pages/ratgeber/.
 */

export interface Article {
  title: string
  /** One sentence for the overview. */
  teaser: string
  route: string
  /*
   * Day of publication and day of the last substantive change, both as ISO 8601 dates.
   *
   * They belong to the article and not to the page, because Google requires datePublished for an
   * Article and reads dateModified as the answer to whether the text is still current. Written by
   * hand and deliberately not derived from the file date: the build container has no Git history,
   * and a reformatting would otherwise pass as a new version of the content.
   *
   * `updated` is bumped when the statements change, not when a typo is fixed.
   */
  published: string
  updated: string
}

export const articles: Article[] = [
  {
    title: 'Wassereinlagerungen: Ursachen und was hilft',
    teaser:
      'Warum sich Flüssigkeit im Gewebe sammelt, was im Alltag dagegen hilft und wann eine ' +
      'Schwellung ärztlich abgeklärt werden sollte.',
    route: '/ratgeber/wassereinlagerungen',
    published: '2026-08-05',
    updated: '2026-08-08',
  },
  {
    title: 'Brasilianische oder medizinische Lymphdrainage?',
    teaser:
      'Ziel, Druck, Verordnung und Kosten im Vergleich. Der Unterschied entscheidet, wo Sie einen ' +
      'Termin brauchen.',
    route: '/ratgeber/brasilianische-vs-medizinische-lymphdrainage',
    published: '2026-08-05',
    updated: '2026-08-08',
  },
]

/**
 * The entry for a route. Lets an article read its own title from here instead of repeating it
 * three times for heading, page title and structured data.
 */
export function articleByRoute(route: string): Article | undefined {
  return articles.find(a => a.route === route)
}

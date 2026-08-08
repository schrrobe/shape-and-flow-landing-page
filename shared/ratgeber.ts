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
}

export const articles: Article[] = [
  {
    title: 'Wassereinlagerungen: Ursachen und was hilft',
    teaser:
      'Warum sich Flüssigkeit im Gewebe sammelt, was im Alltag dagegen hilft und wann eine ' +
      'Schwellung ärztlich abgeklärt werden sollte.',
    route: '/ratgeber/wassereinlagerungen',
  },
  {
    title: 'Brasilianische oder medizinische Lymphdrainage?',
    teaser:
      'Ziel, Druck, Verordnung und Kosten im Vergleich. Der Unterschied entscheidet, wo Sie einen ' +
      'Termin brauchen.',
    route: '/ratgeber/brasilianische-vs-medizinische-lymphdrainage',
  },
]

/**
 * The entry for a route. Lets an article read its own title from here instead of repeating it
 * three times for heading, page title and structured data.
 */
export function articleByRoute(route: string): Article | undefined {
  return articles.find(a => a.route === route)
}

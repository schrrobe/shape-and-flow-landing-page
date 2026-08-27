/*
 * Two questions about an incoming request: is it asking for a page, and does it want Markdown?
 *
 * Separate from the middleware that acts on the answers, because these two are the parts worth
 * testing — an Accept header is a small grammar, and a browser sends a longer one than any agent.
 */

/** What a media type in an Accept header is worth, from `text/markdown;q=0.9`. */
function quality(accept: string, mediaType: string): number {
  for (const entry of accept.split(',')) {
    const [type, ...parameters] = entry.split(';').map(part => part.trim().toLowerCase())
    if (type !== mediaType) continue

    const q = parameters.find(parameter => parameter.startsWith('q='))?.slice(2)
    // An entry without q counts as 1, an unparseable q as 0 — the same way a client that writes
    // "q=high" gets nothing rather than everything.
    if (q === undefined) return 1
    const value = Number.parseFloat(q)
    return Number.isNaN(value) ? 0 : value
  }

  return 0
}

/**
 * Whether the request would rather have Markdown than HTML.
 *
 * Only exact media types count, no wildcard: browsers send a header that ends in a wildcard with
 * q=0.8 and have to keep getting HTML. Markdown wins on a tie, because whoever names
 * `text/markdown` at all does so deliberately — nobody has it in their default header.
 */
export function prefersMarkdown(accept: string | undefined): boolean {
  if (!accept) return false

  const markdown = quality(accept, 'text/markdown')

  return markdown > 0 && markdown >= quality(accept, 'text/html')
}

/*
 * Everything that is not a page: the API, the prerendered payloads, the build assets, the images
 * of the image module, the generated preview images and the endpoints under /.well-known/. What
 * remains are the routes of app/pages/ — and those never carry a file extension, because
 * trailingSlash is off and every route is spelled out.
 */
const NOT_A_PAGE = /^\/(api|_nuxt|_ipx|_fonts|_og|_og-static-fonts|__|\.well-known|_payload)/

/**
 * Whether the path is one of this site's pages, i.e. something that exists as HTML and as
 * Markdown.
 */
export function isPageRoute(path: string): boolean {
  if (!path.startsWith('/') || NOT_A_PAGE.test(path)) return false

  // A dot in the last segment means a file: sitemap.xml, robots.txt, llms.txt, favicon.svg and the
  // Markdown representations themselves.
  return !(path.split('/').pop() ?? '').includes('.')
}

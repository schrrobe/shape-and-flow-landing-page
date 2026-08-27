import type { H3Event } from 'h3'
import { discoveryLinks, markdownPath } from '#shared/agenten'
import { isPageRoute, prefersMarkdown } from '../utils/markdown-anfrage'

/*
 * What every page tells an agent, and how it hands out Markdown when asked for it.
 *
 * Two things happen here, and both only for the pages of this site:
 *
 *  1. The Link header. It says where the Markdown representation of this page, the agent
 *     documentation, the API catalogue, the Agent Skills index and llms.txt are. The same list
 *     also sits in the head as link elements (app/app.vue) — a client that only reads headers has
 *     to get the same answer as one that parses the HTML.
 *  2. Content negotiation. `Accept: text/markdown` returns the Markdown representation at the
 *     canonical URL, so an agent does not need to know a second address for the same content.
 *
 * Deliberately as a plugin with the two request hooks and not as a middleware under
 * server/middleware/: every page is prerendered, and Nitro puts the handler for the static files
 * in front of every middleware. A middleware here would only ever see requests for pages that do
 * not exist — measurably so: its Link header appeared on the 404 page and nowhere else.
 */

/** The page this request is about, or null if it is not about a page. */
function pageRoute(event: H3Event): string | null {
  const path = event.path.split('?')[0] ?? '/'

  return isPageRoute(path) ? path : null
}

/** Whether this request wants Markdown rather than the HTML of a page. */
function wantsMarkdown(event: H3Event): boolean {
  return prefersMarkdown(getRequestHeader(event, 'accept'))
}

export default defineNitroPlugin(nitroApp => {
  nitroApp.hooks.hook('request', event => {
    const route = pageRoute(event)
    if (!route) return

    const { siteUrl } = useRuntimeConfig(event)

    /*
     * Vary on every page, not only on the ones that were negotiated: a cache in between must not
     * hand the HTML of a request without the header to one asking for Markdown — and that the
     * answer is HTML depends on the header just as much as the other way round.
     */
    appendResponseHeader(event, 'vary', 'Accept')
    setResponseHeader(
      event,
      'link',
      discoveryLinks(route)
        .map(link => `<${siteUrl}${link.href}>; rel="${link.rel}"; type="${link.type}"`)
        .join(', '),
    )

    if (!wantsMarkdown(event)) return

    /*
     * The conditional headers of the request are dropped for a negotiated request. They refer to
     * the HTML — its ETag, its date — and the handler for the static files would answer 304 with
     * them, i.e. "unchanged", for a representation the client has never seen. The `.md` address
     * remains fully cacheable; only the negotiated answer is not.
     */
    delete event.node.req.headers['if-none-match']
    delete event.node.req.headers['if-modified-since']
  })

  /*
   * The exchange happens on the way out, because that is the earliest point at which it can
   * happen: the handler for the static files answers before every middleware, and it returns its
   * body as a return value. Which is what this hook gets — with the response not yet written, so
   * body and headers can still be replaced.
   */
  nitroApp.hooks.hook('beforeResponse', async (event, response) => {
    const route = pageRoute(event)
    if (!route || !wantsMarkdown(event)) return

    /*
     * The Markdown lies next to the HTML as a static file, written by the build
     * (modules/markdown/). $fetch stays inside this server and answers from the same file the .md
     * address delivers, so there is one representation and not two that can drift apart. The inner
     * request carries no Accept header of its own and therefore does not end up in this hook again.
     *
     * If it is missing, the HTML stays: that is the representation this site promises, Markdown is
     * the offer on top of it.
     */
    const markdown = await $fetch<string>(markdownPath(route), { responseType: 'text' }).catch(
      () => null,
    )
    if (markdown === null) return

    response.body = markdown

    setResponseHeader(event, 'content-type', 'text/markdown; charset=utf-8')
    setResponseHeader(event, 'content-length', Buffer.byteLength(markdown))
    /*
     * Three headers of the HTML that no longer hold: its ETag and its date describe another
     * representation, and the encoding belonged to the precompressed .br file the handler for the
     * static files had picked out (compressPublicAssets in nuxt.config.ts).
     */
    removeResponseHeader(event, 'etag')
    removeResponseHeader(event, 'last-modified')
    removeResponseHeader(event, 'content-encoding')
  })
})

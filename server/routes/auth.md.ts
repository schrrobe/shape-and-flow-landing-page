import { authDocumentation } from '../utils/agenten-texte'
import { serveDocument } from '../utils/agenten-antwort'

/*
 * The Auth.md document under /auth.md: how an agent gets access here, namely without registration.
 *
 * At the site root and not under /.well-known/, unlike its four neighbours: the Auth.md convention
 * names /auth.md, and a scanner checking for it asks for that address and no other.
 *
 * Answered at runtime, not prerendered — see routeRules in nuxt.config.ts. The address does end in
 * .md, so a prerendered file would carry the right content type by extension; what it would lose
 * is `charset=utf-8`, and the document is full of umlauts.
 *
 * The address does not collide with the Markdown representations of the pages: those are derived
 * from a page route (see markdownPath in shared/agenten.ts), there is no /auth page, and
 * isPageRoute in server/utils/markdown-anfrage.ts treats a last segment with a dot in it as a file
 * rather than a page. So the content negotiation in server/plugins/agenten.ts never sees this
 * request.
 */
export default defineEventHandler(event => {
  const { siteUrl } = useRuntimeConfig(event)

  serveDocument(event, 'text/markdown; charset=utf-8')

  return authDocumentation(siteUrl)
})

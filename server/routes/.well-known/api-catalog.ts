import { agentPaths } from '#shared/agenten'
import { apiCatalogLinkset } from '../../utils/agenten-texte'
import { serveDocument } from '../../utils/agenten-antwort'

/*
 * The API catalogue under /.well-known/api-catalog, per RFC 9727.
 *
 * The content type carries the profile of the RFC: that is what distinguishes a linkset from any
 * other JSON document, and it is what a client looking for a catalogue checks for.
 *
 * The Link header is required, not decoration. RFC 9727, section 2, asks a publisher to answer a
 * HEAD request to this address with a Link header carrying the api-catalog relation — a client
 * that only wants to know where the catalogue is should not have to download it.
 *
 * server/plugins/agenten.ts does not reach this route: it sets its header for the pages of this
 * site, and everything under /.well-known/ is deliberately not one of them.
 */
export default defineEventHandler(event => {
  const { siteUrl } = useRuntimeConfig(event)

  serveDocument(
    event,
    'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"; charset=utf-8',
  )
  setResponseHeader(
    event,
    'link',
    `<${siteUrl}${agentPaths.apiCatalog}>; rel="api-catalog"; type="application/linkset+json"`,
  )

  return apiCatalogLinkset(siteUrl)
})

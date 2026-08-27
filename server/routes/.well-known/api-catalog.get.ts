import { apiCatalogLinkset } from '../../utils/agenten-texte'

/*
 * The API catalogue under /.well-known/api-catalog, per RFC 9727.
 *
 * The content type carries the profile of the RFC: that is what distinguishes a linkset from any
 * other JSON document, and it is what a client looking for a catalogue checks for.
 */
export default defineEventHandler(event => {
  const { siteUrl } = useRuntimeConfig(event)

  setResponseHeader(
    event,
    'content-type',
    'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"; charset=utf-8',
  )

  return apiCatalogLinkset(siteUrl)
})

import { ardManifest } from '../../utils/agenten-texte'
import { serveDocument } from '../../utils/agenten-antwort'

/*
 * ARD capability manifest under /.well-known/ard.json, per the Agentic Resource Discovery
 * specification (v0.91).
 *
 * The neighbouring /.well-known/api-catalog says the same thing as an RFC 9727 linkset. Both
 * exist, because they are read by different clients: the linkset by one that already knows this
 * site and wants its endpoints, the manifest by the registries that crawl for agent-readable
 * sites and build embeddings over the `representativeQueries` in it. Both are assembled from
 * shared/agenten.ts, so they cannot drift apart.
 *
 * `application/json` without a charset parameter: RFC 8259 defines none for this media type, and
 * the specification asks for exactly this content type — a scanner comparing the header literally
 * would not recognise a parameter appended to it.
 *
 * Access-Control-Allow-Origin comes from serveDocument, which sets it for every document here.
 */
export default defineEventHandler(event => {
  const { siteUrl } = useRuntimeConfig(event)

  serveDocument(event, 'application/json')

  return ardManifest(siteUrl)
})

import { agentDocumentation } from '../../utils/agenten-texte'
import { serveDocument } from '../../utils/agenten-antwort'

/*
 * The agent documentation under /.well-known/agent.md: tasks, boundaries, contact points.
 *
 * Answered at runtime, not prerendered — see the routeRules in nuxt.config.ts. Nitro derives the
 * content type of a prerendered file from its extension, and what matters here is exactly that:
 * `text/markdown; charset=utf-8`, and for the neighbouring catalogue the linkset profile of
 * RFC 9727. The answers are strings assembled from shared/, so a request costs nothing.
 */
export default defineEventHandler(event => {
  const { siteUrl } = useRuntimeConfig(event)

  serveDocument(event, 'text/markdown; charset=utf-8')

  return agentDocumentation(siteUrl)
})

import { agentSkillIndex } from '../../../utils/agenten-texte'
import { serveDocument } from '../../../utils/agenten-antwort'

/** The Agent Skills index: which skills this site publishes, and where each is described. */
export default defineEventHandler(event => {
  const { siteUrl } = useRuntimeConfig(event)

  serveDocument(event, 'application/json; charset=utf-8')

  return agentSkillIndex(siteUrl)
})

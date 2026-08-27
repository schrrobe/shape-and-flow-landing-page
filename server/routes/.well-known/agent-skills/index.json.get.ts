import { agentSkillIndex } from '../../../utils/agenten-texte'

/** The Agent Skills index: which skills this site publishes, and where each is described. */
export default defineEventHandler(event => {
  const { siteUrl } = useRuntimeConfig(event)

  return agentSkillIndex(siteUrl)
})

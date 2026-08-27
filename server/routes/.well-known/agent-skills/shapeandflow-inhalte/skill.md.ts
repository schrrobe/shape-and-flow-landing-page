import { agentSkillDocument } from '../../../../utils/agenten-texte'
import { serveDocument } from '../../../../utils/agenten-antwort'

/*
 * The description of the skill the index points at.
 *
 * The name of the directory is the name of the skill in shared/agenten.ts: Nitro builds the route
 * from the path, so the name lives once as a string and once as a directory. A rename that
 * forgets one of the two is caught by test/agenten.spec.ts, which requests exactly the address
 * the index names.
 */
export default defineEventHandler(event => {
  const { siteUrl } = useRuntimeConfig(event)

  serveDocument(event, 'text/markdown; charset=utf-8')

  return agentSkillDocument(siteUrl)
})

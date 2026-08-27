import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'

import { agentPaths, agentSkill, skillPath } from '#shared/agenten'
import { treatments, formatPrice } from '#shared/behandlungen'
import { contact, disclaimer } from '#shared/site'
import {
  agentDocumentation,
  agentSkillDocument,
  agentSkillIndex,
  apiCatalogLinkset,
} from './agenten-texte'

/*
 * What is tested is what an agent relies on: that the endpoints point at each other, that the
 * addresses carry the host of this environment and that the prices in the documentation are the
 * ones from shared/. Wording is not the subject — it may change without turning anything red here.
 */

const HOST = 'https://stage.shapeandflow.de'

/** Every URL that appears in a text. */
function urls(text: string): string[] {
  return text.match(/https?:\/\/[^\s)"]+/g) ?? []
}

describe('agentDocumentation', () => {
  const document = agentDocumentation(HOST)

  it('writes every address with the host of this environment', () => {
    expect(urls(document).length).toBeGreaterThan(0)
    for (const url of urls(document)) expect(url.startsWith(HOST)).toBe(true)
  })

  it('names the four discovery endpoints', () => {
    for (const path of Object.values(agentPaths)) expect(document).toContain(`${HOST}${path}`)
  })

  it('names the treatments with the price from shared/', () => {
    for (const treatment of treatments) {
      expect(document).toContain(treatment.name)
      expect(document).toContain(formatPrice(treatment.priceEuro))
    }
  })

  it('carries the contact point and the mandatory disclaimer', () => {
    expect(document).toContain(contact.email)
    expect(document).toContain(disclaimer)
  })

  it('does not advertise the booking app, which is behind a feature flag', () => {
    expect(document).not.toContain(contact.bookingUrl)
  })
})

describe('agentSkillIndex', () => {
  it('points at the skill and carries the digest of exactly that document', () => {
    const index = agentSkillIndex(HOST) as {
      skills: { name: string; url: string; digest: string }[]
    }
    const skill = index.skills[0]

    expect(index.skills).toHaveLength(1)
    expect(skill?.name).toBe(agentSkill.name)
    expect(skill?.url).toBe(`${HOST}${skillPath}`)

    const digest = createHash('sha256').update(agentSkillDocument(HOST), 'utf8').digest('hex')
    expect(skill?.digest).toBe(`sha256:${digest}`)
  })
})

describe('apiCatalogLinkset', () => {
  const linkset = (apiCatalogLinkset(HOST) as { linkset: Record<string, unknown>[][] }).linkset[0]

  it('anchors every entry at the site and gives it a target and a type', () => {
    expect(linkset?.length).toBeGreaterThan(0)
    for (const entry of linkset ?? []) {
      expect(entry.anchor).toBe(`${HOST}/`)
      expect(String(entry.href).startsWith(HOST)).toBe(true)
      expect(entry.type).toBeTruthy()
      expect(entry.title).toBeTruthy()
    }
  })

  it('lists the agent documentation and the skills index under their relation', () => {
    const relations = new Map((linkset ?? []).map(entry => [String(entry.href), entry.rel]))

    expect(relations.get(`${HOST}${agentPaths.agentDoc}`)).toEqual(['service-doc'])
    expect(relations.get(`${HOST}${agentPaths.skillIndex}`)).toEqual(['agent-skills'])
  })

  it('does not offer the contact endpoint as an API', () => {
    expect(JSON.stringify(linkset)).not.toContain('/api/kontakt')
  })
})

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

/*
 * The shape is the subject here, not just the content: a linkset is only readable if it is a link
 * context object with the relation as the member name — an array of records with a `rel` field
 * looks similar and cannot be parsed (RFC 9264, section 4.2).
 */
describe('apiCatalogLinkset', () => {
  interface Target {
    href: string
    type?: string
    title?: string
  }

  /** The anchor is a string, every other member is the target list of one relation type. */
  interface LinkContext {
    [member: string]: string | Target[]
  }

  const catalogue = apiCatalogLinkset(HOST) as { linkset: LinkContext[] }
  const context = catalogue.linkset[0]

  /** The targets of one relation, empty if the catalogue does not know it. */
  function targetsOf(relation: string): Target[] {
    const targets = context?.[relation]

    return Array.isArray(targets) ? targets : []
  }

  it('is a link context object anchored at the catalogue itself', () => {
    expect(Array.isArray(catalogue.linkset)).toBe(true)
    expect(catalogue.linkset).toHaveLength(1)
    expect(context?.anchor).toBe(`${HOST}${agentPaths.apiCatalog}`)
  })

  it('names the relation as the member and its targets as an array', () => {
    const relations = Object.keys(context ?? {}).filter(member => member !== 'anchor')

    expect(relations.length).toBeGreaterThan(0)
    for (const relation of relations) {
      expect(Array.isArray(context?.[relation])).toBe(true)
      expect(targetsOf(relation).length).toBeGreaterThan(0)
      for (const target of targetsOf(relation)) {
        expect(target.href.startsWith(HOST)).toBe(true)
        expect(target.type).toBeTruthy()
        expect(target.title).toBeTruthy()
        // The relation lives in the member name; a rel field inside the target is the shape that
        // cannot be read.
        expect(target).not.toHaveProperty('rel')
        expect(target).not.toHaveProperty('anchor')
      }
    }
  })

  it('lists the entries of the catalogue under item, the documents under their relation', () => {
    const hrefs = (relation: string): string[] => targetsOf(relation).map(target => target.href)

    expect(hrefs('item')).toContain(`${HOST}${agentPaths.llms}`)
    expect(hrefs('item')).toContain(`${HOST}${agentPaths.sitemap}`)
    expect(hrefs('service-doc')).toEqual([`${HOST}${agentPaths.agentDoc}`])
    expect(hrefs('agent-skills')).toEqual([`${HOST}${agentPaths.skillIndex}`])
  })

  it('does not offer the contact endpoint as an API', () => {
    expect(JSON.stringify(catalogue)).not.toContain('/api/kontakt')
  })
})

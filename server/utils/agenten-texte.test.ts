import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'

import { agentPaths, agentSkill, skillPath } from '#shared/agenten'
import { treatments, formatPrice } from '#shared/behandlungen'
import { contact, disclaimer, site } from '#shared/site'
import {
  agentDocumentation,
  agentSkillDocument,
  agentSkillIndex,
  ardManifest,
  apiCatalogLinkset,
  authDocumentation,
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

  it('names the six discovery endpoints', () => {
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

describe('authDocumentation', () => {
  const document = authDocumentation(HOST)

  it('writes every address with the host of this environment', () => {
    expect(urls(document).length).toBeGreaterThan(0)
    for (const url of urls(document)) expect(url.startsWith(HOST)).toBe(true)
  })

  /*
   * The H1 is the one piece of wording this test does pin down: a scanner for the Auth.md
   * convention matches on the literal string in it, so a rewrite that drops it would break
   * detection while the document still reads fine.
   */
  it('carries "auth.md" in the H1', () => {
    const heading = document.split('\n').find(line => line.startsWith('# '))

    expect(heading).toBeDefined()
    expect(heading).toContain('auth.md')
  })

  it('names itself as the canonical address', () => {
    expect(document).toContain(`canonical_url: "${HOST}${agentPaths.authDoc}"`)
  })

  /*
   * The document has to answer the four questions the convention asks of a self-contained
   * /auth.md: who it is for, where registration happens, which methods exist, and what happens to
   * credentials. Here as headings, because that is where an agent looks them up.
   */
  it('answers the four questions of a self-contained auth.md', () => {
    for (const heading of [
      '## Für wen das gilt',
      '## Registrierung',
      '## Unterstützte Verfahren',
      '## Anmeldedaten',
    ]) {
      expect(document).toContain(heading)
    }
  })

  it('names the anonymous method and rules out the two that need a server', () => {
    expect(document).toContain('anonymous')
    expect(document).toContain('identity_assertion')
    expect(document).toContain('service_auth')
  })

  /*
   * No OAuth metadata is published, and no address is promised that would answer 404: neither of
   * the two documents may appear here as a link an agent could follow.
   */
  it('promises no OAuth metadata endpoint', () => {
    for (const path of [
      '/.well-known/oauth-protected-resource',
      '/.well-known/oauth-authorization-server',
    ]) {
      expect(urls(document)).not.toContain(`${HOST}${path}`)
    }
  })

  it('points at the agent documentation and carries the mandatory disclaimer', () => {
    expect(document).toContain(`${HOST}${agentPaths.agentDoc}`)
    expect(document).toContain(disclaimer)
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
    // Two targets under one relation, the general document first: see apiCatalogLinkset.
    expect(hrefs('service-doc')).toEqual([
      `${HOST}${agentPaths.agentDoc}`,
      `${HOST}${agentPaths.authDoc}`,
    ])
    expect(hrefs('agent-skills')).toEqual([`${HOST}${agentPaths.skillIndex}`])
    expect(hrefs('ard')).toEqual([`${HOST}${agentPaths.ard}`])
  })

  it('does not offer the contact endpoint as an API', () => {
    expect(JSON.stringify(catalogue)).not.toContain('/api/kontakt')
  })
})

/*
 * The ARD manifest is validated by machines that never see this site, so the rules of the schema
 * are the subject here: identifiers of the documented shape, exactly one of url and data, and two
 * to five representative queries per entry. A manifest that a registry rejects is worth as much as
 * none at all.
 */
describe('ardManifest', () => {
  interface Entry {
    identifier: string
    displayName: string
    type: string
    url?: string
    data?: object
    representativeQueries?: string[]
  }

  const manifest = ardManifest(HOST) as {
    specVersion: string
    host: { displayName: string; identifier: string }
    entries: Entry[]
  }

  it('names the specification version and the host', () => {
    expect(manifest.specVersion).toBe('1.0')
    expect(manifest.host.displayName).toBe(site.name)
    expect(manifest.host.identifier).toBe(HOST)
  })

  it('carries entries with an identifier of the host of this environment', () => {
    expect(manifest.entries.length).toBeGreaterThan(0)
    for (const entry of manifest.entries) {
      expect(entry.identifier).toMatch(/^urn:air:[a-zA-Z0-9.-]+(:[a-zA-Z0-9._-]+)+$/)
      expect(entry.identifier.startsWith(`urn:air:${new URL(HOST).host}:`)).toBe(true)
      expect(entry.displayName).toBeTruthy()
      expect(entry.type).toBeTruthy()
    }
  })

  it('gives every entry exactly one of url and data', () => {
    for (const entry of manifest.entries) {
      expect(Boolean(entry.url) !== Boolean(entry.data)).toBe(true)
      if (entry.url) expect(entry.url.startsWith(HOST)).toBe(true)
    }
  })

  it('gives every entry two to five representative queries', () => {
    for (const entry of manifest.entries) {
      expect(entry.representativeQueries?.length).toBeGreaterThanOrEqual(2)
      expect(entry.representativeQueries?.length).toBeLessThanOrEqual(5)
    }
  })

  it('lists the same endpoints as the linkset', () => {
    const listed = manifest.entries.map(entry => entry.url)

    for (const path of [
      agentPaths.agentDoc,
      agentPaths.apiCatalog,
      agentPaths.llms,
      agentPaths.sitemap,
    ]) {
      expect(listed).toContain(`${HOST}${path}`)
    }
    expect(listed).toContain(`${HOST}${skillPath}`)
  })

  it('does not offer the contact endpoint as a capability', () => {
    expect(JSON.stringify(manifest)).not.toContain('/api/kontakt')
  })
})

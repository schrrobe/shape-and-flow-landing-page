import { createHash } from 'node:crypto'
import { agentPaths, agentSkill, markdownPath, skillPath } from '#shared/agenten'
import { treatments, formatPrice } from '#shared/behandlungen'
import { address, contact, disclaimer, formUrl, openingHours, site } from '#shared/site'

/*
 * What the endpoints under /.well-known/ say.
 *
 * Assembled from shared/, not written out: an agent documentation that names a price the price
 * list no longer has would be worse than none at all — an agent reads it precisely because it
 * trusts it. Same reason as in the llms section of nuxt.config.ts.
 *
 * German like the rest of the content, although the specifications are written in English. What
 * is read here are the studio's statements, and they exist in one language.
 *
 * The functions take the site address as an argument instead of reading the environment
 * themselves: this way the tests can check the output against a fixed host, and the handlers pass
 * in what nuxt.config.ts also puts into JSON-LD and llms.txt.
 */

/** Absolute URL of a path on this site. */
function url(siteUrl: string, path: string): string {
  return `${siteUrl}${path}`
}

/**
 * The agent documentation under {@link agentPaths.agentDoc}: tasks, boundaries, contact points.
 *
 * With YAML front matter, because that is how the tools in this field expect a document that
 * describes itself.
 *
 * Deliberately without the address of the booking app: while the Unleash flag
 * `enable_booking_redirect` is off, nothing on this site points there — see
 * app/composables/useBuchung.ts. A booking address in a document that is not subject to the flag
 * would undo that decision. Whoever asks about an appointment is pointed at the form and at the
 * email address, exactly like a visitor.
 */
export function agentDocumentation(siteUrl: string): string {
  const behandlungen = treatments
    // Indented: they belong under the point about the offer, not next to it.
    .map(t => `  - [${t.name}: ${t.title}](${url(siteUrl, t.route)}) — ${formatPrice(t.priceEuro)}`)
    .join('\n')

  return `---
title: "${site.name}: Zugang für KI-Agenten"
canonical_url: "${url(siteUrl, agentPaths.agentDoc)}"
language: "de"
---

# ${site.name}: Zugang für KI-Agenten

${site.name} ist ein Studio für brasilianische Lymphdrainage in ${address.city}. Dieses Dokument beschreibt, was Agenten hier abrufen dürfen, wo die Grenzen liegen und wohin eine Anfrage gehört.

## Aufgaben

- Inhalte lesen: HTML ist die Voreinstellung. Jede öffentliche Seite gibt es zusätzlich als Markdown — mit dem Header \`Accept: text/markdown\` an der kanonischen URL oder unter derselben Adresse mit angehängtem \`.md\`. Die Startseite liegt unter \`${markdownPath('/')}\`.
- Werkzeuge im Browser nutzen: Wer diese Seite in einem Browser mit WebMCP geöffnet hat, findet dort Werkzeuge für Angebot und Preise, für die häufigen Fragen, für Kontakt und Anfahrt, für den Wechsel auf eine andere Seite und für die Markdown-Fassung einer Seite. Sie antworten aus denselben Quellen wie die Seite selbst.
- Angebot und Preise beantworten: die Übersicht steht unter [${url(siteUrl, '/preise')}](${url(siteUrl, '/preise')}).
${behandlungen}
- Häufige Fragen beantworten: [${url(siteUrl, '/faq')}](${url(siteUrl, '/faq')}).
- Termine anbahnen: ${openingHours.note}. Eine Anfrage gehört an das Kontaktformular oder an die E-Mail-Adresse unten; vereinbart wird der Termin zwischen Mensch und Studio.

## Grenzen

- ${disclaimer}
- Markdown ist eine Lese-Darstellung der ausgelieferten Seite, kein Export und keine Schreib-Schnittstelle.
- Die WebMCP-Werkzeuge lesen ausschließlich. Es gibt darunter keines, das ein Formular absendet oder einen Termin bucht; \`seite_oeffnen\` wechselt lediglich die angezeigte Seite.
- ${url(siteUrl, '/api/kontakt')} bedient ausschließlich das Formular dieser Seite, ist pro IP-Adresse ratenbegrenzt und ist kein Agenten-Endpunkt. Anfragen bitte über das Formular oder die E-Mail-Adresse.
- Preise, Anschrift und Aussagen gelten so, wie sie auf der Seite stehen. Keine Termine, Zeiten oder Wirkungen ergänzen, die dort nicht genannt sind.

## Kontaktpunkte

- E-Mail: [${contact.email}](mailto:${contact.email})
- Kontaktformular: [${url(siteUrl, formUrl)}](${url(siteUrl, formUrl)})
- Anschrift: im Studio ${address.venue}, ${address.street}, ${address.postalCode} ${address.city}

## Discovery

- [Hinweise für Sprachmodelle](${url(siteUrl, agentPaths.llms)})
- [XML-Sitemap](${url(siteUrl, agentPaths.sitemap)})
- [API-Katalog](${url(siteUrl, agentPaths.apiCatalog)})
- [ARD-Manifest](${url(siteUrl, agentPaths.aiCatalog)})
- [Agent-Skills-Index](${url(siteUrl, agentPaths.skillIndex)})
`
}

/**
 * The one Agent Skill of this site, in the SKILL.md format: front matter with name and
 * description, below it what the skill is for and what it is not for.
 */
export function agentSkillDocument(siteUrl: string): string {
  return `---
name: ${agentSkill.name}
description: ${agentSkill.description}
---

# ${site.name}: Inhalte lesen

Diese Fähigkeit dient dem lesenden Zugriff auf die veröffentlichten Inhalte von ${site.name}, dem Studio für brasilianische Lymphdrainage in ${address.city}.

## Vorgehen

1. Die gesuchte Seite über [die Sitemap](${url(siteUrl, agentPaths.sitemap)}) oder [die Hinweise für Sprachmodelle](${url(siteUrl, agentPaths.llms)}) bestimmen.
2. Die kanonische URL mit dem Header \`Accept: text/markdown\` abrufen, oder \`.md\` an die Adresse anhängen. Die Startseite liegt unter \`${markdownPath('/')}\`.
3. Antworten mit der Seite belegen, von der sie stammen.

## Grenzen

- Nur veröffentlichte, öffentliche Inhalte. Markdown ist eine Lese-Darstellung der ausgelieferten Seite und wird nicht geschrieben.
- Keine Terminbuchung, keine Formularabsendung, keine Authentifizierung. Anfragen gehören an ${contact.email} oder an [das Kontaktformular](${url(siteUrl, formUrl)}).
- ${disclaimer}

Die Aufgaben und Kontaktpunkte im Überblick: [Agenten-Dokumentation](${url(siteUrl, agentPaths.agentDoc)}).
`
}

/**
 * The Agent Skills index under {@link agentPaths.skillIndex}.
 *
 * The digest is computed over exactly the document the neighbouring handler delivers, so an agent
 * can tell whether the skill has changed since it last read it. Which is why it is calculated
 * here and not written down: a digest maintained by hand would be wrong from the first change of
 * a price onwards.
 */
export function agentSkillIndex(siteUrl: string): object {
  const document = agentSkillDocument(siteUrl)

  return {
    $schema: 'https://schemas.agentskills.io/discovery/0.2.0/schema.json',
    skills: [
      {
        name: agentSkill.name,
        type: 'skill-md',
        description: agentSkill.description,
        url: url(siteUrl, skillPath),
        digest: `sha256:${createHash('sha256').update(document, 'utf8').digest('hex')}`,
      },
    ],
  }
}

/**
 * The API catalogue under {@link agentPaths.apiCatalog} as a linkset per RFC 9727.
 *
 * The shape follows RFC 9264, section 4.2, and the example in appendix A.2 of RFC 9727: `linkset`
 * is an array of link context objects, each with an `anchor` and one member per relation type
 * whose value is an array of link targets. The anchor is the catalogue itself, the entries sit
 * under `item` — the relation that says "part of this catalogue".
 *
 * An array of `{ anchor, rel, href }` records, as it is found in the wild, is something else: a
 * conforming client reads the relation from the member name, not from a `rel` field, and would not
 * find a single link in it.
 *
 * `item`, `service-doc` and `describedby` are registered relation types and are used by their
 * name. `agent-skills` is an extension type, for which RFC 9264 asks for a URI as the member name
 * — there is none for it. It keeps the token, the same one the Link header carries: consistency
 * between header and document is worth more here than a URI nobody has minted. A conforming client
 * ignores the member; the entries it has to understand are all under `item`.
 *
 * Listed are the machine-readable representations of this site — the ones an agent may read. The
 * contact endpoint is not among them on purpose: it is the delivery route of the form, not an
 * offer, and the agent documentation says so in as many words.
 */
export function apiCatalogLinkset(siteUrl: string): object {
  return {
    linkset: [
      {
        anchor: url(siteUrl, agentPaths.apiCatalog),
        item: [
          {
            href: url(siteUrl, agentPaths.llms),
            type: 'text/plain',
            title: `Hinweise für Sprachmodelle zu ${site.name}`,
          },
          {
            href: url(siteUrl, agentPaths.sitemap),
            type: 'application/xml',
            title: 'XML-Sitemap aller öffentlichen Seiten',
          },
          {
            href: url(siteUrl, markdownPath('/')),
            type: 'text/markdown',
            title:
              'Markdown-Darstellung der Startseite; jede Seite auch über Accept: text/markdown',
          },
        ],
        'service-doc': [
          {
            href: url(siteUrl, agentPaths.agentDoc),
            type: 'text/markdown',
            title: 'Dokumentation des Agenten-Zugangs',
          },
        ],
        'agent-skills': [
          {
            href: url(siteUrl, agentPaths.skillIndex),
            type: 'application/json',
            title: 'Agent-Skills-Index',
          },
        ],
        'ai-catalog': [
          {
            href: url(siteUrl, agentPaths.aiCatalog),
            type: 'application/json',
            title: 'ARD-Manifest derselben Endpunkte',
          },
        ],
      },
    ],
  }
}

/**
 * The ARD capability manifest under {@link agentPaths.aiCatalog}.
 *
 * The same endpoints as the linkset above, in the shape a registry indexes: ARD (Agentic Resource
 * Discovery, v0.91) is read by crawlers that build embeddings over what a site offers, RFC 9727 is
 * read by a client that already stands at the door. Two formats, one list — and both are assembled
 * from {@link agentPaths}, so an endpoint cannot appear in one and be missing from the other.
 *
 * The identifiers carry the host of the address the manifest is delivered under, not the literal
 * from shared/site.ts: on the staging host both have to differ, otherwise a registry that reads
 * both would file the two sites under one URN.
 *
 * `identifier` of the host is the site address and deliberately not a `did:web:` — the DID
 * document that would have to answer at /.well-known/did.json does not exist, and an identifier
 * that resolves to nothing is worse than one that resolves to the site itself. The schema asks for
 * an identifier, not for a specific scheme; `https` is one the specification knows elsewhere.
 *
 * `representativeQueries` are the questions this site can actually answer; two to five per entry,
 * as the schema requires. They are in German like the content: an embedding over questions in a
 * language the answer does not exist in would point agents at the wrong door.
 */
export function aiCatalogManifest(siteUrl: string): object {
  /** `urn:air:<publisher>:<namespace>:<name>`, per the ARD schema. */
  const urn = (namespace: string, name: string) =>
    `urn:air:${new URL(siteUrl).host}:${namespace}:${name}`

  return {
    specVersion: '1.0',
    host: {
      displayName: site.name,
      identifier: siteUrl,
      documentationUrl: url(siteUrl, agentPaths.agentDoc),
      logoUrl: `${siteUrl}/images/logo.jpg`,
    },
    entries: [
      {
        identifier: urn('doc', 'agenten-zugang'),
        displayName: `${site.name}: Zugang für KI-Agenten`,
        type: 'text/markdown',
        url: url(siteUrl, agentPaths.agentDoc),
        description:
          'Aufgaben, Grenzen und Kontaktpunkte des Agenten-Zugangs dieses Studios in einem Dokument.',
        tags: ['dokumentation', 'agenten-zugang', address.city.toLowerCase()],
        representativeQueries: [
          `Was darf ein KI-Agent bei ${site.name} abrufen?`,
          `Wie erreiche ich ${site.name} in ${address.city}?`,
          `Welche Grenzen gelten für automatisierte Anfragen an ${site.name}?`,
        ],
      },
      {
        identifier: urn('skill', agentSkill.name),
        displayName: `${site.name}: Inhalte lesen`,
        type: 'text/markdown',
        url: url(siteUrl, skillPath),
        description: agentSkill.description,
        tags: ['inhalte', 'markdown', 'lymphdrainage'],
        capabilities: treatments.map(t => t.name),
        representativeQueries: [
          `Brasilianische Lymphdrainage in ${address.city}`,
          `Was kostet eine Behandlung bei ${site.name}?`,
          `Welche Behandlungen bietet ${site.name} an?`,
        ],
      },
      {
        identifier: urn('catalog', 'api'),
        displayName: `API-Katalog von ${site.name}`,
        type: 'application/linkset+json',
        url: url(siteUrl, agentPaths.apiCatalog),
        description:
          'Linkset nach RFC 9727: dieselben maschinenlesbaren Endpunkte für Clients, die einen Katalog erwarten.',
        tags: ['katalog', 'rfc9727'],
        representativeQueries: [
          `Welche maschinenlesbaren Endpunkte hat ${site.name}?`,
          `Wo liegt der API-Katalog von ${site.name}?`,
        ],
      },
      {
        identifier: urn('content', 'llms-txt'),
        displayName: `Hinweise für Sprachmodelle zu ${site.name}`,
        type: 'text/plain',
        url: url(siteUrl, agentPaths.llms),
        description: 'Kurzüberblick über die Seiten dieses Studios, für Sprachmodelle geschrieben.',
        tags: ['llms-txt', 'überblick'],
        representativeQueries: [
          `Worum geht es auf der Seite von ${site.name}?`,
          `Übersicht der Inhalte von ${site.name}`,
        ],
      },
      {
        identifier: urn('content', 'sitemap'),
        displayName: `XML-Sitemap von ${site.name}`,
        type: 'application/xml',
        url: url(siteUrl, agentPaths.sitemap),
        description:
          'Alle öffentlichen Seiten; jede davon auch als Markdown über Accept: text/markdown oder angehängtes .md.',
        tags: ['sitemap', 'inhalte'],
        representativeQueries: [
          `Welche Seiten hat ${site.name}?`,
          `Sitemap von ${site.name}`,
          `Alle Unterseiten von ${site.name} auflisten`,
        ],
      },
    ],
  }
}

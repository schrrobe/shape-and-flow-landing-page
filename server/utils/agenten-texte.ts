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
- Angebot und Preise beantworten: die Übersicht steht unter [${url(siteUrl, '/preise')}](${url(siteUrl, '/preise')}).
${behandlungen}
- Häufige Fragen beantworten: [${url(siteUrl, '/faq')}](${url(siteUrl, '/faq')}).
- Termine anbahnen: ${openingHours.note}. Eine Anfrage gehört an das Kontaktformular oder an die E-Mail-Adresse unten; vereinbart wird der Termin zwischen Mensch und Studio.

## Grenzen

- ${disclaimer}
- Markdown ist eine Lese-Darstellung der ausgelieferten Seite, kein Export und keine Schreib-Schnittstelle.
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
 * Listed are the machine-readable representations of this site — the ones an agent may read. The
 * contact endpoint is not among them on purpose: it is the delivery route of the form, not an
 * offer, and the agent documentation says so in as many words.
 */
export function apiCatalogLinkset(siteUrl: string): object {
  const anchor = url(siteUrl, '/')

  return {
    linkset: [
      [
        {
          anchor,
          rel: ['item'],
          href: url(siteUrl, agentPaths.llms),
          type: 'text/plain',
          title: `Hinweise für Sprachmodelle zu ${site.name}`,
        },
        {
          anchor,
          rel: ['item'],
          href: url(siteUrl, agentPaths.sitemap),
          type: 'application/xml',
          title: 'XML-Sitemap aller öffentlichen Seiten',
        },
        {
          anchor,
          rel: ['item'],
          href: url(siteUrl, markdownPath('/')),
          type: 'text/markdown',
          title: 'Markdown-Darstellung der Startseite; jede Seite auch über Accept: text/markdown',
        },
        {
          anchor,
          rel: ['service-doc'],
          href: url(siteUrl, agentPaths.agentDoc),
          type: 'text/markdown',
          title: 'Dokumentation des Agenten-Zugangs',
        },
        {
          anchor,
          rel: ['agent-skills'],
          href: url(siteUrl, agentPaths.skillIndex),
          type: 'application/json',
          title: 'Agent-Skills-Index',
        },
      ],
    ],
  }
}

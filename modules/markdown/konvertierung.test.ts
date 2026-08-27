// @vitest-environment node
import { describe, expect, it } from 'vitest'

import { pageMarkdown } from './konvertierung'

/*
 * The conversion is checked against a page in miniature: the parts that would be lost without a
 * rule of their own — the table of the price list, the collapsed FAQ entries, the decorative icons
 * and the form fields — plus the front matter that says which page this is.
 *
 * Deliberately in the node environment and not in the one of the other tests: in the build there
 * is no browser DOM, Turndown parses with its own minimal one, and that one can do less. A test
 * with a DOM would pass over rules that then fail in the build — which is exactly what happened
 * with the table.
 */

function page(main: string): string {
  return `<!DOCTYPE html><html lang="de"><head><title>Preise | Shape &amp; Flow</title>
<link rel="canonical" href="https://shapeandflow.de/preise"><link rel="alternate" type="text/markdown" href="https://shapeandflow.de/preise.md"></head>
<body><header><nav><a href="/preise">Preise</a></nav></header>
<main id="content" class="flex-1">${main}</main>
<footer><p>Impressum</p></footer></body></html>`
}

describe('pageMarkdown', () => {
  it('takes the title and the canonical from the page itself', () => {
    const markdown = pageMarkdown(page('<h1>Preise</h1>')) ?? ''

    expect(markdown).toContain('title: "Preise | Shape & Flow"')
    expect(markdown).toContain('canonical_url: "https://shapeandflow.de/preise"')
    expect(markdown).toContain('# Preise')
  })

  it('converts only the content, not the header and the footer', () => {
    const markdown = pageMarkdown(page('<h1>Preise</h1><p>Ab 65 Euro.</p>')) ?? ''

    expect(markdown).toContain('Ab 65 Euro.')
    expect(markdown).not.toContain('Impressum')
  })

  it('keeps the price table as a table', () => {
    const markdown =
      pageMarkdown(
        page(`<table><thead><tr><th>Behandlung</th><th>Preis</th></tr></thead>
<tbody><tr><th scope="row"><a href="/jeveauxeffect">Jeveauxeffect®</a>
<span>Lymphdrainage für den Körper</span></th><td>150 €</td></tr>
<tr><th colspan="2">Kombitermin und Pakete</th></tr></tbody></table>`),
      ) ?? ''

    expect(markdown).toContain('| Behandlung | Preis |')
    expect(markdown).toContain('| --- | --- |')
    expect(markdown).toContain('[Jeveauxeffect®](/jeveauxeffect)')
    expect(markdown).toContain('| 150 € |')
    // The group heading spans both columns and is padded, otherwise the table ends there.
    expect(markdown).toContain('| Kombitermin und Pakete |  |')
  })

  it('makes the question of a collapsed FAQ entry its own line', () => {
    const markdown =
      pageMarkdown(
        page('<details><summary>Tut das weh?</summary><p>Nein, aber es ist spürbar.</p></details>'),
      ) ?? ''

    expect(markdown).toContain('**Tut das weh?**')
    expect(markdown).toContain('Nein, aber es ist spürbar.')
  })

  it('drops decoration and form controls, keeps the labels', () => {
    const markdown =
      pageMarkdown(
        page(`<p><svg viewBox="0 0 8 8"><path d="M1 1h6"/></svg>Mit Icon</p>
<span aria-hidden="true">·</span>
<label for="kf-name">Name</label><input id="kf-name" name="name">
<select name="treatment"><option>Noch offen</option></select>`),
      ) ?? ''

    expect(markdown).toContain('Mit Icon')
    expect(markdown).toContain('Name')
    expect(markdown).not.toContain('·')
    expect(markdown).not.toContain('Noch offen')
    expect(markdown).not.toContain('<')
  })

  it('returns null for HTML without a main element', () => {
    expect(pageMarkdown('<html><body><p>Nichts</p></body></html>')).toBeNull()
  })
})

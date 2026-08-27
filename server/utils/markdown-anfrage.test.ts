import { describe, expect, it } from 'vitest'

import { isPageRoute, prefersMarkdown } from './markdown-anfrage'

/*
 * The two decisions that determine whether a request gets HTML or Markdown. The header of a
 * browser is the case that must not tip over: it asks for everything, and everything includes
 * Markdown.
 */

describe('prefersMarkdown', () => {
  it('gives a browser HTML', () => {
    expect(
      prefersMarkdown(
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      ),
    ).toBe(false)
  })

  it('gives a client that asks for Markdown Markdown', () => {
    expect(prefersMarkdown('text/markdown')).toBe(true)
    expect(prefersMarkdown('text/markdown, text/html;q=0.5')).toBe(true)
    // Same weight: whoever names Markdown at all means it.
    expect(prefersMarkdown('text/markdown;q=0.9, text/html;q=0.9')).toBe(true)
  })

  it('respects an explicitly lower weight for Markdown', () => {
    expect(prefersMarkdown('text/html, text/markdown;q=0.1')).toBe(false)
    expect(prefersMarkdown('text/markdown;q=0')).toBe(false)
  })

  it('does not read Markdown into a wildcard or a missing header', () => {
    expect(prefersMarkdown('*/*')).toBe(false)
    expect(prefersMarkdown('')).toBe(false)
    expect(prefersMarkdown(undefined)).toBe(false)
  })
})

describe('isPageRoute', () => {
  it('recognises the pages of this site', () => {
    expect(isPageRoute('/')).toBe(true)
    expect(isPageRoute('/preise')).toBe(true)
    expect(isPageRoute('/ratgeber/wassereinlagerungen')).toBe(true)
  })

  it('leaves everything that is not a page alone', () => {
    expect(isPageRoute('/api/kontakt')).toBe(false)
    expect(isPageRoute('/_nuxt/entry.js')).toBe(false)
    expect(isPageRoute('/_ipx/w_600/images/studio-1.jpg')).toBe(false)
    expect(isPageRoute('/.well-known/agent.md')).toBe(false)
    expect(isPageRoute('/llms.txt')).toBe(false)
    expect(isPageRoute('/sitemap.xml')).toBe(false)
    // The Markdown representations themselves: otherwise the middleware would negotiate about
    // them a second time.
    expect(isPageRoute('/preise.md')).toBe(false)
    expect(isPageRoute('/.md')).toBe(false)
  })
})

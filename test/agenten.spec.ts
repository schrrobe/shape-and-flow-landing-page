import { createHash } from 'node:crypto'
import { globSync } from 'node:fs'
import { expect, test } from '@playwright/test'

import { agentPaths, markdownPath } from '../shared/agenten'

/*
 * What an AI agent finds on this site, checked against the artifact that gets delivered.
 *
 * Runs without a browser, only against the HTTP responses of `nuxt preview`: what is at stake
 * here are status codes, content types and headers, and those are precisely what a rendered page
 * hides. The Markdown representations are written by the build (modules/markdown/), so they only
 * exist in .output — a dev server would show a different site.
 *
 * The pages are read from the build for the same reason as in meta-laenge.spec.ts: a page that
 * exists but has no Markdown must turn this test red, and a list written by hand would forget the
 * fourteenth page.
 */

const pages = globSync('.output/public/**/*.html')
  .map(file => file.replace(/^\.output\/public/, '').replace(/\/?index\.html$/, '') || '/')
  .sort()

if (!pages.length)
  throw new Error('No prerendered pages found in .output/public. Run `npm run build` first.')

test.describe('Markdown-Darstellung', () => {
  for (const route of pages) {
    test(`${route} exists as Markdown under ${markdownPath(route)}`, async ({ request }) => {
      const response = await request.get(markdownPath(route))

      expect(response.status()).toBe(200)
      expect(response.headers()['content-type']).toContain('text/markdown')

      const body = await response.text()
      // Front matter with the title and the canonical of the page it belongs to. The home page
      // has the trailing slash the canonical of the page carries.
      expect(body.startsWith('---\ntitle: "')).toBe(true)
      expect(body).toContain(`canonical_url: "https://shapeandflow.de${route}"`)
    })
  }

  test('delivers Markdown at the canonical URL when asked for it', async ({ request }) => {
    const negotiated = await request.get('/preise', { headers: { accept: 'text/markdown' } })

    expect(negotiated.status()).toBe(200)
    expect(negotiated.headers()['content-type']).toContain('text/markdown')
    // A cache in between must not hand this answer to a request without the header.
    expect(negotiated.headers().vary).toContain('Accept')

    const alternate = await request.get('/preise.md')
    expect(await negotiated.text()).toBe(await alternate.text())
  })

  test('the price table survives the conversion', async ({ request }) => {
    const markdown = await (await request.get('/preise.md')).text()

    expect(markdown).toContain('| Behandlung | Preis |')
    expect(markdown).toContain('150 €')
  })

  test('a browser keeps getting HTML', async ({ request }) => {
    const response = await request.get('/', {
      headers: { accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' },
    })

    expect(response.headers()['content-type']).toContain('text/html')
  })
})

test.describe('Discovery', () => {
  test('every page announces the endpoints in the Link header', async ({ request }) => {
    const link = (await request.get('/preise')).headers().link ?? ''

    expect(link).toContain(`<https://shapeandflow.de/preise.md>; rel="alternate"`)
    for (const [relation, path] of [
      ['service-doc', agentPaths.agentDoc],
      ['api-catalog', agentPaths.apiCatalog],
      ['agent-skills', agentPaths.skillIndex],
      ['describedby', agentPaths.llms],
    ] as const) {
      expect(link).toContain(`<https://shapeandflow.de${path}>; rel="${relation}"`)
    }
  })

  test('the home page carries the same links in the markup', async ({ request }) => {
    const html = await (await request.get('/')).text()

    expect(html).toContain(`rel="alternate" type="text/markdown" href="/.md"`)
    expect(html).toContain(`href="${agentPaths.agentDoc}"`)
    expect(html).toContain(`href="${agentPaths.apiCatalog}"`)
    expect(html).toContain(`href="${agentPaths.skillIndex}"`)
  })

  test('the agent documentation names tasks, boundaries and contact points', async ({
    request,
  }) => {
    const response = await request.get(agentPaths.agentDoc)

    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('text/markdown')

    const document = await response.text()
    expect(document).toContain('## Aufgaben')
    expect(document).toContain('## Grenzen')
    expect(document).toContain('## Kontaktpunkte')
  })

  test('the API catalogue is a linkset per RFC 9727', async ({ request }) => {
    const response = await request.get(agentPaths.apiCatalog)

    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('application/linkset+json')
    expect(response.headers()['content-type']).toContain('rfc9727')

    const catalogue = (await response.json()) as {
      linkset: { anchor: string; item?: { href: string }[] }[]
    }
    const context = catalogue.linkset[0]

    // A link context object with the relation as the member name, not a list of records with a rel
    // field: only the former can be read by a conforming client (RFC 9264, section 4.2).
    expect(catalogue.linkset).toHaveLength(1)
    expect(context?.anchor).toBe(`https://shapeandflow.de${agentPaths.apiCatalog}`)
    expect(context?.item?.length).toBeGreaterThan(0)
  })

  /*
   * RFC 9727, section 2: a publisher supporting this address answers a HEAD request with a Link
   * header carrying the api-catalog relation. A client that only wants to know where the catalogue
   * is should not have to download it.
   */
  test('a HEAD request to the catalogue answers with the api-catalog relation', async ({
    request,
  }) => {
    const response = await request.head(agentPaths.apiCatalog)

    expect(response.status()).toBe(200)
    expect(response.headers().link).toContain(
      `<https://shapeandflow.de${agentPaths.apiCatalog}>; rel="api-catalog"`,
    )
  })

  test('the skills index points at a skill that exists and has not changed', async ({
    request,
  }) => {
    const index = (await (await request.get(agentPaths.skillIndex)).json()) as {
      skills: { url: string; digest: string }[]
    }
    const skill = index.skills[0]
    expect(skill).toBeDefined()

    const response = await request.get(new URL(skill!.url).pathname)
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('text/markdown')

    const digest = createHash('sha256')
      .update(await response.text(), 'utf8')
      .digest('hex')
    expect(skill!.digest).toBe(`sha256:${digest}`)
  })
})

test.describe('Structured Data', () => {
  /** The JSON-LD graph of a page. */
  async function graph(text: string): Promise<Record<string, unknown>[]> {
    const json = text.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/)?.[1]
    expect(json, 'The page carries no JSON-LD.').toBeTruthy()

    return (JSON.parse(json!) as { '@graph': Record<string, unknown>[] })['@graph']
  }

  /** Whether a node carries the type, also when it has several. */
  function typed(node: Record<string, unknown>, type: string): boolean {
    const value = node['@type']
    return Array.isArray(value) ? value.includes(type) : value === type
  }

  test('the home page carries a breadcrumb trail', async ({ request }) => {
    const nodes = await graph(await (await request.get('/')).text())
    const breadcrumb = nodes.find(node => typed(node, 'BreadcrumbList'))

    expect(breadcrumb, 'The home page has no BreadcrumbList.').toBeDefined()
    expect((breadcrumb?.itemListElement as unknown[])?.length).toBeGreaterThan(0)
  })

  test('a guide article carries both dates', async ({ request }) => {
    const nodes = await graph(await (await request.get('/ratgeber/wassereinlagerungen')).text())
    const article = nodes.find(node => typed(node, 'Article'))

    expect(article?.datePublished).toBeTruthy()
    expect(article?.dateModified).toBeTruthy()
  })

  test('every offer in the price list has a position and an address', async ({ request }) => {
    const nodes = await graph(await (await request.get('/preise')).text())
    const list = nodes.find(node => typed(node, 'ItemList')) as
      { itemListElement?: { position?: number; item?: { url?: string } }[] } | undefined

    expect(list?.itemListElement?.length).toBeGreaterThan(0)
    for (const entry of list?.itemListElement ?? []) {
      expect(entry.position).toBeGreaterThan(0)
      expect(entry.item?.url).toBeTruthy()
    }
  })
})

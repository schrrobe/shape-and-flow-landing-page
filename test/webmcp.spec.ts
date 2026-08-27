import { expect, test } from '@playwright/test'

import type { Page } from '@playwright/test'

/*
 * What an agent finds in the loaded page, checked in a real browser.
 *
 * app/utils/webmcp.test.ts already tests the tools themselves without a browser. What cannot be
 * had there is the point of this file: whether the plugin runs at all during hydration, whether it
 * gets its paths from the router, and whether the registration happens early enough — a checking
 * tool loads the page and looks straight away, and a tool registered later does not exist for it.
 *
 * The stub is installed before the page's own scripts, because that is how the API arrives in a
 * browser that has it. Both places are served, since the specification puts modelContext on the
 * document and the browser preview puts it on the navigator.
 */

/** A registered tool as the stub records it. */
interface Recorded {
  name: string
  description: string
  inputSchema: { properties?: Record<string, unknown> }
  annotations?: { readOnlyHint?: boolean }
}

declare global {
  interface Window {
    __webmcp: Recorded[]
    __call: (name: string, input: unknown) => Promise<unknown>
    /** Marks the document, so a route change can be told from a reload. */
    __loaded?: boolean
  }
}

/** Installs the model context before the first script of the page runs. */
async function stubModelContext(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const tools = new Map<string, Recorded & { execute: (input: unknown) => Promise<unknown> }>()

    window.__webmcp = []
    window.__call = (name, input) => {
      const tool = tools.get(name)
      if (!tool) throw new Error(`Not registered: ${name}`)
      return tool.execute(input)
    }

    const modelContext = {
      registerTool(tool: Recorded & { execute: (input: unknown) => Promise<unknown> }) {
        tools.set(tool.name, tool)
        window.__webmcp.push(tool)
        return Promise.resolve()
      },
    }

    Object.defineProperty(document, 'modelContext', { value: modelContext, configurable: true })
    Object.defineProperty(navigator, 'modelContext', { value: modelContext, configurable: true })
  })
}

test.describe('WebMCP', () => {
  test.beforeEach(async ({ page }) => {
    await stubModelContext(page)
  })

  test('the home page registers its tools while loading', async ({ page }) => {
    await page.goto('/')

    // Registration runs in the client plugin, i.e. with hydration and not with the HTML.
    await expect.poll(() => page.evaluate(() => window.__webmcp.length)).toBeGreaterThan(0)

    const tools = await page.evaluate(() => window.__webmcp)

    expect(tools.map(tool => tool.name).sort()).toEqual([
      'angebot_und_preise',
      'faq_durchsuchen',
      'kontakt_und_anfahrt',
      'seite_als_markdown',
      'seite_oeffnen',
    ])
    for (const tool of tools) {
      expect(tool.description.length).toBeGreaterThan(0)
      expect(tool.inputSchema).toBeTruthy()
    }
  })

  test('the paths on offer are the pages of this site', async ({ page }) => {
    await page.goto('/')
    await expect.poll(() => page.evaluate(() => window.__webmcp.length)).toBeGreaterThan(0)

    const paths = await page.evaluate(
      () =>
        (
          window.__webmcp.find(tool => tool.name === 'seite_oeffnen')?.inputSchema.properties
            ?.pfad as { enum: string[] }
        ).enum,
    )

    // Real routes, no placeholder from the 404 catch-all.
    expect(paths).toContain('/')
    expect(paths).toContain('/preise')
    expect(paths).toContain('/ratgeber/wassereinlagerungen')
    for (const path of paths) expect(path).not.toMatch(/[:*]/)
  })

  test('the price tool answers with the prices of the page', async ({ page }) => {
    await page.goto('/')
    await expect.poll(() => page.evaluate(() => window.__webmcp.length)).toBeGreaterThan(0)

    const answer = (await page.evaluate(() => window.__call('angebot_und_preise', {}))) as {
      behandlungen: { name: string; preis: string }[]
      pakete: unknown[]
    }

    expect(answer.behandlungen[0]?.preis).toBe('150 €')
    expect(answer.pakete.length).toBeGreaterThan(0)
    // The same figure the price table shows.
    await page.goto('/preise')
    await expect(page.locator('main')).toContainText('150 €')
  })

  test('seite_oeffnen changes the page without a reload', async ({ page }) => {
    await page.goto('/')
    await expect.poll(() => page.evaluate(() => window.__webmcp.length)).toBeGreaterThan(0)

    // Survives the route change only without a reload: a reload would empty the array.
    await page.evaluate(() => {
      window.__loaded = true
    })

    const answer = (await page.evaluate(() =>
      window.__call('seite_oeffnen', { pfad: '/preise' }),
    )) as { pfad: string }

    expect(answer.pfad).toBe('/preise')
    expect(page.url()).toContain('/preise')
    // The page really is there and not just the URL.
    await expect(page.locator('main')).toContainText('150 €')
    expect(await page.evaluate(() => window.__loaded)).toBe(true)
  })

  test('seite_als_markdown delivers the Markdown of the page', async ({ page }) => {
    await page.goto('/')
    await expect.poll(() => page.evaluate(() => window.__webmcp.length)).toBeGreaterThan(0)

    const answer = (await page.evaluate(() =>
      window.__call('seite_als_markdown', { pfad: '/preise' }),
    )) as { quelle: string; markdown: string }

    expect(answer.quelle).toBe('/preise.md')
    expect(answer.markdown).toContain('canonical_url: "https://shapeandflow.de/preise"')
  })

  test('an unknown path is rejected instead of guessed', async ({ page }) => {
    await page.goto('/')
    await expect.poll(() => page.evaluate(() => window.__webmcp.length)).toBeGreaterThan(0)

    const failed = await page.evaluate(async () => {
      try {
        await window.__call('seite_oeffnen', { pfad: '/gibt-es-nicht' })
        return null
      } catch (error) {
        return (error as Error).message
      }
    })

    expect(failed).toContain('Unbekannter Pfad')
    expect(page.url()).not.toContain('gibt-es-nicht')
  })

  test('a browser without the API still delivers the page', async ({ browser }) => {
    const page = await browser.newPage()
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))

    await page.goto('/')
    await expect(page.locator('main')).toBeVisible()

    expect(errors).toEqual([])
    await page.close()
  })
})

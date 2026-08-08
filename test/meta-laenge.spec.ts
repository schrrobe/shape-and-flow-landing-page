import { globSync, readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'

/*
 * No meta description may be cut off in the search result.
 *
 * Google does not measure that line in characters but in pixels, and so does this test:
 * "Jeveauxeffect Face® 65 €" is shorter than "wann Schwellungen abgeklärt werden" although it has
 * more characters. A character limit would trigger sometimes too early and sometimes too late.
 *
 * Measured with the font Google sets the description in on desktop: Arial 14px. The limit of
 * 1000px is the one reported by Seobility and other audit tools; the budget here sits below that,
 * so a wording does not tip over with the very next word.
 *
 * The test reads the built file, because only there is what Google gets to see: the descriptions
 * are assembled from templates with city and price, and a price of 150 € is wider than one of
 * 65 €.
 */

const BUDGET_PX = 990
const FONT = '14px Arial'

const pages = globSync('.output/public/**/*.html')

if (!pages.length)
  throw new Error('No prerendered pages found in .output/public. Run `npm run build` first.')

function description(html: string): string | null {
  const match = html.match(/<meta name="description" content="([^"]*)"/)
  if (!match?.[1]) return null

  return match[1]
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
}

test.describe('Meta-Description', () => {
  for (const file of pages) {
    const route = file.replace(/^\.output\/public/, '').replace(/\/?index\.html$/, '') || '/'

    test(`${route} is not truncated in the search result`, async ({ page }) => {
      const text = description(readFileSync(file, 'utf8'))

      expect(text, `The meta description is missing on ${route}.`).not.toBeNull()

      const width = await page.evaluate(
        ([content, font]) => {
          const ctx = document.createElement('canvas').getContext('2d')
          if (!ctx) throw new Error('No 2D context available for the measurement.')
          ctx.font = font as string
          return ctx.measureText(content as string).width
        },
        [text as string, FONT],
      )

      // Measured unrounded, rounded only in the message: otherwise a description of 990.4px would
      // slip below the budget although it is above it.
      expect(
        width,
        `The description on ${route} is ${Math.round(width)}px wide (budget ${BUDGET_PX}px).`,
      ).toBeLessThanOrEqual(BUDGET_PX)
    })
  }
})

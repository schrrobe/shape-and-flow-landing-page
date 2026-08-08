import { globSync, readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'

/*
 * Keine Meta-Description darf im Suchergebnis abgeschnitten werden.
 *
 * Google misst diese Zeile nicht in Zeichen, sondern in Pixeln, und deshalb tut es dieser Test
 * auch: "Jeveauxeffect Face® 65 €" ist kürzer als "wann Schwellungen abgeklärt werden", obwohl es
 * mehr Zeichen hat. Eine Zeichengrenze würde mal zu früh und mal zu spät anschlagen.
 *
 * Gemessen wird mit dem Font, in dem Google die Description auf dem Desktop setzt: Arial 14px.
 * Die Grenze von 1000px ist die von Seobility und anderen Audit-Werkzeugen gemeldete; das
 * Budget hier liegt darunter, damit eine Formulierung nicht schon beim nächsten Wort kippt.
 *
 * Der Test liest die gebaute Datei, weil erst dort steht, was Google zu sehen bekommt: die
 * Beschreibungen setzen sich aus Vorlagen mit Ort und Preis zusammen, und ein Preis von 150 €
 * ist breiter als einer von 65 €.
 */

const BUDGET_PX = 990
const FONT = '14px Arial'

const seiten = globSync('.output/public/**/*.html')

if (!seiten.length)
  throw new Error('Keine vorgerenderten Seiten in .output/public gefunden. Erst `npm run build`.')

function description(html: string): string | null {
  const treffer = html.match(/<meta name="description" content="([^"]*)"/)
  if (!treffer?.[1]) return null

  return treffer[1]
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
}

test.describe('Meta-Description', () => {
  for (const datei of seiten) {
    const route = datei.replace(/^\.output\/public/, '').replace(/\/?index\.html$/, '') || '/'

    test(`${route} wird im Suchergebnis nicht abgeschnitten`, async ({ page }) => {
      const text = description(readFileSync(datei, 'utf8'))

      expect(text, `Auf ${route} fehlt die Meta-Description.`).not.toBeNull()

      const breite = await page.evaluate(
        ([inhalt, font]) => {
          const ctx = document.createElement('canvas').getContext('2d')
          if (!ctx) throw new Error('Kein 2D-Kontext für die Messung verfügbar.')
          ctx.font = font as string
          return Math.round(ctx.measureText(inhalt as string).width)
        },
        [text as string, FONT],
      )

      expect(
        breite,
        `Die Description auf ${route} ist ${breite}px breit (Budget ${BUDGET_PX}px).`,
      ).toBeLessThanOrEqual(BUDGET_PX)
    })
  }
})

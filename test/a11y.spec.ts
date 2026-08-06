import { globSync } from 'node:fs'
import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

/*
 * Die Routenliste kommt aus dem gebauten Verzeichnis und nicht aus einer gepflegten Konstante:
 * eine neue Seite unter app/pages/ soll geprüft werden, ohne dass jemand daran denkt.
 */
const routen = globSync('.output/public/**/*.html')
  .map(datei => datei.replace(/^\.output\/public/, '').replace(/\/?index\.html$/, ''))
  .map(route => route || '/')
  .sort()

if (!routen.length)
  throw new Error('Keine vorgerenderten Seiten in .output/public gefunden. Erst `npm run build`.')

/*
 * wcag2a bis wcag21aa ist der Umfang, auf den sich die BITV und die EU-Richtlinie 2016/2102
 * beziehen. best-practice bleibt außen vor: die Regeln dort sind Empfehlungen ohne
 * Normbezug, und ein Gate soll nur das erzwingen, worauf man sich berufen kann.
 */
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

test.describe('Barrierefreiheit', () => {
  for (const route of routen) {
    test(`${route} hat keine WCAG-Verstöße`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'networkidle' })

      const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze()

      // Die Standardausgabe nennt nur die Anzahl. Ohne Regel-ID und Selektor müsste man den
      // Lauf lokal wiederholen, um überhaupt zu sehen, was gemeint ist.
      const befund = violations.map(
        v =>
          `[${v.impact}] ${v.id}: ${v.help}\n` +
          v.nodes.map(n => `    ${n.target.join(' ')}`).join('\n'),
      )

      expect(befund, `Verstöße auf ${route}:\n${befund.join('\n')}`).toEqual([])
    })
  }
})

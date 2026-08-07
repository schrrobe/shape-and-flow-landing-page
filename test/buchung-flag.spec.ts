import { globSync, readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'
import { kontakt } from '../shared/site'

/*
 * Keine vorgerenderte Seite darf die Booking-App erwähnen — weder als Link noch als Nebensatz.
 *
 * Das gilt hier unbedingt und nicht nur bei ausgeschaltetem Flag: `enable_booking_redirect` wird
 * im Browser ausgewertet, beim Bauen weiß niemand davon, und der Fallback ist aus. Im HTML steht
 * deshalb immer die Fassung ohne Buchungsstrecke. Genau das prüft der Test — er hält fest, dass
 * niemand versehentlich einen Verweis einbaut, der am Flag vorbei ins Markup gerät.
 *
 * Geprüft wird die gebaute Datei und nicht die Seite im Browser: die Frage ist, was ausgeliefert
 * wird, und die beantwortet die Datei besser als das gerenderte DOM. Playwright startet trotzdem
 * seinen Vorschauserver — der Aufwand ist geschenkt gegenüber einer zweiten Testkonfiguration.
 */

const seiten = globSync('.output/public/**/*.html')

if (!seiten.length)
  throw new Error('Keine vorgerenderten Seiten in .output/public gefunden. Erst `npm run build`.')

/*
 * Absichtlich enge Begriffe. Ein bloßes "buchen" käme auch in Sätzen vor, die nichts mit der
 * Booking-App zu tun haben ("beides lässt sich einzeln buchen"), und ein Test, der bei jedem
 * zweiten Textwechsel grundlos ausschlägt, wird abgeschaltet statt gelesen.
 */
const verboten = [
  new URL(kontakt.buchungUrl).host,
  'Buchungssystem',
  'Terminbuchung',
  'Online buchen',
  'direkt online',
]

test.describe('Vorgerendertes HTML', () => {
  for (const datei of seiten) {
    const route = datei.replace(/^\.output\/public/, '').replace(/\/?index\.html$/, '') || '/'

    test(`${route} erwähnt die Booking-App nicht`, () => {
      const html = readFileSync(datei, 'utf8')
      const treffer = verboten.filter(begriff => html.includes(begriff))

      expect(treffer, `Auf ${route} steht noch: ${treffer.join(', ')}`).toEqual([])
    })
  }
})

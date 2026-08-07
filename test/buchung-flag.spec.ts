import { globSync, readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'
import { kontakt } from '../shared/site'

/*
 * Solange enable_booking_redirect aus ist, darf keine ausgelieferte Seite die Booking-App
 * erwähnen — weder als Link noch als Nebensatz. Über zehn Dateien verteilt ist das eine Stelle
 * zu viel, um es beim nächsten Textwechsel zuverlässig im Kopf zu haben, also prüft es ein Test.
 *
 * Geprüft wird das gebaute HTML und nicht die Seite im Browser: die Frage ist, was ausgeliefert
 * wird, und die beantwortet die Datei besser als das gerenderte DOM. Playwright startet trotzdem
 * seinen Vorschauserver — der Aufwand ist geschenkt gegenüber einer zweiten Testkonfiguration.
 */

const seiten = globSync('.output/public/**/*.html')

if (!seiten.length)
  throw new Error('Keine vorgerenderten Seiten in .output/public gefunden. Erst `npm run build`.')

/*
 * Der Flag-Zustand steht in der Nuxt-Nutzlast jeder Seite, weil er aus der öffentlichen
 * runtimeConfig kommt. Ihn dort abzulesen ist genauer als eine Umgebungsvariable im Testlauf:
 * gebaut wurde das HTML womöglich in einem ganz anderen Prozess.
 */
// Der Schlüssel steht in der Nutzlast mal mit und mal ohne Anführungszeichen, je nachdem, wie
// Nuxt sie serialisiert. Beides zu erlauben ist billiger, als sich auf eine Form zu verlassen.
const startseite = readFileSync('.output/public/index.html', 'utf8')
const flagAn = /"?bookingRedirect"?\s*:\s*true/.test(startseite)

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

test.describe('Ohne enable_booking_redirect', () => {
  test.skip(flagAn, 'enable_booking_redirect ist an: die Booking-App darf dann erwähnt werden.')

  for (const datei of seiten) {
    const route = datei.replace(/^\.output\/public/, '').replace(/\/?index\.html$/, '') || '/'

    test(`${route} erwähnt die Booking-App nicht`, () => {
      const html = readFileSync(datei, 'utf8')
      const treffer = verboten.filter(begriff => html.includes(begriff))

      expect(treffer, `Auf ${route} steht noch: ${treffer.join(', ')}`).toEqual([])
    })
  }
})

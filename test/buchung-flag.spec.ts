import { globSync, readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'
import { contact } from '../shared/site'

/*
 * No prerendered page may mention the booking app — neither as a link nor in passing.
 *
 * That holds unconditionally and not only while the flag is off: `enable_booking_redirect` is
 * evaluated in the browser, at build time nobody knows about it, and the fallback is off. So the
 * HTML always contains the version without a booking flow. That is exactly what this test checks
 * — it records that nobody accidentally adds a reference that slips past the flag into the
 * markup.
 *
 * The built file is checked and not the page in the browser: the question is what gets delivered,
 * and the file answers that better than the rendered DOM. Playwright still starts its preview
 * server — the cost is negligible compared to a second test configuration.
 */

const pages = globSync('.output/public/**/*.html')

if (!pages.length)
  throw new Error('No prerendered pages found in .output/public. Run `npm run build` first.')

/*
 * Deliberately narrow terms. A bare "buchen" would also appear in sentences that have nothing to
 * do with the booking app ("beides lässt sich einzeln buchen"), and a test that fires for no
 * reason on every other copy change gets switched off rather than read.
 */
const forbidden = [
  new URL(contact.bookingUrl).host,
  'Buchungssystem',
  'Terminbuchung',
  'Online buchen',
  'direkt online',
]

test.describe('Prerendered HTML', () => {
  for (const file of pages) {
    const route = file.replace(/^\.output\/public/, '').replace(/\/?index\.html$/, '') || '/'

    test(`${route} does not mention the booking app`, () => {
      const html = readFileSync(file, 'utf8')
      const hits = forbidden.filter(term => html.includes(term))

      expect(hits, `${route} still contains: ${hits.join(', ')}`).toEqual([])
    })
  }
})

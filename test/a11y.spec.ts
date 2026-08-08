import { globSync } from 'node:fs'
import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

/*
 * The list of routes comes from the built directory and not from a maintained constant: a new
 * page under app/pages/ should be checked without anyone having to remember it.
 */
const routes = globSync('.output/public/**/*.html')
  .map(file => file.replace(/^\.output\/public/, '').replace(/\/?index\.html$/, ''))
  .map(route => route || '/')
  .sort()

if (!routes.length)
  throw new Error('No prerendered pages found in .output/public. Run `npm run build` first.')

/*
 * wcag2a through wcag21aa is the scope the BITV and EU directive 2016/2102 refer to.
 * best-practice stays out: those rules are recommendations without a normative basis, and a gate
 * should only enforce what one can point to.
 */
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

test.describe('Barrierefreiheit', () => {
  for (const route of routes) {
    test(`${route} has no WCAG violations`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'networkidle' })

      const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze()

      // The default output only gives the count. Without the rule ID and selector one would have
      // to repeat the run locally just to see what is meant.
      const findings = violations.map(
        v =>
          `[${v.impact}] ${v.id}: ${v.help}\n` +
          v.nodes.map(n => `    ${n.target.join(' ')}`).join('\n'),
      )

      expect(findings, `Violations on ${route}:\n${findings.join('\n')}`).toEqual([])
    })
  }
})

import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { defineNuxtModule } from 'nuxt/kit'
import { markdownPath } from '../../shared/agenten'
import { pageMarkdown } from './konvertierung'

/*
 * Writes a Markdown representation next to every prerendered page.
 *
 * Runs in the build and only there: Turndown stays a devDependency and never ends up in the
 * server bundle. The pages are prerendered anyway (routeRules in nuxt.config.ts), so the
 * conversion happens once per page and per build instead of once per request.
 *
 * The files land in the same directory as the HTML and are therefore delivered like any other
 * static file, with `text/markdown` from the file extension: `/preise` gets `/preise.md`, the home
 * page gets `/.md`. server/plugins/agenten.ts additionally hands them out under the canonical
 * URL when a request asks for `Accept: text/markdown`.
 *
 * Not a route of its own under server/routes/: it would have to be prerendered as well, and Nitro
 * only follows links whose extension is empty or `.json` — a `.md` route would have to be listed
 * by hand, page for page.
 */
export default defineNuxtModule({
  meta: { name: 'sf-markdown' },

  setup(_options, nuxt) {
    nuxt.hook('nitro:init', nitro => {
      /*
       * Nitro logs an error in this hook and carries on with the next route. That would ship a
       * build in which single pages have no Markdown — so the failures are collected and thrown at
       * the end, when the prerenderer is done and its own output is complete.
       */
      const failed: string[] = []

      nitro.hooks.hook('prerender:done', () => {
        if (failed.length)
          throw new Error(`No Markdown could be generated for: ${failed.join(', ')}`)
      })

      nitro.hooks.hook('prerender:generate', async route => {
        // Redirects, error pages and everything that is not a page: the hook sees every
        // prerendered route, including sitemap.xml and the payloads.
        if (route.error || route.skip || !route.fileName?.endsWith('.html')) return

        const html = typeof route.contents === 'string' ? route.contents : undefined
        if (!html) return

        try {
          const markdown = pageMarkdown(html)
          if (markdown === null) throw new Error('the HTML has no <main> element')

          // markdownPath returns the path with a leading slash, the file name is relative to
          // publicDir: `/preise.md` becomes `preise.md`, `/.md` stays `.md`.
          const target = join(nitro.options.output.publicDir, markdownPath(route.route).slice(1))
          await mkdir(dirname(target), { recursive: true })
          await writeFile(target, markdown, 'utf8')
        } catch (error) {
          failed.push(`${route.route} (${error instanceof Error ? error.message : String(error)})`)
        }
      })
    })
  },
})

import tailwindcss from '@tailwindcss/vite'
import { treatmentBySlug, treatments, priceRange } from './shared/behandlungen'
import { articles } from './shared/ratgeber'
import {
  address,
  contact,
  normalizeSiteUrl,
  openingHours,
  site,
  socialProfiles,
} from './shared/site'

// Prices and article titles are not written out as text here either: after a change in shared/,
// llms.txt and the structured data must not be the one place left behind out of date.
const body = treatmentBySlug('jeveauxeffect')!
const face = treatmentBySlug('lymphdrainage-gesicht')!

/*
 * The site URL is a build input, not a runtime value: every page is prerendered at build time, so
 * canonicals, sitemap, OG images and structured data are frozen into the HTML at that point. That
 * is why the pipeline builds a separate image per environment, see docs/deploy.md.
 *
 * On its own, NUXT_SITE_URL only reaches nuxt-site-config, i.e. canonicals, sitemap and
 * robots.txt. schemaOrg and llms below read the literal from shared/site.ts, and without this
 * line the JSON-LD and llms.txt on stage and dev would still carry the production domain.
 */
// Without the trailing slash, because `${siteUrl}/images/...` is concatenated below: a
// NUXT_SITE_URL copied from the docs with a trailing slash would otherwise produce double
// slashes in JSON-LD and llms.txt. The normalisation lives in shared/site.ts, because the
// handlers under server/routes/.well-known/ answer with the same address.
const siteUrl = normalizeSiteUrl(process.env.NUXT_SITE_URL)

export default defineNuxtConfig({
  compatibilityDate: '2026-08-05',

  modules: [
    // Generates .nuxt/eslint.config.mjs with this project's auto-imports. Without the module
    // ESLint would treat useSeoMeta, defineOgImageComponent and the rest as undefined globals.
    '@nuxt/eslint',
    /*
     * axe-core as a panel in the Nuxt DevTools. `enabled` defaults to `nuxt.options.dev`, so in a
     * production build the module does nothing.
     *
     * Version 1.0.0-alpha.1 can do that and nothing else. The build-time report described in the
     * project's README is unreleased code: the package contains neither the option nor the
     * `prerender:generate` hook. Even if it did — it would run axe in linkedom, i.e. without
     * layout and without cascade. Measured across the 13 pages of this site that yields zero
     * violations and 39 rules left undecided for lack of rendering: contrast,
     * `landmark-one-main`, `page-has-heading-one`. Precisely the questions axe is used for.
     *
     * They are answered by the "Barrierefreiheit" job in ci.yml, which runs axe in a real browser
     * against the prerendered pages.
     */
    '@nuxt/a11y',
    // Umbrella module: sitemap, robots, schema-org, og-image, link-checker, seo-utils, site-config.
    '@nuxtjs/seo',
    '@nuxt/image',
    '@nuxt/fonts',
    'nuxt-llms',
  ],

  /*
   * Three checks Nuxt does not enable by itself. They belong here and not in tsconfig.json: the
   * four configurations under .nuxt/ are rewritten by every `nuxt prepare`.
   *
   * noUncheckedIndexedAccess only affects access via index signatures and arrays. The lookup
   * tables in SfButton.vue run over `as const` objects with fixed keys and are unaffected.
   */
  typescript: {
    tsConfig: {
      compilerOptions: {
        noUnusedLocals: true,
        noUnusedParameters: true,
        noUncheckedIndexedAccess: true,
      },
    },
  },

  css: ['~/assets/css/main.css'],

  // Tailwind 4 no longer has a JS config and runs as a Vite plugin, not as a Nuxt module.
  vite: {
    plugins: [tailwindcss()],
  },

  app: {
    head: {
      htmlAttrs: { lang: 'de' },
      link: [
        { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
      meta: [
        // Must follow --sf-primary from app/assets/css/tokens.css.
        { name: 'theme-color', content: '#a04607' },
        { name: 'format-detection', content: 'telephone=no' },
      ],
    },
  },

  /*
   * Hybrid: a Node server runs, but every page is rendered at build time. Crawlers and AI agents
   * get finished HTML with no wait, and the contact form under server/api/ runs alongside at
   * runtime without changing anything about how the pages are rendered.
   */
  routeRules: {
    '/**': { prerender: true },
    // Has to come after the rule above and undo it for /api/: otherwise the prerenderer would try
    // to call the handlers as GET at build time and freeze their response.
    '/api/**': { prerender: false },
    /*
     * The agent endpoints answer at runtime, although they are as static as any page here. The
     * reason is the content type: for a prerendered route Nitro derives it from the file
     * extension, and `/.well-known/api-catalog` has none — a linkset would then be delivered as
     * text/plain and its profile parameter would be lost. Assembling the four answers costs a
     * string concatenation each; keeping them from being prerendered costs one line here.
     */
    '/.well-known/**': { prerender: false },
  },

  /*
   * The outgoing mail server for the contact form. The values here are only the shape; they are
   * set at runtime via NUXT_SMTP_HOST, NUXT_SMTP_PORT, NUXT_SMTP_USER, NUXT_SMTP_PASSWORD,
   * NUXT_SMTP_ABSENDER and NUXT_SMTP_EMPFAENGER (see docs/deploy.md).
   *
   * Deliberately not under `public`: whatever is there lies open in the browser. If the values
   * are missing, server/api/kontakt.post.ts answers with 503 and the form names the email
   * address.
   */
  runtimeConfig: {
    /*
     * The site's own address, for the handlers under server/routes/.well-known/: they are the only
     * thing on this site that is rendered at runtime and they write absolute URLs into their
     * answers. The value is frozen at build time like every other one derived from NUXT_SITE_URL —
     * Nitro derives the same variable name from this key, so a runtime NUXT_SITE_URL would
     * override it.
     *
     * Deliberately not under `public`: nothing in the browser needs it, and the pages carry their
     * address in the canonical anyway.
     */
    siteUrl,
    smtp: {
      host: '',
      // 587 with STARTTLS. For 465 the handler switches to implicit TLS by itself.
      port: 587,
      user: '',
      password: '',
      /*
       * Sender and recipient live in shared/site.ts and therefore in the same place as the rest
       * of the contact details. Here they are only the default: NUXT_SMTP_ABSENDER and
       * NUXT_SMTP_EMPFAENGER override them, e.g. to route requests from dev and stage into a test
       * mailbox.
       *
       * These two keys stay German while the rest of the code is English, and deliberately so:
       * Nitro derives the environment variable name from the key, so renaming them would rename
       * NUXT_SMTP_ABSENDER and NUXT_SMTP_EMPFAENGER on every server and in every GitHub
       * environment. A silently unset NUXT_SMTP_EMPFAENGER would send the requests from dev and
       * stage to the studio mailbox instead of the test one — a rename not worth that risk.
       */
      absender: contact.senderEmail,
      empfaenger: contact.email,
    },
    unleash: {
      url: '',
      backendToken: '',
      environment: '',
      deployment: '',
    },
    public: {
      unleash: {
        url: '',
        frontendToken: '',
        environment: '',
        deployment: '',
      },
    },
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      // Not discoverable through links in the markup, hence listed explicitly. /linktree is
      // deliberately in no menu — it is opened from the social profiles.
      routes: ['/', '/sitemap.xml', '/robots.txt', '/llms.txt', '/linktree'],
    },
    compressPublicAssets: { brotli: true, gzip: true },
  },

  // Feeds canonicals, sitemap, robots.txt, OG images and structured data.
  site: {
    url: siteUrl,
    name: site.name,
    description:
      `Brasilianische Lymphdrainage in ${address.city}: Jeveauxeffect® für Körper und ` +
      `Gesicht bei ${site.name}, lizenzierter Partner der Jeveaux Company®.`,
    defaultLocale: 'de',
    trailingSlash: false,
  },

  schemaOrg: {
    identity: {
      '@type': ['Organization', 'LocalBusiness', 'HealthAndBeautyBusiness'],
      name: site.name,
      description: `Studio für brasilianische Lymphdrainage in ${address.city}.`,
      url: siteUrl,
      logo: `${siteUrl}/images/logo.jpg`,
      image: `${siteUrl}/images/studio-1.jpg`,
      // No `telephone`: the studio takes requests by email and through the contact form, and a
      // phone number in the structured data that does not exist would be a false statement.
      email: contact.email,
      priceRange,
      currenciesAccepted: 'EUR',
      address: {
        streetAddress: address.street,
        postalCode: address.postalCode,
        addressLocality: address.city,
        addressCountry: address.country,
      },
      areaServed: [address.city, 'Ruhrgebiet'],
      // Every social profile that is set, so Google can tie the entity to its accounts. Only
      // emitted when at least one profile exists: an empty sameAs would be a structured data
      // error.
      ...(socialProfiles.length > 0 ? { sameAs: socialProfiles.map(profile => profile.url) } : {}),
      // No openingHoursSpecification: the studio works by appointment, and invented opening hours
      // in the structured data would be a false statement towards Google.
      slogan: openingHours.note,
    },
  },

  ogImage: {
    // The component is not set here but per page via defineOgImageComponent in usePage(). This
    // module version does not allow it as a default, and a value here would have no effect.
    defaults: {
      width: 1200,
      height: 630,
    },
  },

  image: {
    format: ['avif', 'webp'],
    quality: 78,
  },

  fonts: {
    families: [
      // Downloaded at build time and self-hosted, so no request goes to Google.
      {
        name: 'Playfair Display',
        provider: 'google',
        weights: [400, 500, 600],
        styles: ['normal'],
      },
    ],
  },

  llms: {
    domain: siteUrl,
    title: `${site.name} – ${site.tagline}`,
    description:
      `${site.name} ist ein Studio für brasilianische Lymphdrainage in ${address.street}, ` +
      `${address.postalCode} ${address.city}. Angeboten werden der ${body.name} als ästhetische ` +
      `Ganzkörperbehandlung (${body.priceEuro} Euro) und der ${face.name} als ` +
      `Gesichtsbehandlung (${face.priceEuro} Euro). ${site.name} ist lizenzierter Partner ` +
      `der Jeveaux Company®.`,
    notes: [
      'Der Jeveauxeffect® ist eine ästhetische Anwendung im Beauty-Bereich, keine medizinische ' +
        'oder therapeutische Behandlung, und ersetzt keine ärztliche Maßnahme.',
      'Es werden keine Heilversprechen abgegeben. Beschriebene Effekte beruhen auf subjektiven ' +
        'Wahrnehmungen und können individuell abweichen.',
      'Behandelt wird nach Terminvereinbarung.',
      'Jeveauxeffect® und Jeveauxeffect Face® sind eingetragene Marken der Jeveaux Company®.',
    ],
    sections: [
      {
        title: 'Behandlungen',
        links: [
          ...treatments.map(t => ({
            title: `${t.name} – ${t.title} (${t.priceEuro} Euro)`,
            href: t.route,
          })),
          { title: 'Preise im Überblick', href: '/preise' },
        ],
      },
      {
        title: 'Methode und Hintergrund',
        links: [
          {
            title: 'Brasilianische Lymphdrainage: Methode, Ablauf und Gegenanzeigen',
            href: '/brasilianische-lymphdrainage',
          },
          { title: 'Ratgeber-Übersicht', href: '/ratgeber' },
          ...articles.map(a => ({ title: a.title, href: a.route })),
        ],
      },
      {
        title: 'Studio und Kontakt',
        links: [
          { title: `Über das Studio in ${address.city}`, href: '/studio' },
          { title: 'Kontakt, Anfahrt und Terminvereinbarung', href: '/kontakt' },
          { title: 'Häufige Fragen', href: '/faq' },
        ],
      },
      {
        title: 'Rechtliches',
        links: [
          { title: 'Impressum', href: '/impressum' },
          { title: 'Datenschutzerklärung', href: '/datenschutz' },
        ],
      },
    ],
  },
})

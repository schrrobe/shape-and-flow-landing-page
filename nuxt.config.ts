import tailwindcss from '@tailwindcss/vite'
import { behandlungBySlug, behandlungen, preisSpanne } from './shared/behandlungen'
import { ratgeber } from './shared/ratgeber'
import { adresse, kontakt, oeffnungszeiten, site } from './shared/site'

// Preise und Artikeltitel stehen auch hier nicht als Text: llms.txt und Structured Data sollen
// nach einer Änderung in shared/ nicht als einzige Stelle veraltet zurückbleiben.
const koerper = behandlungBySlug('jeveauxeffect')!
const gesicht = behandlungBySlug('lymphdrainage-gesicht')!

/*
 * Die Site-URL ist eine Build-Eingabe, kein Laufzeitwert: jede Seite wird beim Build
 * vorgerendert, damit sind Canonicals, Sitemap, OG-Images und Structured Data zum Zeitpunkt
 * des Builds im HTML festgeschrieben. Deshalb baut die Pipeline pro Umgebung ein eigenes
 * Image, siehe docs/deploy.md.
 *
 * NUXT_SITE_URL erreicht von allein nur nuxt-site-config, also Canonicals, Sitemap und
 * robots.txt. schemaOrg und llms unten lesen den Literal aus shared/site.ts, und ohne diese
 * Zeile stünde in JSON-LD und llms.txt auf stage und dev weiterhin die Produktionsdomain.
 */
// Ohne den abschließenden Schrägstrich, weil unten `${siteUrl}/images/...` verkettet wird: ein
// aus der Doku kopiertes NUXT_SITE_URL mit Schrägstrich am Ende ergäbe sonst doppelte in
// JSON-LD und llms.txt.
const siteUrl = (process.env.NUXT_SITE_URL || site.url).replace(/\/+$/, '')

export default defineNuxtConfig({
  compatibilityDate: '2026-08-05',

  modules: [
    // Erzeugt .nuxt/eslint.config.mjs mit den Auto-Imports dieses Projekts. Ohne das Modul hielte
    // ESLint useSeoMeta, defineOgImageComponent und den Rest für undefinierte Globals.
    '@nuxt/eslint',
    /*
     * axe-core als Panel in den Nuxt DevTools. `enabled` steht per Default auf `nuxt.options.dev`,
     * im Produktionsbuild macht das Modul also nichts.
     *
     * Version 1.0.0-alpha.1 kann ausschließlich das. Der Build-Zeit-Report, den das README des
     * Projekts beschreibt, ist unveröffentlichter Code: im Paket gibt es weder die Option noch
     * den `prerender:generate`-Hook. Selbst wenn — er ließe axe in linkedom laufen, also ohne
     * Layout und ohne Cascade. Über die 13 Seiten dieser Site gemessen ergibt das null Verstöße
     * und 39 Regeln, die mangels Rendering unentschieden bleiben: Kontrast, `landmark-one-main`,
     * `page-has-heading-one`. Genau die Fragen also, für die man axe überhaupt einsetzt.
     *
     * Beantwortet werden sie vom Job "Barrierefreiheit" in ci.yml, der axe in einem echten
     * Browser gegen die vorgerenderten Seiten laufen lässt.
     */
    '@nuxt/a11y',
    // Sammelmodul: sitemap, robots, schema-org, og-image, link-checker, seo-utils, site-config.
    '@nuxtjs/seo',
    '@nuxt/image',
    '@nuxt/fonts',
    'nuxt-llms',
  ],

  /*
   * Drei Prüfungen, die Nuxt von sich aus nicht einschaltet. Sie gehören hierher und nicht in
   * tsconfig.json: die vier Konfigurationen unter .nuxt/ schreibt jeder `nuxt prepare` neu.
   *
   * noUncheckedIndexedAccess betrifft nur Zugriffe über Index-Signaturen und Arrays. Die
   * Nachschlagetabellen in SfButton.vue laufen über `as const`-Objekte mit festen Schlüsseln und
   * bleiben davon unberührt.
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

  // Tailwind 4 hat keine JS-Config mehr und läuft als Vite-Plugin, nicht als Nuxt-Modul.
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
        // Muss --sf-primary aus app/assets/css/tokens.css folgen.
        { name: 'theme-color', content: '#a04607' },
        { name: 'format-detection', content: 'telephone=no' },
      ],
    },
  },

  /*
   * Hybrid: es läuft ein Node-Server, aber jede Seite wird beim Build gerendert. Crawler und
   * KI-Agenten bekommen fertiges HTML ohne Wartezeit, und das Kontaktformular unter server/api/
   * läuft daneben zur Laufzeit, ohne dass sich am Rendering der Seiten etwas ändert.
   */
  routeRules: {
    '/**': { prerender: true },
    // Muss nach der Regel darüber stehen und sie für /api/ wieder aufheben: der Prerenderer würde
    // sonst versuchen, die Handler beim Build als GET abzurufen und deren Antwort einzufrieren.
    '/api/**': { prerender: false },
  },

  /*
   * Der Postausgangsserver für das Kontaktformular. Die Werte hier sind nur die Form; gesetzt
   * werden sie zur Laufzeit über NUXT_SMTP_HOST, NUXT_SMTP_PORT, NUXT_SMTP_USER,
   * NUXT_SMTP_PASSWORD, NUXT_SMTP_ABSENDER und NUXT_SMTP_EMPFAENGER (siehe docs/deploy.md).
   *
   * Bewusst nicht unter `public`: was dort steht, liegt im Browser offen. Fehlen die Werte,
   * antwortet server/api/kontakt.post.ts mit 503 und das Formular nennt die E-Mail-Adresse.
   */
  runtimeConfig: {
    smtp: {
      host: '',
      // 587 mit STARTTLS. Für 465 stellt der Handler von sich aus auf implizites TLS um.
      port: 587,
      user: '',
      password: '',
      /** Absenderadresse der Formularmails. Leer: dann wird `user` genommen. */
      absender: '',
      /** Zielpostfach. Leer: dann geht die Anfrage an kontakt.email aus shared/site.ts. */
      empfaenger: '',
    },
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      // Ohne Verlinkung im Markup nicht auffindbar, deshalb explizit.
      routes: ['/', '/sitemap.xml', '/robots.txt', '/llms.txt'],
    },
    compressPublicAssets: { brotli: true, gzip: true },
  },

  // Speist Canonicals, Sitemap, robots.txt, OG-Images und Structured Data.
  site: {
    url: siteUrl,
    name: site.name,
    description:
      `Brasilianische Lymphdrainage in ${adresse.ort}: Jeveauxeffect® für Körper und ` +
      `Gesicht bei ${site.name}, lizenzierter Partner der Jeveaux Company®.`,
    defaultLocale: 'de',
    trailingSlash: false,
  },

  schemaOrg: {
    identity: {
      '@type': ['Organization', 'LocalBusiness', 'HealthAndBeautyBusiness'],
      name: site.name,
      description: `Studio für brasilianische Lymphdrainage in ${adresse.ort}.`,
      url: siteUrl,
      logo: `${siteUrl}/images/logo.jpg`,
      image: `${siteUrl}/images/studio-1.jpg`,
      // Kein `telephone`: das Studio nimmt Anfragen per E-Mail und über das Kontaktformular an,
      // und eine Rufnummer im Structured Data, die es nicht gibt, wäre eine Falschangabe.
      email: kontakt.email,
      priceRange: preisSpanne,
      currenciesAccepted: 'EUR',
      address: {
        streetAddress: adresse.strasse,
        postalCode: adresse.plz,
        addressLocality: adresse.ort,
        addressCountry: adresse.land,
      },
      areaServed: [adresse.ort, 'Ruhrgebiet'],
      // Solange kein Profil hinterlegt ist, steht hier nichts: ein leeres sameAs wäre ein
      // Fehler im Structured Data.
      ...(kontakt.instagram ? { sameAs: [kontakt.instagram] } : {}),
      // Keine openingHoursSpecification: das Studio arbeitet auf Termin, und erfundene
      // Öffnungszeiten im Structured Data wären eine Falschangabe gegenüber Google.
      slogan: oeffnungszeiten.hinweis,
    },
  },

  ogImage: {
    // Die Komponente wird nicht hier gesetzt, sondern pro Seite über defineOgImageComponent in
    // useSeite(). Als Default lässt die Modulversion sie nicht zu, und ein Wert hier wäre
    // wirkungslos.
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
      // Wird beim Build heruntergeladen und selbst gehostet, es geht also kein Request an Google.
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
      `${site.name} ist ein Studio für brasilianische Lymphdrainage in ${adresse.strasse}, ` +
      `${adresse.plz} ${adresse.ort}. Angeboten werden der ${koerper.name} als ästhetische ` +
      `Ganzkörperbehandlung (${koerper.preisEuro} Euro) und der ${gesicht.name} als ` +
      `Gesichtsbehandlung (${gesicht.preisEuro} Euro). ${site.name} ist lizenzierter Partner ` +
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
          ...behandlungen.map(b => ({
            title: `${b.name} – ${b.titel} (${b.preisEuro} Euro)`,
            href: b.route,
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
          ...ratgeber.map(a => ({ title: a.titel, href: a.route })),
        ],
      },
      {
        title: 'Studio und Kontakt',
        links: [
          { title: `Über das Studio in ${adresse.ort}`, href: '/studio' },
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

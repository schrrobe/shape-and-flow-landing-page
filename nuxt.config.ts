import tailwindcss from '@tailwindcss/vite'
import { behandlungBySlug, behandlungen, preisSpanne } from './shared/behandlungen'
import { ratgeber } from './shared/ratgeber'
import { adresse, kontakt, oeffnungszeiten, site } from './shared/site'

// Preise und Artikeltitel stehen auch hier nicht als Text: llms.txt und Structured Data sollen
// nach einer Änderung in shared/ nicht als einzige Stelle veraltet zurückbleiben.
const koerper = behandlungBySlug('jeveauxeffect')!
const gesicht = behandlungBySlug('lymphdrainage-gesicht')!

export default defineNuxtConfig({
  compatibilityDate: '2026-08-05',

  modules: [
    // Sammelmodul: sitemap, robots, schema-org, og-image, link-checker, seo-utils, site-config.
    '@nuxtjs/seo',
    '@nuxt/image',
    '@nuxt/fonts',
    'nuxt-llms',
  ],

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
        { name: 'theme-color', content: '#c2540a' },
        { name: 'format-detection', content: 'telephone=no' },
      ],
    },
  },

  /*
   * Hybrid: es läuft ein Node-Server, aber jede Seite wird beim Build gerendert. Crawler und
   * KI-Agenten bekommen fertiges HTML ohne Wartezeit, und server/api/ bleibt für später offen
   * (etwa ein Kontaktformular), ohne dass sich am Rendering etwas ändert.
   */
  routeRules: {
    '/**': { prerender: true },
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
    url: site.url,
    name: site.name,
    description: `Brasilianische Lymphdrainage in ${adresse.ort}: Jeveauxeffect® für Körper und `
      + `Gesicht bei ${site.name}, lizenzierter Partner der Jeveaux Company®.`,
    defaultLocale: 'de',
    trailingSlash: false,
  },

  schemaOrg: {
    identity: {
      '@type': ['Organization', 'LocalBusiness', 'HealthAndBeautyBusiness'],
      'name': site.name,
      'description': `Studio für brasilianische Lymphdrainage in ${adresse.ort}.`,
      'url': site.url,
      'logo': `${site.url}/images/logo.jpg`,
      'image': `${site.url}/images/studio-1.jpg`,
      'telephone': kontakt.telefon,
      'email': kontakt.email,
      'priceRange': preisSpanne,
      'currenciesAccepted': 'EUR',
      'address': {
        streetAddress: adresse.strasse,
        postalCode: adresse.plz,
        addressLocality: adresse.ort,
        addressCountry: adresse.land,
      },
      'areaServed': [adresse.ort, 'Ruhrgebiet'],
      // Solange kein Profil hinterlegt ist, steht hier nichts: ein leeres sameAs wäre ein
      // Fehler im Structured Data.
      ...(kontakt.instagram ? { sameAs: [kontakt.instagram] } : {}),
      // Keine openingHoursSpecification: das Studio arbeitet auf Termin, und erfundene
      // Öffnungszeiten im Structured Data wären eine Falschangabe gegenüber Google.
      'slogan': oeffnungszeiten.hinweis,
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
      { name: 'Playfair Display', provider: 'google', weights: [400, 500, 600], styles: ['normal'] },
    ],
  },

  llms: {
    domain: site.url,
    title: `${site.name} – ${site.tagline}`,
    description:
      `${site.name} ist ein Studio für brasilianische Lymphdrainage in ${adresse.strasse}, `
      + `${adresse.plz} ${adresse.ort}. Angeboten werden der ${koerper.name} als ästhetische `
      + `Ganzkörperbehandlung (${koerper.preisEuro} Euro) und der ${gesicht.name} als `
      + `Gesichtsbehandlung (${gesicht.preisEuro} Euro). ${site.name} ist lizenzierter Partner `
      + `der Jeveaux Company®.`,
    notes: [
      'Der Jeveauxeffect® ist eine ästhetische Anwendung im Beauty-Bereich, keine medizinische '
      + 'oder therapeutische Behandlung, und ersetzt keine ärztliche Maßnahme.',
      'Es werden keine Heilversprechen abgegeben. Beschriebene Effekte beruhen auf subjektiven '
      + 'Wahrnehmungen und können individuell abweichen.',
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

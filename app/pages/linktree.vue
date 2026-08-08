<script setup lang="ts">
import { kombiAnker } from '#shared/behandlungen'
import { kontakt, site } from '#shared/site'

/*
 * Die Seite hinter dem Link in den Social-Profilen: alle Ziele als Knöpfe, sonst nichts.
 *
 * Bewusst nicht über useSeite(): das legt eine Brotkrümelspur ins Structured Data, die hier auf
 * nichts Sichtbares zeigt — die Seite hat keinen Seitenkopf und steht ohnehin auf noindex.
 * Das Vorschaubild bleibt, denn genau diese Adresse wird in Profilen und Nachrichten geteilt.
 */
definePageMeta({ layout: 'linktree' })

const beschreibung =
  `Alle Links von ${site.name}: Instagram, TikTok, Website, der Jeveauxeffect® erklärt, ` +
  `Preise und Termine.`

useSeoMeta({
  title: 'Alle Links',
  description: beschreibung,
  ogTitle: `Alle Links | ${site.name}`,
  ogDescription: beschreibung,
  ogType: 'website',
  ogSiteName: site.name,
  ogLocale: 'de_DE',
  twitterCard: 'summary_large_image',
})

defineOgImageComponent('SfOg', {
  title: site.name,
  description: site.tagline,
  eyebrow: 'Alle Links',
})

// Die Seite gehört nicht in den Suchindex — sie sagt nichts, was nicht schon woanders steht.
// Das eine Meta hält sie zugleich aus der Sitemap heraus, wie auf /impressum und /datenschutz.
useHead({ meta: [{ name: 'robots', content: 'noindex, follow' }] })

/*
 * Die Liste steht hier und nicht in shared/: sie hat genau einen Leser. Die Adressen selbst
 * kommen aus shared/, damit sie nicht ein zweites Mal im Projekt stehen.
 *
 * `href` sind externe Ziele und öffnen im neuen Tab, `to` bleibt in der Website.
 */
const eintraege = [
  ...(kontakt.instagram
    ? [{ label: 'Instagram', icon: 'instagram', href: kontakt.instagram } as const]
    : []),
  ...(kontakt.tiktok ? [{ label: 'TikTok', icon: 'tiktok', href: kontakt.tiktok } as const] : []),
  { label: 'Zur Website', icon: 'haus', to: '/' },
  { label: 'Der Jeveauxeffect® erklärt', icon: 'funke', to: '/jeveauxeffect' },
  { label: 'Preise und Kombitermin', icon: 'preisschild', to: kombiAnker },
] as const
</script>

<template>
  <div class="text-center">
    <SfLogo variant="stacked" class="justify-center text-text-primary" />

    <h1 class="mt-6 text-2xl sm:text-3xl">{{ site.name }}</h1>
    <p class="sf-lead mt-2 text-text-secondary">{{ site.tagline }}</p>

    <ul class="mt-10 space-y-3">
      <li v-for="eintrag in eintraege" :key="eintrag.label">
        <SfButton
          v-if="'href' in eintrag"
          :href="eintrag.href"
          external
          variant="secondary"
          size="lg"
          class="w-full justify-start"
        >
          <SfIcon :name="eintrag.icon" />
          {{ eintrag.label }}
        </SfButton>
        <SfButton
          v-else
          :to="eintrag.to"
          variant="secondary"
          size="lg"
          class="w-full justify-start"
        >
          <SfIcon :name="eintrag.icon" />
          {{ eintrag.label }}
        </SfButton>
      </li>

      <!--
        Der letzte Knopf hängt am Flag enable_booking_redirect und wechselt erst nach der
        Hydration auf die Booking-App. SfTerminButton hält diese Fallunterscheidung.
      -->
      <li>
        <SfTerminButton size="lg" class="w-full justify-start">
          <template #icon>
            <SfIcon name="kalender" />
          </template>
        </SfTerminButton>
      </li>
    </ul>
  </div>
</template>

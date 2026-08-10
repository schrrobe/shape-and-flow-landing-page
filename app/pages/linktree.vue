<script setup lang="ts">
import { site, socialProfiles } from '#shared/site'

/*
 * The page behind the link in the social profiles: every destination as a button, nothing else.
 *
 * Deliberately not built with usePage(): that adds a breadcrumb trail to the structured data
 * pointing at nothing visible — this page has no page header and is noindex anyway. The preview
 * image stays, because this is the exact address shared in profiles and messages.
 */
definePageMeta({ layout: 'linktree' })

const description =
  `Alle Links von ${site.name}: Instagram, TikTok, Website, der Jeveauxeffect® erklärt, ` +
  `Preise und Termine.`

useSeoMeta({
  title: 'Alle Links',
  description,
  ogTitle: `Alle Links | ${site.name}`,
  ogDescription: description,
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

// The page does not belong in the search index — it says nothing that is not said elsewhere.
// The same meta keeps it out of the sitemap, as on /impressum and /datenschutz.
useHead({ meta: [{ name: 'robots', content: 'noindex, follow' }] })

/*
 * The button list. It lives here and not in shared/ because it has exactly one reader; the
 * addresses themselves come from shared/ so they are not written down a second time.
 *
 * `href` entries are external and open in a new tab, `to` entries stay inside the site.
 */
const entries = [
  ...socialProfiles.map(profile => ({
    label: profile.name,
    icon: profile.icon,
    href: profile.url,
  })),
  { label: 'Zur Website', icon: 'home', to: '/' },
  { label: 'Der Jeveauxeffect® erklärt', icon: 'sparkle', to: '/jeveauxeffect' },
  { label: 'Preise und Kombitermin', icon: 'price-tag', to: '/preise' },
  {
    label: 'Bewertung abgeben',
    icon: 'star',
    href: 'https://bewertungshelfer.com/app.html#c=MoCwhgDgpgBAZDAYgGwPYHcBQARVAnAFwFsBXAOwBNMBzAOgjGqgHo9mBhYAKTAHYBHRAEFkABgBaAFgCiQ6aygA3AJZQsmTEA',
  },
] as const
</script>

<template>
  <div class="text-center">
    <SfLogo variant="stacked" class="justify-center text-text-primary" />

    <h1 class="mt-6 text-2xl sm:text-3xl">{{ site.name }}</h1>
    <p class="sf-lead mt-2 text-text-secondary">{{ site.tagline }}</p>

    <ul class="mt-10 space-y-3">
      <li v-for="entry in entries" :key="entry.label">
        <SfButton
          v-if="'href' in entry"
          :href="entry.href"
          external
          variant="secondary"
          size="lg"
          class="w-full justify-start"
        >
          <SfIcon :name="entry.icon" />
          {{ entry.label }}
        </SfButton>
        <SfButton v-else :to="entry.to" variant="secondary" size="lg" class="w-full justify-start">
          <SfIcon :name="entry.icon" />
          {{ entry.label }}
        </SfButton>
      </li>

      <!--
        The last button hangs on the enable_booking_redirect flag and only switches to the
        booking app after hydration. SfTerminButton owns that distinction.
      -->
      <li>
        <SfTerminButton size="lg" class="w-full justify-start">
          <template #icon>
            <SfIcon name="calendar" />
          </template>
        </SfTerminButton>
      </li>
    </ul>
  </div>
</template>

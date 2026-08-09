<script setup lang="ts">
import {
  address,
  formUrl,
  contact,
  trademarkNotice,
  openingHours,
  site,
  socialProfiles,
} from '#shared/site'
import { treatments, comboAnchor } from '#shared/behandlungen'
import { articles } from '#shared/ratgeber'

const bookingVisible = useBookingVisible()

const navigation = [
  ...treatments.map(t => ({ name: t.name, url: t.route })),
  // The combo appointment has no page of its own, so it points at its block in the price list.
  { name: 'Kombitermin', url: comboAnchor },
  { name: 'Methode', url: '/brasilianische-lymphdrainage' },
  { name: 'Preise', url: '/preise' },
  { name: 'Studio', url: '/studio' },
  { name: 'Fragen', url: '/faq' },
  { name: 'Kontakt', url: '/kontakt' },
]

/*
 * The menu opens via a details element, so it works without JavaScript. On a page change it has
 * to close again, otherwise it stays open over the new page.
 */
const menu = useTemplateRef<HTMLDetailsElement>('menu')
const router = useRouter()
// The return value unregisters the guard. Without it, it would stay registered a second time when
// the layout is rebuilt — after an error page rendering its own NuxtLayout, for instance — and
// keep the old <details> element alive.
const stopGuard = router.afterEach(() => {
  if (menu.value) {
    menu.value.open = false
  }
})
onScopeDispose(stopGuard)
</script>

<template>
  <div class="flex min-h-dvh flex-col">
    <a
      href="#content"
      class="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-sf focus:bg-surface focus:px-4 focus:py-2 focus:shadow-card"
    >
      Zum Inhalt springen
    </a>

    <header
      class="sticky top-0 z-40 border-b border-border bg-background/95 shadow-header backdrop-blur"
    >
      <div class="sf-container flex h-16 items-center justify-between gap-4 sm:h-20">
        <NuxtLink
          to="/"
          class="flex items-center rounded-sf py-1 hover:text-primary"
          :aria-label="`${site.nameAscii}, zur Startseite`"
        >
          <SfLogo />
        </NuxtLink>

        <nav aria-label="Hauptmenü" class="hidden items-center gap-6 lg:flex">
          <NuxtLink
            v-for="entry in navigation"
            :key="entry.url"
            :to="entry.url"
            class="text-sm text-text-secondary hover:text-primary"
            active-class="text-primary"
          >
            {{ entry.name }}
          </NuxtLink>
        </nav>

        <div class="flex items-center gap-2">
          <!--
            The wrapper carries the hidden, not the button: SfButton brings its own inline-flex,
            and two display utilities on the same element are resolved by the order in the
            stylesheet, not by intent. On mobile only the menu remains, otherwise the button
            crowds the wordmark.
          -->
          <div class="hidden sm:flex">
            <SfTerminButton />
          </div>

          <details ref="menu" class="relative lg:hidden">
            <summary
              class="flex size-10 cursor-pointer items-center justify-center rounded-sf border border-border bg-surface marker:content-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
              aria-label="Menü öffnen"
            >
              <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true">
                <path
                  d="M1 1h16M1 7h16M1 13h16"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
            </summary>
            <nav
              aria-label="Hauptmenü"
              class="absolute right-0 z-50 mt-2 w-60 rounded-sf border border-border bg-surface p-2 shadow-card"
            >
              <NuxtLink
                v-for="entry in navigation"
                :key="entry.url"
                :to="entry.url"
                class="block rounded-sf px-3 py-2.5 text-text-secondary hover:bg-surface-muted hover:text-primary"
                active-class="text-primary"
              >
                {{ entry.name }}
              </NuxtLink>
              <!--
                Not SfTerminButton: the button in the menu spans the full width and is not inline,
                so the case distinction appears here a second time.
              -->
              <a
                v-if="bookingVisible"
                :href="contact.bookingUrl"
                target="_blank"
                rel="noopener"
                class="mt-1 block rounded-sf bg-primary px-3 py-2.5 text-center font-medium text-primary-contrast hover:bg-primary-hover"
              >
                Termin buchen
              </a>
              <NuxtLink
                v-else
                :to="formUrl"
                class="mt-1 block rounded-sf bg-primary px-3 py-2.5 text-center font-medium text-primary-contrast hover:bg-primary-hover"
              >
                Termin anfragen
              </NuxtLink>
            </nav>
          </details>
        </div>
      </div>
    </header>

    <main id="content" class="flex-1">
      <slot />
    </main>

    <footer class="mt-20 border-t border-border bg-surface-muted">
      <div class="sf-container py-14">
        <div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div class="sm:col-span-2 lg:col-span-1">
            <SfLogo variant="stacked" />
          </div>

          <div>
            <h2 class="sf-eyebrow">Behandlungen</h2>
            <ul class="mt-4 space-y-2 text-sm">
              <li v-for="treatment in treatments" :key="treatment.slug">
                <NuxtLink
                  :to="treatment.route"
                  class="text-text-secondary hover:text-primary hover:underline"
                >
                  {{ treatment.name }}
                </NuxtLink>
              </li>
              <li>
                <NuxtLink
                  :to="comboAnchor"
                  class="text-text-secondary hover:text-primary hover:underline"
                >
                  Kombitermin Körper und Gesicht
                </NuxtLink>
              </li>
              <li>
                <NuxtLink
                  to="/preise"
                  class="text-text-secondary hover:text-primary hover:underline"
                >
                  Preise
                </NuxtLink>
              </li>
              <li>
                <NuxtLink
                  to="/brasilianische-lymphdrainage"
                  class="text-text-secondary hover:text-primary hover:underline"
                >
                  Die Methode
                </NuxtLink>
              </li>
            </ul>
          </div>

          <div>
            <h2 class="sf-eyebrow">Mehr erfahren</h2>
            <ul class="mt-4 space-y-2 text-sm">
              <li>
                <NuxtLink to="/faq" class="text-text-secondary hover:text-primary hover:underline">
                  Häufige Fragen
                </NuxtLink>
              </li>
              <li>
                <NuxtLink
                  to="/studio"
                  class="text-text-secondary hover:text-primary hover:underline"
                >
                  Das Studio
                </NuxtLink>
              </li>
              <li>
                <NuxtLink
                  to="/ratgeber"
                  class="text-text-secondary hover:text-primary hover:underline"
                >
                  Ratgeber
                </NuxtLink>
              </li>
              <li v-for="article in articles" :key="article.route">
                <NuxtLink
                  :to="article.route"
                  class="text-text-secondary hover:text-primary hover:underline"
                >
                  {{ article.title }}
                </NuxtLink>
              </li>
            </ul>
          </div>

          <div>
            <h2 class="sf-eyebrow">Kontakt</h2>
            <address class="mt-4 space-y-2 text-sm text-text-secondary not-italic">
              <p>
                im Studio {{ address.venue }}<br />
                {{ address.street }}<br />
                {{ address.postalCode }} {{ address.city }}
              </p>
              <p>
                <a :href="`mailto:${contact.email}`" class="hover:text-primary hover:underline">
                  {{ contact.email }} </a
                ><br />
                <NuxtLink :to="formUrl" class="hover:text-primary hover:underline">
                  Kontaktformular
                </NuxtLink>
              </p>
              <p>{{ openingHours.note }}</p>
              <p v-if="socialProfiles.length > 0">
                <!-- Every profile that shared/site.ts has an address for. -->
                <template v-for="(profile, index) in socialProfiles" :key="profile.name">
                  <span v-if="index > 0" aria-hidden="true"> · </span>
                  <a
                    :href="profile.url"
                    target="_blank"
                    rel="noopener"
                    class="hover:text-primary hover:underline"
                  >
                    {{ profile.name }}
                  </a>
                </template>
              </p>
            </address>

            <SfTerminButton class="mt-5" />
          </div>
        </div>

        <SfRule class="mt-12 text-text-secondary" />

        <div
          class="mt-6 flex flex-col gap-4 text-sm text-text-secondary sm:flex-row sm:items-start sm:justify-between"
        >
          <p class="max-w-xl">
            {{ trademarkNotice }}
          </p>
          <ul class="flex shrink-0 flex-wrap gap-x-5 gap-y-2">
            <li>
              <NuxtLink to="/impressum" class="hover:text-primary hover:underline">
                Impressum
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/datenschutz" class="hover:text-primary hover:underline">
                Datenschutz
              </NuxtLink>
            </li>
            <!-- No year: a copyright year in the markup is wrong from January 1st onwards. -->
            <li>© {{ site.name }}</li>
          </ul>
        </div>
      </div>
    </footer>
  </div>
</template>

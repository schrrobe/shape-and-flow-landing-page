<script setup lang="ts">
import {
  adresse,
  formularUrl,
  kontakt,
  markenhinweis,
  oeffnungszeiten,
  site,
  sozialeProfile,
} from '#shared/site'
import { behandlungen, kombiAnker } from '#shared/behandlungen'
import { ratgeber } from '#shared/ratgeber'

const buchungSichtbar = useBuchungSichtbar()

const navigation = [
  ...behandlungen.map(b => ({ name: b.name, url: b.route })),
  // Der Kombitermin hat keine eigene Seite, deshalb zeigt er auf seinen Block in der Preisliste.
  { name: 'Kombitermin', url: kombiAnker },
  { name: 'Methode', url: '/brasilianische-lymphdrainage' },
  { name: 'Preise', url: '/preise' },
  { name: 'Studio', url: '/studio' },
  { name: 'Fragen', url: '/faq' },
  { name: 'Kontakt', url: '/kontakt' },
]

/*
 * Das Menü klappt über ein Detail-Element auf, damit es ohne JavaScript funktioniert. Beim
 * Seitenwechsel muss es wieder zugehen, sonst bleibt es über der neuen Seite stehen.
 */
const menue = useTemplateRef<HTMLDetailsElement>('menue')
const router = useRouter()
// Der Rückgabewert meldet den Guard wieder ab. Ohne das bliebe er beim Neuaufbau des Layouts —
// etwa nach einer Fehlerseite, die ein eigenes NuxtLayout rendert — ein zweites Mal registriert
// und hielte das alte <details>-Element am Leben.
const stopGuard = router.afterEach(() => {
  if (menue.value) {
    menue.value.open = false
  }
})
onScopeDispose(stopGuard)
</script>

<template>
  <div class="flex min-h-dvh flex-col">
    <a
      href="#inhalt"
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
            v-for="eintrag in navigation"
            :key="eintrag.url"
            :to="eintrag.url"
            class="text-sm text-text-secondary hover:text-primary"
            active-class="text-primary"
          >
            {{ eintrag.name }}
          </NuxtLink>
        </nav>

        <div class="flex items-center gap-2">
          <!--
            Der Wrapper trägt das hidden, nicht der Button: SfButton bringt selbst inline-flex mit,
            und zwei Display-Utilities auf demselben Element entscheidet die Reihenfolge im
            Stylesheet, nicht die Absicht. Auf Mobil bleibt nur das Menü, sonst drängt der Button
            in die Wortmarke.
          -->
          <div class="hidden sm:flex">
            <SfTerminButton />
          </div>

          <details ref="menue" class="relative lg:hidden">
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
                v-for="eintrag in navigation"
                :key="eintrag.url"
                :to="eintrag.url"
                class="block rounded-sf px-3 py-2.5 text-text-secondary hover:bg-surface-muted hover:text-primary"
                active-class="text-primary"
              >
                {{ eintrag.name }}
              </NuxtLink>
              <!--
                Nicht SfTerminButton: der Knopf im Menü ist über die ganze Breite gesetzt und nicht
                inline, deshalb steht die Fallunterscheidung hier ein zweites Mal.
              -->
              <a
                v-if="buchungSichtbar"
                :href="kontakt.buchungUrl"
                target="_blank"
                rel="noopener"
                class="mt-1 block rounded-sf bg-primary px-3 py-2.5 text-center font-medium text-primary-contrast hover:bg-primary-hover"
              >
                Termin buchen
              </a>
              <NuxtLink
                v-else
                :to="formularUrl"
                class="mt-1 block rounded-sf bg-primary px-3 py-2.5 text-center font-medium text-primary-contrast hover:bg-primary-hover"
              >
                Termin anfragen
              </NuxtLink>
            </nav>
          </details>
        </div>
      </div>
    </header>

    <main id="inhalt" class="flex-1">
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
              <li v-for="behandlung in behandlungen" :key="behandlung.slug">
                <NuxtLink
                  :to="behandlung.route"
                  class="text-text-secondary hover:text-primary hover:underline"
                >
                  {{ behandlung.name }}
                </NuxtLink>
              </li>
              <li>
                <NuxtLink
                  :to="kombiAnker"
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
              <li v-for="artikel in ratgeber" :key="artikel.route">
                <NuxtLink
                  :to="artikel.route"
                  class="text-text-secondary hover:text-primary hover:underline"
                >
                  {{ artikel.titel }}
                </NuxtLink>
              </li>
            </ul>
          </div>

          <div>
            <h2 class="sf-eyebrow">Kontakt</h2>
            <address class="mt-4 space-y-2 text-sm text-text-secondary not-italic">
              <p>
                {{ adresse.strasse }}<br />
                {{ adresse.plz }} {{ adresse.ort }}
              </p>
              <p>
                <a :href="`mailto:${kontakt.email}`" class="hover:text-primary hover:underline">
                  {{ kontakt.email }} </a
                ><br />
                <NuxtLink :to="formularUrl" class="hover:text-primary hover:underline">
                  Kontaktformular
                </NuxtLink>
              </p>
              <p>{{ oeffnungszeiten.hinweis }}</p>
              <p v-if="sozialeProfile.length > 0">
                <!-- Every profile that shared/site.ts has an address for. -->
                <template v-for="(profil, index) in sozialeProfile" :key="profil.name">
                  <span v-if="index > 0" aria-hidden="true"> · </span>
                  <a
                    :href="profil.url"
                    target="_blank"
                    rel="noopener"
                    class="hover:text-primary hover:underline"
                  >
                    {{ profil.name }}
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
            {{ markenhinweis }}
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
            <!-- Ohne Jahreszahl: ein Copyright-Jahr im Markup ist ab dem 1. Januar falsch. -->
            <li>© {{ site.name }}</li>
          </ul>
        </div>
      </div>
    </footer>
  </div>
</template>

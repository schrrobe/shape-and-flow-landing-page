<script setup lang="ts">
import type { NuxtError } from '#app'

/*
 * Die Fehlerseite.
 *
 * Sie liegt außerhalb der Layouts, deshalb wird das Layout hier ausdrücklich gesetzt: eine
 * 404-Seite ohne Menü ist eine Sackgasse, und genau da braucht man den Weg zurück am dringendsten.
 */
const props = defineProps<{ error: NuxtError }>()

const istNichtGefunden = computed(() => props.error?.statusCode === 404)

useHead({
  title: istNichtGefunden.value ? 'Seite nicht gefunden' : 'Es ist ein Fehler aufgetreten',
  meta: [{ name: 'robots', content: 'noindex, follow' }],
})
</script>

<template>
  <NuxtLayout>
    <div class="sf-container py-20 sm:py-28">
      <span class="sf-eyebrow">{{ error?.statusCode ?? 'Fehler' }}</span>
      <h1 class="mt-3 text-3xl sm:text-4xl">
        {{ istNichtGefunden ? 'Diese Seite gibt es nicht' : 'Da ist etwas schiefgegangen' }}
      </h1>
      <p class="sf-lead mt-5 text-text-secondary">
        <template v-if="istNichtGefunden">
          Vielleicht hat sich die Adresse geändert oder ein Tippfehler eingeschlichen. Über die
          Links unten kommen Sie weiter.
        </template>
        <template v-else>
          Bitte laden Sie die Seite neu. Wenn es weiterhin nicht klappt, schreiben Sie uns kurz.
        </template>
      </p>

      <ul class="mt-8 flex flex-wrap gap-x-6 gap-y-3">
        <li>
          <NuxtLink to="/" class="text-primary underline underline-offset-4 hover:no-underline">
            Startseite
          </NuxtLink>
        </li>
        <li>
          <NuxtLink
            to="/preise"
            class="text-primary underline underline-offset-4 hover:no-underline"
          >
            Preise
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/faq" class="text-primary underline underline-offset-4 hover:no-underline">
            Häufige Fragen
          </NuxtLink>
        </li>
        <li>
          <NuxtLink
            to="/kontakt"
            class="text-primary underline underline-offset-4 hover:no-underline"
          >
            Kontakt
          </NuxtLink>
        </li>
      </ul>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

/*
 * The error page.
 *
 * It sits outside the layouts, which is why the layout is set explicitly here: a 404 page without
 * a menu is a dead end, and that is exactly where the way back is needed most.
 */
const props = defineProps<{ error: NuxtError }>()

const isNotFound = computed(() => props.error?.statusCode === 404)

useHead({
  title: isNotFound.value ? 'Seite nicht gefunden' : 'Es ist ein Fehler aufgetreten',
  meta: [{ name: 'robots', content: 'noindex, follow' }],
})
</script>

<template>
  <NuxtLayout>
    <div class="sf-container py-20 sm:py-28">
      <span class="sf-eyebrow">{{ error?.statusCode ?? 'Fehler' }}</span>
      <h1 class="mt-3 text-3xl sm:text-4xl">
        {{ isNotFound ? 'Diese Seite gibt es nicht' : 'Da ist etwas schiefgegangen' }}
      </h1>
      <p class="sf-lead mt-5 text-text-secondary">
        <template v-if="isNotFound">
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

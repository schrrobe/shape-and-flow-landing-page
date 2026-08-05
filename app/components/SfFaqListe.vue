<script setup lang="ts">
import type { FaqEintrag } from '#shared/faq'

/*
 * Die FAQ als <details>/<summary>.
 *
 * Ohne JavaScript: das Aufklappen macht der Browser, Tastatursteuerung und Vorlesen funktionieren
 * dadurch von selbst. Wichtig fürs Ranking ist außerdem, dass der Antworttext im HTML steht und
 * nicht erst beim Klick nachgeladen wird, denn nur dann liest ihn ein Crawler mit.
 *
 * Das FAQPage-Structured-Data setzt die Seite, die diese Komponente einbindet, nicht die
 * Komponente selbst: sonst gäbe es bei zwei FAQ-Blöcken auf einer Seite zwei konkurrierende
 * Graphen.
 */
defineProps<{
  eintraege: FaqEintrag[]
}>()
</script>

<template>
  <div class="divide-y divide-border border-y border-border">
    <details v-for="eintrag in eintraege" :key="eintrag.frage" class="group">
      <summary
        class="flex cursor-pointer items-start justify-between gap-4 py-4 font-display text-lg marker:content-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
      >
        {{ eintrag.frage }}
        <span
          class="mt-1.5 shrink-0 text-primary transition-transform group-open:rotate-45"
          aria-hidden="true"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 2v12M2 8h12"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
        </span>
      </summary>

      <div class="sf-prose pb-5">
        <p v-for="(absatz, i) in eintrag.antwort" :key="i">
          {{ absatz }}
        </p>
        <ul v-if="eintrag.liste">
          <li v-for="punkt in eintrag.liste" :key="punkt">
            {{ punkt }}
          </li>
        </ul>
        <p v-if="eintrag.nachsatz">
          {{ eintrag.nachsatz }}
        </p>
      </div>
    </details>
  </div>
</template>

<style scoped>
/* Safari zeigt sonst das eigene Dreieck neben unserem Plus. */
summary::-webkit-details-marker {
  display: none;
}
</style>

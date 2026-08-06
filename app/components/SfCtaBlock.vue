<script setup lang="ts">
import { adresse, formularUrl, kontakt, mailtoUrl, oeffnungszeiten } from '#shared/site'

/*
 * Der Terminblock. Steht am Ende jeder inhaltlichen Seite.
 *
 * Drei Wege, absichtlich in dieser Reihenfolge: das Kontaktformular zuerst, weil es ohne
 * Mailprogramm auskommt, dann die E-Mail für alle, die lieber aus ihrem eigenen Postfach
 * schreiben, dann die Online-Buchung für alle, die direkt verbindlich buchen wollen.
 */
withDefaults(
  defineProps<{
    titel?: string
    text?: string
    /** Auf dem orangen Panel invertieren sich Flächen und Text. */
    inverse?: boolean
  }>(),
  {
    titel: 'Termin vereinbaren',
    text: 'Schreiben Sie kurz, was Sie interessiert. Wir melden uns mit freien Terminen zurück.',
    inverse: false,
  },
)
</script>

<template>
  <div
    class="rounded-sf p-6 sm:p-8"
    :class="
      inverse
        ? 'sf-on-inverse bg-inverse-surface text-inverse-text'
        : 'border border-border bg-surface shadow-card'
    "
  >
    <h2 class="text-2xl">
      {{ titel }}
    </h2>
    <p class="mt-3 max-w-prose" :class="inverse ? 'text-inverse-body' : 'text-text-secondary'">
      {{ text }}
    </p>

    <div class="mt-6 flex flex-wrap gap-3">
      <SfButton :to="formularUrl" :variant="inverse ? 'inverse' : 'primary'" size="lg">
        Nachricht schreiben
      </SfButton>
      <SfButton :href="mailtoUrl" :variant="inverse ? 'inverse' : 'secondary'" size="lg">
        {{ kontakt.email }}
      </SfButton>
      <SfButton
        :href="kontakt.buchungUrl"
        :variant="inverse ? 'inverse' : 'secondary'"
        size="lg"
        external
      >
        Online buchen
      </SfButton>
    </div>

    <p class="mt-4 text-sm" :class="inverse ? 'text-inverse-body' : 'text-text-secondary'">
      {{ oeffnungszeiten.hinweis }}. {{ adresse.strasse }}, {{ adresse.plz }} {{ adresse.ort }}.
    </p>
  </div>
</template>

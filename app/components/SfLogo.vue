<script setup lang="ts">
import { site } from '#shared/site'

/*
 * Das Logo — Konturlinie, Schriftzug und Unterzeile — liegt als Bilddatei vor, wird aber als
 * Deckkraftmaske eingebunden und nicht als <img>. Grund: dasselbe Logo steht auf hellem Grund
 * dunkel und im orangen Panel cremefarben. Als Maske über `currentColor` genügt eine Datei pro
 * Zuschnitt, die Farbe kommt aus dem Textkontext und folgt damit auch dem Hover in der Kopfzeile.
 *
 * Zwei Zuschnitte, weil die Unterzeile in Kopfzeilengröße nur noch Grau wäre: "inline" zeigt
 * Konturlinie und Schriftzug, "stacked" zusätzlich Trennlinie und gesperrte Unterzeile.
 *
 * Die Seitenverhältnisse stammen aus den Dateien selbst. Ohne sie müsste die Maske eine Höhe *und*
 * eine Breite bekommen, und jede Änderung am Zuschnitt würde das Logo verzerren.
 */
const props = withDefaults(
  defineProps<{
    variant?: 'inline' | 'stacked'
  }>(),
  {
    variant: 'inline',
  },
)

const zuschnitte = {
  inline: { datei: '/images/logo-maske-wortmarke.webp', seitenverhaeltnis: 1.5328 },
  stacked: { datei: '/images/logo-maske.webp', seitenverhaeltnis: 1.3115 },
} as const

const zuschnitt = computed(() => zuschnitte[props.variant])
</script>

<template>
  <span class="inline-flex">
    <!--
      Die Maske ist für Screenreader nichts, deshalb steht der Name daneben als Text. In der
      Kopfzeile trägt der umgebende Link ein aria-label, das gewinnt — doppelt vorgelesen wird
      also nichts.
    -->
    <span
      class="sf-logo"
      :class="variant === 'inline' ? 'h-9 sm:h-11' : 'w-48 sm:w-56'"
      :style="{
        '--sf-logo-datei': `url('${zuschnitt.datei}')`,
        '--sf-logo-seitenverhaeltnis': zuschnitt.seitenverhaeltnis,
      }"
      aria-hidden="true"
    />
    <span class="sr-only">{{ site.nameAscii }}, Brasilianische Lymphdrainage</span>
  </span>
</template>

<style scoped>
.sf-logo {
  aspect-ratio: var(--sf-logo-seitenverhaeltnis);
  background-color: currentColor;
  /* Safari unter 15.4 kennt die Kurzschreibweise nur mit Präfix. */
  -webkit-mask: var(--sf-logo-datei) center / contain no-repeat;
  mask: var(--sf-logo-datei) center / contain no-repeat;
}
</style>

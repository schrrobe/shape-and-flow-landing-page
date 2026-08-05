<script setup lang="ts">
/*
 * Der Schriftzug als Text, nicht als Bild.
 *
 * Bewusst nachgebaut statt das Logo-JPEG einzubinden: Text ist bei jeder Auflösung scharf,
 * skaliert mit der Schriftgröße, ist durchsuchbar und lässt sich vorlesen. Die Bilddatei bleibt
 * dem Vorschaubild und der Studioseite.
 *
 * Das kursive "and" zwischen zwei Linien ist aus dem Logo übernommen, ebenso die gesperrte
 * Unterzeile.
 */
withDefaults(defineProps<{
  /** "inline" für die Kopfzeile, "stacked" für Hero und Fußzeile. */
  variant?: 'inline' | 'stacked'
  /** Die gesperrte Unterzeile zeigen. Nur in der gestapelten Variante sinnvoll. */
  subline?: boolean
}>(), {
  variant: 'inline',
  subline: false,
})
</script>

<template>
  <span
    v-if="variant === 'inline'"
    class="font-display text-xl leading-none whitespace-nowrap sm:text-2xl"
  >
    Shape <span class="italic">and</span> Flow
  </span>

  <span v-else class="flex flex-col items-center gap-1 font-display leading-[0.95]">
    <span class="text-4xl sm:text-5xl">Shape</span>
    <span class="flex w-full items-center gap-3">
      <span class="h-px flex-1 bg-current opacity-30" />
      <span class="text-2xl italic sm:text-3xl">and</span>
      <span class="h-px flex-1 bg-current opacity-30" />
    </span>
    <span class="text-4xl sm:text-5xl">Flow</span>
    <template v-if="subline">
      <SfRule class="mt-3 w-full" />
      <span
        class="mt-2 text-center text-[0.6875rem] font-sans font-medium tracking-[0.2em] uppercase opacity-80 sm:text-xs"
      >
        Brasilianische Lymphdrainage
      </span>
    </template>
  </span>
</template>

<script setup lang="ts">
/*
 * Die Trennlinie mit Punkt in der Mitte.
 *
 * Kein beliebiger Hairline-Divider, sondern das Ornament, das im Logo unter "Flow" steht. Deshalb
 * ist es hier die einzige zugelassene Trennform: sie kommt aus der Marke und nicht aus einem
 * Designsystem-Katalog.
 *
 * Farbe über currentColor, damit dieselbe Komponente auf Beige und auf dem orangen Panel
 * funktioniert.
 */
withDefaults(defineProps<{
  /** Ohne Punkt, wenn die Linie nur trennen und nicht auszeichnen soll. */
  plain?: boolean
}>(), { plain: false })
</script>

<template>
  <div class="flex items-center gap-3 text-current" aria-hidden="true">
    <span class="h-px flex-1 bg-current opacity-30" />
    <span v-if="!plain" class="size-1 rounded-full bg-current opacity-50" />
    <span v-if="!plain" class="h-px flex-1 bg-current opacity-30" />
  </div>
</template>

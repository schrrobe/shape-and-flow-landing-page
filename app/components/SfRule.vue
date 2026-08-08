<script setup lang="ts">
/*
 * The divider with a dot in the middle.
 *
 * Not just any hairline divider, but the ornament that sits under "Flow" in the logo. That is why
 * it is the only permitted form of separation here: it comes from the brand and not from a design
 * system catalogue.
 *
 * Colour via currentColor, so the same component works on beige and on the orange panel.
 */
withDefaults(
  defineProps<{
    /** Without the dot, when the line should only separate and not mark anything out. */
    plain?: boolean
  }>(),
  { plain: false },
)
</script>

<template>
  <div class="flex items-center gap-3 text-current" aria-hidden="true">
    <span class="h-px flex-1 bg-current opacity-30" />
    <span v-if="!plain" class="size-1 rounded-full bg-current opacity-50" />
    <span v-if="!plain" class="h-px flex-1 bg-current opacity-30" />
  </div>
</template>

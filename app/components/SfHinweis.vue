<script setup lang="ts">
/*
 * The notice box for the mandatory text.
 *
 * Appears on every page describing an effect. It is deliberately styled quietly and not as a
 * warning: the text is part of the information and should be read, not scare people off. Marked
 * up as an <aside> so screen readers and search engines can class it as secondary information.
 */
withDefaults(
  defineProps<{
    title?: string
  }>(),
  { title: 'Wichtiger Hinweis' },
)
</script>

<template>
  <aside
    class="rounded-sf border border-border bg-surface-muted p-5 text-sm leading-relaxed sm:p-6"
  >
    <p class="font-medium text-text-primary">
      {{ title }}
    </p>
    <div class="mt-2 space-y-2 text-text-secondary">
      <slot />
    </div>
  </aside>
</template>

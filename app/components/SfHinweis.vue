<script setup lang="ts">
/*
 * Die Hinweisbox für den Pflichttext.
 *
 * Steht auf jeder Seite, die eine Wirkung beschreibt. Sie ist absichtlich ruhig gestaltet und
 * nicht als Warnung: der Text gehört zur Aufklärung und soll gelesen werden, nicht abschrecken.
 * Als <aside> ausgezeichnet, damit Screenreader und Suchmaschinen ihn als Nebeninformation
 * einordnen können.
 */
withDefaults(
  defineProps<{
    titel?: string
  }>(),
  { titel: 'Wichtiger Hinweis' },
)
</script>

<template>
  <aside
    class="rounded-sf border border-border bg-surface-muted p-5 text-sm leading-relaxed sm:p-6"
  >
    <p class="font-medium text-text-primary">
      {{ titel }}
    </p>
    <div class="mt-2 space-y-2 text-text-secondary">
      <slot />
    </div>
  </aside>
</template>

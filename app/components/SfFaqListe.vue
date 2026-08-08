<script setup lang="ts">
import type { FaqEntry } from '#shared/faq'

/*
 * The FAQ as <details>/<summary>.
 *
 * Without JavaScript: the browser does the expanding, so keyboard control and screen reader
 * output work by themselves. What also matters for ranking is that the answer text is in the HTML
 * and not loaded on click, because only then does a crawler read it.
 *
 * The FAQPage structured data is set by the page embedding this component, not by the component
 * itself: otherwise two FAQ blocks on one page would produce two competing graphs.
 */
defineProps<{
  entries: FaqEntry[]
}>()
</script>

<template>
  <div class="divide-y divide-border border-y border-border">
    <details v-for="entry in entries" :key="entry.question" class="group">
      <summary
        class="flex cursor-pointer items-start justify-between gap-4 py-4 font-display text-lg marker:content-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
      >
        {{ entry.question }}
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
        <p v-for="(paragraph, i) in entry.answer" :key="i">
          {{ paragraph }}
        </p>
        <ul v-if="entry.list">
          <li v-for="item in entry.list" :key="item">
            {{ item }}
          </li>
        </ul>
        <p v-if="entry.closing">
          {{ entry.closing }}
        </p>
      </div>
    </details>
  </div>
</template>

<style scoped>
/* Otherwise Safari shows its own triangle next to our plus sign. */
summary::-webkit-details-marker {
  display: none;
}
</style>

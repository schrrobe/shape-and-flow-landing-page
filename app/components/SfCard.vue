<script setup lang="ts">
/* Die Kartenfläche der Booking-App: weiß auf Beige, ein Rahmen, ein flacher Schatten. */
withDefaults(
  defineProps<{
    /** Weglassen, wenn die Karte selbst schon Innenabstand mitbringt (etwa bei Bildern). */
    padded?: boolean
  }>(),
  { padded: true },
)
</script>

<template>
  <div
    class="rounded-sf border border-border bg-surface shadow-card"
    :class="padded ? 'p-5 sm:p-6' : undefined"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
/* The card surface of the booking app: white on beige, a border, a flat shadow. */
withDefaults(
  defineProps<{
    /** Leave out when the card already brings its own padding (with images, for instance). */
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

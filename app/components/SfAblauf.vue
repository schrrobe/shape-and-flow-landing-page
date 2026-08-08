<script setup lang="ts">
/*
 * The treatment procedure as a sequence.
 *
 * The numbering is here because the procedure really does have a fixed order: first the lymph is
 * activated, then the modelling happens. The order is the method, not decoration.
 *
 * A continuous line runs through the markers. That is the contour line from the logo, here as the
 * connection between the phases: one line, one path, one direction. It is the only decorative
 * element of the site and appears at exactly this spot.
 */
defineProps<{
  phases: { title: string; text: string }[]
}>()
</script>

<template>
  <ol class="sf-sequence relative">
    <li v-for="(phase, i) in phases" :key="phase.title" class="relative pb-10 pl-16 last:pb-0">
      <!--
        The line sits on the li and stops at the last element so it does not run into nothing.
        As a pseudo element in CSS, because an SVG per step would only be more markup for the
        same picture.
      -->
      <span class="sf-sequence-marker font-display" aria-hidden="true">{{ i + 1 }}</span>
      <h3 class="text-xl">
        {{ phase.title }}
      </h3>
      <p class="mt-2 text-text-secondary">
        {{ phase.text }}
      </p>
    </li>
  </ol>
</template>

<style scoped>
.sf-sequence-marker {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  width: 2.75rem;
  height: 2.75rem;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--sf-border);
  border-radius: 9999px;
  background-color: var(--sf-surface);
  color: var(--sf-primary);
  font-size: 1.125rem;
  line-height: 1;
}

/* The connecting line: from the bottom edge of one marker to the top edge of the next. */
.sf-sequence li:not(:last-child)::before {
  content: '';
  position: absolute;
  top: 2.75rem;
  bottom: 0;
  left: calc(1.375rem - 1px);
  width: 2px;
  background: linear-gradient(
    to bottom,
    var(--sf-primary) 0%,
    color-mix(in srgb, var(--sf-primary) 35%, transparent) 100%
  );
}

/*
 * The line draws itself as you scroll. Runs without JavaScript via a view timeline; where the
 * browser does not know it, the line is simply there from the start.
 */
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .sf-sequence li:not(:last-child)::before {
      animation: sf-draw linear both;
      animation-timeline: view();
      animation-range: entry 15% cover 40%;
      transform-origin: top;
    }
  }
}

@keyframes sf-draw {
  from {
    transform: scaleY(0);
  }

  to {
    transform: scaleY(1);
  }
}
</style>

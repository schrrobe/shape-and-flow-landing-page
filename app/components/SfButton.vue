<script setup lang="ts">
/*
 * Die Button-Rezeptur der Booking-App, ergänzt um eine Variante für das orange Panel.
 *
 * Rendert je nach Prop das richtige Element: NuxtLink für interne Ziele, <a> für tel:, mailto: und
 * externe Adressen, <button> wenn kein Ziel angegeben ist. Ein Link, der wie ein Button aussieht,
 * soll trotzdem ein Link sein, damit Öffnen im neuen Tab und Kopieren der Adresse funktionieren.
 */
const props = withDefaults(
  defineProps<{
    to?: string
    href?: string
    variant?: 'primary' | 'secondary' | 'ghost' | 'inverse'
    size?: 'md' | 'lg'
    /** Externe Links bekommen rel="noopener" und öffnen in einem neuen Tab. */
    external?: boolean
    /** Nur ohne Ziel: `submit` für den Absenden-Knopf eines Formulars. */
    type?: 'button' | 'submit'
  }>(),
  {
    variant: 'primary',
    size: 'md',
    external: false,
    type: 'button',
  },
)

const base =
  'inline-flex items-center justify-center gap-2 rounded-sf font-medium transition-colors ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2'

const variants = {
  primary:
    'bg-primary text-primary-contrast hover:bg-primary-hover focus-visible:outline-focus-ring',
  secondary:
    'bg-surface text-text-primary border border-border hover:bg-surface-muted ' +
    'focus-visible:outline-focus-ring',
  ghost: 'bg-transparent text-text-primary hover:bg-surface-muted focus-visible:outline-focus-ring',
  // Auf Orange: cremefarbene Fläche, dunkler Text. Ein oranger Button wäre dort unsichtbar.
  inverse:
    'bg-inverse-text text-text-primary hover:bg-surface-muted focus-visible:outline-inverse-text',
} as const

const sizes = {
  md: 'px-4 py-2.5 text-base',
  lg: 'px-6 py-3 text-base sm:text-lg',
} as const

const classes = computed(() => [base, variants[props.variant], sizes[props.size]])
</script>

<template>
  <NuxtLink v-if="to" :to="to" :class="classes">
    <slot />
  </NuxtLink>
  <a
    v-else-if="href"
    :href="href"
    :class="classes"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener' : undefined"
  >
    <slot />
  </a>
  <button v-else :type="type" :class="classes">
    <slot />
  </button>
</template>

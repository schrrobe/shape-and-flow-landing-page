<script setup lang="ts">
/*
 * The button recipe of the booking app, extended by a variant for the orange panel.
 *
 * Renders the right element depending on the props: NuxtLink for internal targets, <a> for tel:,
 * mailto: and external addresses, <button> when no target is given. A link that looks like a
 * button should still be a link, so that opening in a new tab and copying the address work.
 */
const props = withDefaults(
  defineProps<{
    to?: string
    href?: string
    variant?: 'primary' | 'secondary' | 'ghost' | 'inverse'
    size?: 'md' | 'lg'
    /** External links get rel="noopener" and open in a new tab. */
    external?: boolean
    /** Only without a target: `submit` for the send button of a form. */
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
  // On orange: cream surface, dark text. An orange button would be invisible there.
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

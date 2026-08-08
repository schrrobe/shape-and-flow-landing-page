<script setup lang="ts">
import { site } from '#shared/site'

/*
 * The logo — contour line, wordmark and subline — exists as an image file, but is embedded as an
 * opacity mask and not as an <img>. Reason: the same logo appears dark on a light background and
 * cream on the orange panel. As a mask over `currentColor` one file per crop is enough, the
 * colour comes from the text context and so it follows the hover in the header as well.
 *
 * Two crops, because the subline at header size would be nothing but grey: "inline" shows contour
 * line and wordmark, "stacked" additionally the divider and the letterspaced subline.
 *
 * The aspect ratios come from the files themselves. Without them the mask would need both a
 * height *and* a width, and any change to the crop would distort the logo.
 */
const props = withDefaults(
  defineProps<{
    variant?: 'inline' | 'stacked'
  }>(),
  {
    variant: 'inline',
  },
)

const crops = {
  inline: { file: '/images/logo-maske-wortmarke.webp', aspectRatio: 1.5328 },
  stacked: { file: '/images/logo-maske.webp', aspectRatio: 1.3115 },
} as const

const crop = computed(() => crops[props.variant])
</script>

<template>
  <span class="inline-flex">
    <!--
      The mask is nothing to screen readers, so the name sits next to it as text. In the header
      the surrounding link carries an aria-label, which wins — so nothing gets read out twice.
    -->
    <span
      class="sf-logo"
      :class="variant === 'inline' ? 'h-9 sm:h-11' : 'w-48 sm:w-56'"
      :style="{
        '--sf-logo-file': `url('${crop.file}')`,
        '--sf-logo-aspect-ratio': crop.aspectRatio,
      }"
      aria-hidden="true"
    />
    <span class="sr-only">{{ site.nameAscii }}, Brasilianische Lymphdrainage</span>
  </span>
</template>

<style scoped>
.sf-logo {
  aspect-ratio: var(--sf-logo-aspect-ratio);
  background-color: currentColor;
  /* Safari below 15.4 only knows the shorthand with a prefix. */
  -webkit-mask: var(--sf-logo-file) center / contain no-repeat;
  mask: var(--sf-logo-file) center / contain no-repeat;
}
</style>

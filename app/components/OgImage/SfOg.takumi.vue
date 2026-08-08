<script setup lang="ts">
import { address, site } from '#shared/site'

/*
 * The preview image for social media and messengers, rendered at build time.
 *
 * Deliberately close to the logo: cream serif on the brand orange. Whoever gets the link sent in
 * WhatsApp should see the same picture as on the studio door.
 *
 * The renderer understands only part of CSS (flexbox, no grids, no pseudo elements), hence inline
 * styles here instead of Tailwind classes. Only font families the renderer can load as a file may
 * be named: "Playfair Display" is downloaded at build time, "sans-serif" is the built-in reserve.
 * A system font such as Georgia would only produce a warning here.
 */
withDefaults(
  defineProps<{
    title?: string
    description?: string
    eyebrow?: string
  }>(),
  {
    title: 'Brasilianische Lymphdrainage',
    description: '',
    eyebrow: site.nameAscii,
  },
)

const postalLine = `${address.street} · ${address.postalCode} ${address.city}`

// Literals instead of tokens, because the Takumi renderer does not resolve CSS variables. Must
// follow --sf-inverse-surface and --sf-inverse-text from app/assets/css/tokens.css.
const orange = '#a04607'
const cream = '#f5efe6'
const line = 'rgba(245, 239, 230, 0.45)'
</script>

<template>
  <div
    :style="{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      width: '100%',
      height: '100%',
      padding: '72px 80px',
      backgroundColor: orange,
      color: cream,
      fontFamily: 'Playfair Display, serif',
    }"
  >
    <div
      :style="{
        display: 'flex',
        fontSize: '30px',
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: line,
      }"
    >
      {{ eyebrow }}
    </div>

    <div :style="{ display: 'flex', flexDirection: 'column' }">
      <div
        :style="{
          display: 'flex',
          fontSize: title.length > 46 ? '62px' : '78px',
          lineHeight: 1.1,
          maxWidth: '900px',
        }"
      >
        {{ title }}
      </div>
      <div
        v-if="description"
        :style="{
          display: 'flex',
          marginTop: '26px',
          fontSize: '32px',
          lineHeight: 1.35,
          maxWidth: '860px',
          color: 'rgba(245, 239, 230, 0.85)',
          fontFamily: 'Inter',
        }"
      >
        {{ description }}
      </div>
    </div>

    <div
      :style="{
        display: 'flex',
        alignItems: 'center',
        paddingTop: '34px',
        borderTop: `2px solid ${line}`,
        fontSize: '28px',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        fontFamily: 'Inter',
        color: 'rgba(245, 239, 230, 0.9)',
      }"
    >
      {{ postalLine }}
    </div>
  </div>
</template>

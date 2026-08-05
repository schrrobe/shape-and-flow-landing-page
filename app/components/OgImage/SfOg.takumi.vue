<script setup lang="ts">
import { adresse, site } from '#shared/site'

/*
 * Das Vorschaubild für Social Media und Messenger, gerendert beim Build.
 *
 * Bewusst nah am Logo: cremefarbene Serif auf dem Markenorange. Wer den Link in WhatsApp
 * geschickt bekommt, soll dasselbe Bild sehen wie an der Studiotür.
 *
 * Der Renderer versteht nur einen Teil von CSS (Flexbox, keine Grids, keine Pseudoelemente),
 * deshalb hier Inline-Styles statt Tailwind-Klassen. Als Schriftfamilie darf nur stehen, was der
 * Renderer als Datei laden kann: "Playfair Display" wird beim Build heruntergeladen, "sans-serif"
 * ist die eingebaute Reserve. Ein Systemfont wie Georgia würde hier nur eine Warnung erzeugen.
 */
withDefaults(defineProps<{
  title?: string
  description?: string
  eyebrow?: string
}>(), {
  title: 'Brasilianische Lymphdrainage',
  description: '',
  eyebrow: site.nameAscii,
})

const anschrift = `${adresse.strasse} · ${adresse.plz} ${adresse.ort}`

const orange = '#c2540a'
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
        fontFamily: 'sans-serif',
        color: 'rgba(245, 239, 230, 0.9)',
      }"
    >
      {{ anschrift }}
    </div>
  </div>
</template>

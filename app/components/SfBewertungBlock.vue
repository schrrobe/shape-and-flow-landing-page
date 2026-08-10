<script setup lang="ts">
import type { Block } from '~/utils/bewertung'

/*
 * One question of the review helper: a legend and its chips.
 *
 * The chips look like buttons but are real checkboxes resp. radio buttons — hidden with sr-only
 * and drawn through their label. That way keyboard, screen reader and browser autofill keep
 * working, and the ticked state is announced instead of only being visible as a colour.
 *
 * fieldset and legend for the same reason as in SfKontaktFormular: without them a screen reader
 * reads eight chip labels without the question they answer.
 *
 * The component holds no state: it reports which chip was tapped and the page decides what that
 * means for its selection. See umgeschaltet() in app/utils/bewertung.ts for why.
 */
defineProps<{
  block: Block
  /** The ticked ids of this block. */
  gewaehlt: string[]
}>()

const emit = defineEmits<{ umschalten: [id: string] }>()
</script>

<template>
  <fieldset>
    <legend class="sf-label">{{ block.frage }}</legend>

    <div class="mt-2 flex flex-wrap gap-2">
      <label v-for="baustein in block.bausteine" :key="baustein.id" class="inline-flex">
        <input
          :type="block.mehrfach ? 'checkbox' : 'radio'"
          :name="block.id"
          :value="baustein.id"
          :checked="gewaehlt.includes(baustein.id)"
          class="peer sr-only"
          @click="emit('umschalten', baustein.id)"
        />
        <!--
          The ticked chip inverts to orange on cream, which is the same pairing as the primary
          button and therefore carries the same contrast. peer-focus-visible instead of
          focus-visible: the focus ring belongs on the chip one sees, not on the hidden input.
        -->
        <span
          class="cursor-pointer rounded-sf border border-border bg-surface px-3 py-2 text-sm transition-colors select-none peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-contrast peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus-ring hover:bg-surface-muted peer-checked:hover:bg-primary-hover"
        >
          {{ baustein.label }}
        </span>
      </label>
    </div>
  </fieldset>
</template>

<style scoped>
/*
 * Windows high contrast discards background-color and color, so the ticked chip would look exactly
 * like the eight next to it. Highlight and HighlightText are the system's own pair for "selected"
 * and are the two colours that mode keeps. A screen reader knew all along, this is for everyone who
 * looks at the chips.
 */
@media (forced-colors: active) {
  .peer:checked + span {
    background-color: Highlight;
    color: HighlightText;
  }
}
</style>

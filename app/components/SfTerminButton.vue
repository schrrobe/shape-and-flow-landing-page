<script setup lang="ts">
import { formularUrl, kontakt } from '#shared/site'

/*
 * Die Termin-Schaltfläche in ihren zwei Zuständen: mit Booking-App führt sie dorthin, ohne sie
 * ins Kontaktformular. Ersatz und nicht Wegfall, weil sie an den drei Stellen steht, an denen sie
 * der einzige Handlungsaufruf ist — Kopfzeile, Startseite, Fußzeile.
 *
 * Variante und Größe kommen als Attribute durch: <SfTerminButton variant="inverse" size="lg" />
 * landet an SfButton, weil dieses Element sie nicht selbst als Prop deklariert.
 *
 * Der Slot "icon" steht in beiden Zuständen vor der Beschriftung. Er ist der Grund, warum die
 * Linkliste unter /linktree diese Komponente benutzt, statt die Fallunterscheidung ein drittes
 * Mal auszuschreiben — das Flag soll an möglichst wenigen Stellen abgefragt werden.
 */
const buchungSichtbar = useBuchungSichtbar()
</script>

<template>
  <SfButton v-if="buchungSichtbar" :href="kontakt.buchungUrl" external>
    <slot name="icon" />
    Termin buchen
  </SfButton>
  <SfButton v-else :to="formularUrl">
    <slot name="icon" />
    Termin anfragen
  </SfButton>
</template>

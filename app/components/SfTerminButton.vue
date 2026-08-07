<script setup lang="ts">
import { formularUrl, kontakt } from '#shared/site'

/*
 * Die Termin-Schaltfläche in ihren zwei Zuständen: mit Booking-App führt sie dorthin, ohne sie
 * ins Kontaktformular. Ersatz und nicht Wegfall, weil sie an den drei Stellen steht, an denen sie
 * der einzige Handlungsaufruf ist — Kopfzeile, Startseite, Fußzeile.
 *
 * Variante und Größe kommen als Attribute durch: <SfTerminButton variant="inverse" size="lg" />
 * landet an SfButton, weil dieses Element sie nicht selbst als Prop deklariert.
 */
const buchungSichtbar = useBuchungSichtbar()
</script>

<template>
  <SfButton v-if="buchungSichtbar" :href="kontakt.buchungUrl" external> Termin buchen </SfButton>
  <SfButton v-else :to="formularUrl"> Termin anfragen </SfButton>
</template>

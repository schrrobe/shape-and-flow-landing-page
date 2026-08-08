<script setup lang="ts">
import { formUrl, contact } from '#shared/site'

/*
 * The appointment button in its two states: with the booking app it leads there, without it into
 * the contact form. A replacement rather than a removal, because it sits in the three places
 * where it is the only call to action — header, home page, footer.
 *
 * Variant and size are passed through as attributes: <SfTerminButton variant="inverse" size="lg" />
 * ends up on SfButton, because this element does not declare them as props itself.
 *
 * The "icon" slot sits before the label in both states. It is the reason the link list under
 * /linktree uses this component instead of spelling the distinction out a third time — the flag
 * should be read in as few places as possible.
 */
const bookingVisible = useBookingVisible()
</script>

<template>
  <SfButton v-if="bookingVisible" :href="contact.bookingUrl" external>
    <slot name="icon" />
    Termin buchen
  </SfButton>
  <SfButton v-else :to="formUrl">
    <slot name="icon" />
    Termin anfragen
  </SfButton>
</template>

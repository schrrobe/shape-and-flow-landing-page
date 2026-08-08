<script setup lang="ts">
import { address, formUrl, contact, mailtoUrl, openingHours } from '#shared/site'

/*
 * The appointment block. Sits at the end of every content page.
 *
 * Three ways, deliberately in this order: the contact form first, because it works without a mail
 * client, then the email address for everyone who prefers writing from their own mailbox, then
 * online booking for everyone who wants to book bindingly right away. Without the booking app the
 * third way simply falls away — the two before it lead to the same place.
 */
const bookingVisible = useBookingVisible()
withDefaults(
  defineProps<{
    title?: string
    text?: string
    /** On the orange panel, surfaces and text are inverted. */
    inverse?: boolean
  }>(),
  {
    title: 'Termin vereinbaren',
    text: 'Schreiben Sie kurz, was Sie interessiert. Wir melden uns mit freien Terminen zurück.',
    inverse: false,
  },
)
</script>

<template>
  <div
    class="rounded-sf p-6 sm:p-8"
    :class="
      inverse
        ? 'sf-on-inverse bg-inverse-surface text-inverse-text'
        : 'border border-border bg-surface shadow-card'
    "
  >
    <h2 class="text-2xl">
      {{ title }}
    </h2>
    <p class="mt-3 max-w-prose" :class="inverse ? 'text-inverse-body' : 'text-text-secondary'">
      {{ text }}
    </p>

    <div class="mt-6 flex flex-wrap gap-3">
      <SfButton :to="formUrl" :variant="inverse ? 'inverse' : 'primary'" size="lg">
        Nachricht schreiben
      </SfButton>
      <SfButton :href="mailtoUrl" :variant="inverse ? 'inverse' : 'secondary'" size="lg">
        {{ contact.email }}
      </SfButton>
      <SfButton
        v-if="bookingVisible"
        :href="contact.bookingUrl"
        :variant="inverse ? 'inverse' : 'secondary'"
        size="lg"
        external
      >
        Online buchen
      </SfButton>
    </div>

    <p class="mt-4 text-sm" :class="inverse ? 'text-inverse-body' : 'text-text-secondary'">
      {{ openingHours.note }}. {{ address.street }}, {{ address.postalCode }} {{ address.city }}.
    </p>
  </div>
</template>

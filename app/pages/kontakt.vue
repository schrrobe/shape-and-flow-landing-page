<script setup lang="ts">
import { computed } from 'vue'
import { address, mapUrl, contact, mailtoUrl, openingHours, site } from '#shared/site'

/*
 * This page mentions online booking in three visible places: in the lead, in the paragraph above
 * the form and in the second card. When the flag is off there is no booking page — and then
 * nothing may stand here that hints at one either.
 */
const bookingVisible = useBookingVisible()

usePage({
  title: `Kontakt und Termin in ${address.city}`,
  ogTitle: 'Kontakt und Termin',
  shortTitle: 'Kontakt',
  /*
   * The description deliberately never mentions online booking. It sits in the prerendered HTML
   * and in the preview image, both of which are created at build time — that is, long before the
   * browser SDK knows the flag. A version saying "oder online buchen" would therefore never be
   * delivered, and a branch nobody ever gets to see is dead code.
   */
  description:
    `Termin für brasilianische Lymphdrainage bei Shape & Flow, ${address.street}, ${address.postalCode} ` +
    `${address.city}. Per Kontaktformular oder per E-Mail.`,
  ogLabel: 'Kontakt',
})

// computed and not evaluated once: the flag is only settled once the browser SDK has answered,
// and that is after the first render. The same goes for `channels` below.
const lead = computed(() =>
  bookingVisible.value
    ? `Schreiben Sie uns über das Formular oder per E-Mail. Wer schon weiß, was er möchte,
      bucht den Termin direkt online.`
    : `Schreiben Sie uns über das Formular oder per E-Mail. Wir melden uns mit freien Terminen
      zurück.`,
)

/*
 * No phone and no WhatsApp as a way to reach us: the studio is not at the phone during a
 * treatment, and a request sitting in the mailbox gets lost less often than a missed call. Why the
 * number is absent from the imprint as well is explained in shared/site.ts.
 *
 * That does not apply to the way back: in the form the reply can be chosen to come via WhatsApp.
 * It is still not listed here, because this list shows ways you can open yourself.
 */
const channels = computed(() => [
  {
    title: 'E-Mail',
    text: 'Wenn Sie lieber aus Ihrem eigenen Postfach schreiben.',
    label: contact.email,
    href: mailtoUrl,
    external: false,
  },
  ...(bookingVisible.value
    ? [
        {
          title: 'Online buchen',
          text: 'Freie Termine sehen und direkt verbindlich buchen.',
          label: 'Zur Terminbuchung',
          href: contact.bookingUrl,
          external: true,
        },
      ]
    : []),
])
</script>

<template>
  <article>
    <SfSeitenkopf title="Kontakt" label="Termin vereinbaren" :lead="lead" />

    <div class="sf-container">
      <!-- The form comes before the other channels, because it works without a mail client. -->
      <section id="formular" aria-labelledby="formular-heading">
        <h2 id="formular-heading" class="text-2xl sm:text-3xl">Anfrage schreiben</h2>
        <p v-if="bookingVisible" class="mt-3 max-w-prose text-text-secondary">
          Das Formular ist für Fragen gedacht, etwa zur Behandlung, zum Ablauf oder zum Preis. Wir
          antworten in der Regel innerhalb eines Werktags.
        </p>
        <!--
          Without a booking page the form is not the second-best option but the way to an
          appointment. Then it must not say here that it is "für Fragen gedacht".
        -->
        <p v-else class="mt-3 max-w-prose text-text-secondary">
          Über das Formular fragen Sie einen Termin an oder stellen eine Frage zur Behandlung, zum
          Ablauf oder zum Preis. Wir antworten in der Regel innerhalb eines Werktags.
        </p>
        <!--
          The notice sits above the form and not with the contact channels below it: whoever
          starts typing here has already skipped past the booking.
        -->
        <p v-if="bookingVisible" class="mt-3 max-w-prose text-text-secondary">
          Wenn Sie einen Termin möchten, nutzen Sie bitte den Knopf
          <a
            :href="contact.bookingUrl"
            target="_blank"
            rel="noopener"
            class="text-primary underline underline-offset-2 hover:no-underline"
            >Termin buchen</a
          >. Dort stehen die freien Zeiten, und der Termin ist sofort verbindlich. Über das Formular
          dauert dasselbe einen Mailwechsel länger.
        </p>
        <SfKontaktFormular class="mt-6" />
      </section>

      <!-- Two columns only when there really are two cards: half a card next to blank space, no. -->
      <div class="mt-14 grid gap-6" :class="{ 'sm:grid-cols-2': channels.length > 1 }">
        <SfCard v-for="channel in channels" :key="channel.title">
          <h2 class="font-display text-xl">
            {{ channel.title }}
          </h2>
          <p class="mt-2 text-text-secondary">
            {{ channel.text }}
          </p>
          <SfButton
            :href="channel.href"
            variant="secondary"
            :external="channel.external"
            class="mt-5"
          >
            {{ channel.label }}
          </SfButton>
        </SfCard>
      </div>

      <div class="mt-14 grid gap-14 lg:grid-cols-2 lg:gap-20">
        <div>
          <h2 class="text-2xl sm:text-3xl">Adresse und Anfahrt</h2>
          <address class="mt-5 space-y-1 text-lg not-italic">
            <p>{{ site.name }}</p>
            <p>im Studio {{ address.venue }}</p>
            <p>{{ address.street }}</p>
            <p>{{ address.postalCode }} {{ address.city }}</p>
          </address>
          <p class="mt-4 text-text-secondary">
            Am Eingang steht {{ address.venue }} und nicht {{ site.name }} — Sie sind trotzdem
            richtig.
          </p>
          <p class="mt-3 text-text-secondary">
            {{ openingHours.note }}. Kommen Sie bitte nicht ohne Termin vorbei, weil während einer
            Behandlung niemand an der Tür ist.
          </p>
          <!--
            Deliberately only a link to Google Maps and no embedded map: a map in an iframe loads
            data from Google as soon as the page opens, and would make a consent flow plus cookie
            banner necessary. For an address that is a bad trade.
          -->
          <SfButton :href="mapUrl" variant="secondary" class="mt-6" external>
            Route in Google Maps planen
          </SfButton>
        </div>

        <div class="sf-prose">
          <h2 class="mt-0!">Was in die Anfrage gehört</h2>
          <p>Damit die Antwort schneller passt, schreiben Sie am besten gleich mit:</p>
          <ul>
            <li>welche Behandlung Sie interessiert, Körper oder Gesicht</li>
            <li>an welchen Tagen und Uhrzeiten es Ihnen passt</li>
          </ul>
          <p>
            Was gesundheitlich zu beachten ist, klären wir vor dem Termin persönlich und nicht per
            Nachricht. Es gibt Situationen, in denen nicht behandelt wird.
            <NuxtLink to="/brasilianische-lymphdrainage#gegenanzeigen"
              >Die Gegenanzeigen stehen hier</NuxtLink
            >.
          </p>
        </div>
      </div>
    </div>
  </article>
</template>

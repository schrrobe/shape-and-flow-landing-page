<script setup lang="ts">
import { treatmentBySlug, treatments, formatPrice, priceItems } from '#shared/behandlungen'
import { faqByTopic } from '#shared/faq'
import { address, disclaimer } from '#shared/site'

// The prices come from shared/behandlungen.ts, here in the description too: otherwise the search
// result would advertise an amount after the next price change that the page no longer names.
const body = treatmentBySlug('jeveauxeffect')!
const face = treatmentBySlug('lymphdrainage-gesicht')!
const combo = priceItems.find(p => p.slug === 'kombi-koerper-gesicht')!

// Without the booking app there is no payment in the booking system, hence no sentence about it.
const bookingVisible = useBookingVisible()

usePage({
  title: withCity('Preise brasilianische Lymphdrainage'),
  ogTitle: 'Preise',
  description:
    `Preise in ${address.city}: ${face.name} ${formatPrice(face.priceEuro)}, ` +
    `${body.name} ${formatPrice(body.priceEuro)}, zusammen ${formatPrice(combo.priceEuro)}. ` +
    `Pakete günstiger pro Behandlung, keine versteckten Kosten.`,
  ogLabel: 'Preise',
})

const priceFaq = faqByTopic('prices')

useSchemaOrg([
  // An offer list, so the prices are also machine-readable in one place.
  defineItemList({
    name: 'Behandlungen und Preise',
    itemListElement: [
      ...treatments.map(t =>
        defineOffer({
          name: t.name,
          description: t.title,
          price: t.priceEuro,
          priceCurrency: 'EUR',
          availability: 'https://schema.org/InStock',
        }),
      ),
      ...priceItems.map(p =>
        defineOffer({
          name: p.name,
          description: p.note,
          price: p.priceEuro,
          priceCurrency: 'EUR',
          availability: 'https://schema.org/InStock',
        }),
      ),
    ],
  }),
])

useFaqSchema(priceFaq)
</script>

<template>
  <article>
    <SfSeitenkopf
      title="Preise"
      label="Was es kostet"
      lead="Zwei Behandlungen, einzeln oder zusammen, dazu Pakete für mehrere Termine. Bezahlt
        wird pro Termin, es gibt keine Mitgliedschaft und keine Grundgebühr."
    />

    <div class="sf-container">
      <div class="max-w-3xl">
        <SfPreisTabelle />

        <p class="mt-6 text-sm text-text-secondary">
          Alle Preise sind Endpreise. Gemäß § 19 UStG wird keine Umsatzsteuer berechnet. Beide
          Behandlungen lassen sich einzeln oder zusammen buchen. Bei den Paketen gilt der genannte
          Preis pro Behandlung, das Paket wird im Studio vereinbart.
        </p>
      </div>

      <div class="mt-14 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div class="sf-prose">
          <h2>Zahlung und Absage</h2>
          <p>
            Bezahlt wird im Studio nach der Behandlung.<template v-if="bookingVisible">
              Wer online über das Buchungssystem bucht, kann direkt dort bezahlen.</template
            >
          </p>
          <p>
            Wenn ein Termin nicht klappt, sagen Sie bitte so früh wie möglich ab. Dann kann jemand
            anderes den Platz bekommen.
          </p>

          <h2>Keine Kassenleistung</h2>
          <p>
            Die Behandlungen sind ästhetische Anwendungen im Beauty-Bereich, keine medizinischen
            Leistungen. Es gibt deshalb kein Rezept und keine Erstattung durch die Krankenkasse.
            <NuxtLink to="/ratgeber/brasilianische-vs-medizinische-lymphdrainage"
              >Der Unterschied zur medizinischen Lymphdrainage ist hier erklärt</NuxtLink
            >.
          </p>
        </div>

        <div>
          <h2 class="text-2xl">Fragen zu den Preisen</h2>
          <div class="mt-6">
            <SfFaqListe :entries="priceFaq" />
          </div>
        </div>
      </div>

      <SfHinweis class="mt-16 max-w-3xl">
        <p>{{ disclaimer }}</p>
      </SfHinweis>

      <div class="mt-16">
        <!-- Without a booking page the block is left with the form and email only: "buchen" would
             then be overpromising, and the block's default title fits more precisely. -->
        <SfCtaBlock inverse :title="bookingVisible ? 'Termin buchen' : 'Termin vereinbaren'" />
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { behandlungBySlug, behandlungen, preis, preispositionen } from '#shared/behandlungen'
import { faqZuThema } from '#shared/faq'
import { adresse, disclaimer } from '#shared/site'

// Die Preise kommen aus shared/behandlungen.ts, auch hier in der Beschreibung: sonst wirbt das
// Suchergebnis nach der nächsten Preisänderung mit einem Betrag, den die Seite nicht mehr nennt.
const koerper = behandlungBySlug('jeveauxeffect')!
const gesicht = behandlungBySlug('lymphdrainage-gesicht')!
const kombi = preispositionen.find(p => p.slug === 'kombi-koerper-gesicht')!

// Ohne Booking-App gibt es keine Zahlung im Buchungssystem, also auch keinen Satz darüber.
const buchungSichtbar = useBuchungSichtbar()

useSeite({
  titel: mitOrt('Preise brasilianische Lymphdrainage'),
  ogTitel: 'Preise',
  beschreibung:
    `Preise in ${adresse.ort}: ${gesicht.name} ${preis(gesicht.preisEuro)}, ` +
    `${koerper.name} ${preis(koerper.preisEuro)}, zusammen ${preis(kombi.preisEuro)}. ` +
    `Pakete günstiger pro Behandlung, keine versteckten Kosten.`,
  ogLabel: 'Preise',
})

const preisFaq = faqZuThema('preise')

useSchemaOrg([
  // Eine Angebotsliste, damit die Preise auch maschinenlesbar an einer Stelle stehen.
  defineItemList({
    name: 'Behandlungen und Preise',
    itemListElement: [
      ...behandlungen.map(b =>
        defineOffer({
          name: b.name,
          description: b.titel,
          price: b.preisEuro,
          priceCurrency: 'EUR',
          availability: 'https://schema.org/InStock',
        }),
      ),
      ...preispositionen.map(p =>
        defineOffer({
          name: p.name,
          description: p.hinweis,
          price: p.preisEuro,
          priceCurrency: 'EUR',
          availability: 'https://schema.org/InStock',
        }),
      ),
    ],
  }),
])

useFaqSchema(preisFaq)
</script>

<template>
  <article>
    <SfSeitenkopf
      titel="Preise"
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
            Bezahlt wird im Studio nach der Behandlung.<template v-if="buchungSichtbar">
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
            <SfFaqListe :eintraege="preisFaq" />
          </div>
        </div>
      </div>

      <SfHinweis class="mt-16 max-w-3xl">
        <p>{{ disclaimer }}</p>
      </SfHinweis>

      <div class="mt-16">
        <!-- Ohne Buchungsseite bleibt im Block nur Formular und E-Mail: "buchen" wäre dann zu viel
             versprochen, und der Standardtitel des Blocks passt genauer. -->
        <SfCtaBlock inverse :titel="buchungSichtbar ? 'Termin buchen' : 'Termin vereinbaren'" />
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { behandlungBySlug, preis } from '#shared/behandlungen'
import { faqZuThema } from '#shared/faq'
import { adresse, disclaimer, markenhinweis } from '#shared/site'

/*
 * Die Gesichtsbehandlung.
 *
 * Der Seitentitel setzt auf "Lymphdrainage Gesicht" und nicht auf den Markennamen: nach der Marke
 * sucht nur, wer sie schon kennt, nach der Behandlung suchen alle anderen.
 */
const behandlung = behandlungBySlug('lymphdrainage-gesicht')!

useSeite({
  titel: mitOrt('Lymphdrainage Gesicht'),
  ogTitel: 'Lymphdrainage für das Gesicht',
  beschreibung:
    `Jeveauxeffect Face® in ${adresse.ort}: brasilianische Lymphdrainage für das Gesicht mit Fokus `
    + `auf Entstauung, Kontur und Frische. ${preis(behandlung.preisEuro)}, Termine nach `
    + `Vereinbarung.`,
  ogLabel: 'Gesichtsbehandlung',
})

useBehandlungSchema(behandlung)

const gesichtFaq = faqZuThema('gesicht')

useFaqSchema(gesichtFaq)
</script>

<template>
  <article>
    <SfSeitenkopf
      titel="Lymphdrainage für das Gesicht"
      label="Gesichtsbehandlung"
      lead="Der Jeveauxeffect Face® ist die Gesichtsbehandlung der Jeveaux Company®. Sie arbeitet
        auf Entstauung, klarere Konturen und ein waches Aussehen."
    />

    <div class="sf-container">
      <SfCard class="max-w-3xl">
        <div class="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <div>
            <p class="sf-eyebrow">
              Jeveauxeffect Face®
            </p>
            <p class="mt-1 font-display text-3xl">
              {{ preis(behandlung.preisEuro) }}
            </p>
          </div>
          <SfButton to="/preise" variant="secondary">
            Alle Preise
          </SfButton>
        </div>
      </SfCard>

      <div class="mt-14 grid gap-14 lg:grid-cols-[1fr_22rem] lg:gap-20">
        <div class="sf-prose">
          <h2>Was die Behandlung macht</h2>
          <p>
            Der Jeveauxeffect Face® ist die speziell entwickelte Gesichtsbehandlung der Jeveaux
            Company®. Sie überträgt die Methode der brasilianischen Lymphdrainage auf Gesicht, Hals
            und Kieferlinie, mit drei Schwerpunkten: entstauen, konturieren und die Haut frischer
            aussehen lassen.
          </p>
          <p>
            Gearbeitet wird mit den Händen, in einer festen Abfolge von Griffen. Zuerst wird der
            Lymphfluss angeregt, danach wird gezielt an der Kontur gearbeitet. Die Griffe im Gesicht
            sind feiner als am Körper, aber sie folgen derselben Logik.
            <NuxtLink to="/brasilianische-lymphdrainage">Wie die Methode grundsätzlich arbeitet,
              steht hier</NuxtLink>.
          </p>

          <h2>Wobei die Behandlung unterstützen kann</h2>
          <ul>
            <li>ein entstautes, weniger geschwollenes Gefühl im Gesicht</li>
            <li>klarere Konturen an Kieferlinie und Wangen</li>
            <li>ein waches, frisches Aussehen</li>
          </ul>
          <p>
            Wie deutlich das ausfällt, ist von Person zu Person verschieden. Ein geschwollenes
            Gesicht am Morgen hat viele mögliche Ursachen, von zu wenig Schlaf über salziges Essen
            bis zum Hormonzyklus, und die Behandlung ändert an diesen Ursachen nichts.
          </p>

          <h2>Einzeln oder zusammen mit der Körperbehandlung</h2>
          <p>
            Die Gesichtsbehandlung lässt sich einzeln buchen. Viele kombinieren sie mit dem
            <NuxtLink to="/jeveauxeffect">Jeveauxeffect® für den Körper</NuxtLink> und legen beide
            Termine zusammen. Sagen Sie bei der Anfrage einfach, was Sie möchten.
          </p>

          <h2>Was Sie vorher wissen sollten</h2>
          <p>
            Die Gegenanzeigen gelten für die Gesichtsbehandlung genauso wie für den Körper. Bei
            akuten Entzündungen, offenen Wunden im Behandlungsbereich, Fieber oder einem akuten
            Infekt wird nicht behandelt.
            <NuxtLink to="/brasilianische-lymphdrainage#gegenanzeigen">Die vollständige Liste steht
              auf der Methodenseite</NuxtLink>.
          </p>
        </div>

        <aside class="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <SfCard>
            <h2 class="sf-eyebrow">
              Auf einen Blick
            </h2>
            <dl class="mt-4 space-y-3 text-sm">
              <div class="flex justify-between gap-4">
                <dt class="text-text-secondary">
                  Behandlung
                </dt>
                <dd class="text-right">
                  Jeveauxeffect Face®
                </dd>
              </div>
              <div class="flex justify-between gap-4">
                <dt class="text-text-secondary">
                  Bereich
                </dt>
                <dd class="text-right">
                  Gesicht, Hals, Kieferlinie
                </dd>
              </div>
              <div class="flex justify-between gap-4">
                <dt class="text-text-secondary">
                  Preis
                </dt>
                <dd class="text-right font-medium">
                  {{ preis(behandlung.preisEuro) }}
                </dd>
              </div>
              <div class="flex justify-between gap-4">
                <dt class="text-text-secondary">
                  Ort
                </dt>
                <dd class="text-right">
                  {{ adresse.strasse }}, {{ adresse.ort }}
                </dd>
              </div>
            </dl>
            <SfRule class="my-5 text-border" />
            <p class="text-sm text-text-secondary">
              {{ markenhinweis }}
            </p>
          </SfCard>
        </aside>
      </div>

      <SfHinweis class="mt-16 max-w-3xl">
        <p>{{ disclaimer }}</p>
      </SfHinweis>

      <section class="mt-16 max-w-3xl">
        <h2 class="text-2xl sm:text-3xl">
          Fragen zur Gesichtsbehandlung
        </h2>
        <div class="mt-6">
          <SfFaqListe :eintraege="gesichtFaq" />
        </div>
      </section>

      <div class="mt-16">
        <SfCtaBlock inverse />
      </div>
    </div>
  </article>
</template>

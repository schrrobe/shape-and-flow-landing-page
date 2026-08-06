<script setup lang="ts">
import { behandlungBySlug, preis } from '#shared/behandlungen'
import { faqZuThema } from '#shared/faq'
import { adresse, disclaimer, markenhinweis } from '#shared/site'

/*
 * Die Körperbehandlung.
 *
 * Die Methode selbst wird hier nur so weit erklärt, wie es fürs Verständnis nötig ist. Die
 * ausführliche Erklärung steht auf der Themenseite, damit nicht zwei Seiten um dieselbe
 * Suchanfrage konkurrieren.
 */
const behandlung = behandlungBySlug('jeveauxeffect')!

useSeite({
  titel: mitOrt('Jeveauxeffect®: Lymphdrainage für den Körper'),
  ogTitel: 'Jeveauxeffect® für den Körper',
  kurzTitel: 'Jeveauxeffect®',
  beschreibung:
    `Jeveauxeffect® in ${adresse.ort}: brasilianische Lymphdrainage als ästhetische ` +
    `Ganzkörperbehandlung mit Faszienarbeit und Modellierung. ${preis(behandlung.preisEuro)}, ` +
    `Termine nach Vereinbarung.`,
  ogLabel: 'Körperbehandlung',
})

useBehandlungSchema(behandlung)

const koerperFaq = faqZuThema('koerper')

useFaqSchema(koerperFaq)

const geeignet = [
  'Sie möchten sich leichter und weniger gespannt fühlen.',
  'Sie suchen eine aktive Behandlung, keine Massage zum Einschlafen.',
  'Sie kennen Wassereinlagerungen und ein schweres Körpergefühl aus Ihrem Alltag.',
]

const nichtGeeignet = [
  'Sie wollen vor allem entspannen und abschalten.',
  'Sie erwarten eine medizinische Behandlung oder eine Therapie.',
  'Es liegt eine der Gegenanzeigen vor.',
]
</script>

<template>
  <article>
    <SfSeitenkopf
      titel="Jeveauxeffect®"
      label="Körperbehandlung"
      lead="Die ästhetische Ganzkörperbehandlung der Jeveaux Company®. Erst wird die Lymphe
        aktiviert, dann wird kräftig modelliert."
    />

    <div class="sf-container">
      <!-- Preis und Buchung sofort sichtbar, weil das die häufigste Frage auf dieser Seite ist. -->
      <SfCard class="max-w-3xl">
        <div class="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <div>
            <p class="sf-eyebrow">
              {{ behandlung.titel }}
            </p>
            <p class="mt-1 font-display text-3xl">
              {{ preis(behandlung.preisEuro) }}
            </p>
          </div>
          <SfButton to="/preise" variant="secondary"> Alle Preise </SfButton>
        </div>
      </SfCard>

      <div class="mt-14 grid gap-14 lg:grid-cols-[1fr_22rem] lg:gap-20">
        <div class="sf-prose">
          <h2>Was in der Behandlung passiert</h2>
          <p>
            Der Jeveauxeffect® ist eine ästhetische Ganzkörpermassage, die manuelle Techniken zur
            Aktivierung des Lymphsystems mit Faszienarbeit und Körpermodellierung verbindet. Sie ist
            das Herzstück der Jeveaux Methode und folgt einem festen Ablauf.
          </p>
          <p>
            Zu Beginn wird die Lymphe sanft angeregt, um den Körper in Bewegung zu bringen.
            Anschließend wird intensiv gearbeitet und modelliert, präzise und deutlich spürbar. Eine
            Wellnessmassage ist das nicht: die Behandlung ist kraftvoll und hat Struktur.
            <NuxtLink to="/brasilianische-lymphdrainage#ablauf"
              >Der Ablauf im Detail steht hier</NuxtLink
            >.
          </p>

          <h2>Wobei die Behandlung unterstützen kann</h2>
          <ul>
            <li>Wassereinlagerungen zu reduzieren</li>
            <li>ein schweres oder gespanntes Körpergefühl zu lindern</li>
            <li>die Regeneration des Körpers zu fördern</li>
          </ul>
          <p>
            Viele Kundinnen fühlen sich nach der Behandlung leichter, weniger aufgequollen und
            wohler im eigenen Körper. Häufig genannt werden außerdem mehr Form und Kontur sowie ein
            Effekt, der sich sofort zeigt.
          </p>

          <h2>Für wen die Behandlung passt</h2>
          <p>Der Jeveauxeffect® passt zu Ihnen, wenn Folgendes zutrifft:</p>
          <ul>
            <li v-for="punkt in geeignet" :key="punkt">
              {{ punkt }}
            </li>
          </ul>
          <p>Weniger gut passt die Behandlung in diesen Fällen:</p>
          <ul>
            <li v-for="punkt in nichtGeeignet" :key="punkt">
              {{ punkt }}
            </li>
          </ul>
          <p>
            <NuxtLink to="/brasilianische-lymphdrainage#gegenanzeigen"
              >Die vollständige Liste der Gegenanzeigen steht auf der Methodenseite</NuxtLink
            >. Im Zweifel klären Sie das bitte vorab ärztlich ab.
          </p>

          <h2>Wie es weitergeht</h2>
          <p>
            Schreiben Sie kurz, was Sie interessiert, oder buchen Sie direkt online. Vor der ersten
            Behandlung besprechen wir im Studio, worauf wir achten müssen und wie kräftig gearbeitet
            wird.
          </p>
        </div>

        <aside class="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <NuxtImg
            src="/images/studio-1.jpg"
            alt="Massageliege mit orangefarbenem Plaid im Behandlungsraum von Shape and Flow in Dortmund"
            class="aspect-4/5 w-full rounded-sf border border-border object-cover shadow-card"
            width="1301"
            height="1626"
            sizes="100vw lg:22rem"
            loading="lazy"
          />
          <SfCard>
            <h2 class="sf-eyebrow">Auch im Angebot</h2>
            <p class="mt-3">
              <NuxtLink to="/lymphdrainage-gesicht" class="font-display text-lg hover:text-primary">
                Jeveauxeffect Face®
              </NuxtLink>
            </p>
            <p class="mt-1 text-sm text-text-secondary">
              Die Gesichtsbehandlung mit Fokus auf Entstauung und Kontur. Lässt sich mit der
              Körperbehandlung kombinieren.
            </p>
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
        <h2 class="text-2xl sm:text-3xl">Fragen zur Körperbehandlung</h2>
        <div class="mt-6">
          <SfFaqListe :eintraege="koerperFaq" />
        </div>
      </section>

      <div class="mt-16">
        <SfCtaBlock inverse />
      </div>
    </div>
  </article>
</template>

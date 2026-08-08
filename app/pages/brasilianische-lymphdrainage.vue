<script setup lang="ts">
import { treatments, formatPrice } from '#shared/behandlungen'
import { faqByTopic, contraindications } from '#shared/faq'
import { address, disclaimer, trademarkNotice } from '#shared/site'

/*
 * The topic page about the method.
 *
 * It answers the question "what is this actually" in full, so the two treatment pages can stick to
 * their own offer and the same explanation does not appear three times on the site. The links to
 * the treatments run from here, not the other way round.
 */
usePage({
  title: 'Brasilianische Lymphdrainage: Methode und Ablauf',
  ogTitle: 'Brasilianische Lymphdrainage',
  description:
    'Was die brasilianische Lymphdrainage ist, wie der Jeveauxeffect® abläuft, wie er sich von ' +
    'der medizinischen unterscheidet und wann nicht behandelt wird.',
  ogLabel: 'Die Methode',
})

const methodFaq = faqByTopic('health')

useFaqSchema(methodFaq)
</script>

<template>
  <article>
    <SfSeitenkopf
      title="Brasilianische Lymphdrainage"
      label="Die Methode"
      lead="Eine ästhetische Massage, die den Lymphfluss anregt und danach kräftig modelliert. Hier
        steht, wie sie arbeitet, was sie kann und wo ihre Grenzen liegen."
    />

    <div class="sf-container">
      <div class="grid gap-14 lg:grid-cols-[1fr_20rem] lg:gap-20">
        <div class="sf-prose">
          <h2>Was die brasilianische Lymphdrainage ist</h2>
          <p>
            Die brasilianische Lymphdrainage kommt, wie der Name sagt, aus Brasilien. Sie ist eine
            ästhetisch ausgerichtete Weiterentwicklung der manuellen Lymphdrainage: statt um die
            Behandlung einer Krankheit geht es um Entstauung und um die Form des Körpers.
          </p>
          <p>
            Der Jeveauxeffect® ist die Ausprägung dieser Methode, die die Jeveaux Company®
            entwickelt hat. Er verbindet drei Handschriften in einem festen Ablauf: Lymphdrainage,
            Faszienarbeit und Körpermodellierung. Shape &amp; Flow arbeitet in
            {{ address.city }} als lizenzierter Partner mit dieser Methode.
          </p>

          <h2 id="ablauf">Wie eine Behandlung abläuft</h2>
          <p>
            Der Ablauf ist festgelegt und wird nicht nach Tagesform improvisiert. Genau das
            unterscheidet die Methode von einer Massage, bei der nach Gefühl gearbeitet wird.
          </p>
          <ol>
            <li>
              <strong>Aktivieren.</strong> Zuerst wird die Lymphe mit sanften, rhythmischen Griffen
              angeregt. Dieser Teil ist ruhig und bereitet das Gewebe vor.
            </li>
            <li>
              <strong>Modellieren.</strong> Danach wird mit deutlich mehr Druck gearbeitet. Die
              Griffe folgen einer festen Reihenfolge und sind klar spürbar.
            </li>
          </ol>
          <p>
            Die Behandlung ist intensiv, aber kontrollierbar. Wie kräftig gearbeitet wird, stimmen
            wir während des Termins ab. Wer eine Behandlung zum Einschlafen sucht, ist mit einer
            klassischen Entspannungsmassage besser beraten.
          </p>

          <h2>Was Kundinnen danach beschreiben</h2>
          <p>Rückmeldungen nach einem Termin ähneln sich. Am häufigsten genannt werden:</p>
          <ul>
            <li>ein leichteres, freieres Gefühl im Körper</li>
            <li>weniger Spannung oder Druckgefühl</li>
            <li>mehr Kontur und Definition</li>
            <li>ein Unterschied, der sich direkt nach dem Termin zeigt</li>
          </ul>
          <p>
            Weil die Lymphe angeregt wird, kann die Behandlung dabei unterstützen, dass sich der
            Körper weniger aufgeschwemmt anfühlt und Wassereinlagerungen besser abfließen können.
            Wie deutlich das wahrgenommen wird, ist individuell verschieden und hängt unter anderem
            von körperlichen Voraussetzungen, Bewegung, Ernährung und allgemeinem Wohlbefinden ab.
          </p>

          <h2 id="unterschied">Der Unterschied zur medizinischen Lymphdrainage</h2>
          <p>
            Beide Verfahren arbeiten am Lymphsystem, aber sie haben verschiedene Aufgaben. Die
            medizinische Lymphdrainage ist eine Heilbehandlung: Sie wird bei einem diagnostizierten
            Lymphödem ärztlich verordnet und von Physiotherapeutinnen und Physiotherapeuten
            durchgeführt, die Krankenkasse beteiligt sich an den Kosten.
          </p>
          <p>
            Der Jeveauxeffect® ist eine ästhetische Anwendung im Beauty-Bereich. Es gibt kein
            Rezept, keine Kassenleistung und keine Diagnose. Wer eine medizinische Behandlung
            braucht, gehört zur Ärztin oder zum Arzt, nicht ins Beauty-Studio.
            <NuxtLink to="/ratgeber/brasilianische-vs-medizinische-lymphdrainage"
              >Der ausführliche Vergleich steht hier</NuxtLink
            >.
          </p>

          <h2 id="gegenanzeigen">Wann nicht behandelt wird</h2>
          <p>
            Auch eine ästhetische Behandlung hat Grenzen. In diesen Situationen findet keine
            Behandlung statt:
          </p>
          <ul>
            <li v-for="item in contraindications" :key="item">
              {{ item }}
            </li>
          </ul>
          <p>
            Im Zweifel gilt immer: vorher ärztlich abklären. Sagen Sie uns außerdem vor dem Termin,
            wenn Sie schwanger sind, Medikamente einnehmen oder eine Vorerkrankung haben. Das
            besprechen wir vor der ersten Behandlung ohnehin gemeinsam.
          </p>
        </div>

        <!-- Sidebar with both offers, so the topic page sells as well. -->
        <aside class="lg:sticky lg:top-28 lg:self-start">
          <SfCard>
            <h2 class="sf-eyebrow">Behandlungen</h2>
            <ul class="mt-4 space-y-4">
              <li v-for="treatment in treatments" :key="treatment.slug">
                <NuxtLink :to="treatment.route" class="group block">
                  <span class="flex items-baseline justify-between gap-3">
                    <span class="font-display text-lg group-hover:text-primary">
                      {{ treatment.name }}
                    </span>
                    <span class="font-display whitespace-nowrap text-primary">
                      {{ formatPrice(treatment.priceEuro) }}
                    </span>
                  </span>
                  <span class="mt-0.5 block text-sm text-text-secondary">
                    {{ treatment.title }}
                  </span>
                </NuxtLink>
              </li>
            </ul>
            <SfRule class="my-5 text-border" />
            <p class="text-sm text-text-secondary">
              {{ trademarkNotice }}
            </p>
          </SfCard>
        </aside>
      </div>

      <SfHinweis class="mt-16 max-w-3xl">
        <p>{{ disclaimer }}</p>
        <p>
          Der Jeveauxeffect® kann eine bewusste Körperpflege unterstützen, ersetzt aber keine
          gesunde Lebensweise.
        </p>
      </SfHinweis>

      <section class="mt-16 max-w-3xl">
        <h2 class="text-2xl sm:text-3xl">Fragen zu Gesundheit und Eignung</h2>
        <div class="mt-6">
          <SfFaqListe :entries="methodFaq" />
        </div>
        <NuxtLink
          to="/faq"
          class="mt-6 inline-block text-primary underline underline-offset-4 hover:no-underline"
        >
          Alle Fragen und Antworten
        </NuxtLink>
      </section>

      <div class="mt-16">
        <SfCtaBlock inverse />
      </div>
    </div>
  </article>
</template>

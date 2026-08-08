<script setup lang="ts">
import { treatments, comboAnchor, comboAppointment, formatPrice } from '#shared/behandlungen'
import { faqByTopic } from '#shared/faq'
import { address, disclaimer, site } from '#shared/site'

// The title stays short, because the company name is appended by the template and Google cuts off
// at around 60 characters.
usePage({
  title: withCity('Brasilianische Lymphdrainage'),
  ogTitle: `Brasilianische Lymphdrainage in ${address.city}`,
  description:
    `Brasilianische Lymphdrainage in ${address.city}: der Jeveauxeffect® für Körper und Gesicht, ` +
    `ästhetisch und mit festem Ablauf. Termine nach Vereinbarung.`,
  ogLabel: site.tagline,
})

const phases = [
  {
    title: 'Aktivieren',
    text:
      'Zum Auftakt wird die Lymphe mit sanften, rhythmischen Griffen angeregt. Das ist der leise ' +
      'Teil der Behandlung und bereitet das Gewebe auf das vor, was danach kommt.',
  },
  {
    title: 'Modellieren',
    text:
      'Dann wird mit deutlich mehr Druck gearbeitet und modelliert. Dieser Teil ist spürbar und ' +
      'folgt einer festen Abfolge von Griffen. Wie kräftig gearbeitet wird, stimmen wir ' +
      'unterwegs miteinander ab.',
  },
]

const impressions = [
  'ein leichteres Körpergefühl',
  'mehr Form und Kontur',
  'weniger Spannung im Gewebe',
  'ein Unterschied, der sich direkt nach dem Termin zeigt',
]

const homeFaq = faqByTopic('general').slice(0, 4)
</script>

<template>
  <div>
    <!--
      The hero translates the brand into architecture: on the left the heading on the brand
      orange, on the right the treatment room. That the accent wall in the studio has the same
      orange is not a coincidence of the crop but the reason for this split: the seam between
      panel and photo almost disappears.

      No logo in the panel: it is already in the page header directly above, and twice below each
      other reads as repetition, not as a sender.
    -->
    <section class="grid lg:grid-cols-2">
      <div
        class="sf-on-inverse flex flex-col justify-center bg-inverse-surface px-5 py-14 text-inverse-text sm:px-8 sm:py-20 lg:py-24 lg:pr-14 lg:pl-[max(2rem,calc((100vw-72rem)/2+2rem))]"
      >
        <h1 class="text-3xl sm:text-4xl lg:text-[2.75rem]">
          Brasilianische Lymphdrainage in {{ address.city }}
        </h1>

        <p class="sf-lead mt-5 text-inverse-body">
          Der Jeveauxeffect® ist keine Wellnessmassage. Er arbeitet mit Druck und Rhythmus, nach
          einem festen Ablauf. Die meisten merken direkt nach dem Termin einen Unterschied.
        </p>

        <div class="mt-8 flex flex-wrap gap-3">
          <SfTerminButton variant="inverse" size="lg" />
          <!-- On orange the second button needs a border, otherwise it reads as body copy. -->
          <SfButton
            to="/brasilianische-lymphdrainage"
            variant="ghost"
            size="lg"
            class="border border-inverse-text/40 text-inverse-text! hover:bg-inverse-border!"
          >
            Wie die Methode arbeitet
          </SfButton>
        </div>
      </div>

      <div class="relative min-h-[18rem] lg:min-h-[34rem]">
        <NuxtImg
          src="/images/studio-1.jpg"
          alt="Behandlungsraum bei Shape and Flow: Massageliege mit orangefarbenem Plaid vor der orangefarbenen Wand mit Jeveaux-Postern"
          class="absolute inset-0 size-full object-cover"
          width="1301"
          height="1600"
          sizes="100vw lg:50vw"
          preload
          fetchpriority="high"
        />
      </div>
    </section>

    <!-- Treatments -->
    <section class="sf-container py-16 sm:py-20">
      <span class="sf-eyebrow">Zwei Behandlungen</span>
      <h2 class="mt-3 text-3xl sm:text-4xl">Körper und Gesicht</h2>
      <p class="sf-lead mt-4 text-text-secondary">
        Beide folgen derselben Methode. Sie lassen sich einzeln buchen oder nacheinander.
      </p>

      <div class="mt-10 grid gap-6 md:grid-cols-2">
        <SfCard v-for="treatment in treatments" :key="treatment.slug">
          <div class="flex items-baseline justify-between gap-4">
            <h3 class="font-display text-2xl">
              {{ treatment.name }}
            </h3>
            <span class="font-display text-xl whitespace-nowrap text-primary">
              {{ formatPrice(treatment.priceEuro) }}
            </span>
          </div>
          <p class="mt-1 text-sm tracking-wide text-text-secondary uppercase">
            {{ treatment.title }}
          </p>
          <p class="mt-4 text-text-secondary">
            {{ treatment.summary }}
          </p>
          <SfButton :to="treatment.route" variant="secondary" class="mt-6">
            Mehr zur Behandlung
          </SfButton>
        </SfCard>

        <!--
          The combo appointment across the full width: not a third treatment but the two above it
          in one appointment. Hence a card of its own and not an equal-ranking third.
        -->
        <SfCard class="md:col-span-2">
          <div class="flex items-baseline justify-between gap-4">
            <h3 class="font-display text-2xl">Beides zusammen</h3>
            <span class="font-display text-xl whitespace-nowrap text-primary">
              {{ formatPrice(comboAppointment.priceEuro) }}
            </span>
          </div>
          <p class="mt-1 text-sm tracking-wide text-text-secondary uppercase">
            {{ comboAppointment.note }}
          </p>
          <p class="mt-4 text-text-secondary">
            Körper und Gesicht in einem Termin, statt zweimal zu kommen. Für regelmäßige Termine
            gibt es zusätzlich 5er- und 10er-Pakete.
          </p>
          <SfButton :to="comboAnchor" variant="secondary" class="mt-6">
            Kombi- und Paketpreise
          </SfButton>
        </SfCard>
      </div>
    </section>

    <!-- Procedure: the connecting line sits here, because here the order is the statement. -->
    <section class="border-y border-border bg-surface-muted">
      <div class="sf-container grid gap-12 py-16 sm:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div>
          <span class="sf-eyebrow">Der Ablauf</span>
          <h2 class="mt-3 text-3xl sm:text-4xl">Erst aktivieren, dann modellieren</h2>
          <p class="mt-4 text-text-secondary">
            Die Behandlung läuft in zwei Teilen, immer in dieser Reihenfolge. Das unterscheidet den
            Jeveauxeffect® von einer Massage, bei der nach Gefühl gearbeitet wird.
          </p>
        </div>
        <SfAblauf :phases="phases" />
      </div>
    </section>

    <!-- Effects, deliberately phrased as perception -->
    <section class="sf-container py-16 sm:py-20">
      <div class="grid gap-12 lg:grid-cols-2 lg:gap-20">
        <div>
          <span class="sf-eyebrow">Danach</span>
          <h2 class="mt-3 text-3xl sm:text-4xl">Was Kundinnen beschreiben</h2>
          <ul class="sf-list mt-6">
            <li v-for="impression in impressions" :key="impression">
              {{ impression }}
            </li>
          </ul>
          <p class="mt-6 max-w-prose text-text-secondary">
            Weil die Lymphe angeregt wird, kann die Behandlung dabei unterstützen, dass sich der
            Körper weniger aufgeschwemmt anfühlt. Wie deutlich das ausfällt, ist von Person zu
            Person verschieden.
          </p>
        </div>

        <SfHinweis class="lg:mt-14">
          <p>{{ disclaimer }}</p>
          <p>
            Es gibt Situationen, in denen nicht behandelt wird.
            <NuxtLink
              to="/brasilianische-lymphdrainage#gegenanzeigen"
              class="text-primary underline underline-offset-2 hover:no-underline"
              >Die Gegenanzeigen stehen hier</NuxtLink
            >.
          </p>
        </SfHinweis>
      </div>
    </section>

    <!-- Studio -->
    <section class="border-y border-border bg-surface-muted">
      <div class="sf-container grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:gap-16">
        <div>
          <span class="sf-eyebrow">Das Studio</span>
          <h2 class="mt-3 text-3xl sm:text-4xl">Ein Raum, eine Kundin</h2>
          <p class="mt-4 max-w-prose text-text-secondary">
            Shape &amp; Flow ist ein kleines Studio in {{ address.district }}, in der
            {{ address.street }}. Es gibt einen Behandlungsraum und keine Parallelbetreuung, Sie
            haben den Termin also für sich.
          </p>
          <SfButton to="/studio" variant="secondary" class="mt-6"> Studio ansehen </SfButton>
        </div>
        <!-- Portrait cropped to 4:5, otherwise the image towers over the text column. -->
        <NuxtImg
          src="/images/studio-2.jpg"
          alt="Umkleideecke im Studio mit Rattan-Paravent, Rattansessel mit orangefarbenem Kissen und kleinem Beistelltisch"
          class="aspect-4/5 w-full rounded-sf border border-border object-cover shadow-card"
          width="1536"
          height="2048"
          sizes="100vw lg:44vw"
          loading="lazy"
        />
      </div>
    </section>

    <!-- Questions -->
    <section class="sf-container py-16 sm:py-20">
      <span class="sf-eyebrow">Häufige Fragen</span>
      <h2 class="mt-3 text-3xl sm:text-4xl">Bevor Sie kommen</h2>
      <div class="mt-8 max-w-3xl">
        <SfFaqListe :entries="homeFaq" />
        <NuxtLink
          to="/faq"
          class="mt-6 inline-block text-primary underline underline-offset-4 hover:no-underline"
        >
          Alle Fragen und Antworten
        </NuxtLink>
      </div>
    </section>

    <section class="sf-container pb-4">
      <SfCtaBlock inverse />
    </section>
  </div>
</template>

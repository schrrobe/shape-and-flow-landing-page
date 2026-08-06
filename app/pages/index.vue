<script setup lang="ts">
import { behandlungen, preis } from '#shared/behandlungen'
import { faqZuThema } from '#shared/faq'
import { adresse, disclaimer, kontakt, site } from '#shared/site'

// Der Titel bleibt kurz, weil der Firmenname per Vorlage angehängt wird und Google bei etwa
// 60 Zeichen abschneidet.
useSeite({
  titel: mitOrt('Brasilianische Lymphdrainage'),
  ogTitel: `Brasilianische Lymphdrainage in ${adresse.ort}`,
  beschreibung:
    `Jeveauxeffect® bei ${site.name} in ${adresse.ort}: brasilianische Lymphdrainage für Körper `
    + `und Gesicht. Ästhetische Behandlung mit festem Ablauf, Termine nach Vereinbarung.`,
  ogLabel: site.tagline,
})

const phasen = [
  {
    titel: 'Aktivieren',
    text:
      'Zum Auftakt wird die Lymphe mit sanften, rhythmischen Griffen angeregt. Das ist der leise '
      + 'Teil der Behandlung und bereitet das Gewebe auf das vor, was danach kommt.',
  },
  {
    titel: 'Modellieren',
    text:
      'Dann wird mit deutlich mehr Druck gearbeitet und modelliert. Dieser Teil ist spürbar und '
      + 'folgt einer festen Abfolge von Griffen. Wie kräftig gearbeitet wird, stimmen wir '
      + 'unterwegs miteinander ab.',
  },
]

const eindruecke = [
  'ein leichteres Körpergefühl',
  'mehr Form und Kontur',
  'weniger Spannung im Gewebe',
  'ein Unterschied, der sich direkt nach dem Termin zeigt',
]

const startFaq = faqZuThema('allgemein').slice(0, 4)
</script>

<template>
  <div>
    <!--
      Der Hero setzt das Logo ins Bauliche um: links das cremefarbene Wortzeichen auf dem
      Markenorange, rechts der Behandlungsraum. Dass die Akzentwand im Studio dasselbe Orange hat,
      ist kein Zufall des Zuschnitts, sondern der Grund für diese Aufteilung: die Naht zwischen
      Panel und Foto verschwindet fast.
    -->
    <section class="grid lg:grid-cols-2">
      <div
        class="sf-on-inverse flex flex-col justify-center bg-inverse-surface px-5 py-14 text-inverse-text sm:px-8 sm:py-20 lg:py-24 lg:pr-14 lg:pl-[max(2rem,calc((100vw-72rem)/2+2rem))]"
      >
        <SfWordmark variant="stacked" subline class="items-start! text-left! self-start" />

        <h1 class="mt-10 text-3xl sm:text-4xl lg:text-[2.75rem]">
          Brasilianische Lymphdrainage in {{ adresse.ort }}
        </h1>

        <p class="sf-lead mt-5 text-inverse-body">
          Der Jeveauxeffect® ist keine Wellnessmassage. Er arbeitet mit Druck und Rhythmus, nach
          einem festen Ablauf. Die meisten merken direkt nach dem Termin einen Unterschied.
        </p>

        <div class="mt-8 flex flex-wrap gap-3">
          <SfButton :href="kontakt.buchungUrl" variant="inverse" size="lg" external>
            Termin buchen
          </SfButton>
          <!-- Auf Orange braucht der zweite Button einen Rahmen, sonst liest er sich als Fließtext. -->
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

    <!-- Behandlungen -->
    <section class="sf-container py-16 sm:py-20">
      <span class="sf-eyebrow">Zwei Behandlungen</span>
      <h2 class="mt-3 text-3xl sm:text-4xl">
        Körper und Gesicht
      </h2>
      <p class="sf-lead mt-4 text-text-secondary">
        Beide folgen derselben Methode. Sie lassen sich einzeln buchen oder nacheinander.
      </p>

      <div class="mt-10 grid gap-6 md:grid-cols-2">
        <SfCard v-for="behandlung in behandlungen" :key="behandlung.slug">
          <div class="flex items-baseline justify-between gap-4">
            <h3 class="font-display text-2xl">
              {{ behandlung.name }}
            </h3>
            <span class="font-display text-xl whitespace-nowrap text-primary">
              {{ preis(behandlung.preisEuro) }}
            </span>
          </div>
          <p class="mt-1 text-sm tracking-wide text-text-secondary uppercase">
            {{ behandlung.titel }}
          </p>
          <p class="mt-4 text-text-secondary">
            {{ behandlung.kurz }}
          </p>
          <SfButton :to="behandlung.route" variant="secondary" class="mt-6">
            Mehr zur Behandlung
          </SfButton>
        </SfCard>
      </div>
    </section>

    <!-- Ablauf: hier sitzt die verbindende Linie, weil hier die Reihenfolge die Aussage ist. -->
    <section class="border-y border-border bg-surface-muted">
      <div class="sf-container grid gap-12 py-16 sm:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div>
          <span class="sf-eyebrow">Der Ablauf</span>
          <h2 class="mt-3 text-3xl sm:text-4xl">
            Erst aktivieren, dann modellieren
          </h2>
          <p class="mt-4 text-text-secondary">
            Die Behandlung läuft in zwei Teilen, immer in dieser Reihenfolge. Das unterscheidet den
            Jeveauxeffect® von einer Massage, bei der nach Gefühl gearbeitet wird.
          </p>
        </div>
        <SfAblauf :phasen="phasen" />
      </div>
    </section>

    <!-- Wirkung, bewusst als Wahrnehmung formuliert -->
    <section class="sf-container py-16 sm:py-20">
      <div class="grid gap-12 lg:grid-cols-2 lg:gap-20">
        <div>
          <span class="sf-eyebrow">Danach</span>
          <h2 class="mt-3 text-3xl sm:text-4xl">
            Was Kundinnen beschreiben
          </h2>
          <ul class="sf-liste mt-6">
            <li v-for="eindruck in eindruecke" :key="eindruck">
              {{ eindruck }}
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
            >Die Gegenanzeigen stehen hier</NuxtLink>.
          </p>
        </SfHinweis>
      </div>
    </section>

    <!-- Studio -->
    <section class="border-y border-border bg-surface-muted">
      <div class="sf-container grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:gap-16">
        <div>
          <span class="sf-eyebrow">Das Studio</span>
          <h2 class="mt-3 text-3xl sm:text-4xl">
            Ein Raum, eine Kundin
          </h2>
          <p class="mt-4 max-w-prose text-text-secondary">
            Shape &amp; Flow ist ein kleines Studio in {{ adresse.stadtteil }}, in der
            {{ adresse.strasse }}. Es gibt einen Behandlungsraum und keine Parallelbetreuung, Sie
            haben den Termin also für sich.
          </p>
          <SfButton to="/studio" variant="secondary" class="mt-6">
            Studio ansehen
          </SfButton>
        </div>
        <!-- Hochformat auf 4:5 beschnitten, sonst überragt das Bild die Textspalte deutlich. -->
        <NuxtImg
          src="/images/studio-2.jpg"
          alt="Umkleideecke im Studio mit Rattan-Paravent, Rattansessel mit orangefarbenem Kissen und kleinem Beistelltisch"
          class="aspect-4/5 w-full rounded-sf border border-border object-cover shadow-card"
          width="1200"
          height="1500"
          sizes="100vw lg:44vw"
          loading="lazy"
        />
      </div>
    </section>

    <!-- Fragen -->
    <section class="sf-container py-16 sm:py-20">
      <span class="sf-eyebrow">Häufige Fragen</span>
      <h2 class="mt-3 text-3xl sm:text-4xl">
        Bevor Sie kommen
      </h2>
      <div class="mt-8 max-w-3xl">
        <SfFaqListe :eintraege="startFaq" />
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

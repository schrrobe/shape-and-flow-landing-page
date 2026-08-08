<script setup lang="ts">
import { faq } from '#shared/faq'
import { address, disclaimer } from '#shared/site'

/*
 * All questions in one place.
 *
 * The sub-pages each show only the excerpt matching their topic. This page is the complete
 * version and therefore carries the FAQPage structured data for the whole set.
 */
usePage({
  title: 'Häufige Fragen zur brasilianischen Lymphdrainage',
  ogTitle: 'Häufige Fragen',
  description:
    'Antworten zu Ablauf, Wirkung, Gegenanzeigen, Schwangerschaft, Preisen und Krankenkasse rund ' +
    `um die brasilianische Lymphdrainage in ${address.city}.`,
  ogLabel: 'Fragen und Antworten',
})

useFaqSchema(faq)
</script>

<template>
  <article>
    <SfSeitenkopf
      title="Häufige Fragen"
      label="Fragen und Antworten"
      lead="Was Kundinnen vor dem ersten Termin wissen wollen. Wenn Ihre Frage fehlt, schreiben Sie
        uns kurz über das Kontaktformular."
    />

    <div class="sf-container">
      <div class="max-w-3xl">
        <SfFaqListe :entries="faq" />
      </div>

      <SfHinweis class="mt-14 max-w-3xl">
        <p>{{ disclaimer }}</p>
        <p>
          Wie der Jeveauxeffect® empfunden wird, hängt unter anderem ab von individuellen
          körperlichen Voraussetzungen, Lebensstil, Bewegung, Ernährung und allgemeinem
          Wohlbefinden. Bei bestehenden Erkrankungen oder gesundheitlichen Beschwerden holen Sie
          bitte vor der Behandlung ärztlichen Rat ein.
        </p>
      </SfHinweis>

      <div class="mt-16">
        <SfCtaBlock
          inverse
          title="Frage nicht dabei?"
          text="Schreiben Sie einfach. Wir antworten auch auf Fragen, bei denen es am Ende nicht zu
            einem Termin kommt."
        />
      </div>
    </div>
  </article>
</template>

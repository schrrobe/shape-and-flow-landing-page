<script setup lang="ts">
import { faq } from '#shared/faq'
import { adresse, disclaimer } from '#shared/site'

/*
 * Alle Fragen an einem Ort.
 *
 * Die Unterseiten zeigen jeweils nur den zu ihrem Thema passenden Ausschnitt. Diese Seite ist die
 * vollständige Fassung und trägt deshalb das FAQPage-Structured-Data für den gesamten Bestand.
 */
useSeite({
  titel: 'Häufige Fragen zur brasilianischen Lymphdrainage',
  ogTitel: 'Häufige Fragen',
  beschreibung:
    'Antworten zu Ablauf, Wirkung, Gegenanzeigen, Schwangerschaft, Preisen und Krankenkasse rund ' +
    `um die brasilianische Lymphdrainage in ${adresse.ort}.`,
  ogLabel: 'Fragen und Antworten',
})

useFaqSchema(faq)
</script>

<template>
  <article>
    <SfSeitenkopf
      titel="Häufige Fragen"
      label="Fragen und Antworten"
      lead="Was Kundinnen vor dem ersten Termin wissen wollen. Wenn Ihre Frage fehlt, schreiben Sie
        uns kurz über das Kontaktformular."
    />

    <div class="sf-container">
      <div class="max-w-3xl">
        <SfFaqListe :eintraege="faq" />
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
          titel="Frage nicht dabei?"
          text="Schreiben Sie einfach. Wir antworten auch auf Fragen, bei denen es am Ende nicht zu
            einem Termin kommt."
        />
      </div>
    </div>
  </article>
</template>

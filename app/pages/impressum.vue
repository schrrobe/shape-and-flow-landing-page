<script setup lang="ts">
import { adresse, kontakt, site } from '#shared/site'

/*
 * Pflichtangaben nach § 5 DDG.
 *
 * Der Name der Inhaberin kommt aus shared/site.ts, weil dieselbe Angabe hier zweimal und in der
 * Datenschutzerklärung ein drittes Mal steht — DDG und DSGVO verlangen an allen drei Stellen
 * denselben Namen.
 *
 * Alle Pflichtangaben sind gesetzt. Ein Impressum mit Platzhaltern ist abmahnbar — wer hier etwas
 * ändert, prüft danach docs/launch-checklist.md.
 */
useSeite({
  titel: 'Impressum',
  beschreibung: `Impressum und Anbieterkennzeichnung von ${site.name}, ${adresse.ort}.`,
  ogLabel: 'Rechtliches',
})

// Diese Seite gehört nicht in den Suchindex, aber sie muss erreichbar und verlinkt bleiben.
useHead({ meta: [{ name: 'robots', content: 'noindex, follow' }] })
</script>

<template>
  <article>
    <SfSeitenkopf titel="Impressum" label="Rechtliches" />

    <div class="sf-container">
      <div class="sf-prose">
        <h2 class="mt-0!">Angaben gemäß § 5 DDG</h2>
        <p>
          {{ site.name }}<br />
          Inhaberin: {{ site.inhaberin }}<br />
          {{ adresse.strasse }}<br />
          {{ adresse.plz }} {{ adresse.ort }}<br />
          Deutschland
        </p>

        <h2>Kontakt</h2>
        <p>
          Telefon: {{ kontakt.telefonAnzeige }}<br />
          E-Mail: {{ kontakt.email }}
        </p>

        <h2>Umsatzsteuer</h2>
        <p>
          <!-- Kleinunternehmerregelung, deshalb steht hier keine USt-IdNr.: § 27 a UStG verlangt
               sie nur, wenn eine erteilt wurde. Sollte die Grenze des § 19 UStG einmal
               überschritten werden, ersetzt die Nummer diesen Absatz. -->
          Gemäß § 19 UStG wird keine Umsatzsteuer berechnet und daher auch nicht in Rechnungen
          ausgewiesen.
        </p>

        <h2>Verantwortlich für den Inhalt</h2>
        <p>
          {{ site.inhaberin }}<br />
          {{ adresse.strasse }}, {{ adresse.plz }} {{ adresse.ort }}
        </p>

        <h2>Verbraucherstreitbeilegung</h2>
        <p>
          Wir sind nicht verpflichtet und nicht bereit, an einem Streitbeilegungsverfahren vor einer
          Verbraucherschlichtungsstelle teilzunehmen.
        </p>

        <h2>Marken</h2>
        <p>
          Jeveauxeffect® und Jeveauxeffect Face® sind eingetragene Marken der Jeveaux Company®.
          {{ site.name }} ist lizenzierter Partner der Jeveaux Company®. Alle weiteren genannten
          Marken sind Eigentum der jeweiligen Rechteinhaber.
        </p>

        <h2>Bildnachweis</h2>
        <p>Die Studioaufnahmen und das Logo stammen von {{ site.name }}.</p>

        <h2>Haftung für Inhalte und Links</h2>
        <p>
          Die Inhalte dieser Website wurden mit Sorgfalt erstellt. Für die Richtigkeit,
          Vollständigkeit und Aktualität können wir keine Gewähr übernehmen. Die Inhalte sind
          allgemeine Information und keine medizinische Beratung.
        </p>
        <p>
          Für die Inhalte verlinkter externer Seiten sind deren Betreiber verantwortlich. Zum
          Zeitpunkt der Verlinkung waren dort keine rechtswidrigen Inhalte erkennbar. Eine
          dauerhafte inhaltliche Kontrolle fremder Seiten ist ohne konkreten Anlass nicht zumutbar.
          Bei Kenntnis von Rechtsverstößen entfernen wir solche Links.
        </p>

        <h2>Urheberrecht</h2>
        <p>
          Die auf dieser Website erstellten Inhalte und Werke unterliegen dem deutschen
          Urheberrecht. Vervielfältigung, Bearbeitung und Verbreitung außerhalb der Grenzen des
          Urheberrechts bedürfen unserer schriftlichen Zustimmung. Downloads und Kopien sind für den
          privaten, nicht kommerziellen Gebrauch gestattet.
        </p>
      </div>
    </div>
  </article>
</template>

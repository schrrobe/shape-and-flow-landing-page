<script setup lang="ts">
import {
  adresse,
  kartenUrl,
  kontakt,
  mailtoUrl,
  oeffnungszeiten,
  site,
  telUrl,
  whatsappUrl,
} from '#shared/site'

useSeite({
  titel: `Kontakt und Termin in ${adresse.ort}`,
  ogTitel: 'Kontakt und Termin',
  kurzTitel: 'Kontakt',
  beschreibung:
    `Termin für brasilianische Lymphdrainage bei Shape & Flow, ${adresse.strasse}, ${adresse.plz} ` +
    `${adresse.ort}. Per WhatsApp, telefonisch oder online buchen.`,
  ogLabel: 'Kontakt',
})

const wege = [
  {
    titel: 'WhatsApp',
    text: 'Der schnellste Weg. Schreiben Sie kurz, was Sie interessiert.',
    label: 'Nachricht schreiben',
    href: whatsappUrl,
    external: true,
  },
  {
    titel: 'Telefon',
    text: 'Wenn gerade behandelt wird, klingelt es durch. Dann einfach später noch einmal.',
    label: kontakt.telefonAnzeige,
    href: telUrl,
    external: false,
  },
  {
    titel: 'Online buchen',
    text: 'Freie Termine sehen und direkt verbindlich buchen.',
    label: 'Zur Terminbuchung',
    href: kontakt.buchungUrl,
    external: true,
  },
  {
    titel: 'E-Mail',
    text: 'Für alles, was länger ist als eine Nachricht.',
    label: kontakt.email,
    href: mailtoUrl,
    external: false,
  },
]
</script>

<template>
  <article>
    <SfSeitenkopf
      titel="Kontakt"
      label="Termin vereinbaren"
      lead="Vier Wege, uns zu erreichen. Am schnellsten geht es per WhatsApp."
    />

    <div class="sf-container">
      <div class="grid gap-6 sm:grid-cols-2">
        <SfCard v-for="weg in wege" :key="weg.titel">
          <h2 class="font-display text-xl">
            {{ weg.titel }}
          </h2>
          <p class="mt-2 text-text-secondary">
            {{ weg.text }}
          </p>
          <SfButton
            :href="weg.href"
            :variant="weg.titel === 'WhatsApp' ? 'primary' : 'secondary'"
            :external="weg.external"
            class="mt-5"
          >
            {{ weg.label }}
          </SfButton>
        </SfCard>
      </div>

      <div class="mt-14 grid gap-14 lg:grid-cols-2 lg:gap-20">
        <div>
          <h2 class="text-2xl sm:text-3xl">Adresse und Anfahrt</h2>
          <address class="mt-5 space-y-1 text-lg not-italic">
            <p>{{ site.name }}</p>
            <p>{{ adresse.strasse }}</p>
            <p>{{ adresse.plz }} {{ adresse.ort }}</p>
          </address>
          <p class="mt-4 text-text-secondary">
            {{ oeffnungszeiten.hinweis }}. Kommen Sie bitte nicht ohne Termin vorbei, weil während
            einer Behandlung niemand an der Tür ist.
          </p>
          <!--
            Bewusst nur ein Link zu Google Maps und keine eingebettete Karte: eine Karte im iframe
            lädt Daten bei Google, sobald die Seite aufgeht, und würde eine Einwilligung samt
            Cookie-Banner nötig machen. Für eine Adresse ist das ein schlechter Tausch.
          -->
          <SfButton :href="kartenUrl" variant="secondary" class="mt-6" external>
            Route in Google Maps planen
          </SfButton>
        </div>

        <div class="sf-prose">
          <h2 class="mt-0!">Was in die Anfrage gehört</h2>
          <p>Damit die Antwort schneller passt, schreiben Sie am besten gleich mit:</p>
          <ul>
            <li>welche Behandlung Sie interessiert, Körper oder Gesicht</li>
            <li>an welchen Tagen und Uhrzeiten es Ihnen passt</li>
            <li>ob es gesundheitlich etwas zu beachten gibt</li>
          </ul>
          <p>
            Der letzte Punkt ist kein Formalismus. Es gibt Situationen, in denen nicht behandelt
            wird, und die klären wir lieber vor als nach der Terminvergabe.
            <NuxtLink to="/brasilianische-lymphdrainage#gegenanzeigen"
              >Die Gegenanzeigen stehen hier</NuxtLink
            >.
          </p>
        </div>
      </div>

      <div class="mt-16">
        <SfCtaBlock inverse />
      </div>
    </div>
  </article>
</template>

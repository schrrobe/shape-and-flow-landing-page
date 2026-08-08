<script setup lang="ts">
import { address, formUrl, contact, site } from '#shared/site'

/*
 * Mandatory information under § 5 DDG.
 *
 * The owner's name comes from shared/site.ts, because the same detail appears twice here and a
 * third time in the privacy policy — the DDG and the GDPR require the same name in all three
 * places.
 *
 * All mandatory details are filled in. An imprint with placeholders can be formally warned —
 * whoever changes something here checks docs/launch-checklist.md afterwards.
 */
usePage({
  title: 'Impressum',
  description: `Impressum und Anbieterkennzeichnung von ${site.name}, ${address.city}.`,
  ogLabel: 'Rechtliches',
})

// This page does not belong in the search index, but it has to stay reachable and linked.
useHead({ meta: [{ name: 'robots', content: 'noindex, follow' }] })
</script>

<template>
  <article>
    <SfSeitenkopf title="Impressum" label="Rechtliches" />

    <div class="sf-container">
      <div class="sf-prose">
        <h2 class="mt-0!">Angaben gemäß § 5 DDG</h2>
        <p>
          {{ site.name }}<br />
          Inhaberin: {{ site.owner }}<br />
          {{ address.street }}<br />
          {{ address.postalCode }} {{ address.city }}<br />
          Deutschland
        </p>

        <h2>Kontakt</h2>
        <p>
          <!-- No phone number: § 5(1)(2) DDG requires details that allow quick electronic contact
               and direct communication, and expressly names only the email address for that. That
               a phone line is not part of it when a second electronic channel is available was
               decided by the ECJ in C-298/07 — here that channel is the contact form. -->
          E-Mail: {{ contact.email }}<br />
          Kontaktformular:
          <NuxtLink :to="formUrl">shapeandflow.de/kontakt</NuxtLink>
        </p>

        <h2>Umsatzsteuer</h2>
        <p>
          <!-- Small business regulation, hence no VAT ID here: § 27a UStG only requires one if it
               has been issued. Should the threshold of § 19 UStG ever be exceeded, the number
               replaces this paragraph. -->
          Gemäß § 19 UStG wird keine Umsatzsteuer berechnet und daher auch nicht in Rechnungen
          ausgewiesen.
        </p>

        <h2>Verantwortlich für den Inhalt</h2>
        <p>
          {{ site.owner }}<br />
          {{ address.street }}, {{ address.postalCode }} {{ address.city }}
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

<script setup lang="ts">
import { kontraindikationen } from '#shared/faq'
import { artikelByRoute } from '#shared/ratgeber'
import { disclaimer } from '#shared/site'

/*
 * Der Vergleich beider Verfahren.
 *
 * Der Artikel steht nicht nur aus SEO-Gründen hier. Die Verwechslung ist der häufigste Grund für
 * falsche Erwartungen an einen Termin, und sie rechtlich klar aufzulösen schützt beide Seiten.
 */
const artikel = artikelByRoute('/ratgeber/brasilianische-vs-medizinische-lymphdrainage')!

useSeite({
  titel: artikel.titel,
  kurzTitel: artikel.titel,
  ogTitel: 'Brasilianisch oder medizinisch?',
  beschreibung:
    'Ziel, Durchführung, Kosten und Kassenerstattung im Vergleich: wann eine ästhetische ' +
    'Lymphdrainage passt und wann die medizinische Behandlung die richtige ist.',
  ogLabel: 'Ratgeber',
  pfad: [{ name: 'Ratgeber', url: '/ratgeber' }],
})

useSchemaOrg([
  defineArticle({
    headline: artikel.titel,
    description:
      'Vergleich von ästhetischer und medizinischer Lymphdrainage nach Ziel, Durchführung, ' +
      'Verordnung und Kosten.',
  }),
])

const vergleich = [
  {
    merkmal: 'Ziel',
    aesthetisch: 'Entstauung und Form, ein leichteres Körpergefühl',
    medizinisch: 'Behandlung einer Erkrankung, etwa eines Lymphödems',
  },
  {
    merkmal: 'Einordnung',
    aesthetisch: 'kosmetische Anwendung im Beauty-Bereich',
    medizinisch: 'Heilbehandlung',
  },
  {
    merkmal: 'Wer behandelt',
    aesthetisch: 'geschulte Fachkraft, bei Shape & Flow nach der Jeveaux Methode',
    medizinisch: 'Physiotherapeutin oder Physiotherapeut mit Zusatzqualifikation',
  },
  {
    merkmal: 'Verordnung',
    aesthetisch: 'keine, Sie buchen selbst einen Termin',
    medizinisch: 'ärztliches Rezept nach Diagnose',
  },
  {
    merkmal: 'Druck',
    aesthetisch: 'erst sanft, dann kräftig und modellierend',
    medizinisch: 'durchgehend sehr sanft',
  },
  {
    merkmal: 'Kosten',
    aesthetisch: 'Selbstzahlung',
    medizinisch: 'Kassenleistung mit Eigenanteil',
  },
]
</script>

<template>
  <article>
    <SfSeitenkopf
      :titel="artikel.titel"
      label="Ratgeber"
      lead="Beide arbeiten am Lymphsystem, aber sie haben verschiedene Aufgaben. Wer das
        verwechselt, bucht das Falsche."
      :pfad="[{ name: 'Ratgeber', url: '/ratgeber' }]"
    />

    <div class="sf-container">
      <div class="sf-prose">
        <h2 class="mt-0!">Der kurze Unterschied</h2>
        <p>
          Die medizinische Lymphdrainage ist eine Heilbehandlung. Sie wird ärztlich verordnet, wenn
          eine Diagnose vorliegt, meist ein Lymphödem, und von Physiotherapeutinnen und
          Physiotherapeuten mit entsprechender Zusatzqualifikation durchgeführt. Gearbeitet wird
          durchgehend sehr sanft, weil es um den Abtransport von Lymphflüssigkeit geht und nicht um
          Gewebedruck.
        </p>
        <p>
          Die brasilianische Lymphdrainage ist eine ästhetische Weiterentwicklung derselben
          Grundidee. Sie ist keine Heilbehandlung, braucht kein Rezept, und sie arbeitet nach der
          ersten Phase deutlich kräftiger, weil zusätzlich modelliert wird.
        </p>
      </div>

      <!-- Die Tabelle ist der Kern des Artikels: hier liest man den Unterschied in zehn Sekunden. -->
      <div class="mt-12 max-w-3xl overflow-x-auto">
        <table class="w-full border-collapse text-left text-sm">
          <caption class="sr-only">
            Ästhetische und medizinische Lymphdrainage im Vergleich
          </caption>
          <thead>
            <tr class="border-b border-border">
              <th scope="col" class="py-3 pr-4 font-medium">Merkmal</th>
              <th scope="col" class="py-3 pr-4 font-medium">Brasilianisch, ästhetisch</th>
              <th scope="col" class="py-3 font-medium">Medizinisch</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="zeile in vergleich"
              :key="zeile.merkmal"
              class="border-b border-border align-top last:border-b-0"
            >
              <th scope="row" class="py-4 pr-4 font-medium">
                {{ zeile.merkmal }}
              </th>
              <td class="py-4 pr-4 text-text-secondary">
                {{ zeile.aesthetisch }}
              </td>
              <td class="py-4 text-text-secondary">
                {{ zeile.medizinisch }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="sf-prose mt-12">
        <h2>Was das für Ihren Termin bedeutet</h2>
        <p>
          Wenn eine Ärztin ein Lymphödem festgestellt hat, ist die verordnete Behandlung die
          richtige. Ein Beauty-Studio ersetzt sie nicht und darf sie nicht ersetzen.
        </p>
        <p>
          Wenn medizinisch nichts vorliegt und Sie sich einfach leichter und definierter fühlen
          möchten, ist die ästhetische Variante gemeint. Das ist der
          <NuxtLink to="/jeveauxeffect">Jeveauxeffect®</NuxtLink> für den Körper und der
          <NuxtLink to="/lymphdrainage-gesicht">Jeveauxeffect Face®</NuxtLink> für das Gesicht.
        </p>

        <h2>Wo die ästhetische Behandlung aufhört</h2>
        <p>
          In diesen Situationen wird nicht behandelt, unabhängig davon, wie gern Sie einen Termin
          hätten:
        </p>
        <ul>
          <li v-for="punkt in kontraindikationen" :key="punkt">
            {{ punkt }}
          </li>
        </ul>
        <p>
          Bei Unsicherheiten gilt: vorher ärztlich abklären. Das ist keine Absicherungsformel,
          sondern der Grund, warum diese Liste existiert.
        </p>
      </div>

      <SfHinweis class="mt-14 max-w-3xl">
        <p>Dieser Text ist allgemeine Information und keine medizinische Beratung.</p>
        <p>{{ disclaimer }}</p>
      </SfHinweis>

      <div class="mt-16">
        <SfCtaBlock inverse />
      </div>
    </div>
  </article>
</template>

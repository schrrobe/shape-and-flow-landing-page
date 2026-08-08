<script setup lang="ts">
import { contraindications } from '#shared/faq'
import { articleByRoute } from '#shared/ratgeber'
import { disclaimer } from '#shared/site'

/*
 * The comparison of the two approaches.
 *
 * The article is not here for SEO reasons alone. Mixing the two up is the most common cause of
 * false expectations about an appointment, and resolving it clearly in legal terms protects both
 * sides.
 */
const article = articleByRoute('/ratgeber/brasilianische-vs-medizinische-lymphdrainage')!

usePage({
  title: article.title,
  shortTitle: article.title,
  ogTitle: 'Brasilianisch oder medizinisch?',
  description:
    'Ziel, Durchführung, Kosten und Kassenerstattung im Vergleich: wann eine ästhetische ' +
    'Lymphdrainage passt und wann die medizinische die richtige ist.',
  ogLabel: 'Ratgeber',
  trail: [{ name: 'Ratgeber', url: '/ratgeber' }],
})

useSchemaOrg([
  defineArticle({
    headline: article.title,
    description:
      'Vergleich von ästhetischer und medizinischer Lymphdrainage nach Ziel, Durchführung, ' +
      'Verordnung und Kosten.',
  }),
])

const comparison = [
  {
    feature: 'Ziel',
    aesthetic: 'Entstauung und Form, ein leichteres Körpergefühl',
    medical: 'Behandlung einer Erkrankung, etwa eines Lymphödems',
  },
  {
    feature: 'Einordnung',
    aesthetic: 'kosmetische Anwendung im Beauty-Bereich',
    medical: 'Heilbehandlung',
  },
  {
    feature: 'Wer behandelt',
    aesthetic: 'geschulte Fachkraft, bei Shape & Flow nach der Jeveaux Methode',
    medical: 'Physiotherapeutin oder Physiotherapeut mit Zusatzqualifikation',
  },
  {
    feature: 'Verordnung',
    aesthetic: 'keine, Sie buchen selbst einen Termin',
    medical: 'ärztliches Rezept nach Diagnose',
  },
  {
    feature: 'Druck',
    aesthetic: 'erst sanft, dann kräftig und modellierend',
    medical: 'durchgehend sehr sanft',
  },
  {
    feature: 'Kosten',
    aesthetic: 'Selbstzahlung',
    medical: 'Kassenleistung mit Eigenanteil',
  },
]
</script>

<template>
  <article>
    <SfSeitenkopf
      :title="article.title"
      label="Ratgeber"
      lead="Beide arbeiten am Lymphsystem, aber sie haben verschiedene Aufgaben. Wer das
        verwechselt, bucht das Falsche."
      :trail="[{ name: 'Ratgeber', url: '/ratgeber' }]"
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

      <!-- The table is the core of the article: here the difference reads in ten seconds. -->
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
              v-for="row in comparison"
              :key="row.feature"
              class="border-b border-border align-top last:border-b-0"
            >
              <th scope="row" class="py-4 pr-4 font-medium">
                {{ row.feature }}
              </th>
              <td class="py-4 pr-4 text-text-secondary">
                {{ row.aesthetic }}
              </td>
              <td class="py-4 text-text-secondary">
                {{ row.medical }}
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
          <li v-for="item in contraindications" :key="item">
            {{ item }}
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

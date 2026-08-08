<script setup lang="ts">
import { computed } from 'vue'
import { adresse, kartenUrl, kontakt, mailtoUrl, oeffnungszeiten, site } from '#shared/site'

/*
 * Diese Seite spricht an drei sichtbaren Stellen von der Online-Buchung: im Vorspann, im Absatz
 * über dem Formular und in der zweiten Karte. Ist das Flag aus, gibt es keine Buchungsseite —
 * dann darf hier auch nichts stehen, was auf eine hindeutet.
 */
const buchungSichtbar = useBuchungSichtbar()

useSeite({
  titel: `Kontakt und Termin in ${adresse.ort}`,
  ogTitel: 'Kontakt und Termin',
  kurzTitel: 'Kontakt',
  /*
   * Die Beschreibung erwähnt die Online-Buchung bewusst in keinem Fall. Sie steht im
   * vorgerenderten HTML und im Vorschaubild, beides entsteht beim Build — also lange bevor das
   * Browser-SDK das Flag kennt. Eine Fassung "oder online buchen" käme deshalb nie zur
   * Auslieferung, und ein Zweig, den niemand je zu sehen bekommt, ist toter Code.
   */
  beschreibung:
    `Termin für brasilianische Lymphdrainage bei Shape & Flow, ${adresse.strasse}, ${adresse.plz} ` +
    `${adresse.ort}. Per Kontaktformular oder per E-Mail.`,
  ogLabel: 'Kontakt',
})

// computed und nicht einmalig ausgewertet: das Flag steht erst fest, wenn das Browser-SDK
// geantwortet hat, und das ist nach dem ersten Rendern. Gilt genauso für `wege` unten.
const vorspann = computed(() =>
  buchungSichtbar.value
    ? `Schreiben Sie uns über das Formular oder per E-Mail. Wer schon weiß, was er möchte,
      bucht den Termin direkt online.`
    : `Schreiben Sie uns über das Formular oder per E-Mail. Wir melden uns mit freien Terminen
      zurück.`,
)

/*
 * Kein Telefon und kein WhatsApp als Weg zu uns: das Studio ist während einer Behandlung nicht am
 * Apparat, und eine Anfrage, die im Postfach liegt, geht dabei seltener verloren als ein
 * verpasster Anruf. Warum die Nummer auch im Impressum fehlt, steht in shared/site.ts.
 *
 * Für den Rückweg gilt das nicht: im Formular lässt sich die Antwort per WhatsApp wählen. Hier
 * steht sie trotzdem nicht, weil diese Liste Wege zeigt, die man selbst öffnen kann.
 */
const wege = computed(() => [
  {
    titel: 'E-Mail',
    text: 'Wenn Sie lieber aus Ihrem eigenen Postfach schreiben.',
    label: kontakt.email,
    href: mailtoUrl,
    external: false,
  },
  ...(buchungSichtbar.value
    ? [
        {
          titel: 'Online buchen',
          text: 'Freie Termine sehen und direkt verbindlich buchen.',
          label: 'Zur Terminbuchung',
          href: kontakt.buchungUrl,
          external: true,
        },
      ]
    : []),
])
</script>

<template>
  <article>
    <SfSeitenkopf titel="Kontakt" label="Termin vereinbaren" :lead="vorspann" />

    <div class="sf-container">
      <!-- Das Formular steht vor den anderen Wegen, weil es ohne Mailprogramm funktioniert. -->
      <section id="formular" aria-labelledby="formular-titel">
        <h2 id="formular-titel" class="text-2xl sm:text-3xl">Anfrage schreiben</h2>
        <p v-if="buchungSichtbar" class="mt-3 max-w-prose text-text-secondary">
          Das Formular ist für Fragen gedacht, etwa zur Behandlung, zum Ablauf oder zum Preis. Wir
          antworten in der Regel innerhalb eines Werktags.
        </p>
        <!--
          Ohne Buchungsseite ist das Formular nicht die zweitbeste Wahl, sondern der Weg zum Termin.
          Dann darf hier auch nicht stehen, es sei "für Fragen gedacht".
        -->
        <p v-else class="mt-3 max-w-prose text-text-secondary">
          Über das Formular fragen Sie einen Termin an oder stellen eine Frage zur Behandlung, zum
          Ablauf oder zum Preis. Wir antworten in der Regel innerhalb eines Werktags.
        </p>
        <!--
          Der Hinweis steht über dem Formular und nicht bei den Kontaktwegen darunter: wer hier
          anfängt zu tippen, hat die Buchung dann schon übersprungen.
        -->
        <p v-if="buchungSichtbar" class="mt-3 max-w-prose text-text-secondary">
          Wenn Sie einen Termin möchten, nutzen Sie bitte den Knopf
          <a
            :href="kontakt.buchungUrl"
            target="_blank"
            rel="noopener"
            class="text-primary underline underline-offset-2 hover:no-underline"
            >Termin buchen</a
          >. Dort stehen die freien Zeiten, und der Termin ist sofort verbindlich. Über das Formular
          dauert dasselbe einen Mailwechsel länger.
        </p>
        <SfKontaktFormular class="mt-6" />
      </section>

      <!-- Zwei Spalten nur, wenn es auch zwei Karten gibt: eine halbe Karte neben Leerraum nicht. -->
      <div class="mt-14 grid gap-6" :class="{ 'sm:grid-cols-2': wege.length > 1 }">
        <SfCard v-for="weg in wege" :key="weg.titel">
          <h2 class="font-display text-xl">
            {{ weg.titel }}
          </h2>
          <p class="mt-2 text-text-secondary">
            {{ weg.text }}
          </p>
          <SfButton :href="weg.href" variant="secondary" :external="weg.external" class="mt-5">
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
          </ul>
          <p>
            Was gesundheitlich zu beachten ist, klären wir vor dem Termin persönlich und nicht per
            Nachricht. Es gibt Situationen, in denen nicht behandelt wird.
            <NuxtLink to="/brasilianische-lymphdrainage#gegenanzeigen"
              >Die Gegenanzeigen stehen hier</NuxtLink
            >.
          </p>
        </div>
      </div>
    </div>
  </article>
</template>

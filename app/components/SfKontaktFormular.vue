<script setup lang="ts">
import { behandlungen, kombitermin } from '#shared/behandlungen'
import { kontakt, mailtoUrl } from '#shared/site'

/*
 * Das Kontaktformular. Schickt an server/api/kontakt.post.ts, das die Anfrage per SMTP zustellt.
 *
 * Ohne Captcha: gegen Skripte stehen ein Honigtopf-Feld und eine Frequenzgrenze auf dem Server.
 * reCAPTCHA oder Turnstile wären ein Drittanbieter im Ladepfad und damit ein Einwilligungsbanner
 * auf einer Website, die bisher keines braucht — für ein Studioformular ein schlechter Tausch.
 *
 * Die Validierung im Browser ist die Bequemlichkeitsschicht, nicht die Prüfung: dieselben Regeln
 * stehen noch einmal in der API-Route, weil ein Formular auch ohne Browser abgeschickt werden kann.
 */
const felder = reactive({
  name: '',
  email: '',
  handy: '',
  /**
   * Auf welchem Weg die Antwort kommen soll. Radiogruppe und kein Häkchen: die beiden Wege
   * schließen sich aus, und ein ungesetztes Häkchen sagt nicht, was stattdessen passiert.
   */
  antwortweg: 'email' as 'email' | 'whatsapp',
  behandlung: '',
  zeitfenster: '',
  nachricht: '',
  /** Honigtopf. Bleibt für Menschen leer, weil das Feld nicht sichtbar und nicht erreichbar ist. */
  webseite: '',
})

/*
 * Ohne Nummer ist die Wahl WhatsApp folgenlos — dann bliebe nur die Antwort per Mail, die man
 * gerade abgewählt hat. Deshalb wird das sonst freiwillige Feld an dieser Stelle zur Pflicht.
 */
const handyPflicht = computed(() => felder.antwortweg === 'whatsapp')

const ANTWORTWEGE = [
  { wert: 'email', beschriftung: 'Per E-Mail' },
  { wert: 'whatsapp', beschriftung: 'Per WhatsApp' },
] as const

const zustand = ref<'bereit' | 'sendet' | 'gesendet'>('bereit')
const feldFehler = ref<Record<string, string>>({})
const fehlermeldung = ref('')

/** Beim Absenden festgehalten, damit die Bestätigung nicht kippt, falls `felder` noch angefasst wird. */
const gesendetPerWhatsapp = ref(false)

const meldung = useTemplateRef<HTMLElement>('meldung')

const GRUENDE: Record<string, string> = {
  konfiguration:
    `Der Versand über das Formular ist gerade nicht möglich. Schreiben Sie uns bitte direkt ` +
    `an ${kontakt.email}, dann geht Ihre Anfrage nicht verloren.`,
  frequenz:
    'Von diesem Anschluss kamen gerade mehrere Anfragen. Bitte versuchen Sie es in einer Minute ' +
    'noch einmal.',
  versand: `Die Nachricht ließ sich nicht zustellen. Bitte schreiben Sie uns an ${kontakt.email}.`,
}

async function absenden() {
  // Doppelklick auf den Knopf würde die Anfrage sonst zweimal verschicken.
  if (zustand.value === 'sendet') return

  zustand.value = 'sendet'
  feldFehler.value = {}
  fehlermeldung.value = ''

  try {
    await $fetch('/api/kontakt', { method: 'POST', body: { ...felder } })
    gesendetPerWhatsapp.value = felder.antwortweg === 'whatsapp'
    zustand.value = 'gesendet'
  } catch (ursache) {
    zustand.value = 'bereit'

    // createError verpackt die Nutzdaten in `data`, und $fetch legt den Antwortkörper noch einmal
    // in ein `data` — daher die zwei Ebenen.
    const antwort = (
      ursache as { data?: { data?: { fehler?: Record<string, string>; grund?: string } } }
    ).data?.data

    if (antwort?.fehler) {
      feldFehler.value = antwort.fehler
      fehlermeldung.value = 'Bitte prüfen Sie die markierten Felder.'
    } else {
      fehlermeldung.value = GRUENDE[antwort?.grund ?? ''] ?? GRUENDE.versand!
    }
  }

  // Die Meldung steht über dem Formular und wäre nach einem Absenden weiter unten sonst
  // außerhalb des Sichtfelds. Der Fokus bringt auch Screenreader an die richtige Stelle.
  await nextTick()
  meldung.value?.focus()
}
</script>

<template>
  <div class="rounded-sf border border-border bg-surface p-6 shadow-card sm:p-8">
    <div v-if="zustand === 'gesendet'" ref="meldung" tabindex="-1" role="status" class="sf-prose">
      <h2 class="mt-0!">Danke, die Anfrage ist da</h2>
      <!--
        Der Hinweis auf den Spam-Ordner passt nur zur Antwort per Mail. Wer WhatsApp gewählt hat,
        würde dort vergeblich nachsehen.
      -->
      <p v-if="gesendetPerWhatsapp">
        Wir melden uns mit freien Terminen per WhatsApp zurück, in der Regel innerhalb eines
        Werktags.
      </p>
      <p v-else>
        Wir melden uns mit freien Terminen zurück, in der Regel innerhalb eines Werktags. Falls
        nichts ankommt, schauen Sie bitte auch in den Spam-Ordner.
      </p>
    </div>

    <form v-else novalidate @submit.prevent="absenden">
      <p
        v-if="fehlermeldung"
        ref="meldung"
        tabindex="-1"
        role="alert"
        class="mb-6 rounded-sf bg-danger px-4 py-3"
      >
        {{ fehlermeldung }}
      </p>

      <div class="grid gap-5 sm:grid-cols-2">
        <div>
          <label class="sf-label" for="kf-name">Name</label>
          <input
            id="kf-name"
            v-model="felder.name"
            class="sf-feld"
            type="text"
            name="name"
            autocomplete="name"
            required
            :aria-invalid="feldFehler.name ? 'true' : undefined"
            :aria-describedby="feldFehler.name ? 'kf-name-fehler' : undefined"
          />
          <p v-if="feldFehler.name" id="kf-name-fehler" class="sf-feldfehler">
            {{ feldFehler.name }}
          </p>
        </div>

        <div>
          <label class="sf-label" for="kf-email">E-Mail</label>
          <input
            id="kf-email"
            v-model="felder.email"
            class="sf-feld"
            type="email"
            name="email"
            autocomplete="email"
            required
            :aria-invalid="feldFehler.email ? 'true' : undefined"
            :aria-describedby="feldFehler.email ? 'kf-email-fehler' : undefined"
          />
          <p v-if="feldFehler.email" id="kf-email-fehler" class="sf-feldfehler">
            {{ feldFehler.email }}
          </p>
        </div>

        <div>
          <label class="sf-label" for="kf-handy">
            Handynummer{{ handyPflicht ? '' : ' (optional)' }}
          </label>
          <input
            id="kf-handy"
            v-model="felder.handy"
            class="sf-feld"
            type="tel"
            name="handy"
            autocomplete="tel"
            inputmode="tel"
            :required="handyPflicht"
            :aria-invalid="feldFehler.handy ? 'true' : undefined"
            :aria-describedby="feldFehler.handy ? 'kf-handy-fehler' : undefined"
          />
          <p v-if="feldFehler.handy" id="kf-handy-fehler" class="sf-feldfehler">
            {{ feldFehler.handy }}
          </p>
        </div>

        <!--
          fieldset statt einer Reihe loser Radiobuttons: Screenreader kündigen die legend als
          Frage zu beiden Feldern an, sonst stünden dort zwei Wahlmöglichkeiten ohne Frage.
        -->
        <fieldset class="sm:col-span-2">
          <legend class="sf-label">Wie sollen wir antworten?</legend>
          <div class="flex flex-wrap gap-x-6 gap-y-2">
            <label
              v-for="weg in ANTWORTWEGE"
              :key="weg.wert"
              class="flex items-center gap-2 text-base"
            >
              <input
                v-model="felder.antwortweg"
                type="radio"
                name="antwortweg"
                :value="weg.wert"
                class="size-4 accent-primary"
              />
              {{ weg.beschriftung }}
            </label>
          </div>
          <p v-if="handyPflicht" class="mt-2 text-sm text-text-secondary">
            Für die Antwort per WhatsApp geben wir Ihre Handynummer an WhatsApp Ireland weiter.
            Näheres in der
            <NuxtLink
              to="/datenschutz"
              class="text-primary underline underline-offset-2 hover:no-underline"
              >Datenschutzerklärung</NuxtLink
            >.
          </p>
        </fieldset>

        <div>
          <label class="sf-label" for="kf-behandlung">Behandlung (optional)</label>
          <select id="kf-behandlung" v-model="felder.behandlung" class="sf-feld" name="behandlung">
            <option value="">Noch offen</option>
            <option
              v-for="behandlung in behandlungen"
              :key="behandlung.slug"
              :value="behandlung.name"
            >
              {{ behandlung.name }}
            </option>
            <!--
              Der Kombitermin steht hier als dritte Wahl, obwohl er keine eigene Behandlung ist:
              wer beides zusammen will, soll es nicht in das Nachrichtenfeld schreiben müssen.
            -->
            <option :value="kombitermin.name">Beides zusammen in einem Termin</option>
          </select>
        </div>

        <div>
          <label class="sf-label" for="kf-zeitfenster">Wann passt es Ihnen? (optional)</label>
          <input
            id="kf-zeitfenster"
            v-model="felder.zeitfenster"
            class="sf-feld"
            type="text"
            name="zeitfenster"
            placeholder="z. B. vormittags, Dienstag oder Donnerstag"
          />
        </div>

        <div class="sm:col-span-2">
          <label class="sf-label" for="kf-nachricht">Nachricht</label>
          <textarea
            id="kf-nachricht"
            v-model="felder.nachricht"
            class="sf-feld"
            name="nachricht"
            rows="6"
            required
            :aria-invalid="feldFehler.nachricht ? 'true' : undefined"
            :aria-describedby="
              feldFehler.nachricht
                ? 'kf-nachricht-fehler kf-nachricht-hinweis'
                : 'kf-nachricht-hinweis'
            "
          />
          <p v-if="feldFehler.nachricht" id="kf-nachricht-fehler" class="sf-feldfehler">
            {{ feldFehler.nachricht }}
          </p>
          <p id="kf-nachricht-hinweis" class="mt-2 text-sm text-text-secondary">
            Bitte keine Angaben zu Ihrer Gesundheit. Was gesundheitlich zu beachten ist, besprechen
            wir vor dem Termin persönlich.
          </p>
        </div>
      </div>

      <!--
        Der Honigtopf. display:none statt sr-only: ein für Screenreader lesbares Feld würde dort
        als echte Eingabe angekündigt. Skripte lesen das Markup und füllen es trotzdem aus.
      -->
      <div class="hidden" aria-hidden="true">
        <label for="kf-webseite">Webseite</label>
        <input
          id="kf-webseite"
          v-model="felder.webseite"
          type="text"
          name="webseite"
          tabindex="-1"
          autocomplete="off"
        />
      </div>

      <!--
        Hinweis statt Einwilligungshäkchen. Die Verarbeitung der Anfrage stützt sich auf Art. 6
        Abs. 1 lit. b bzw. f DSGVO und braucht keine Einwilligung; ein Pflichthäkchen wäre auch
        keine wirksame, weil eine Einwilligung nur freiwillig ist, wenn man sie verweigern kann,
        ohne die Leistung zu verlieren. Der Wortlaut in app/pages/datenschutz.vue sagt dasselbe.
      -->
      <p class="mt-6 text-sm text-text-secondary">
        Ihre Angaben verwenden wir, um diese Anfrage zu beantworten. Näheres in der
        <NuxtLink
          to="/datenschutz"
          class="text-primary underline underline-offset-2 hover:no-underline"
          >Datenschutzerklärung</NuxtLink
        >.
      </p>

      <div class="mt-7 flex flex-wrap items-center gap-4">
        <SfButton type="submit" size="lg" :aria-busy="zustand === 'sendet'">
          {{ zustand === 'sendet' ? 'Wird gesendet …' : 'Anfrage senden' }}
        </SfButton>
        <p class="text-sm text-text-secondary">
          Oder direkt per Mail an
          <a :href="mailtoUrl" class="text-primary underline underline-offset-2 hover:no-underline">
            {{ kontakt.email }}
          </a>
        </p>
      </div>
    </form>
  </div>
</template>

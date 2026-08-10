<script setup lang="ts">
import { googleReviewUrl, site } from '#shared/site'
import { bewertungBloecke, umgeschaltet, type Block } from '~/utils/bewertung'
import { baueBewertungstext, type Auswahl } from '~/utils/bewertungstext'

/*
 * The review helper: tick what applies, get a text, paste it into Google.
 *
 * Replaces bewertungshelfer.com, which the link tree used to point at. Not because that tool was
 * broken, but because its phrases fit any business and therefore this one only roughly — the
 * building blocks here name the treatments, the studio and the results guests actually mention.
 *
 * Everything happens in the browser: no request leaves the page, so there is nothing to consent to
 * and nothing to write in the privacy policy.
 *
 * Deliberately the default layout and not the one from /linktree: that shell centres a short list
 * of buttons in the viewport, while this page is a form longer than a phone screen.
 */
const description =
  `Bewertung für ${site.name} schreiben: anklicken, was gepasst hat, Text übernehmen und bei ` +
  `Google einfügen.`

useSeoMeta({
  title: 'Bewertung schreiben',
  description,
  ogTitle: `Bewertung schreiben | ${site.name}`,
  ogDescription: description,
  ogType: 'website',
  ogSiteName: site.name,
  ogLocale: 'de_DE',
  twitterCard: 'summary_large_image',
})

defineOgImageComponent('SfOg', {
  title: 'Bewertung schreiben',
  description: `Ein paar Klicks, fertiger Text für die Google-Bewertung.`,
  eyebrow: site.name,
})

/*
 * Out of the search index, like /linktree: the page says nothing that is not said elsewhere, and a
 * page that helps write reviews has no business ranking for the studio's own name. The same meta
 * keeps it out of the sitemap.
 */
useHead({ meta: [{ name: 'robots', content: 'noindex, follow' }] })

/** Ticked ids per block. Empty at the start, so the text area starts out with its hint. */
const auswahl = ref<Auswahl>(Object.fromEntries(bewertungBloecke.map(block => [block.id, []])))

/*
 * Which sentence frames the text uses. Fixed at first, random from the first interaction onwards.
 *
 * The fixed value is what keeps prerendering and hydration in step: with nothing ticked the text is
 * empty either way, and the seed only starts to matter once someone in a browser clicks — which is
 * exactly when neuerVorschlag() gives it a real value.
 */
const seed = ref(1)

const text = computed(() => baueBewertungstext(auswahl.value, seed.value))

/*
 * The page owns the selection and every change to it. The chips only report which one was tapped:
 * two taps within one tick would otherwise read the same stale state and the first would be lost.
 */
function umschalten(block: Block, id: string) {
  auswahl.value[block.id] = umgeschaltet(block, auswahl.value[block.id] ?? [], id)
}

const anzahlGewaehlt = computed(() =>
  Object.values(auswahl.value).reduce((summe, ids) => summe + ids.length, 0),
)

function neuerVorschlag() {
  // A different seed picks different frames and rotates the enumerations. Same ticks, other wording.
  seed.value = Math.floor(Math.random() * 100_000)
}

const textarea = useTemplateRef<HTMLTextAreaElement>('textarea')
const kopierStatus = ref<'offen' | 'kopiert' | 'markiert'>('offen')

/*
 * Google's review form takes no text as a URL parameter — the place ID is all it accepts. So the
 * text goes through the clipboard, and the two buttons stand in the order that requires: copy
 * first, then open Google.
 */
async function kopieren() {
  try {
    await navigator.clipboard.writeText(text.value)
    kopierStatus.value = 'kopiert'
  } catch {
    /*
     * Happens without HTTPS and in browsers that only allow the clipboard from a real gesture on
     * their own terms. Selecting the text is the fallback that always works: from there it is one
     * long press resp. one Strg+C away.
     */
    textarea.value?.select()
    kopierStatus.value = 'markiert'
  }
}

// A changed text is not the copied one any more, so the confirmation has to go.
watch(text, () => {
  kopierStatus.value = 'offen'
})
</script>

<template>
  <article>
    <SfSeitenkopf
      title="Bewertung schreiben"
      label="Danke, dass Sie sich die Zeit nehmen"
      lead="Klicken Sie an, was auf Ihren Termin zugetroffen hat. Daraus entsteht ein fertiger Text, den
        Sie kopieren und bei Google einfügen können."
    />

    <div class="sf-container">
      <div class="grid gap-10 lg:grid-cols-[1fr_22rem] lg:items-start lg:gap-14">
        <!-- The blocks come from app/utils/bewertung.ts, in the order the text uses them. -->
        <form class="space-y-8" @submit.prevent>
          <SfBewertungBlock
            v-for="block in bewertungBloecke"
            :key="block.id"
            :block="block"
            :gewaehlt="auswahl[block.id] ?? []"
            @umschalten="id => umschalten(block, id)"
          />
        </form>

        <!--
          Sticky on the wide screen, plain below the form on a phone: on a phone a box pinned to
          the bottom would cover the chips someone is trying to tick.
        -->
        <section aria-labelledby="vorschau-heading" class="lg:sticky lg:top-8">
          <SfCard>
            <h2 id="vorschau-heading" class="font-display text-xl">Ihr Text</h2>

            <p v-if="!anzahlGewaehlt" class="mt-3 text-text-secondary">
              Sobald Sie links etwas anklicken, steht der Text hier.
            </p>

            <template v-else>
              <!--
                A real, read-only textarea and not a paragraph: this way the text can be selected
                and copied by hand even if the clipboard button is blocked.
              -->
              <label class="sr-only" for="bewertung-text">Vorgeschlagener Bewertungstext</label>
              <textarea
                id="bewertung-text"
                ref="textarea"
                class="sf-field mt-3 min-h-40 resize-y leading-relaxed"
                readonly
                :value="text"
              />

              <!--
                A hint next to the finished text, not a condition for getting one: one tick already
                gives a whole sentence, and holding it back until the third would leave a guest with
                no text and no button. It is true and it helps, though — each chip brings its own
                three wordings, so whoever ticks more gets a text nobody else has.
              -->
              <p v-if="anzahlGewaehlt < 3" class="mt-3 text-sm text-text-secondary">
                Je mehr Sie anklicken, desto eigener wird der Text.
              </p>

              <div class="mt-4 space-y-3">
                <SfButton
                  :variant="kopierStatus === 'kopiert' ? 'secondary' : 'primary'"
                  class="w-full"
                  @click="kopieren"
                >
                  {{ kopierStatus === 'kopiert' ? 'Text kopiert' : 'Text kopieren' }}
                </SfButton>

                <SfButton
                  :href="googleReviewUrl"
                  :variant="kopierStatus === 'kopiert' ? 'primary' : 'secondary'"
                  class="w-full"
                  external
                >
                  <SfIcon name="star" />
                  Bei Google einfügen
                </SfButton>

                <SfButton variant="ghost" class="w-full" @click="neuerVorschlag">
                  Anders formulieren
                </SfButton>
              </div>

              <!--
                aria-live, because the confirmation is the only feedback that the copy worked, and
                a change of button label alone is not announced.
              -->
              <p class="mt-3 text-sm text-text-secondary" role="status" aria-live="polite">
                <template v-if="kopierStatus === 'kopiert'">
                  Der Text liegt in der Zwischenablage. Bei Google auf die Sterne tippen und ihn ins
                  Textfeld einfügen.
                </template>
                <template v-else-if="kopierStatus === 'markiert'">
                  Der Text ist markiert — mit Strg+C beziehungsweise langem Antippen kopieren.
                </template>
              </p>
            </template>
          </SfCard>
        </section>
      </div>

      <SfHinweis title="Ihre Worte, nur schneller getippt" class="mt-14">
        <p>
          Die Bausteine sind Vorschläge und kein fertiges Urteil: klicken Sie bitte nur an, was Sie
          selbst so erlebt haben, und ändern Sie den Text bei Google, wo er nicht ganz passt. Die
          Sterne vergeben Sie dort ohnehin selbst.
        </p>
        <p>
          Ihre Auswahl bleibt im Browser. Sie wird nicht gespeichert und nicht an uns gesendet — wir
          lesen die Bewertung wie alle anderen erst bei Google.
        </p>
      </SfHinweis>
    </div>
  </article>
</template>

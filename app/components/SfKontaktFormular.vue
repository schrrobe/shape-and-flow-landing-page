<script setup lang="ts">
import { treatments, comboAppointment } from '#shared/behandlungen'
import { contact, mailtoUrl } from '#shared/site'

/*
 * The contact form. Posts to server/api/kontakt.post.ts, which delivers the request over SMTP.
 *
 * Without a captcha: against scripts there is a honeypot field and a rate limit on the server.
 * reCAPTCHA or Turnstile would be a third party in the loading path and therefore a consent
 * banner on a site that so far needs none — a bad trade for a studio form.
 *
 * Validation happens in the API route only. The form carries `novalidate`, so the browser
 * shows no bubbles of its own: they cannot be styled, appear one at a time and vanish on the
 * next click, while the server answers with all field errors at once and in our own wording.
 * `required` and `type="email"` stay on the inputs for semantics — screen readers announce
 * them, and they document what each field expects.
 */
const fields = reactive({
  name: '',
  email: '',
  mobile: '',
  /**
   * Which way the reply should come. A radio group and not a checkbox: the two channels are
   * mutually exclusive, and an unticked box does not say what happens instead.
   */
  replyChannel: 'email' as 'email' | 'whatsapp',
  treatment: '',
  timeSlot: '',
  message: '',
  /** Honeypot. Stays empty for humans, because the field is neither visible nor reachable. */
  website: '',
})

/*
 * Without a number the WhatsApp choice has no consequence — only the reply by mail would be
 * left, which was just deselected. That is why the otherwise optional field becomes mandatory
 * at this point.
 */
const mobileRequired = computed(() => fields.replyChannel === 'whatsapp')

const REPLY_CHANNELS = [
  { value: 'email', label: 'Per E-Mail' },
  { value: 'whatsapp', label: 'Per WhatsApp' },
] as const

const status = ref<'ready' | 'sending' | 'sent'>('ready')
const fieldErrors = ref<Record<string, string>>({})
const errorMessage = ref('')

/** Captured on submit, so the confirmation does not flip if `fields` is touched afterwards. */
const sentViaWhatsapp = ref(false)

const notice = useTemplateRef<HTMLElement>('notice')

const REASONS: Record<string, string> = {
  config:
    `Der Versand über das Formular ist gerade nicht möglich. Schreiben Sie uns bitte direkt ` +
    `an ${contact.email}, dann geht Ihre Anfrage nicht verloren.`,
  rate:
    'Von diesem Anschluss kamen gerade mehrere Anfragen. Bitte versuchen Sie es in einer Minute ' +
    'noch einmal.',
  delivery: `Die Nachricht ließ sich nicht zustellen. Bitte schreiben Sie uns an ${contact.email}.`,
}

async function submit() {
  // A double click on the button would otherwise send the request twice.
  if (status.value === 'sending') return

  status.value = 'sending'
  fieldErrors.value = {}
  errorMessage.value = ''

  try {
    await $fetch('/api/kontakt', { method: 'POST', body: { ...fields } })
    sentViaWhatsapp.value = fields.replyChannel === 'whatsapp'
    status.value = 'sent'
  } catch (cause) {
    status.value = 'ready'

    // createError wraps the payload in `data`, and $fetch wraps the response body in another
    // `data` — hence the two levels.
    const response = (
      cause as { data?: { data?: { errors?: Record<string, string>; reason?: string } } }
    ).data?.data

    if (response?.errors) {
      fieldErrors.value = response.errors
      errorMessage.value = 'Bitte prüfen Sie die markierten Felder.'
    } else {
      errorMessage.value = REASONS[response?.reason ?? ''] ?? REASONS.delivery!
    }
  }

  // The message sits above the form and would otherwise be out of view after a submit further
  // down. The focus also brings screen readers to the right place.
  await nextTick()
  notice.value?.focus()
}
</script>

<template>
  <div class="rounded-sf border border-border bg-surface p-6 shadow-card sm:p-8">
    <div v-if="status === 'sent'" ref="notice" tabindex="-1" role="status" class="sf-prose">
      <h2 class="mt-0!">Danke, die Anfrage ist da</h2>
      <!--
        The hint about the spam folder only fits a reply by mail. Whoever chose WhatsApp would
        look there in vain.
      -->
      <p v-if="sentViaWhatsapp">
        Wir melden uns mit freien Terminen per WhatsApp zurück, in der Regel innerhalb eines
        Werktags.
      </p>
      <p v-else>
        Wir melden uns mit freien Terminen zurück, in der Regel innerhalb eines Werktags. Falls
        nichts ankommt, schauen Sie bitte auch in den Spam-Ordner.
      </p>
    </div>

    <form v-else novalidate @submit.prevent="submit">
      <p
        v-if="errorMessage"
        ref="notice"
        tabindex="-1"
        role="alert"
        class="mb-6 rounded-sf bg-danger px-4 py-3"
      >
        {{ errorMessage }}
      </p>

      <div class="grid gap-5 sm:grid-cols-2">
        <div>
          <label class="sf-label" for="kf-name">Name</label>
          <input
            id="kf-name"
            v-model="fields.name"
            class="sf-field"
            type="text"
            name="name"
            autocomplete="name"
            required
            :aria-invalid="fieldErrors.name ? 'true' : undefined"
            :aria-describedby="fieldErrors.name ? 'kf-name-error' : undefined"
          />
          <p v-if="fieldErrors.name" id="kf-name-error" class="sf-field-error">
            {{ fieldErrors.name }}
          </p>
        </div>

        <div>
          <label class="sf-label" for="kf-email">E-Mail</label>
          <input
            id="kf-email"
            v-model="fields.email"
            class="sf-field"
            type="email"
            name="email"
            autocomplete="email"
            required
            :aria-invalid="fieldErrors.email ? 'true' : undefined"
            :aria-describedby="fieldErrors.email ? 'kf-email-error' : undefined"
          />
          <p v-if="fieldErrors.email" id="kf-email-error" class="sf-field-error">
            {{ fieldErrors.email }}
          </p>
        </div>

        <div>
          <label class="sf-label" for="kf-mobile">
            Handynummer{{ mobileRequired ? '' : ' (optional)' }}
          </label>
          <input
            id="kf-mobile"
            v-model="fields.mobile"
            class="sf-field"
            type="tel"
            name="mobile"
            autocomplete="tel"
            inputmode="tel"
            :required="mobileRequired"
            :aria-invalid="fieldErrors.mobile ? 'true' : undefined"
            :aria-describedby="fieldErrors.mobile ? 'kf-mobile-error' : undefined"
          />
          <p v-if="fieldErrors.mobile" id="kf-mobile-error" class="sf-field-error">
            {{ fieldErrors.mobile }}
          </p>
        </div>

        <!--
          A fieldset instead of a row of loose radio buttons: screen readers announce the legend
          as the question for both fields, otherwise there would be two options without a
          question.
        -->
        <fieldset class="sm:col-span-2">
          <legend class="sf-label">Wie sollen wir antworten?</legend>
          <div class="flex flex-wrap gap-x-6 gap-y-2">
            <label
              v-for="channel in REPLY_CHANNELS"
              :key="channel.value"
              class="flex items-center gap-2 text-base"
            >
              <input
                v-model="fields.replyChannel"
                type="radio"
                name="replyChannel"
                :value="channel.value"
                class="size-4 accent-primary"
              />
              {{ channel.label }}
            </label>
          </div>
          <p v-if="mobileRequired" class="mt-2 text-sm text-text-secondary">
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
          <label class="sf-label" for="kf-treatment">Behandlung (optional)</label>
          <select id="kf-treatment" v-model="fields.treatment" class="sf-field" name="treatment">
            <option value="">Noch offen</option>
            <option v-for="treatment in treatments" :key="treatment.slug" :value="treatment.name">
              {{ treatment.name }}
            </option>
            <!--
              The combo appointment is here as a third choice although it is not a treatment of
              its own: whoever wants both together should not have to write it into the message
              field.
            -->
            <option :value="comboAppointment.name">Beides zusammen in einem Termin</option>
          </select>
        </div>

        <div>
          <label class="sf-label" for="kf-timeslot">Wann passt es Ihnen? (optional)</label>
          <input
            id="kf-timeslot"
            v-model="fields.timeSlot"
            class="sf-field"
            type="text"
            name="timeSlot"
            placeholder="z. B. vormittags, Dienstag oder Donnerstag"
          />
        </div>

        <div class="sm:col-span-2">
          <label class="sf-label" for="kf-message">Nachricht</label>
          <textarea
            id="kf-message"
            v-model="fields.message"
            class="sf-field"
            name="message"
            rows="6"
            required
            :aria-invalid="fieldErrors.message ? 'true' : undefined"
            :aria-describedby="
              fieldErrors.message ? 'kf-message-error kf-message-hint' : 'kf-message-hint'
            "
          />
          <p v-if="fieldErrors.message" id="kf-message-error" class="sf-field-error">
            {{ fieldErrors.message }}
          </p>
          <p id="kf-message-hint" class="mt-2 text-sm text-text-secondary">
            Bitte keine Angaben zu Ihrer Gesundheit. Was gesundheitlich zu beachten ist, besprechen
            wir vor dem Termin persönlich.
          </p>
        </div>
      </div>

      <!--
        The honeypot. display:none rather than sr-only: a field readable by screen readers would
        be announced there as a real input. Scripts read the markup and fill it in regardless.
      -->
      <div class="hidden" aria-hidden="true">
        <label for="kf-website">Webseite</label>
        <input
          id="kf-website"
          v-model="fields.website"
          type="text"
          name="website"
          tabindex="-1"
          autocomplete="off"
        />
      </div>

      <!--
        A notice instead of a consent checkbox. Processing the request rests on Art. 6(1)(b)
        resp. (f) GDPR and needs no consent; a mandatory checkbox would not be a valid one
        either, because a consent is only freely given if it can be refused without losing the
        service. The wording in app/pages/datenschutz.vue says the same.
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
        <SfButton type="submit" size="lg" :aria-busy="status === 'sending'">
          {{ status === 'sending' ? 'Wird gesendet …' : 'Anfrage senden' }}
        </SfButton>
        <p class="text-sm text-text-secondary">
          Oder direkt per Mail an
          <a :href="mailtoUrl" class="text-primary underline underline-offset-2 hover:no-underline">
            {{ contact.email }}
          </a>
        </p>
      </div>
    </form>
  </div>
</template>

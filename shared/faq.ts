/*
 * The questions customers ask before an appointment.
 *
 * One source for two outputs: the visible FAQ page and the FAQPage structured data. That is why
 * answers are arrays of paragraphs and not HTML, because Google wants plain text in the JSON-LD.
 *
 * In substance the answers are based on the documents of the Jeveaux Company® as the licensor.
 * Ground rule for changes: no promises of healing, no guaranteed effects, no figures without a
 * source. Wordings such as "kann unterstützen" and "viele Kundinnen berichten" are chosen
 * deliberately and are legally relevant.
 */

import { treatmentBySlug, priceItemBySlug } from './behandlungen'

export type FaqTopic = 'general' | 'procedure' | 'health' | 'prices' | 'body' | 'face'

export interface FaqEntry {
  question: string
  /** Paragraphs of the answer. */
  answer: string[]
  /** Bullet list shown after the paragraphs. */
  list?: string[]
  /** Closing note below the list. */
  closing?: string
  topics: FaqTopic[]
}

/**
 * Situations in which no treatment takes place. Worded exactly like this in the licensor's
 * documents and rendered on the method page and in the FAQ.
 */
export const contraindications: string[] = [
  'akute oder chronische Entzündungen im Körper',
  'aktive Krebserkrankungen oder eine laufende Krebstherapie',
  'Fieber oder ein starkes Krankheitsgefühl',
  'akute Infekte',
  'offene Wunden oder frische Verletzungen',
  'Thrombose oder der Verdacht darauf',
  'Herz-Kreislauf-Erkrankungen',
  'unbehandelte oder akute Erkrankungen des Lymphsystems',
]

/*
 * The prices for the price FAQ, derived from behandlungen.ts rather than typed out: otherwise the
 * FAQ — and with it the FAQPage structured data — would name amounts after the next price change
 * that the price table no longer lists.
 */
const body = treatmentBySlug('jeveauxeffect')!
const face = treatmentBySlug('lymphdrainage-gesicht')!
const combo = priceItemBySlug('kombi-koerper-gesicht')!
const bodyPack5 = priceItemBySlug('jeveauxeffect-5er')!
const bodyPack10 = priceItemBySlug('jeveauxeffect-10er')!
const facePack5 = priceItemBySlug('jeveauxeffect-face-5er')!
const facePack10 = priceItemBySlug('jeveauxeffect-face-10er')!

export const faq: FaqEntry[] = [
  {
    question: 'Was ist der Jeveauxeffect® genau?',
    answer: [
      'Der Jeveauxeffect® ist eine ästhetische Ganzkörpermassage, die die Jeveaux Company® ' +
        'entwickelt hat. Sie verbindet manuelle Lymphdrainage, Faszienarbeit und Körpermodellierung ' +
        'in einem festen Ablauf.',
      'Zuerst wird die Lymphe sanft angeregt, damit im Körper etwas in Bewegung kommt. Danach wird ' +
        'kräftiger gearbeitet und modelliert. Mit einer Wellnessmassage hat das wenig zu tun: die ' +
        'Behandlung ist deutlich spürbar und folgt einer festen Abfolge von Griffen.',
    ],
    topics: ['general', 'body'],
  },
  {
    question: 'Ist der Jeveauxeffect® eine medizinische Behandlung?',
    answer: [
      'Nein. Der Jeveauxeffect® ist eine ästhetische Anwendung im Beauty-Bereich. Er ist keine ' +
        'medizinische oder therapeutische Behandlung und ersetzt keine ärztliche Maßnahme.',
      'Die medizinische Lymphdrainage ist etwas anderes: sie wird bei einem diagnostizierten ' +
        'Lymphödem verordnet und von Physiotherapeutinnen und Physiotherapeuten durchgeführt. Wenn ' +
        'Sie eine solche Behandlung brauchen, ist Ihre Ärztin oder Ihr Arzt die richtige Adresse.',
    ],
    topics: ['general', 'health'],
  },
  {
    question: 'Für wen ist die Behandlung geeignet?',
    answer: [
      'Für alle, die sich leichter und wohler im eigenen Körper fühlen möchten und eine aktive, ' +
        'spürbare Behandlung suchen statt einer klassischen Entspannungsmassage.',
      'Wer vor allem abschalten und dösen will, ist mit einer Wellnessmassage besser beraten. Der ' +
        'Jeveauxeffect® arbeitet mit Druck und Rhythmus, und das merkt man.',
    ],
    topics: ['general'],
  },
  {
    question: 'Was kann ich nach der Behandlung erwarten?',
    answer: [
      'Viele Kundinnen beschreiben ihr Körpergefühl danach als verändert. Am häufigsten genannt ' +
        'werden:',
    ],
    list: [
      'ein leichteres, freieres Gefühl im Körper',
      'weniger Spannung oder Druckgefühl',
      'mehr Kontur und Definition',
      'ein Effekt, der sich direkt nach der Behandlung zeigt',
    ],
    closing:
      'Weil die Lymphe angeregt wird, kann die Behandlung dabei unterstützen, dass sich der Körper ' +
      'weniger aufgeschwemmt anfühlt. Wie deutlich das ausfällt, ist von Person zu Person ' +
      'verschieden und hängt auch von Alltag und Lebensstil ab.',
    topics: ['general', 'procedure'],
  },
  {
    question: 'Hilft die Behandlung bei Wassereinlagerungen?',
    answer: [
      'Der Jeveauxeffect® kann den Körper dabei unterstützen, sich leichter und weniger gespannt ' +
        'anzufühlen, weil die Lymphe sanft angeregt wird.',
      'Ein Heilversprechen ist damit nicht verbunden. Wenn Schwellungen immer wiederkehren, stark ' +
        'sind oder nur an einer Körperstelle auftreten, lassen Sie die Ursache bitte ärztlich ' +
        'abklären, bevor Sie einen Termin buchen.',
    ],
    topics: ['general', 'health', 'body'],
  },
  {
    question: 'Ist die Behandlung schmerzhaft?',
    answer: [
      'Sie ist intensiv und deutlich spürbar, für die meisten Kundinnen aber gut auszuhalten. Der ' +
        'Druck lässt sich jederzeit anpassen, sagen Sie also einfach etwas, wenn es zu viel wird.',
    ],
    topics: ['procedure'],
  },
  {
    question: 'Gibt es Gegenanzeigen?',
    answer: ['Ja. Auch eine ästhetische Behandlung hat Grenzen. Nicht behandelt wird bei:'],
    list: contraindications,
    closing:
      'Im Zweifel gilt immer: vorher ärztlich abklären. Sagen Sie uns außerdem vor dem Termin, ' +
      'wenn Sie schwanger sind, Medikamente nehmen oder eine Vorerkrankung haben.',
    topics: ['health', 'procedure'],
  },
  {
    question: 'Kann ich die Behandlung in der Schwangerschaft machen?',
    answer: [
      'Das lässt sich nicht pauschal beantworten. Sprechen Sie vorher mit Ihrer Ärztin oder Ihrem ' +
        'Arzt und sagen Sie uns bei der Terminvereinbarung Bescheid, damit wir gemeinsam entscheiden ' +
        'können.',
    ],
    topics: ['health'],
  },
  {
    question: 'Wie lange hält der Effekt an?',
    answer: [
      'Das ist individuell verschieden. Körperliche Voraussetzungen, Bewegung, Ernährung, ' +
        'Trinkmenge und allgemeines Wohlbefinden spielen alle eine Rolle.',
      'Der Jeveauxeffect® kann eine bewusste Körperpflege unterstützen, ersetzt aber keine gesunde ' +
        'Lebensweise. Was für Sie sinnvoll ist, klären wir am besten direkt im Termin.',
    ],
    topics: ['procedure', 'general'],
  },
  {
    question: 'Was kostet die Behandlung?',
    answer: [
      `Die Gesichtsbehandlung ${face.name} kostet ${face.priceEuro} Euro, die ` +
        `Körperbehandlung ${body.name} kostet ${body.priceEuro} Euro. Beide zusammen in ` +
        `einem Termin kosten ${combo.priceEuro} Euro.`,
      `Für mehrere Termine gibt es Pakete: die Körperbehandlung kostet im 5er Paket ` +
        `${bodyPack5.priceEuro} Euro und im 10er Paket ${bodyPack10.priceEuro} Euro pro ` +
        `Behandlung, die Gesichtsbehandlung ${facePack5.priceEuro} Euro im 5er Paket und ` +
        `${facePack10.priceEuro} Euro im 10er Paket pro Behandlung.`,
    ],
    topics: ['prices'],
  },
  {
    question: 'Übernimmt die Krankenkasse die Kosten?',
    answer: [
      'Nein. Es handelt sich um eine ästhetische Behandlung im Beauty-Bereich und nicht um eine ' +
        'medizinische Leistung, deshalb gibt es keine Kassenerstattung und kein Rezept.',
    ],
    topics: ['prices', 'health'],
  },
  {
    question: 'Worauf sollte ich vor dem Termin achten?',
    answer: [
      'Planen Sie genug Zeit ein und kommen Sie in bequemer Kleidung. Alles Weitere, auch Fragen ' +
        'zu Ihrer Gesundheit, besprechen wir vor der ersten Behandlung im Studio.',
    ],
    topics: ['procedure'],
  },
  {
    question: 'Was ist der Unterschied zwischen der Körper- und der Gesichtsbehandlung?',
    answer: [
      'Der Jeveauxeffect® ist die Ganzkörperbehandlung. Der Jeveauxeffect Face® ist die eigens ' +
        'entwickelte Gesichtsbehandlung mit Fokus auf Entstauung, Konturierung und ein frisches ' +
        'Aussehen.',
      'Beide folgen derselben Methode und lassen sich einzeln oder nacheinander buchen.',
    ],
    topics: ['face', 'body', 'general'],
  },
]

/** Entries on a topic, for the topic-specific FAQ blocks on the sub-pages. */
export function faqByTopic(topic: FaqTopic): FaqEntry[] {
  return faq.filter(e => e.topics.includes(topic))
}

/** The answer as a single body of text, the way the FAQPage structured data needs it. */
export function faqAnswerText(entry: FaqEntry): string {
  const parts = [...entry.answer]
  if (entry.list?.length) {
    parts.push(`${entry.list.join('; ')}.`)
  }
  if (entry.closing) {
    parts.push(entry.closing)
  }
  return parts.join(' ')
}

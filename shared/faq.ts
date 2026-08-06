/*
 * Die Fragen, die Kundinnen vor einem Termin stellen.
 *
 * Eine Quelle für zwei Ausgaben: die sichtbare FAQ-Seite und das FAQPage-Structured-Data. Deshalb
 * sind Antworten Absatz-Arrays und kein HTML, denn Google will im JSON-LD reinen Text.
 *
 * Inhaltlich beruhen die Antworten auf den Unterlagen der Jeveaux Company® als Lizenzgeberin.
 * Grundregel für Änderungen: keine Heilversprechen, keine Wirkungsgarantien, keine Zahlen ohne
 * Quelle. Formulierungen wie "kann unterstützen" und "viele Kundinnen berichten" sind bewusst
 * gewählt und rechtlich relevant.
 */

export type FaqThema = 'allgemein' | 'ablauf' | 'gesundheit' | 'preise' | 'koerper' | 'gesicht'

export interface FaqEintrag {
  frage: string
  /** Absätze der Antwort. */
  antwort: string[]
  /** Aufzählung, die nach den Absätzen erscheint. */
  liste?: string[]
  /** Nachsatz unter der Liste. */
  nachsatz?: string
  themen: FaqThema[]
}

/**
 * Situationen, in denen nicht behandelt wird. Steht wörtlich so in den Unterlagen des
 * Lizenzgebers und wird auf der Themenseite und in der FAQ ausgegeben.
 */
export const kontraindikationen: string[] = [
  'akute oder chronische Entzündungen im Körper',
  'aktive Krebserkrankungen oder eine laufende Krebstherapie',
  'Fieber oder ein starkes Krankheitsgefühl',
  'akute Infekte',
  'offene Wunden oder frische Verletzungen',
  'Thrombose oder der Verdacht darauf',
  'Herz-Kreislauf-Erkrankungen',
  'unbehandelte oder akute Erkrankungen des Lymphsystems',
]

export const faq: FaqEintrag[] = [
  {
    frage: 'Was ist der Jeveauxeffect® genau?',
    antwort: [
      'Der Jeveauxeffect® ist eine ästhetische Ganzkörpermassage, die die Jeveaux Company® ' +
        'entwickelt hat. Sie verbindet manuelle Lymphdrainage, Faszienarbeit und Körpermodellierung ' +
        'in einem festen Ablauf.',
      'Zuerst wird die Lymphe sanft angeregt, damit im Körper etwas in Bewegung kommt. Danach wird ' +
        'kräftiger gearbeitet und modelliert. Mit einer Wellnessmassage hat das wenig zu tun: die ' +
        'Behandlung ist deutlich spürbar und folgt einer festen Abfolge von Griffen.',
    ],
    themen: ['allgemein', 'koerper'],
  },
  {
    frage: 'Ist der Jeveauxeffect® eine medizinische Behandlung?',
    antwort: [
      'Nein. Der Jeveauxeffect® ist eine ästhetische Anwendung im Beauty-Bereich. Er ist keine ' +
        'medizinische oder therapeutische Behandlung und ersetzt keine ärztliche Maßnahme.',
      'Die medizinische Lymphdrainage ist etwas anderes: sie wird bei einem diagnostizierten ' +
        'Lymphödem verordnet und von Physiotherapeutinnen und Physiotherapeuten durchgeführt. Wenn ' +
        'Sie eine solche Behandlung brauchen, ist Ihre Ärztin oder Ihr Arzt die richtige Adresse.',
    ],
    themen: ['allgemein', 'gesundheit'],
  },
  {
    frage: 'Für wen ist die Behandlung geeignet?',
    antwort: [
      'Für alle, die sich leichter und wohler im eigenen Körper fühlen möchten und eine aktive, ' +
        'spürbare Behandlung suchen statt einer klassischen Entspannungsmassage.',
      'Wer vor allem abschalten und dösen will, ist mit einer Wellnessmassage besser beraten. Der ' +
        'Jeveauxeffect® arbeitet mit Druck und Rhythmus, und das merkt man.',
    ],
    themen: ['allgemein'],
  },
  {
    frage: 'Was kann ich nach der Behandlung erwarten?',
    antwort: [
      'Viele Kundinnen beschreiben ihr Körpergefühl danach als verändert. Am häufigsten genannt ' +
        'werden:',
    ],
    liste: [
      'ein leichteres, freieres Gefühl im Körper',
      'weniger Spannung oder Druckgefühl',
      'mehr Kontur und Definition',
      'ein Effekt, der sich direkt nach der Behandlung zeigt',
    ],
    nachsatz:
      'Weil die Lymphe angeregt wird, kann die Behandlung dabei unterstützen, dass sich der Körper ' +
      'weniger aufgeschwemmt anfühlt. Wie deutlich das ausfällt, ist von Person zu Person ' +
      'verschieden und hängt auch von Alltag und Lebensstil ab.',
    themen: ['allgemein', 'ablauf'],
  },
  {
    frage: 'Hilft die Behandlung bei Wassereinlagerungen?',
    antwort: [
      'Der Jeveauxeffect® kann den Körper dabei unterstützen, sich leichter und weniger gespannt ' +
        'anzufühlen, weil die Lymphe sanft angeregt wird.',
      'Ein Heilversprechen ist damit nicht verbunden. Wenn Schwellungen immer wiederkehren, stark ' +
        'sind oder nur an einer Körperstelle auftreten, lassen Sie die Ursache bitte ärztlich ' +
        'abklären, bevor Sie einen Termin buchen.',
    ],
    themen: ['allgemein', 'gesundheit', 'koerper'],
  },
  {
    frage: 'Ist die Behandlung schmerzhaft?',
    antwort: [
      'Sie ist intensiv und deutlich spürbar, für die meisten Kundinnen aber gut auszuhalten. Der ' +
        'Druck lässt sich jederzeit anpassen, sagen Sie also einfach etwas, wenn es zu viel wird.',
    ],
    themen: ['ablauf'],
  },
  {
    frage: 'Gibt es Gegenanzeigen?',
    antwort: ['Ja. Auch eine ästhetische Behandlung hat Grenzen. Nicht behandelt wird bei:'],
    liste: kontraindikationen,
    nachsatz:
      'Im Zweifel gilt immer: vorher ärztlich abklären. Sagen Sie uns außerdem vor dem Termin, ' +
      'wenn Sie schwanger sind, Medikamente nehmen oder eine Vorerkrankung haben.',
    themen: ['gesundheit', 'ablauf'],
  },
  {
    frage: 'Kann ich die Behandlung in der Schwangerschaft machen?',
    antwort: [
      'Das lässt sich nicht pauschal beantworten. Sprechen Sie vorher mit Ihrer Ärztin oder Ihrem ' +
        'Arzt und sagen Sie uns bei der Terminvereinbarung Bescheid, damit wir gemeinsam entscheiden ' +
        'können.',
    ],
    themen: ['gesundheit'],
  },
  {
    frage: 'Wie lange hält der Effekt an?',
    antwort: [
      'Das ist individuell verschieden. Körperliche Voraussetzungen, Bewegung, Ernährung, ' +
        'Trinkmenge und allgemeines Wohlbefinden spielen alle eine Rolle.',
      'Der Jeveauxeffect® kann eine bewusste Körperpflege unterstützen, ersetzt aber keine gesunde ' +
        'Lebensweise. Was für Sie sinnvoll ist, klären wir am besten direkt im Termin.',
    ],
    themen: ['ablauf', 'allgemein'],
  },
  {
    frage: 'Was kostet die Behandlung?',
    antwort: [
      'Die Gesichtsbehandlung Jeveauxeffect Face® kostet 65 Euro, die Körperbehandlung ' +
        'Jeveauxeffect® kostet 150 Euro. Beide zusammen in einem Termin kosten 215 Euro.',
      'Für mehrere Termine gibt es Pakete: die Körperbehandlung kostet im 5er Paket 130 Euro und ' +
        'im 10er Paket 120 Euro pro Behandlung, die Gesichtsbehandlung 59 Euro im 5er Paket und ' +
        '45 Euro im 10er Paket pro Behandlung.',
    ],
    themen: ['preise'],
  },
  {
    frage: 'Übernimmt die Krankenkasse die Kosten?',
    antwort: [
      'Nein. Es handelt sich um eine ästhetische Behandlung im Beauty-Bereich und nicht um eine ' +
        'medizinische Leistung, deshalb gibt es keine Kassenerstattung und kein Rezept.',
    ],
    themen: ['preise', 'gesundheit'],
  },
  {
    frage: 'Worauf sollte ich vor dem Termin achten?',
    antwort: [
      'Planen Sie genug Zeit ein und kommen Sie in bequemer Kleidung. Alles Weitere, auch Fragen ' +
        'zu Ihrer Gesundheit, besprechen wir vor der ersten Behandlung im Studio.',
    ],
    themen: ['ablauf'],
  },
  {
    frage: 'Was ist der Unterschied zwischen der Körper- und der Gesichtsbehandlung?',
    antwort: [
      'Der Jeveauxeffect® ist die Ganzkörperbehandlung. Der Jeveauxeffect Face® ist die eigens ' +
        'entwickelte Gesichtsbehandlung mit Fokus auf Entstauung, Konturierung und ein frisches ' +
        'Aussehen.',
      'Beide folgen derselben Methode und lassen sich einzeln oder nacheinander buchen.',
    ],
    themen: ['gesicht', 'koerper', 'allgemein'],
  },
]

/** Einträge zu einem Thema, für die themenspezifischen FAQ-Blöcke auf den Unterseiten. */
export function faqZuThema(thema: FaqThema): FaqEintrag[] {
  return faq.filter(e => e.themen.includes(thema))
}

/** Antwort als ein Fließtext, wie es das FAQPage-Structured-Data braucht. */
export function faqAntwortText(eintrag: FaqEintrag): string {
  const teile = [...eintrag.antwort]
  if (eintrag.liste?.length) {
    teile.push(`${eintrag.liste.join('; ')}.`)
  }
  if (eintrag.nachsatz) {
    teile.push(eintrag.nachsatz)
  }
  return teile.join(' ')
}

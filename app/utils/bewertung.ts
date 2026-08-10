import { address, site } from '#shared/site'
import { treatmentBySlug } from '#shared/behandlungen'

/*
 * The building blocks the review helper under /bewertung assembles its text from.
 *
 * Everything a guest can tick is written down here, and only here: the page renders this list and
 * bewertungstext.ts joins the phrases. Adding a phrase means adding one line in this file.
 *
 * Two people who tick the same chips must not end up with the same review, or Google sees a pattern
 * and the studio has a problem. Variety therefore comes from three places at once: eight sentence
 * frames per block, three wordings per chip, and the order of the enumeration. Three ticks already
 * give a few thousand texts, a full review far more — the counts are asserted in
 * bewertungstext.test.ts and fail if a change here drops them.
 *
 * Three rules keep the assembled German grammatical without any parsing:
 *
 *  1. Every wording of a chip fits the same slot. A block's `rahmen` decides what that slot takes —
 *     noun phrases after a colon, verb phrases after the owner's name, whole clauses on their own —
 *     and every wording of that block is written to match. Mixing kinds within one block is what
 *     would produce broken sentences.
 *  2. Wordings start lowercase unless the first word is a noun. The builder capitalises the first
 *     letter of the finished sentence, so the same wording reads correctly first or last in a list.
 *  3. In the treatment block the wordings are feminine, neuter or plural. Its frames put the slot
 *     behind "für" in one case and behind a colon in another, and only those genders look the same
 *     in the nominative and the accusative. A masculine "den Kombitermin" would break half of them.
 */

const koerper = treatmentBySlug('jeveauxeffect')!
const gesicht = treatmentBySlug('lymphdrainage-gesicht')!

/** Guests call the owner by her first name, and a review of hers would too. */
const inhaberin = site.owner.split(' ')[0] ?? site.owner

export interface Baustein {
  /** Stable across text rebuilds and used as the input's value — never rename in place. */
  id: string
  /** What the chip says. Short enough to read at a glance on a phone. */
  label: string
  /**
   * Three ways to say the same thing, one of which the builder picks per seed. They have to be
   * interchangeable: same slot, same meaning, no wording that only works in first position.
   */
  phrasen: string[]
}

export interface Block {
  id: string
  /** The legend above the chips. */
  frage: string
  /**
   * Whether several chips can be ticked. The treatment block is single choice: the options there
   * already cover the combinations, and two of them at once would contradict each other.
   */
  mehrfach: boolean
  /** Sentence frames containing `{liste}`, one of which the builder picks per seed. */
  rahmen: string[]
  bausteine: Baustein[]
}

/*
 * The blocks in the order they appear on the page and in the finished text.
 *
 * That order is the shape of a review someone would write by hand: what was done, what came of it,
 * who did it, what it was like there, and whether they would come back.
 */
export const bewertungBloecke: Block[] = [
  {
    id: 'behandlung',
    frage: 'Was haben Sie machen lassen?',
    mehrfach: false,
    rahmen: [
      `Ich war für {liste} bei ${site.name} in ${address.city}.`,
      `Bei ${site.name} in ${address.city} war ich für {liste}.`,
      `Ich hatte bei ${site.name} in ${address.city} einen Termin für {liste}.`,
      `Mein Termin bei ${site.name} in ${address.city}: {liste}.`,
      `Ich habe mich bei ${site.name} in ${address.city} für {liste} entschieden.`,
      `Gebucht hatte ich bei ${site.name} in ${address.city} {liste}.`,
      `Angemeldet hatte ich mich bei ${site.name} in ${address.city} für {liste}.`,
      `Ich war bei ${site.name} in ${address.city}, gebucht hatte ich {liste}.`,
    ],
    bausteine: [
      {
        id: 'koerper',
        label: 'Körper (Jeveauxeffect®)',
        phrasen: [
          `die brasilianische Lymphdrainage am Körper (${koerper.name})`,
          `die Ganzkörperbehandlung ${koerper.name}`,
          `die Körperbehandlung ${koerper.name}`,
        ],
      },
      {
        id: 'gesicht',
        label: 'Gesicht (Jeveauxeffect Face®)',
        phrasen: [
          `die brasilianische Lymphdrainage im Gesicht (${gesicht.name})`,
          `die Gesichtsbehandlung ${gesicht.name}`,
          `die Lymphdrainage im Gesicht (${gesicht.name})`,
        ],
      },
      {
        id: 'kombi',
        label: 'Körper und Gesicht zusammen',
        phrasen: [
          'die Körper- und die Gesichtsbehandlung in einem Termin',
          'Körper und Gesicht zusammen in einem Termin',
          'beide Behandlungen direkt hintereinander, Körper und Gesicht',
        ],
      },
      {
        id: 'paket',
        label: 'Mehrere Körpertermine',
        phrasen: [
          `ein Paket mit mehreren Terminen (${koerper.name})`,
          'mehrere Termine hintereinander',
          'eine Reihe von Körperterminen',
        ],
      },
      {
        id: 'paket-gesicht',
        label: 'Mehrere Gesichtstermine',
        phrasen: [
          `mehrere Gesichtsbehandlungen (${gesicht.name})`,
          'eine Reihe von Gesichtsterminen',
          'die Gesichtsbehandlung, inzwischen mehrmals',
        ],
      },
    ],
  },
  {
    id: 'ergebnis',
    frage: 'Was hat sich verändert?',
    mehrfach: true,
    // A colon before the slot: it takes noun phrases and needs no verb to agree with them.
    rahmen: [
      'Das Ergebnis: {liste}.',
      'Was sich verändert hat: {liste}.',
      'Danach: {liste}.',
      'Was mir aufgefallen ist: {liste}.',
      'Nach dem Termin: {liste}.',
      'Was danach anders war: {liste}.',
      'Geblieben ist: {liste}.',
      'Gemerkt habe ich vor allem: {liste}.',
    ],
    bausteine: [
      {
        id: 'bauch',
        label: 'Flacherer Bauch',
        phrasen: [
          'ein flacherer Bauch',
          'ein sichtbar flacherer Bauch',
          'ein Bauch, der flacher aussieht als vorher',
        ],
      },
      {
        id: 'taille',
        label: 'Definiertere Taille',
        phrasen: [
          'eine sichtbar definiertere Taille',
          'eine Taille, die wieder eine ist',
          'eine deutlichere Linie an der Taille',
        ],
      },
      {
        id: 'beine',
        label: 'Leichtere Beine',
        phrasen: [
          'spürbar leichtere Beine',
          'Beine, die abends nicht mehr so schwer sind',
          'ein leichteres Gefühl in den Beinen',
        ],
      },
      {
        id: 'wasser',
        label: 'Weniger Wassereinlagerungen',
        phrasen: [
          'weniger Wassereinlagerungen',
          'deutlich weniger eingelagertes Wasser',
          'weniger Schwellung, vor allem an den Knöcheln',
        ],
      },
      {
        id: 'haut',
        label: 'Straffere Haut',
        phrasen: [
          'eine glattere, straffere Haut',
          'eine Haut, die sich straffer anfühlt',
          'ein festeres Hautgefühl',
        ],
      },
      {
        id: 'hautbild',
        label: 'Gleichmäßigeres Hautbild',
        phrasen: [
          'ein gleichmäßigeres Hautbild an den Beinen',
          'weniger Dellen an den Beinen',
          'ein glatteres Hautbild an den Oberschenkeln',
        ],
      },
      {
        id: 'konturen',
        label: 'Klarere Gesichtskonturen',
        phrasen: [
          'klarere Konturen im Gesicht',
          'eine deutlichere Kinnlinie',
          'ein Gesicht mit klareren Konturen',
        ],
      },
      {
        id: 'frisch',
        label: 'Frischeres Gesicht',
        phrasen: [
          'ein waches, frisches Gesicht',
          'ein ausgeruhter Blick',
          'ein Gesicht, das nach Schlaf aussieht, den ich nicht hatte',
        ],
      },
      {
        id: 'verquollen',
        label: 'Morgens weniger verquollen',
        phrasen: [
          'ein weniger verquollenes Gesicht am Morgen',
          'weniger Schwellung um die Augen',
          'ein Gesicht, das morgens nicht mehr aufgedunsen wirkt',
        ],
      },
      {
        id: 'hose',
        label: 'Kleidung sitzt anders',
        phrasen: [
          'eine Hose, die auf einmal wieder locker sitzt',
          'Kleidung, die anders fällt',
          'ein Rock, der ohne Ziehen zugeht',
        ],
      },
      {
        id: 'leicht',
        label: 'Leichteres Körpergefühl',
        phrasen: [
          'ein leichteres Gefühl im ganzen Körper',
          'das Gefühl, weniger mit mir herumzuschleppen',
          'ein Körper, der sich leichter anfühlt',
        ],
      },
      {
        id: 'entspannt',
        label: 'Entspannter',
        phrasen: [
          'ein entspanntes Körpergefühl',
          'eine Ruhe, die den ganzen Abend gehalten hat',
          'ein Zustand zwischen entspannt und müde, im guten Sinn',
        ],
      },
    ],
  },
  {
    id: 'karin',
    frage: `Wie war die Behandlung bei ${inhaberin}?`,
    mehrfach: true,
    // The slot sits behind the subject, so every wording is a verb phrase in the third person.
    rahmen: [
      `${inhaberin} {liste}.`,
      `Besonders angenehm: ${inhaberin} {liste}.`,
      `Was den Termin ausmacht: ${inhaberin} {liste}.`,
      `Zu ${inhaberin} selbst: sie {liste}.`,
      `Gut gefallen hat mir, wie ${inhaberin} arbeitet: sie {liste}.`,
      `${inhaberin} macht das gut: sie {liste}.`,
      `Dazu kommt ${inhaberin} selbst: sie {liste}.`,
      `Wegen ${inhaberin} komme ich wieder: sie {liste}.`,
    ],
    bausteine: [
      {
        id: 'erklaert',
        label: 'Erklärt jeden Schritt',
        phrasen: [
          'erklärt jeden Schritt, bevor sie ihn macht',
          'sagt vorher, was als Nächstes kommt',
          'erklärt unterwegs, woran sie gerade arbeitet',
        ],
      },
      {
        id: 'ehrlich',
        label: 'Berät ehrlich',
        phrasen: [
          'berät ehrlich, statt etwas schönzureden',
          'sagt auch mal, dass etwas nicht nötig ist',
          'redet nichts größer, als es ist',
        ],
      },
      {
        id: 'realistisch',
        label: 'Sagt, was realistisch ist',
        phrasen: [
          'sagt vorher, was ein Termin bringt und was nicht',
          'verspricht nichts, was sie nicht halten kann',
          'ist offen darüber, wie viele Termine es dafür braucht',
        ],
      },
      {
        id: 'druck',
        label: 'Angenehmer Druck',
        phrasen: [
          'arbeitet mit genau dem Druck, der sich noch gut anfühlt',
          'hat kräftige Hände, ohne dass es wehtut',
          'trifft den Druck, bei dem man sich fallen lässt',
        ],
      },
      {
        id: 'empfindlich',
        label: 'Achtet auf empfindliche Stellen',
        phrasen: [
          'fragt nach, wenn eine Stelle empfindlich ist',
          'geht an heiklen Stellen sofort behutsamer vor',
          'merkt selbst, wenn eine Stelle unangenehm wird',
        ],
      },
      {
        id: 'fragen',
        label: 'Antwortet auf alles',
        phrasen: [
          'beantwortet auch Fragen, die ich fast peinlich fand',
          'nimmt sich für Fragen genauso Zeit wie für die Behandlung',
          'erklärt so lange, bis man es verstanden hat',
        ],
      },
      {
        id: 'tipps',
        label: 'Tipps für danach',
        phrasen: [
          'gibt Tipps, was man danach zu Hause weitermachen kann',
          'sagt, worauf man in den Tagen danach achten sollte',
          'schickt einen mit ein paar praktischen Hinweisen nach Hause',
        ],
      },
      {
        id: 'merkt',
        label: 'Merkt sich, was war',
        phrasen: [
          'weiß beim nächsten Termin noch, was das letzte Mal Thema war',
          'knüpft beim zweiten Termin da an, wo wir aufgehört hatten',
          'erinnert sich an Dinge, die ich selbst schon vergessen hatte',
        ],
      },
      {
        id: 'zeit',
        label: 'Nimmt sich Zeit',
        phrasen: [
          'nimmt sich Zeit, ohne dass es hektisch wird',
          'schaut nicht auf die Uhr',
          'hört erst auf, wenn sie fertig ist',
        ],
      },
      {
        id: 'herzlich',
        label: 'Herzlich',
        phrasen: [
          'empfängt einen freundlich, ohne aufdringlich zu sein',
          'ist herzlich, auch beim ersten Termin',
          'sorgt dafür, dass man sich nicht fremd fühlt',
        ],
      },
    ],
  },
  {
    id: 'studio',
    frage: 'Wie war es im Studio?',
    mehrfach: true,
    // Whole clauses here, joined into one sentence — hence the bare first frame.
    rahmen: [
      '{liste}.',
      'Drumherum stimmt es auch: {liste}.',
      'Zum Studio selbst: {liste}.',
      'Und sonst: {liste}.',
      'Was noch dazukommt: {liste}.',
      'Und noch was: {liste}.',
      'Dazu: {liste}.',
      'Ach ja: {liste}.',
    ],
    bausteine: [
      {
        id: 'sauber',
        label: 'Sauber',
        phrasen: [
          'der Raum ist wirklich sauber',
          'es ist überall sauber',
          'die Räume sind gepflegt',
        ],
      },
      {
        id: 'ruhig',
        label: 'Ruhig',
        phrasen: [
          'es ist ruhig, kein Telefon klingelt dazwischen',
          'niemand platzt in den Termin herein',
          'es bleibt die ganze Zeit still',
        ],
      },
      {
        id: 'puenktlich',
        label: 'Pünktlich',
        phrasen: [
          'die Termine fangen pünktlich an',
          'ich musste nicht warten',
          'es ging los, als es losgehen sollte',
        ],
      },
      {
        id: 'atmosphaere',
        label: 'Entspannte Atmosphäre',
        phrasen: [
          'die Atmosphäre ist entspannt, ohne Hektik',
          'man kommt schon beim Reinkommen runter',
          'die Stimmung ist ruhig, nicht so klinisch',
        ],
      },
      {
        id: 'bequem',
        label: 'Man liegt bequem',
        phrasen: [
          'man liegt bequem',
          'es ist warm genug auf der Liege',
          'man liegt so, dass man liegen bleiben möchte',
        ],
      },
      {
        id: 'finden',
        label: 'Leicht zu finden',
        phrasen: [
          `das Studio ist leicht zu finden, auch wenn am Eingang ${address.venue} steht`,
          `man muss wissen, dass es in ${address.venue} liegt, dann findet man es sofort`,
          `es liegt mitten in ${address.district}, im Haus von ${address.venue}`,
        ],
      },
      {
        id: 'parken',
        label: 'Parken kein Problem',
        phrasen: [
          'Parken ist direkt davor kein Problem',
          'einen Parkplatz habe ich immer gefunden',
          'man muss keine Runden um den Block fahren',
        ],
      },
      {
        id: 'termin',
        label: 'Termine gut zu bekommen',
        phrasen: [
          'einen Termin bekommt man zügig',
          'ich musste nicht wochenlang auf einen Termin warten',
          'das Terminmachen war unkompliziert',
        ],
      },
      {
        id: 'kein-druck',
        label: 'Kein Verkaufsdruck',
        phrasen: [
          'man wird zu nichts überredet',
          'niemand versucht, einem ein Paket zu verkaufen',
          'es gibt kein Verkaufsgespräch hinterher',
        ],
      },
    ],
  },
  {
    id: 'fazit',
    frage: 'Ihr Fazit?',
    mehrfach: true,
    rahmen: [
      '{liste}.',
      'Mein Fazit: {liste}.',
      'Unterm Strich: {liste}.',
      'Kurz gesagt: {liste}.',
      'Für mich steht fest: {liste}.',
      'Deshalb: {liste}.',
      'Und ja: {liste}.',
      'Also: {liste}.',
    ],
    bausteine: [
      {
        id: 'wieder',
        label: 'Komme wieder',
        phrasen: [
          'ich komme wieder',
          'ich gehe da wieder hin',
          'das war nicht mein letzter Termin',
        ],
      },
      {
        id: 'naechster',
        label: 'Nächster Termin steht',
        phrasen: [
          'mein nächster Termin steht schon',
          'den nächsten Termin habe ich direkt mitgenommen',
          'der Folgetermin ist gebucht',
        ],
      },
      {
        id: 'regelmaessig',
        label: 'Gehe regelmäßig hin',
        phrasen: [
          'ich gehe inzwischen regelmäßig hin',
          'das gehört bei mir inzwischen dazu',
          'ich lasse das jetzt in Abständen machen',
        ],
      },
      {
        id: 'empfehlung',
        label: 'Klare Empfehlung',
        phrasen: [
          `${site.name} kann ich wirklich empfehlen`,
          'ich würde es jeder empfehlen, die darüber nachdenkt',
          'weitersagen würde ich das jederzeit',
        ],
      },
      {
        id: 'weitergesagt',
        label: 'Schon weitererzählt',
        phrasen: [
          'eine Freundin geht inzwischen auch hin',
          'ich habe es schon zweimal weitererzählt',
          'in meinem Bekanntenkreis wissen es inzwischen einige',
        ],
      },
      {
        id: 'preis',
        label: 'Preis-Leistung passt',
        phrasen: [
          'das Geld war jeden Cent wert',
          'für das, was man bekommt, ist der Preis in Ordnung',
          'ich habe schon mehr für weniger bezahlt',
        ],
      },
      {
        id: 'schnell',
        label: 'Schneller Effekt als erwartet',
        phrasen: [
          'ich hätte nicht gedacht, dass man so schnell etwas sieht',
          'so früh hatte ich mit einem Unterschied nicht gerechnet',
          'es ging schneller, als ich erwartet hatte',
        ],
      },
      {
        id: 'skeptisch',
        label: 'War vorher skeptisch',
        phrasen: [
          'ich war vorher skeptisch, jetzt nicht mehr',
          'ich bin ohne große Erwartung hingegangen, jetzt bin ich überzeugt',
          'meine Skepsis war umsonst',
        ],
      },
    ],
  },
]

/**
 * The selection of a block after a chip has been tapped.
 *
 * A function of the previous selection and not a mutation, and it lives next to the data rather
 * than in the chip component: the page owns the selection, and a component that read its own model
 * back to change it would lose a tick's worth of taps — the prop it reads is only updated after the
 * parent has rendered.
 */
export function umgeschaltet(block: Block, gewaehlt: string[], id: string): string[] {
  if (gewaehlt.includes(id)) return gewaehlt.filter(vorhandener => vorhandener !== id)

  /*
   * Single choice replaces instead of adding. Tapping the ticked chip again clears the block, which
   * radio buttons cannot do by themselves — without it a mis-tap could not be taken back, as there
   * is no "none of these" chip.
   */
  return block.mehrfach ? [...gewaehlt, id] : [id]
}

import { bewertungBloecke, type Block } from './bewertung'

/*
 * Turns the ticked chips into a review text.
 *
 * Pure functions with no Vue and no randomness of their own: the seed comes in as an argument, so
 * the same selection always yields the same text and the tests can state exact strings. The page
 * hands out a new seed when someone asks for a different wording.
 */

/** Ticked building blocks per block id. */
export type Auswahl = Record<string, string[]>

/**
 * A small integer hash (FNV-1a, 32 bit).
 *
 * Not Math.random(), because a rebuild has to be reproducible: the seed plus the block id has to
 * pick the same frame every time, otherwise every keystroke on the page would reshuffle sentences
 * the guest has already read.
 */
function hash(text: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/**
 * Joins phrases the German way: "a", "a und b", "a, b und c".
 *
 * No serial comma before "und" — except when the phrase right before it carries a comma of its own.
 * "erklärt jeden Schritt, bevor sie ihn macht und arbeitet …" makes the reader stumble, because
 * "und arbeitet" first looks like it continues the subordinate clause; with the comma the sentence
 * reads in one go. § 72 of the official rules allows the comma for exactly that reason.
 *
 * Exported for its own test: the rule is worth checking on fixed input rather than through whatever
 * wordings a seed happens to pick.
 */
export function verbinde(phrasen: string[]): string {
  if (phrasen.length <= 1) return phrasen[0] ?? ''

  const davor = phrasen.at(-2)!
  return `${phrasen.slice(0, -1).join(', ')}${davor.includes(',') ? ',' : ''} und ${phrasen.at(-1)}`
}

/** Uppercases the first letter only. The rest of the sentence keeps its own casing. */
function grossAmAnfang(satz: string): string {
  return satz.charAt(0).toUpperCase() + satz.slice(1)
}

/**
 * Rotates a list by an offset derived from the seed.
 *
 * Without it "Anderen Text vorschlagen" would only swap the sentence frames and the same three
 * results would keep appearing in the same order — which reads like nothing happened. Rotating
 * instead of shuffling keeps neighbouring phrases in the order they were written, and that order
 * was chosen so the enumeration flows.
 */
function rotiere<T>(werte: T[], versatz: number): T[] {
  if (werte.length < 2) return werte
  const start = versatz % werte.length
  return [...werte.slice(start), ...werte.slice(0, start)]
}

/** One sentence for one block, or null when nothing in that block is ticked. */
function baueSatz(block: Block, gewaehlt: string[], seed: number): string | null {
  /*
   * Driven by the block's own order, not by the order of clicks: someone who ticks "Parken" first
   * and "sauber" second should get the sentence the wordings were written for, not their click
   * history.
   *
   * Which of the three wordings a chip contributes is salted with the chip's own id. Two guests
   * with the same ticks therefore differ wording by wording, and ticking one more chip does not
   * reword the sentence someone has already read.
   */
  const phrasen = block.bausteine
    .filter(baustein => gewaehlt.includes(baustein.id))
    .map(
      baustein =>
        baustein.phrasen[hash(`${seed}:${block.id}:${baustein.id}`) % baustein.phrasen.length]!,
    )
  if (!phrasen.length) return null

  const rahmen = block.rahmen[hash(`${seed}:${block.id}:rahmen`) % block.rahmen.length]!
  const liste = verbinde(rotiere(phrasen, hash(`${seed}:${block.id}:folge`)))

  return grossAmAnfang(rahmen.replace('{liste}', liste))
}

/**
 * Builds the whole review: one sentence per block that has something ticked, in block order.
 *
 * Returns an empty string while nothing is selected — the page shows a hint instead of an empty
 * box in that case.
 */
export function baueBewertungstext(auswahl: Auswahl, seed: number): string {
  return bewertungBloecke
    .map(block => baueSatz(block, auswahl[block.id] ?? [], seed))
    .filter((satz): satz is string => satz !== null)
    .join(' ')
}

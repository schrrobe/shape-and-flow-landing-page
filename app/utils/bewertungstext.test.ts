import { describe, expect, it } from 'vitest'

import { bewertungBloecke, umgeschaltet, type Block } from './bewertung'
import { baueBewertungstext, verbinde, type Auswahl } from './bewertungstext'

/*
 * What is tested is what the text has to guarantee, not its wording: that every tick shows up,
 * that the same seed gives the same text, and that no combination produces a broken sentence. The
 * phrases in bewertung.ts may be reworded without turning anything red here.
 */

/** Every block ticked with everything it offers — the longest text the tool can produce. */
function alles(): Auswahl {
  return Object.fromEntries(
    bewertungBloecke.map(block => [block.id, block.bausteine.map(b => b.id)]),
  )
}

describe('baueBewertungstext', () => {
  it('returns an empty string as long as nothing is ticked', () => {
    expect(baueBewertungstext({}, 1)).toBe('')
    expect(baueBewertungstext({ ergebnis: [] }, 1)).toBe('')
  })

  it('gives the same text for the same seed and selection', () => {
    const auswahl: Auswahl = { behandlung: ['koerper'], ergebnis: ['bauch', 'beine'] }

    expect(baueBewertungstext(auswahl, 42)).toBe(baueBewertungstext(auswahl, 42))
  })

  it('puts every ticked chip into the text, in one of its wordings', () => {
    for (const seed of [1, 7, 99]) {
      const text = baueBewertungstext(alles(), seed).toLowerCase()

      for (const block of bewertungBloecke)
        for (const baustein of block.bausteine)
          // The first letter may have been capitalised as the start of a sentence.
          expect(
            baustein.phrasen.some(phrase => text.includes(phrase.toLowerCase())),
            `${block.id}/${baustein.id} fehlt im Text`,
          ).toBe(true)
    }
  })

  /*
   * The number this asserts is the point of the whole file: two guests who tick the same chips must
   * not get the same review. 3000 seeds are a sample, not the full space — the real one is the
   * product of frames, wordings and rotations and is far larger. If a change to bewertung.ts drops
   * variety, this is where it shows.
   */
  it('produces at least 200 different texts for the same handful of ticks', () => {
    const auswahl: Auswahl = {
      behandlung: ['koerper'],
      ergebnis: ['bauch', 'beine'],
      fazit: ['wieder'],
    }

    const texte = new Set(
      Array.from({ length: 3000 }, (_, seed) => baueBewertungstext(auswahl, seed)),
    )

    expect(texte.size).toBeGreaterThanOrEqual(200)
  })

  it('produces over a thousand different texts for a full review', () => {
    const texte = new Set(
      Array.from({ length: 3000 }, (_, seed) => baueBewertungstext(alles(), seed)),
    )

    expect(texte.size).toBeGreaterThan(1000)
  })

  it('ignores ids that no longer exist instead of writing empty sentences', () => {
    const text = baueBewertungstext({ ergebnis: ['bauch', 'gibtsnicht'] }, 3)

    expect(text).toMatch(/Bauch/)
    expect(text).not.toContain('  ')
    expect(text).not.toContain(' .')
  })

  it('keeps the block order of the questions', () => {
    const auswahl: Auswahl = { behandlung: ['koerper'], karin: ['ehrlich'], fazit: ['wieder'] }

    /** Whether the sentence carries any of the wordings that chip may contribute. */
    function stammtVon(satz: string, blockId: string, bausteinId: string) {
      const baustein = bewertungBloecke
        .find(block => block.id === blockId)!
        .bausteine.find(b => b.id === bausteinId)!

      return baustein.phrasen.some(phrase => satz.toLowerCase().includes(phrase.toLowerCase()))
    }

    for (const seed of [1, 5, 42]) {
      const saetze = baueBewertungstext(auswahl, seed).split(/(?<=\.)\s+/)

      expect(saetze).toHaveLength(3)
      expect(stammtVon(saetze[0]!, 'behandlung', 'koerper')).toBe(true)
      expect(stammtVon(saetze[1]!, 'karin', 'ehrlich')).toBe(true)
      expect(stammtVon(saetze[2]!, 'fazit', 'wieder')).toBe(true)
    }
  })

  it('starts every sentence with a capital letter and ends it with a full stop', () => {
    for (const seed of [1, 2, 3]) {
      const saetze = baueBewertungstext(alles(), seed)
        .split(/(?<=\.)\s+/)
        .filter(Boolean)

      // One sentence per block, and the tool has five blocks.
      expect(saetze).toHaveLength(bewertungBloecke.length)

      for (const satz of saetze) {
        expect(satz.charAt(0)).toBe(satz.charAt(0).toUpperCase())
        expect(satz.endsWith('.')).toBe(true)
      }
    }
  })

  /*
   * Every chip on its own, across 60 seeds: 44 chips with three wordings each, in blocks of eight
   * frames, so 24 combinations per chip. The seeds sample those combinations rather than covering
   * them, because wording and frame are drawn from separate hashes — enough to catch a wording that
   * does not fit its slot, not a proof that every pairing was seen.
   */
  it('produces a readable sentence for every chip on its own', () => {
    for (const block of bewertungBloecke)
      for (const baustein of block.bausteine)
        for (let seed = 0; seed < 60; seed++) {
          const satz = baueBewertungstext({ [block.id]: [baustein.id] }, seed)
          const wo = `${block.id}/${baustein.id}, seed ${seed}`

          expect(satz.charAt(0), wo).toBe(satz.charAt(0).toUpperCase())
          expect(satz, wo).toMatch(/\.$/)
          // A leftover placeholder would mean a frame without {liste}.
          expect(satz, wo).not.toContain('{liste}')
          // "und" without a second wording would mean the join ran on an empty list.
          expect(satz, wo).not.toMatch(/\sund\s*\.$/)
          expect(satz, wo).not.toMatch(/\s{2}|,\s*\.|:\s*\./)
        }
  })
})

describe('verbinde', () => {
  it('leaves a single phrase alone', () => {
    expect(verbinde(['ein flacherer Bauch'])).toBe('ein flacherer Bauch')
  })

  it('joins two phrases with "und" and no comma', () => {
    expect(verbinde(['a', 'b'])).toBe('a und b')
  })

  it('separates three phrases with commas and only the last with "und"', () => {
    expect(verbinde(['a', 'b', 'c'])).toBe('a, b und c')
  })

  it('sets a comma before "und" when the phrase in front of it carries one', () => {
    expect(verbinde(['erklärt alles, bevor sie anfängt', 'nimmt sich Zeit'])).toBe(
      'erklärt alles, bevor sie anfängt, und nimmt sich Zeit',
    )
  })

  it('looks only at the phrase in front of the "und", not at any earlier one', () => {
    expect(verbinde(['a, b', 'c', 'd'])).toBe('a, b, c und d')
  })
})

describe('umgeschaltet', () => {
  const mehrfach = bewertungBloecke.find(b => b.mehrfach) as Block
  const einfach = bewertungBloecke.find(b => !b.mehrfach) as Block

  it('adds and removes in a multiple-choice block', () => {
    const [erster, zweiter] = mehrfach.bausteine

    const eins = umgeschaltet(mehrfach, [], erster!.id)
    const zwei = umgeschaltet(mehrfach, eins, zweiter!.id)

    expect(zwei).toEqual([erster!.id, zweiter!.id])
    expect(umgeschaltet(mehrfach, zwei, erster!.id)).toEqual([zweiter!.id])
  })

  it('replaces the previous choice in a single-choice block', () => {
    const [erster, zweiter] = einfach.bausteine

    expect(umgeschaltet(einfach, [erster!.id], zweiter!.id)).toEqual([zweiter!.id])
  })

  it('lets a single choice be taken back, which a radio button cannot do', () => {
    const [erster] = einfach.bausteine

    expect(umgeschaltet(einfach, [erster!.id], erster!.id)).toEqual([])
  })

  it('never mutates the selection it was given', () => {
    const [erster, zweiter] = mehrfach.bausteine
    const vorher = [erster!.id]

    umgeschaltet(mehrfach, vorher, zweiter!.id)

    expect(vorher).toEqual([erster!.id])
  })
})

describe('bewertungBloecke', () => {
  it('has unique ids per block and per building block', () => {
    const blockIds = bewertungBloecke.map(b => b.id)
    expect(new Set(blockIds).size).toBe(blockIds.length)

    for (const block of bewertungBloecke) {
      const ids = block.bausteine.map(b => b.id)
      expect(new Set(ids).size, `doppelte Bausteine in ${block.id}`).toBe(ids.length)
    }
  })

  it('has a {liste} placeholder in every sentence frame', () => {
    for (const block of bewertungBloecke)
      for (const rahmen of block.rahmen) expect(rahmen, block.id).toContain('{liste}')
  })

  it('offers a choice of frames, so two reviews do not read identically', () => {
    for (const block of bewertungBloecke)
      expect(block.rahmen.length, block.id).toBeGreaterThanOrEqual(2)
  })
})

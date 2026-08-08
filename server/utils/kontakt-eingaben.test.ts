import { describe, expect, it } from 'vitest'

import { anfrageAus, fehlerZu, type Anfrage } from './kontakt-eingaben'

/*
 * Geprüft wird nur, was eine Entscheidung trifft: was durchkommt, was beanstandet wird und was
 * beim Säubern übrig bleibt. Die Meldungstexte selbst sind nicht Gegenstand der Tests — sie
 * dürfen sich ändern, ohne dass hier etwas rot wird.
 */

/** Eine Anfrage, die durchgeht. Die Tests verändern jeweils das eine Feld, um das es geht. */
function gueltig(abweichung: Partial<Anfrage> = {}): Anfrage {
  return anfrageAus({
    name: 'Karin Beispiel',
    email: 'karin@example.org',
    nachricht: 'Ich hätte gern einen Termin für nächste Woche.',
    ...abweichung,
  })
}

describe('anfrageAus', () => {
  it('nimmt nur die beiden bekannten Antwortwege und fällt sonst auf E-Mail zurück', () => {
    expect(anfrageAus({ antwortweg: 'whatsapp' }).antwortweg).toBe('whatsapp')
    expect(anfrageAus({ antwortweg: 'email' }).antwortweg).toBe('email')
    expect(anfrageAus({}).antwortweg).toBe('email')
    // Was ein Skript sonst noch schicken kann. Der Cast steht hier, weil genau das geprüft wird:
    // dass ein Wert außerhalb des Typs nicht durchkommt.
    expect(anfrageAus({ antwortweg: 'sms' as Anfrage['antwortweg'] }).antwortweg).toBe('email')
    expect(anfrageAus({ antwortweg: 42 as unknown as Anfrage['antwortweg'] }).antwortweg).toBe(
      'email',
    )
  })

  it('wirft Zeilenumbrüche aus der Handynummer, damit nichts in einen Mail-Header rutscht', () => {
    expect(anfrageAus({ handy: '0176 1234567\r\nBcc: wer@anders.example' }).handy).not.toContain(
      '\n',
    )
  })

  it('kürzt die Handynummer auf die Feldgrenze', () => {
    expect(anfrageAus({ handy: '0'.repeat(60) }).handy).toHaveLength(30)
  })
})

describe('fehlerZu', () => {
  it('lässt eine vollständige Anfrage ohne Handynummer durch', () => {
    expect(fehlerZu(gueltig())).toEqual({})
  })

  it('nimmt übliche Schreibweisen einer Rufnummer an', () => {
    for (const handy of ['0176 1234567', '+49 176 1234567', '+49 (0)176 / 123-4567', '017612345']) {
      expect(fehlerZu(gueltig({ handy })), handy).toEqual({})
    }
  })

  it('beanstandet eine Nummer, die keine ist — auch bei Antwort per Mail', () => {
    for (const handy of ['ruf mich an', '0176-ABCDEFG', '12345']) {
      expect(fehlerZu(gueltig({ handy })), handy).toHaveProperty('handy')
    }
  })

  it('verlangt eine Handynummer, sobald WhatsApp der Antwortweg ist', () => {
    expect(fehlerZu(gueltig({ antwortweg: 'whatsapp' }))).toHaveProperty('handy')
    expect(fehlerZu(gueltig({ antwortweg: 'whatsapp', handy: '0176 1234567' }))).toEqual({})
  })

  it('verlangt die Handynummer nicht, wenn per Mail geantwortet wird', () => {
    expect(fehlerZu(gueltig({ antwortweg: 'email', handy: '' }))).toEqual({})
  })

  it('prüft Name, E-Mail und Nachricht weiterhin', () => {
    expect(fehlerZu(gueltig({ name: 'K' }))).toHaveProperty('name')
    expect(fehlerZu(gueltig({ email: 'karin@example' }))).toHaveProperty('email')
    expect(fehlerZu(gueltig({ nachricht: 'Hallo' }))).toHaveProperty('nachricht')
  })
})

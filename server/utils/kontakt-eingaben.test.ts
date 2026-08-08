import { describe, expect, it } from 'vitest'

import { requestFrom, errorsFor, type ContactRequest } from './kontakt-eingaben'

/*
 * Only what makes a decision is tested: what gets through, what is flagged and what is left after
 * cleaning. The message texts themselves are not the subject of the tests — they may change
 * without turning anything red here.
 */

/** A request that passes. Each test changes the one field it is about. */
function valid(overrides: Partial<ContactRequest> = {}): ContactRequest {
  return requestFrom({
    name: 'Karin Beispiel',
    email: 'karin@example.org',
    message: 'Ich hätte gern einen Termin für nächste Woche.',
    ...overrides,
  })
}

describe('requestFrom', () => {
  it('accepts only the two known reply channels and falls back to email otherwise', () => {
    expect(requestFrom({ replyChannel: 'whatsapp' }).replyChannel).toBe('whatsapp')
    expect(requestFrom({ replyChannel: 'email' }).replyChannel).toBe('email')
    expect(requestFrom({}).replyChannel).toBe('email')
    // What a script might send instead. The cast is here because that is exactly what is being
    // tested: that a value outside the type does not get through.
    expect(
      requestFrom({ replyChannel: 'sms' as ContactRequest['replyChannel'] }).replyChannel,
    ).toBe('email')
    expect(
      requestFrom({ replyChannel: 42 as unknown as ContactRequest['replyChannel'] }).replyChannel,
    ).toBe('email')
  })

  it('strips line breaks from the mobile number so nothing slips into a mail header', () => {
    expect(requestFrom({ mobile: '0176 1234567\r\nBcc: wer@anders.example' }).mobile).not.toContain(
      '\n',
    )
  })

  it('truncates the mobile number to the field limit', () => {
    expect(requestFrom({ mobile: '0'.repeat(60) }).mobile).toHaveLength(30)
  })
})

describe('errorsFor', () => {
  it('lets a complete request without a mobile number through', () => {
    expect(errorsFor(valid())).toEqual({})
  })

  it('accepts the usual ways of writing a phone number', () => {
    for (const mobile of [
      '0176 1234567',
      '+49 176 1234567',
      '+49 (0)176 / 123-4567',
      '017612345',
    ]) {
      expect(errorsFor(valid({ mobile })), mobile).toEqual({})
    }
  })

  it('flags a number that is not one — even when replying by mail', () => {
    for (const mobile of ['ruf mich an', '0176-ABCDEFG', '12345']) {
      expect(errorsFor(valid({ mobile })), mobile).toHaveProperty('mobile')
    }
  })

  it('requires a mobile number as soon as WhatsApp is the reply channel', () => {
    expect(errorsFor(valid({ replyChannel: 'whatsapp' }))).toHaveProperty('mobile')
    expect(errorsFor(valid({ replyChannel: 'whatsapp', mobile: '0176 1234567' }))).toEqual({})
  })

  it('does not require the mobile number when replying by mail', () => {
    expect(errorsFor(valid({ replyChannel: 'email', mobile: '' }))).toEqual({})
  })

  it('still checks name, email and message', () => {
    expect(errorsFor(valid({ name: 'K' }))).toHaveProperty('name')
    expect(errorsFor(valid({ email: 'karin@example' }))).toHaveProperty('email')
    expect(errorsFor(valid({ message: 'Hallo' }))).toHaveProperty('message')
  })
})

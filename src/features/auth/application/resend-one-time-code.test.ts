import { describe, expect, it } from 'vitest'
import { makeResendOneTimeCode, type OneTimeCodeSender } from './resend-one-time-code'

describe('resend one-time code', () => {
  it('asks the sender to send a new code for the challenge', async () => {
    const resent: string[] = []
    const sender: OneTimeCodeSender = {
      resendCode: async (challengeId) => {
        resent.push(challengeId)
      },
    }

    await makeResendOneTimeCode(sender)({ id: 'challenge-1', email: 'ada@example.com', remember: false })

    expect(resent).toEqual(['challenge-1'])
  })
})

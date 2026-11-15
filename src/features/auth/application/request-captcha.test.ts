import { describe, expect, it } from 'vitest'
import type { Captcha } from '../domain/captcha'
import { makeRequestCaptcha } from './request-captcha'

const captcha: Captcha = { key: 'captcha-1', image: 'data:image/png;base64,AAAA' }

describe('request captcha', () => {
  it('asks the issuer for a fresh captcha each time', async () => {
    let issued = 0
    const requestCaptcha = makeRequestCaptcha({
      issueCaptcha: async () => {
        issued += 1
        return captcha
      },
    })

    await requestCaptcha()
    const second = await requestCaptcha()

    expect(second).toEqual(captcha)
    expect(issued).toBe(2)
  })

  it('lets a failure from the issuer reach the caller', async () => {
    const failure = new Error('unavailable')
    const requestCaptcha = makeRequestCaptcha({ issueCaptcha: () => Promise.reject(failure) })

    await expect(requestCaptcha()).rejects.toBe(failure)
  })
})

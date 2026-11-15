import { describe, expect, it } from 'vitest'
import { CaptchaRejectedError, CredentialsRejectedError } from '../application/sign-in'
import { OneTimeCodeRejectedError } from '../application/verify-one-time-code'
import type { SignInAttempt, SignInChallenge } from '../domain/authentication'
import { HttpAuthApi } from './http-auth-api'

interface RecordedRequest {
  url: string
  method: string
  contentType?: string | null
  credentials?: RequestCredentials
  body?: unknown
}

/** Stands in for the network: records each request and answers with the given response. */
function fakeFetch(respond: () => Response) {
  const requests: RecordedRequest[] = []
  const fetch: typeof globalThis.fetch = async (input, init) => {
    const request: RecordedRequest = { url: String(input), method: init?.method ?? 'GET' }
    if (init?.body !== undefined) {
      request.contentType = new Headers(init.headers).get('Content-Type')
      request.credentials = init.credentials
      request.body = JSON.parse(String(init.body))
    }
    requests.push(request)
    return respond()
  }
  return { fetch, requests }
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

const DEVICE_ID = '1adad3ef-bea8-40a3-8a64-11188e16fece'

<<<<<<< HEAD
function makeApi(fetch: typeof globalThis.fetch, baseUrl = 'https://auth.example.com') {
  return new HttpAuthApi({ baseUrl, fetch, deviceId: () => DEVICE_ID })
=======
const NOW = Date.UTC(2026, 10, 15, 12, 0, 0)

function makeApi(fetch: typeof globalThis.fetch, baseUrl = 'https://auth.example.com') {
  return new HttpAuthApi({ baseUrl, fetch, deviceId: () => DEVICE_ID, now: () => NOW })
>>>>>>> development
}

const captchaBody = { captcha_key: '4b8730977b9f4bed9fe43419fb26a839', image: 'data:image/png;base64,iVBORw0KGgo=' }

const attempt: SignInAttempt = {
  credentials: { email: 'ada@example.com', password: 'Secret1!' },
  captcha: { key: '56babc286622444a9645b50a8f7d9939', text: 'QZWL' },
  remember: true,
}

/** What the service answers when the credentials are right and a one-time code must follow. */
const otpRequiredBody = {
  success: true,
  otp_required: true,
  otp_code: '949661',
  challenge_token: '8D668890B52ADA80405A821AE4E5668EE8C624EC4A7DB9614B32CDBD3D77D223',
  user_id: 2763,
}

describe('HTTP auth API', () => {
  describe('issuing a captcha', () => {
    it('fetches one from the captcha endpoint and reads its key and picture', async () => {
      const { fetch, requests } = fakeFetch(() => json(captchaBody))

      const captcha = await makeApi(fetch, 'https://auth.example.com/').issueCaptcha()

      expect(captcha).toEqual({ key: captchaBody.captcha_key, image: captchaBody.image })
      expect(requests).toEqual([{ url: 'https://auth.example.com/auth/captcha', method: 'GET' }])
    })

    it('accepts a base URL without a trailing slash', async () => {
      const { fetch, requests } = fakeFetch(() => json(captchaBody))

      await makeApi(fetch, 'https://auth.example.com').issueCaptcha()

      expect(requests[0].url).toBe('https://auth.example.com/auth/captcha')
    })

    it('fails when the server answers with an error status', async () => {
      const { fetch } = fakeFetch(() => json({ message: 'boom' }, 503))

      await expect(makeApi(fetch).issueCaptcha()).rejects.toThrow('503')
    })

    it('fails when the answer is not a captcha', async () => {
      const { fetch } = fakeFetch(() => json({ captcha_key: 'key-only' }))

      await expect(makeApi(fetch).issueCaptcha()).rejects.toThrow('captcha')
    })
  })

  describe('verifying credentials', () => {
    it('posts the attempt as an admin sign-in from this device, with cookies, to the login endpoint', async () => {
      const { fetch, requests } = fakeFetch(() => json(otpRequiredBody))

      await makeApi(fetch).verifyCredentials(attempt)

      expect(requests).toEqual([
        {
          url: 'https://auth.example.com/auth/login',
          method: 'POST',
          contentType: 'application/json',
          credentials: 'include',
          body: {
            captcha: 'QZWL',
            captcha_key: '56babc286622444a9645b50a8f7d9939',
            client_type: 'admin',
            device_id: DEVICE_ID,
            email: 'ada@example.com',
            password: 'Secret1!',
            remember: true,
            remote_login: true,
          },
        },
      ])
    })

    it('issues a challenge for the user, revealing the code when the service hands it back', async () => {
      const { fetch } = fakeFetch(() => json(otpRequiredBody))

      const challenge = await makeApi(fetch).verifyCredentials(attempt)

<<<<<<< HEAD
      expect(challenge).toEqual({ id: '2763', email: 'ada@example.com', revealedCode: '949661' })
=======
      expect(challenge).toEqual({ id: '2763', email: 'ada@example.com', remember: true, revealedCode: '949661' })
>>>>>>> development
    })

    it('keeps the code hidden when the service does not hand it back', async () => {
      const { otp_code: _, ...withoutCode } = otpRequiredBody
      const { fetch } = fakeFetch(() => json(withoutCode))

      const challenge = await makeApi(fetch).verifyCredentials(attempt)

<<<<<<< HEAD
      expect(challenge).toEqual({ id: '2763', email: 'ada@example.com' })
=======
      expect(challenge).toEqual({ id: '2763', email: 'ada@example.com', remember: true })
>>>>>>> development
    })

    it('reports wrong credentials when the service answers 401', async () => {
      const { fetch } = fakeFetch(() => json({ error: 'Kullanıcı adı veya parola hatalı' }, 401))

      await expect(makeApi(fetch).verifyCredentials(attempt)).rejects.toBeInstanceOf(CredentialsRejectedError)
    })

    it('reports a wrong captcha answer when the service answers 422', async () => {
      const { fetch } = fakeFetch(() => json({ error: 'Güvenlik kodu yanlış' }, 422))

      await expect(makeApi(fetch).verifyCredentials(attempt)).rejects.toBeInstanceOf(CaptchaRejectedError)
    })

    it('fails on any other error status', async () => {
      const { fetch } = fakeFetch(() => json({ error: 'boom' }, 500))

      await expect(makeApi(fetch).verifyCredentials(attempt)).rejects.toThrow('500')
    })

    it('fails when the service does not ask for a one-time code, a sign-in it does not yet support', async () => {
      const { fetch } = fakeFetch(() => json({ success: true, otp_required: false }))

      await expect(makeApi(fetch).verifyCredentials(attempt)).rejects.toThrow('one-time code')
    })
  })

  describe('verifying a one-time code', () => {
<<<<<<< HEAD
    const challenge: SignInChallenge = { id: '2763', email: 'ada@example.com' }

    /** What the service answers when the code is right, trimmed to what matters here. */
    const verifiedBody = {
      success: true,
      access_token: 'header.payload.signature',
      expires_in: 3599,
      refresh_token: 'opaque-refresh-token',
      redirect_url: '/home',
      user: { id: 2763, email: 'ada@example.com' },
    }

    it('posts the code for the challenged user, with cookies, and opens a session with the access token', async () => {
      const { fetch, requests } = fakeFetch(() => json(verifiedBody))

      const session = await makeApi(fetch).verifyCode(challenge, '535744')

      expect(session).toEqual({ email: 'ada@example.com', accessToken: 'header.payload.signature' })
=======
    const challenge: SignInChallenge = { id: '2763', email: 'ada@example.com', remember: true }

    /** What the service answers once the code is right (trimmed to what matters here). */
    const verifiedBody = {
      success: true,
      redirect_url: '/home',
      access_token: 'eyJ.access.token',
      refresh_token: 'refresh-token',
      expires_in: 3599,
      session_time: 15,
      last_failed_login_message: null,
      user: { id: 2763, first_name: 'Ada', last_name: 'Lovelace', name: 'Ada Lovelace', email: 'ada@example.com' },
    }

    it('posts the code for the challenged user, with cookies', async () => {
      const { fetch, requests } = fakeFetch(() => json(verifiedBody))

      await makeApi(fetch).verifyCode(challenge, '535744')

>>>>>>> development
      expect(requests).toEqual([
        {
          url: 'https://auth.example.com/auth/otp/verify',
          method: 'POST',
          contentType: 'application/json',
          credentials: 'include',
          body: { client_type: 'admin', otp: '535744', user_id: 2763 },
        },
      ])
    })

<<<<<<< HEAD
=======
    it('opens a session for the user with their tokens, expiring when the access token does', async () => {
      const { fetch } = fakeFetch(() => json(verifiedBody))

      const session = await makeApi(fetch).verifyCode(challenge, '535744')

      expect(session).toEqual({
        user: { id: '2763', name: 'Ada Lovelace', email: 'ada@example.com' },
        tokens: { accessToken: 'eyJ.access.token', refreshToken: 'refresh-token', expiresAt: NOW + 3599 * 1000 },
        remember: true,
      })
    })

    it('fails when the answer carries no tokens', async () => {
      const { fetch } = fakeFetch(() => json({ success: true, user: verifiedBody.user }))

      await expect(makeApi(fetch).verifyCode(challenge, '535744')).rejects.toThrow('session')
    })

>>>>>>> development
    it.each([400, 401, 422])('reports a wrong or expired code when the service answers %i', async (status) => {
      const { fetch } = fakeFetch(() => json({ error: 'Doğrulama kodunun süresi dolmuş veya geçersiz' }, status))

      await expect(makeApi(fetch).verifyCode(challenge, '000000')).rejects.toBeInstanceOf(OneTimeCodeRejectedError)
    })

    it('fails on any other error status', async () => {
      const { fetch } = fakeFetch(() => json({ error: 'boom' }, 500))

      await expect(makeApi(fetch).verifyCode(challenge, '535744')).rejects.toThrow('500')
    })
<<<<<<< HEAD

    it('fails when the service accepts the code but hands back no access token', async () => {
      const { fetch } = fakeFetch(() => json({ success: true }))

      await expect(makeApi(fetch).verifyCode(challenge, '535744')).rejects.toThrow('access token')
    })
=======
>>>>>>> development
  })
})

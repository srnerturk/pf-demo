import { describe, expect, it } from 'vitest'
import { HttpAuthApi } from './http-auth-api'

interface RecordedRequest {
  url: string
  method: string
}

/** Stands in for the network: records each request and answers with the given response. */
function fakeFetch(respond: () => Response) {
  const requests: RecordedRequest[] = []
  const fetch: typeof globalThis.fetch = async (input, init) => {
    requests.push({ url: String(input), method: init?.method ?? 'GET' })
    return respond()
  }
  return { fetch, requests }
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

const captchaBody = { captcha_key: '4b8730977b9f4bed9fe43419fb26a839', image: 'data:image/png;base64,iVBORw0KGgo=' }

describe('HTTP auth API', () => {
  describe('issuing a captcha', () => {
    it('fetches one from the captcha endpoint and reads its key and picture', async () => {
      const { fetch, requests } = fakeFetch(() => json(captchaBody))
      const api = new HttpAuthApi({ baseUrl: 'https://auth.example.com/', fetch })

      const captcha = await api.issueCaptcha()

      expect(captcha).toEqual({ key: captchaBody.captcha_key, image: captchaBody.image })
      expect(requests).toEqual([{ url: 'https://auth.example.com/auth/captcha', method: 'GET' }])
    })

    it('accepts a base URL without a trailing slash', async () => {
      const { fetch, requests } = fakeFetch(() => json(captchaBody))
      const api = new HttpAuthApi({ baseUrl: 'https://auth.example.com', fetch })

      await api.issueCaptcha()

      expect(requests[0].url).toBe('https://auth.example.com/auth/captcha')
    })

    it('fails when the server answers with an error status', async () => {
      const { fetch } = fakeFetch(() => json({ message: 'boom' }, 503))
      const api = new HttpAuthApi({ baseUrl: 'https://auth.example.com', fetch })

      await expect(api.issueCaptcha()).rejects.toThrow('503')
    })

    it('fails when the answer is not a captcha', async () => {
      const { fetch } = fakeFetch(() => json({ captcha_key: 'key-only' }))
      const api = new HttpAuthApi({ baseUrl: 'https://auth.example.com', fetch })

      await expect(api.issueCaptcha()).rejects.toThrow('captcha')
    })
  })
})

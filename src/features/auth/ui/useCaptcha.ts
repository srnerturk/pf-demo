import { useCallback, useEffect, useState } from 'react'
import type { RequestCaptcha } from '../application/request-captcha'
import type { Captcha } from '../domain/captcha'

export type CaptchaState = { status: 'loading' } | { status: 'ready'; captcha: Captcha } | { status: 'failed' }

/** What came back for one request; a newer request makes it stale. */
type Answer = { request: number } & ({ captcha: Captcha } | { failed: true })

/** Fetches a captcha on mount and whenever `refresh` is called; only the latest request's answer counts. */
export function useCaptcha(requestCaptcha: RequestCaptcha) {
  const [request, setRequest] = useState(0)
  const [answer, setAnswer] = useState<Answer | null>(null)

  useEffect(() => {
    let latest = true
    requestCaptcha().then(
      (captcha) => latest && setAnswer({ request, captcha }),
      () => latest && setAnswer({ request, failed: true }),
    )
    return () => {
      latest = false
    }
  }, [request, requestCaptcha])

  const refresh = useCallback(() => setRequest((previous) => previous + 1), [])

  const state: CaptchaState =
    answer === null || answer.request !== request
      ? { status: 'loading' }
      : 'captcha' in answer
        ? { status: 'ready', captcha: answer.captcha }
        : { status: 'failed' }

  return { state, refresh }
}

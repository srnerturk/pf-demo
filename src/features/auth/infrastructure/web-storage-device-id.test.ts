import { beforeEach, describe, expect, it } from 'vitest'
import { WebStorageDeviceId } from './web-storage-device-id'

/** Hands out device-1, device-2… so tests can tell a reused id from a new one. */
function sequentialIds() {
  let issued = 0
  return () => `device-${++issued}`
}

describe('WebStorageDeviceId', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('creates an id on first use and keeps answering with it', () => {
    const deviceId = new WebStorageDeviceId(window.localStorage, sequentialIds())

    expect(deviceId.current()).toBe('device-1')
    expect(deviceId.current()).toBe('device-1')
  })

  it('reuses the id created on an earlier visit', () => {
    new WebStorageDeviceId(window.localStorage, sequentialIds()).current()

    expect(new WebStorageDeviceId(window.localStorage, () => 'device-new').current()).toBe('device-1')
  })

  it('keeps one id for this visit when the browser refuses to store it', () => {
    const refusingStorage = {
      getItem: () => null,
      setItem: () => {
        throw new DOMException('Storage is disabled', 'SecurityError')
      },
    }
    const deviceId = new WebStorageDeviceId(refusingStorage, sequentialIds())

    expect(deviceId.current()).toBe('device-1')
    expect(deviceId.current()).toBe('device-1')
  })
})

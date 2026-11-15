import { afterEach, describe, expect, it, vi } from 'vitest'
import { saveFileInBrowser } from './save-file'

describe('saveFileInBrowser', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('downloads the content under the given name and frees the object URL', () => {
    const createObjectURL = vi.fn<(blob: Blob) => string>().mockReturnValue('blob:users')
    const revokeObjectURL = vi.fn<(url: string) => void>()
    vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL })
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    saveFileInBrowser({ name: 'users.csv', content: 'a,b', mediaType: 'text/csv' })

    const blob = createObjectURL.mock.calls[0][0]
    expect(blob.type).toBe('text/csv')
    expect(click).toHaveBeenCalledOnce()
    expect(click.mock.contexts[0]).toMatchObject({ download: 'users.csv', href: 'blob:users' })
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:users')
  })
})

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SearchInput } from './SearchInput'

describe('SearchInput', () => {
  it('is a named search box that reports what is typed', async () => {
    const onChange = vi.fn<(value: string) => void>()
    render(<SearchInput label="Kullanıcı ara" placeholder="Ara…" value="" onValueChange={onChange} />)

    await userEvent.type(screen.getByRole('searchbox', { name: 'Kullanıcı ara' }), 'a')

    expect(onChange).toHaveBeenCalledWith('a')
  })
})

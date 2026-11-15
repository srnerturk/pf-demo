import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SelectField } from './SelectField'

const options = [
  { value: 'finance', label: 'Finans' },
  { value: 'risk', label: 'Risk' },
]

describe('SelectField', () => {
  it('shows the placeholder until something is chosen, then reports the choice', async () => {
    const onValueChange = vi.fn<(value: string) => void>()
    const user = userEvent.setup()
    render(<SelectField id="group" label="Kullanıcı grubu" placeholder="Grup seçin" options={options} value="" onValueChange={onValueChange} />)
    const select = screen.getByRole('combobox', { name: 'Kullanıcı grubu' })
    expect(select).toHaveTextContent('Grup seçin')

    await user.click(select)
    await user.click(screen.getByRole('option', { name: 'Risk' }))

    expect(onValueChange).toHaveBeenCalledWith('risk')
  })

  it('shows the chosen option', () => {
    render(<SelectField id="group" label="Kullanıcı grubu" options={options} value="finance" onValueChange={() => {}} />)

    expect(screen.getByRole('combobox', { name: 'Kullanıcı grubu' })).toHaveTextContent('Finans')
  })

  it('shows its error and marks the control invalid', () => {
    render(<SelectField id="group" label="Kullanıcı grubu" options={options} value="" onValueChange={() => {}} error="Bu alan zorunlu." />)

    const select = screen.getByRole('combobox', { name: 'Kullanıcı grubu' })
    expect(select).toHaveAttribute('aria-invalid', 'true')
    expect(select).toHaveAccessibleDescription('Bu alan zorunlu.')
  })
})

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { TestI18nProvider } from '@/test/i18n'
import { ImageFileField } from './ImageFileField'

function Harness({ error }: { error?: string }) {
  const [file, setFile] = useState<File | null>(null)
  return (
    <TestI18nProvider>
      <ImageFileField id="photo" label="Profil fotoğrafı" hint="JPEG veya PNG" accept="image/png,image/jpeg" value={file} onChange={setFile} error={error} />
      <output aria-label="Chosen">{file ? `chosen ${file.name}` : 'none'}</output>
    </TestI18nProvider>
  )
}

const photo = () => new File(['png'], 'ada.png', { type: 'image/png' })

describe('ImageFileField', () => {
  it('lets the person choose a photo, previews it, and remove it again', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    expect(screen.getByLabelText('Profil fotoğrafı')).toHaveAccessibleDescription('JPEG veya PNG')

    await user.upload(screen.getByLabelText('Profil fotoğrafı'), photo())

    expect(screen.getByRole('status', { name: 'Chosen' })).toHaveTextContent('chosen ada.png')
    expect(await screen.findByRole('img', { name: 'Seçilen fotoğrafın önizlemesi' })).toBeInTheDocument()
    expect(screen.getByText('ada.png')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Kaldır' }))

    expect(screen.getByRole('status', { name: 'Chosen' })).toHaveTextContent('none')
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('shows its error in place of the hint', () => {
    render(<Harness error="Yalnızca JPEG veya PNG yükleyebilirsiniz." />)

    expect(screen.getByLabelText('Profil fotoğrafı')).toHaveAccessibleDescription('Yalnızca JPEG veya PNG yükleyebilirsiniz.')
    expect(screen.getByLabelText('Profil fotoğrafı')).toHaveAttribute('aria-invalid', 'true')
  })
})

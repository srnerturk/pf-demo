import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TestI18nProvider } from '@/test/i18n'
import { EmailAlreadyInUseError, type CreateUser } from '../application/create-user'
import type { User } from '../domain/user'
import { CreateUserDialog } from './CreateUserDialog'
import { testGroups } from './test-directory'

const created: User = {
  id: 24,
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  status: 'active',
  roles: ['MUHASEBE'],
  createdAt: new Date(0),
  updatedAt: new Date(0),
}

function renderDialog(createUser: CreateUser = vi.fn<CreateUser>().mockResolvedValue(created)) {
  const user = userEvent.setup()
  const onCreated = vi.fn<(user: User) => void>()
  const onOpenChange = vi.fn<(open: boolean) => void>()
  render(
    <TestI18nProvider>
      <CreateUserDialog
        open
        onOpenChange={onOpenChange}
        createUser={createUser}
        listUserGroups={async () => testGroups.map(({ id, name }) => ({ id, name }))}
        onCreated={onCreated}
      />
    </TestI18nProvider>,
  )
  return { user, createUser, onCreated, onOpenChange }
}

const dialog = () => screen.getByRole('dialog', { name: 'Kullanıcı oluştur' })

async function choose(user: ReturnType<typeof userEvent.setup>, field: string, option: string | RegExp) {
  await user.click(within(dialog()).getByRole('combobox', { name: field }))
  await user.click(await screen.findByRole('option', { name: option }))
}

async function fillIn(user: ReturnType<typeof userEvent.setup>) {
  await user.type(within(dialog()).getByLabelText('İsim'), 'Ada')
  await user.type(within(dialog()).getByLabelText('Soyad'), 'Lovelace')
  await user.type(within(dialog()).getByLabelText('E-posta'), 'ada@example.com')
  await choose(user, 'Kullanıcı grubu', 'Finans')
}

const save = (user: ReturnType<typeof userEvent.setup>) => user.click(within(dialog()).getByRole('button', { name: 'Kaydet' }))

describe('CreateUserDialog', () => {
  it('explains what is missing and creates nothing when saved empty', async () => {
    const { user, createUser } = renderDialog()

    await save(user)

    expect(await within(dialog()).findAllByText('Bu alan zorunlu.')).toHaveLength(4)
    expect(within(dialog()).getByLabelText('İsim')).toHaveAttribute('aria-invalid', 'true')
    expect(within(dialog()).getByRole('combobox', { name: 'Kullanıcı grubu' })).toHaveAttribute('aria-invalid', 'true')
    expect(createUser).not.toHaveBeenCalled()
  })

  it('creates the user with everything entered', async () => {
    const { user, createUser, onCreated } = renderDialog()
    const photo = new File(['png'], 'ada.png', { type: 'image/png' })

    await choose(user, 'Dil', 'English')
    await fillIn(user)
    await user.type(within(dialog()).getByLabelText('Telefon (isteğe bağlı)'), '532 123 45 67')
    await user.upload(within(dialog()).getByLabelText('Profil fotoğrafı'), photo)
    await save(user)

    await vi.waitFor(() => expect(onCreated).toHaveBeenCalledWith(created))
    expect(createUser).toHaveBeenCalledWith({
      language: 'en',
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      phone: { countryCode: '+90', nationalNumber: '532 123 45 67' },
      userGroupId: 'finance',
      profilePhoto: { mediaType: 'image/png', sizeBytes: photo.size, content: photo },
    })
  })

  it('starts in the interface language and Turkey’s dialling code', () => {
    renderDialog()

    expect(within(dialog()).getByRole('combobox', { name: 'Dil' })).toHaveTextContent('Türkçe')
    expect(within(dialog()).getByRole('combobox', { name: 'Ülke kodu' })).toHaveTextContent('+90')
  })

  it('rejects a phone number that is too short and a photo that is too large', async () => {
    const { user, createUser } = renderDialog()

    await fillIn(user)
    await user.type(within(dialog()).getByLabelText('Telefon (isteğe bağlı)'), '532')
    await user.upload(
      within(dialog()).getByLabelText('Profil fotoğrafı'),
      new File([new Uint8Array(1024 * 1024 + 1)], 'huge.png', { type: 'image/png' }),
    )
    await save(user)

    expect(await within(dialog()).findByText('Geçerli bir telefon numarası girin.')).toBeInTheDocument()
    expect(within(dialog()).getByText('Fotoğraf en fazla 1024 KB olabilir.')).toBeInTheDocument()
    expect(createUser).not.toHaveBeenCalled()
  })

  it('points at the email when it is already in use', async () => {
    const { user } = renderDialog(vi.fn<CreateUser>().mockRejectedValue(new EmailAlreadyInUseError('ada@example.com')))

    await fillIn(user)
    await save(user)

    expect(await within(dialog()).findByText('Bu e-posta adresiyle kayıtlı bir kullanıcı var.')).toBeInTheDocument()
    expect(within(dialog()).getByLabelText('E-posta')).toHaveAttribute('aria-invalid', 'true')
  })

  it('keeps the input and reports the problem when creating fails', async () => {
    const { user, onCreated } = renderDialog(vi.fn<CreateUser>().mockRejectedValue(new Error('service unavailable')))

    await fillIn(user)
    await save(user)

    expect(await within(dialog()).findByRole('alert')).toHaveTextContent('Kullanıcı oluşturulamadı. Lütfen tekrar deneyin.')
    expect(within(dialog()).getByLabelText('İsim')).toHaveValue('Ada')
    expect(onCreated).not.toHaveBeenCalled()
  })

  it('closes on cancel', async () => {
    const { user, onOpenChange } = renderDialog()

    await user.click(within(dialog()).getByRole('button', { name: 'İptal' }))

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})

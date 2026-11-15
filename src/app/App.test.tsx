import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import { makeRequestCaptcha } from '@/features/auth/application/request-captcha'
import { makeResendOneTimeCode } from '@/features/auth/application/resend-one-time-code'
import { makeSignIn } from '@/features/auth/application/sign-in'
import { makeVerifyOneTimeCode } from '@/features/auth/application/verify-one-time-code'
import { InMemoryAuthenticator } from '@/features/auth/infrastructure/in-memory-authenticator'
import { WebStorageSessionStore } from '@/features/auth/infrastructure/web-storage-session-store'
import { WebStorageThemePreferenceStore } from '@/features/theme/infrastructure/web-storage-theme-preference-store'
import { makeChangeUsersStatus } from '@/features/users/application/change-users-status'
import { makeCreateUser } from '@/features/users/application/create-user'
import { makeExportUsers } from '@/features/users/application/export-users'
import { makeListUserGroups } from '@/features/users/application/list-user-groups'
import { makeListUsers } from '@/features/users/application/list-users'
import { demoUserGroups, demoUsers } from '@/features/users/infrastructure/demo-user-directory'
import { InMemoryUserDirectory } from '@/features/users/infrastructure/in-memory-user-directory'
import { WebStorageLocalePreferenceStore } from '@/shared/i18n/web-storage-locale-preference-store'
import { App } from './App'

const account = { email: 'ada@example.com', password: 'password123', oneTimeCode: '123456' }
const captcha = { key: 'captcha-1', image: 'data:image/png;base64,AAAA' }

function CurrentPath() {
  return <output aria-label="Current path">{useLocation().pathname}</output>
}

function renderApp({ at = '/', signedInAs }: { at?: string; signedInAs?: string } = {}) {
  const user = userEvent.setup()
  const authenticator = new InMemoryAuthenticator({ account })
  const sessionStore = new WebStorageSessionStore(window.localStorage)
  const userDirectory = new InMemoryUserDirectory({ users: demoUsers, groups: demoUserGroups })
  if (signedInAs) sessionStore.save({ email: signedInAs, accessToken: 'remembered-access-token' })

  render(
    <MemoryRouter initialEntries={[at]}>
      <App
        signIn={makeSignIn(authenticator)}
        requestCaptcha={makeRequestCaptcha({ issueCaptcha: async () => captcha })}
        verifyOneTimeCode={makeVerifyOneTimeCode(authenticator)}
        resendOneTimeCode={makeResendOneTimeCode(authenticator)}
        sessionStore={sessionStore}
        themePreferenceStore={new WebStorageThemePreferenceStore(window.localStorage)}
        systemPrefersDark={false}
        localePreferenceStore={new WebStorageLocalePreferenceStore(window.localStorage)}
        preferredLanguages={['tr-TR']}
        userManagement={{
          listUsers: makeListUsers(userDirectory),
          exportUsers: makeExportUsers(userDirectory),
          createUser: makeCreateUser(userDirectory),
          changeUsersStatus: makeChangeUsersStatus(userDirectory),
          listUserGroups: makeListUserGroups(userDirectory),
          saveFile: () => {},
          searchDelayMs: 0,
        }}
        footnote="Demo account details"
      />
      <CurrentPath />
    </MemoryRouter>,
  )
  return { user, sessionStore }
}

const currentPath = () => screen.getByRole('status', { name: 'Current path' })

describe('App', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.classList.remove('dark')
    document.documentElement.lang = ''
  })

  it('sends a signed-out visitor to the sign-in page', () => {
    renderApp({ at: '/' })

    expect(currentPath()).toHaveTextContent('/auth/login')
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('sends a signed-out visitor from an unknown address to the sign-in page', () => {
    renderApp({ at: '/does-not-exist' })

    expect(currentPath()).toHaveTextContent('/auth/login')
  })

  it('signs a person in with their password and emailed code, opens the dashboard, and signs out again', async () => {
    const { user, sessionStore } = renderApp({ at: '/auth/login' })

    await user.type(screen.getByLabelText('Email'), account.email)
    await user.type(screen.getByLabelText('Password'), account.password)
    await screen.findByRole('img', { name: 'Security code to type' })
    await user.type(screen.getByLabelText('Security code'), 'QZWL')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    await screen.findByRole('heading', { name: 'Check your email' })
    await user.keyboard('000000')
    await user.click(screen.getByRole('button', { name: 'Verify' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('That code isn’t right.')

    await user.keyboard(account.oneTimeCode)
    await user.click(screen.getByRole('button', { name: 'Verify' }))
    expect(await screen.findByRole('heading', { name: 'Gösterge Paneli' })).toBeInTheDocument()
    expect(currentPath()).toHaveTextContent(/^\/$/)
    expect(within(screen.getByRole('banner')).getByText(account.email)).toBeInTheDocument()
    expect(sessionStore.load()).toEqual({ email: account.email, accessToken: expect.any(String) })

    await user.click(screen.getByRole('button', { name: 'Çıkış yap' }))
    expect(currentPath()).toHaveTextContent('/auth/login')
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveValue('')
    expect(sessionStore.load()).toBeNull()
  })

  it('refuses a wrong password', async () => {
    const { user } = renderApp({ at: '/auth/login' })

    await user.type(screen.getByLabelText('Email'), account.email)
    await user.type(screen.getByLabelText('Password'), 'not-the-password')
    await screen.findByRole('img', { name: 'Security code to type' })
    await user.type(screen.getByLabelText('Security code'), 'QZWL')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('That email and password don’t match an account.')
  })

  it('opens the dashboard for a session remembered from an earlier visit', () => {
    renderApp({ at: '/', signedInAs: account.email })

    expect(screen.getByRole('heading', { name: 'Gösterge Paneli' })).toBeInTheDocument()
    expect(within(screen.getByRole('banner')).getByText(account.email)).toBeInTheDocument()
  })

  it('sends a signed-in person away from the sign-in page to the dashboard', () => {
    renderApp({ at: '/auth/login', signedInAs: account.email })

    expect(currentPath()).toHaveTextContent(/^\/$/)
    expect(screen.getByRole('heading', { name: 'Gösterge Paneli' })).toBeInTheDocument()
  })

  it('shows the footnote below the sign-in flow', () => {
    renderApp({ at: '/auth/login' })

    expect(screen.getByText('Demo account details')).toBeInTheDocument()
  })

  it('opens a page from the side menu', async () => {
    const { user } = renderApp({ at: '/', signedInAs: account.email })
    const menu = screen.getByRole('navigation', { name: 'Ana menü' })

    await user.click(within(menu).getByRole('button', { name: 'Giriş Kontrolü' }))
    await user.click(within(menu).getByRole('link', { name: 'Roller' }))

    expect(currentPath()).toHaveTextContent('/access-control/roles')
    expect(screen.getByRole('heading', { name: 'Roller' })).toBeInTheDocument()
    const breadcrumb = screen.getByRole('navigation', { name: 'Konum' })
    expect(within(breadcrumb).getByRole('link', { name: 'Ana sayfa' })).toHaveAttribute('href', '/')
    expect(breadcrumb).toHaveTextContent('Giriş Kontrolü')
  })

  it('offers the configuration and management sections in the side menu', () => {
    renderApp({ at: '/', signedInAs: account.email })
    const menu = screen.getByRole('navigation', { name: 'Ana menü' })

    expect(within(menu).getByRole('button', { name: 'Yapılandırma' })).toBeInTheDocument()
    expect(within(menu).getByRole('button', { name: 'Yönetim' })).toBeInTheDocument()
  })

  it('sends a signed-out visitor from a menu page to the sign-in page', () => {
    renderApp({ at: '/access-control/users' })

    expect(currentPath()).toHaveTextContent('/auth/login')
  })

  it('switches the dashboard to the dark theme and remembers it for the next visit', async () => {
    const { user } = renderApp({ at: '/', signedInAs: account.email })

    await user.click(within(screen.getByRole('banner')).getByRole('button', { name: 'Koyu temaya geç' }))

    expect(document.documentElement).toHaveClass('dark')
    expect(new WebStorageThemePreferenceStore(window.localStorage).load()).toBe('dark')
  })

  it('switches the dashboard to English and remembers it for the next visit', async () => {
    const { user } = renderApp({ at: '/', signedInAs: account.email })

    await user.click(within(screen.getByRole('banner')).getByRole('combobox', { name: 'Dil' }))
    await user.click(screen.getByRole('option', { name: 'English' }))

    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    expect(within(screen.getByRole('navigation', { name: 'Main menu' })).getByRole('button', { name: 'Access Control' })).toBeInTheDocument()
    expect(within(screen.getByRole('banner')).getByRole('button', { name: 'Sign out' })).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('en')
    expect(new WebStorageLocalePreferenceStore(window.localStorage).load()).toBe('en')
  })

  it('opens user management from the side menu and adds a user to the list', async () => {
    const { user } = renderApp({ at: '/', signedInAs: account.email })
    const menu = screen.getByRole('navigation', { name: 'Ana menü' })

    await user.click(within(menu).getByRole('button', { name: 'Giriş Kontrolü' }))
    await user.click(within(menu).getByRole('link', { name: 'Kullanıcı Yönetimi' }))

    expect(currentPath()).toHaveTextContent('/access-control/users')
    expect(screen.getByRole('heading', { level: 1, name: 'Kullanıcı Yönetimi' })).toBeInTheDocument()
    expect(await screen.findByText('Toplam 119 kayıt')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Kullanıcı ekle' }))
    const dialog = screen.getByRole('dialog', { name: 'Kullanıcı oluştur' })
    await user.type(within(dialog).getByLabelText('İsim'), 'Ada')
    await user.type(within(dialog).getByLabelText('Soyad'), 'Lovelace')
    await user.type(within(dialog).getByLabelText('E-posta'), 'ada@example.com')
    await user.click(within(dialog).getByRole('combobox', { name: 'Kullanıcı grubu' }))
    await user.click(await screen.findByRole('option', { name: 'Finans' }))
    await user.click(within(dialog).getByRole('button', { name: 'Kaydet' }))

    expect(await screen.findByText('Ada Lovelace oluşturuldu.')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(await screen.findByText('Toplam 120 kayıt')).toBeInTheDocument()
    expect(within(screen.getByRole('table', { name: 'Kullanıcı Listesi' })).getAllByRole('row')[1]).toHaveTextContent('Ada Lovelace')
  })
})

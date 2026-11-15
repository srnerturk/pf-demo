# pf-demo

Vite + React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui + React Router + React Hook Form, tested with Vitest and Testing Library.

## Scripts

| Command              | What it does                                  |
| -------------------- | --------------------------------------------- |
| `npm run dev`        | Start the dev server                          |
| `npm test`           | Run the test suite once                       |
| `npm run test:watch` | Run tests in watch mode (use while doing TDD) |
| `npm run typecheck`  | Type-check app, tests and config              |
| `npm run lint`       | Lint with oxlint (includes layer boundaries)  |
| `npm run build`      | Type-check and build for production           |
| `npm run preview`    | Serve the production build                    |

## Architecture

Code is organised by feature, and each feature is split into layers whose
dependencies point **inward only**:

```
src/
├── main.tsx                      # Composition root: picks adapters and the router, injects them
├── index.css                     # Tailwind entry + global design tokens (light/dark)
├── app/
│   ├── App.tsx                   # Routes and who may see them; receives use cases as props
│   ├── paths.ts                  # Every URL the app answers to
│   ├── routing/                  # Route guards (RequireSession, RedirectIfSignedIn)
│   ├── layouts/                  # Page frames (DashboardLayout: side menu + header with theme switch and sign out)
│   ├── navigation/               # Side menu: its shape (menu.ts), the admin menu data, SideMenu
│   ├── pages/                    # Pages that compose features (SignInPage, MenuItemPage)
│   └── components/               # App-specific pieces (BrandMark, PageHeader)
├── shared/
│   ├── lib/utils.ts              # cn(): class merging used by every component
│   ├── ui/                       # shadcn/ui primitives (button, input, card…), owned by us
│   ├── components/               # Our compositions of primitives (form fields, DataTable…)
│   └── i18n/                     # Turkish/English: catalogs, I18nProvider, useI18n, LocaleSwitcher
├── test/setup.ts                 # Vitest + jest-dom setup
└── features/contact/
    ├── domain/                   # Entities + business rules. Plain TS, no imports from outside.
    ├── application/              # Use cases + ports (interfaces they need from the outside world)
    ├── infrastructure/           # Adapters implementing ports (HTTP, storage, fakes…)
    └── ui/                       # React components (React Hook Form lives here)
```

`ui → application → domain` and `infrastructure → application → domain`.
`oxlint` fails the build if `domain/` or `application/` import React, React Hook
Form, or an outer layer (see `overrides` in `.oxlintrc.json`).

### Routing and session

React Router lives only in `app/` and `main.tsx`; features don't know about URLs.

| Path          | Who may see it | Otherwise                         |
| ------------- | -------------- | --------------------------------- |
| `/auth/login` | Signed out     | Signed-in people are sent to `/`  |
| `/`           | Signed in      | Signed-out people go to `/auth/login` |
| side-menu pages (`/access-control/*`, `/configuration/*`, `/management/*`) | Signed in | Signed-out people go to `/auth/login` |
| anything else | —              | Sent to `/`, then guarded as above |

- `SessionProvider` (`features/auth/ui`) holds who is signed in and exposes
  `useSession()` → `{ session, startSession, endSession }`. It remembers the
  session through the `SessionStore` port; `WebStorageSessionStore` backs it
  with `localStorage` in `main.tsx`.
- Guards only read the session. Signing in or out changes the session and the
  guards redirect, so pages never navigate by hand.
- `App` expects to be rendered inside a router: `BrowserRouter` in `main.tsx`,
  `MemoryRouter` with `initialEntries` in tests.

### Auth API

The PF auth service lives at `VITE_AUTH_API_BASE_URL` (default `https://pf-auth-uat.halkode.com.tr`).
`HttpAuthApi` (`features/auth/infrastructure`) is its adapter; `fetch` is injected so tests never touch the network.

- **Captcha** — `GET /auth/captcha` → `{ captcha_key, image }` (`image` is a PNG data URL). The sign-in
  form shows it, offers a new one on request, and fetches a new one after every failed attempt
  (a captcha answers one attempt).
- **Sign in** — `SignIn` takes a `SignInAttempt`: `{ credentials, captcha: { key, text }, remember }`
  ("Remember me" on the form). `POST /auth/login` (with cookies) sends it as
  `{ email, password, captcha, captcha_key, remember, device_id, client_type: "admin", remote_login: true }`:

  | Answer | Means | Becomes |
  | --- | --- | --- |
  | `200 { otp_required: true, user_id, otp_code?, challenge_token }` | Credentials accepted, a one-time code must follow; the challenge token is also set as an httponly `__Host-pf-login-otp-*` cookie | `SignInChallenge { id: String(user_id), revealedCode: otp_code }` |
  | `401 { error }` | Wrong email or password | `CredentialsRejectedError` |
  | `422 { error }` | Wrong (or expired) captcha answer | `CaptchaRejectedError` |

  A `200` without `otp_required` isn't supported yet and shows as a general failure.
- **One-time code** — `POST /auth/otp/verify` (with cookies) sends `{ client_type: "admin", otp, user_id }`.
  `400`/`401`/`422 { error }` (wrong or expired code) becomes `OneTimeCodeRejectedError`; any other
  success opens the session. When login hands back `otp_code` (UAT does), the code screen opens
  with it filled in. Resending is not wired yet: `InMemoryAuthenticator` only pretends to resend.
- **Device** — `WebStorageDeviceId` creates this browser's `device_id` once and keeps it in
  `localStorage` (key `pf-demo.device-id`); it falls back to one id per visit when storage is blocked.
- Signing in asks only that a password is given; its length is the server's rule.

### Side menu

`app/navigation/admin-menu.ts` lists the menu's sections (Giriş Kontrolü,
Yapılandırma, Yönetim) and their pages as message keys; the URLs come from `paths.ts`. `App`
turns every menu item into a route that shows `MenuItemPage` (title, breadcrumb,
empty state) until the page has a feature of its own. To build a page out, point
its route at a real page instead. `SideMenu` opens on the section of the current
page. Below `lg` the menu slides over the page from the header's menu button.

### Theme

`features/theme` lets a person switch between light and dark (the button in the
dashboard header) and remembers the choice:

- **Domain** (`theme.ts`): a person's choice wins; until they make one, the
  operating system preference decides (`initialTheme`).
- **Port** `ThemePreferenceStore`, backed by `WebStorageThemePreferenceStore`
  (`localStorage`, key `pf-demo.theme`) in `main.tsx`.
- **UI**: `ThemeProvider` wraps the whole app and puts the `dark` class on
  `<html>`; `useTheme()` → `{ theme, toggleTheme }`; `ThemeToggle` is the button.
- A small inline script in `index.html` applies the same rule before React loads,
  so a dark page doesn't flash light. Keep it in step with the domain rule and the storage key.

### Languages (i18n)

The interface speaks Turkish (default) and English; the switch sits in the dashboard header.
It lives in `shared/i18n` because shared components (table, pagination, file picker) need
their own labels too.

- **Catalogs** (`shared/i18n/catalog`): `tr.ts` is the source of truth; `en.ts` is typed
  `Messages`, so the build fails if English misses a key. A test checks both use the same
  `{placeholders}`. Group keys by area (`layout`, `menu`, `table`, `form`, `users`…).
- **Use**: `const { t, locale, formatDateTime } = useI18n()`; `t('users.create.title')`,
  `t('table.total', { count })`. Keys are type-checked. A `{ one, other }` message picks its
  plural form with `Intl.PluralRules`.
- **Rules** (`locale.ts`): a person's choice wins, then the first supported browser
  language, then Turkish. Remembered through the `LocalePreferenceStore` port
  (`WebStorageLocalePreferenceStore`, key `pf-demo.locale`); `<html lang>` follows.
- Domain rules still return violation codes; UIs map codes to message keys.
- Tests wrap components in `TestI18nProvider` (`src/test/i18n.tsx`, Turkish unless told otherwise).
- Not translated yet: the sign-in flow (English copy).

### UI kit and design tokens

- **Tokens** live in `src/index.css`: semantic CSS variables (`--primary`,
  `--muted-foreground`, `--destructive`, `--success`, `--sidebar-*`, `--radius`…) for light mode
  and, under the `.dark` class, for dark mode. `@theme inline` exposes
  them as Tailwind utilities (`bg-primary`, `text-muted-foreground`). Features use
  only these semantic utilities, never raw palette colours, so the theme changes in one place.
- **Primitives** (`shared/ui`) come from shadcn/ui and are configured by
  `components.json`. Add more with `npx shadcn@latest add <name>`; they land in
  `src/shared/ui` and import `cn` from `@/shared/lib/utils`.
- **Compositions** (`shared/components`) combine primitives into app-level
  building blocks with behaviour of their own, e.g. `FormField` (label, control
  and error wired for assistive technology) and `SubmitButton` (busy state that
  blocks double submission). Form fields: `TextField`, `SelectField`, `PhoneField`,
  `ImageFileField`, `SearchInput`, all built on `FormField`. Lists: `data-table/DataTable`
  (columns, sort, selection, loading/empty states; the caller owns paging) and
  `TablePagination`. Restyle these, not the feature screens.
- Feature UIs (`features/*/ui`) compose these; they hold no styling constants of their own.

### User management

`features/users` backs Giriş Kontrolü › Kullanıcı Yönetimi (`/access-control/users`,
page `app/pages/UsersPage.tsx`): search, sort, paging, bulk activate/deactivate, CSV export
and a create-user modal.

- **Domain**: `User`, `NewUser` rules (`required`, `invalid-email`, `invalid-phone`,
  `unsupported-photo-type`, `photo-too-large`: JPEG/PNG up to 1024 KB), `UserQuery`.
- **Application**: one port per capability (`UserFinder`, `UserCreator`,
  `UserStatusChanger`, `UserGroupCatalog`) and their use cases. Adapters throw
  `EmailAlreadyInUseError`.
- **Infrastructure**: `InMemoryUserDirectory` with demo data (`demo-user-directory.ts`, 119
  users). Swap in an HTTP adapter in `main.tsx` once the API exists.
- CSV files are written with `shared/lib/csv` and saved through the injected `SaveFile`
  (`saveFileInBrowser` in `main.tsx`).

### The example feature

`features/contact` is a small, complete example that shows the pattern:

- **Domain** (`contact-message.ts`) holds the validation rules. They return
  violation codes (`'required'`, `'invalid-email'`), not UI text.
- **Application** (`send-contact-message.ts`) holds the `SendContactMessage` use case.
  It re-checks the rules, so the form isn't the only guard, and sends through
  the `ContactMessageSender` port.
- **Infrastructure** (`in-memory-contact-message-sender.ts`) is a stand-in adapter
  with simulated latency. When a real API exists, add an `HttpContactMessageSender`
  that implements the same port and swap it in `main.tsx`.
- **UI** (`ContactForm.tsx`) uses React Hook Form. Each field's `validate`
  calls the domain rule, and the component maps the violation code to a
  message. The use case comes in as a prop.

Copy this shape for new features, or delete `features/contact` and the
`ContactForm` usage in `App.tsx` when you no longer need the example.

## Testing

Work test-first: write a failing test (red), make it pass with the least code (green), then refactor.

- Domain and use cases are tested as plain functions.
- Components are tested through what the user sees (`getByLabelText`, `getByRole`)
  using `@testing-library/user-event`.
- Mock only at boundaries. Ports are replaced with fakes, and internal logic is never mocked.
- `src/app/App.test.tsx` is an integration test: the real use case and the in-memory adapter, driven through the UI.

The `@/` import alias maps to `src/` and is resolved by `tsconfig.json` paths
(Vite reads them via `resolve.tsconfigPaths`).

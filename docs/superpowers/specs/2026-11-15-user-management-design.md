# User management + i18n — design

## Intent

The first real screen under Giriş Kontrolü: a modern take on the legacy
"Kullanıcı Yönetimi" list and its create form (the create form becomes a
modal). Alongside it, the app gets Turkish/English support, and form pieces
become reusable components so later screens share one look that can be
restyled in one place.

## Goals

- User list: search (debounced), sortable columns, row selection, bulk
  activate / deactivate, CSV export, pagination with page size, loading /
  empty / error states.
- Create user modal: language, first name, last name, email, phone (country
  code + number), user group, profile photo (jpeg/png, ≤ 1024 KB). Domain
  validation with violation codes; duplicate email reported on the field.
- i18n: `tr` (default) and `en`, chosen in the header, remembered between
  visits, `<html lang>` kept in step. Type-checked message keys; English
  must define every Turkish key.
- Reusable form compositions: `TextField`, `SelectField`, `PhoneField`,
  `ImageFileField`, `SearchInput`; reusable `DataTable` + `TablePagination`.

## Non-goals (this round)

- Editing / deleting a user, role assignment, Excel export, real API.
- Translating the sign-in flow (it keeps its English copy; follow-up).

## Approaches

### i18n

1. **Own small typed i18n in `shared/i18n` (chosen).** Catalog objects,
   dotted keys typed from the Turkish catalog, `{param}` interpolation,
   plurals via `Intl.PluralRules`. No dependency, same port/adapter shape as
   the theme preference. Lives in `shared` because shared components
   (pagination, table) need their own labels.
2. **react-i18next.** Mature (ICU, lazy namespaces) but a new dependency and
   weaker key typing out of the box; more than two static locales don't
   need yet. Can replace (1) behind `useI18n()` later.

### Lists

1. **Own `DataTable` over shadcn `table` (chosen)** — columns, sort,
   selection, loading/empty states; server-shaped (the caller owns the query).
2. **TanStack Table.** Powerful, but a dependency for features we don't use yet.

## Design

- **Users domain** (`features/users/domain`): `User`, `UserStatus`,
  `NewUser` + rules (`required`, `invalid-email`, `invalid-phone`,
  `unsupported-photo-type`, `photo-too-large`), `UserQuery` / `UserPage`.
- **Application** — one port per capability: `UserFinder`, `UserCreator`,
  `UserStatusChanger`, `UserGroupCatalog`; use cases `listUsers`,
  `exportUsers`, `createUser`, `changeUsersStatus`, `listUserGroups`.
  `EmailAlreadyInUseError` is thrown by adapters.
- **Infrastructure** — `InMemoryUserDirectory` (119 seeded demo users,
  groups with roles, latency, injectable clock).
- **UI** — `UserManagement` (card, toolbar, bulk bar, table, pagination),
  `CreateUserDialog`. CSV is built with `shared/lib/csv` and saved through an
  injected `SaveFile` (browser implementation in the composition root).
- **App** — `/access-control/users` routes to `UsersPage` (shared
  `PageHeader` with breadcrumb + the feature). Menu items and page titles
  are message keys.

## Calls left to the builder

Copy, column layout, seed data, debounce length (300 ms, injectable),
phone rule (digits; 10 for +90, 7–14 elsewhere; optional field).

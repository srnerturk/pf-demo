# pf-demo

Vite + React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui + React Hook Form, tested with Vitest and Testing Library.

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
├── main.tsx                      # Composition root: picks adapters, injects them
├── index.css                     # Tailwind entry + global design tokens (light/dark)
├── app/App.tsx                   # Page shell; receives use cases as props
├── shared/
│   ├── lib/utils.ts              # cn(): class merging used by every component
│   ├── ui/                       # shadcn/ui primitives (button, input, card…), owned by us
│   └── components/               # Our compositions of primitives (FormField, SubmitButton)
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

### UI kit and design tokens

- **Tokens** live in `src/index.css`: semantic CSS variables (`--primary`,
  `--muted-foreground`, `--destructive`, `--success`, `--radius`…) for light mode
  and, under `prefers-color-scheme: dark`, for dark mode. `@theme inline` exposes
  them as Tailwind utilities (`bg-primary`, `text-muted-foreground`). Features use
  only these semantic utilities, never raw palette colours, so the theme changes in one place.
- **Primitives** (`shared/ui`) come from shadcn/ui and are configured by
  `components.json`. Add more with `npx shadcn@latest add <name>`; they land in
  `src/shared/ui` and import `cn` from `@/shared/lib/utils`.
- **Compositions** (`shared/components`) combine primitives into app-level
  building blocks with behaviour of their own, e.g. `FormField` (label, control
  and error wired for assistive technology) and `SubmitButton` (busy state that
  blocks double submission).
- Feature UIs (`features/*/ui`) compose these; they hold no styling constants of their own.

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

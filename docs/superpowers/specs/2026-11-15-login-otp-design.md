# Sign-in with one-time code — design

## Intent

A modern, minimal SaaS-style authentication flow: email + password, then a
6-digit one-time code, then a signed-in confirmation. No backend exists yet,
so authentication is mocked behind ports that a real API adapter can replace.

## Goals

- Sign-in screen: email, password with show/hide toggle, "Sign in" button.
- Separate verification screen: 6 single-digit inputs with automatic focus
  movement (type → next, Backspace on empty → previous, paste fills all),
  "Verify" button.
- Resend code with a countdown; resend is disabled until it reaches zero.
- Smooth transitions between screens, disabled under `prefers-reduced-motion`.
- Validation in the domain (violation codes), re-checked by use cases,
  surfaced by the UI as messages.
- After verifying: "You're signed in" screen with a "Sign out" button that
  returns to sign-in.

## Non-goals

- Real backend, session persistence, routing/URLs per screen, "forgot password".

## Constraints

- Follow the existing stack and layering (`features/<name>/{domain,application,infrastructure,ui}`),
  enforced by oxlint. No new dependencies.
- Test-first; mock only at ports.

## Approaches

1. **Screen state machine inside the feature (chosen).** `SignInFlow` holds
   the current step (`credentials` → `verification` → `signed-in`) and renders
   one screen at a time with a CSS enter transition. No dependency, fits a
   single-page demo.
2. **Add React Router.** Each screen gets a URL. Rejected: new dependency and
   deep links to the verification step would need guarding; not asked for.
3. **One component with conditional sections.** Rejected: mixes two screens'
   responsibilities in one unit.

## Design

- **Domain** (`features/auth/domain`)
  - `credentials.ts` — `validateEmail`, `validatePassword` (required, min 8).
  - `one-time-code.ts` — `ONE_TIME_CODE_LENGTH = 6`, `validateOneTimeCode`
    (`required` / `incomplete` / `not-digits`).
  - `resend-cooldown.ts` — `secondsUntilResend(sentAt, now, cooldownSeconds)`.
- **Application** (`features/auth/application`) — one port per capability (ISP):
  - `CredentialVerifier.verify(credentials) → Challenge { challengeId, email }`
    → use case `makeSignIn`.
  - `OneTimeCodeVerifier.verify(challengeId, code) → Session { email }`
    → use case `makeVerifyOneTimeCode`.
  - `OneTimeCodeSender.resend(challengeId)` → use case `makeResendOneTimeCode`.
  - Errors: `InvalidCredentialsInputError`, `InvalidOneTimeCodeInputError`
    (input violations); adapters throw `CredentialsRejectedError` /
    `OneTimeCodeRejectedError` (domain-meaningful rejections), defined in application.
- **Infrastructure** — `InMemoryAuthenticator` implements all three ports.
  Demo account `demo@example.com` / `password123`, code `123456`, configurable latency.
- **UI** — `SignInForm`, `OneTimeCodeForm` (with `OneTimeCodeInput` and
  `ResendCodeButton`), `SignedIn`, `SignInFlow`. Use cases come in as props;
  `main.tsx` composes them. `App` renders `SignInFlow`; the contact example is removed
  from the page (left in the codebase as the reference feature).

## Calls left to the builder

Copy, exact animation curves, resend cooldown length (default 30 s, injectable
for tests), masking of the email on the verification screen.

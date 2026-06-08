# Codex Prompt Guide for `frontendV2`

Use this file as the default prompt context when working on `frontendV2`.
It is designed to keep changes aligned with the current project architecture,
API contract, and business rules while leaving a clear section for the next request.

---

## 1. Project Context

- Project: `frontendV2`
- Stack: Angular 19, TypeScript, RxJS, Angular Router, Reactive Forms
- Module style: `NgModule` app, not standalone-only app
- Root module: `src/app/app.module.ts`
- Routing file: `src/app/app-routing.module.ts`
- Environment API base: `src/environments/environment.ts`
- Current API base URL: `/api`
- Auth flow uses:
  - `AuthService`
  - `AuthGuard`
  - `AuthInterceptor`
  - token storage through `TokenService`

Frontend route layout:

- Public pages use `CommonLayoutComponent`
- Protected dashboard pages use `DashboardLayoutComponent`
- Current protected feature pages include:
  - `/profile`
  - `/anamnesis`
  - `/child-profile`
  - `/reports-child`

---

## 2. Frontend Architecture Rules

Follow the existing frontend patterns exactly unless the request explicitly says otherwise.

### Components

- Keep page components as orchestrators
- Put heavy UI blocks into child components
- Prefer input/output communication between page and child components
- Do not call `HttpClient` directly from components
- Use Reactive Forms for non-trivial forms
- Keep files reasonably small and focused

### Services

- Use Angular services for API access and state
- Services typically use:
  - `BehaviorSubject`
  - `readonly ...$` observable streams
  - `loading$`, `saving$`, `error$`, and data streams
- Service methods should usually:
  - set loading/saving state
  - clear previous error
  - call API
  - map `response.data`
  - update local state in `tap`
  - expose friendly error messages in `catchError`

### API typing

- Use interfaces from `src/app/api/interfaces`
- Preserve the standard response envelope:
  - `SuccessResponse<T>`
  - `ErrorResponse`
- Frontend API calls should expect backend responses in the shape:
  - `{ success: true, data, message?, meta? }`
- Do not use `any`

### Routing

- Keep route definitions in `src/app/app-routing.module.ts`
- Protected dashboard pages must stay behind `AuthGuard`
- Do not create fake routes that are not backed by real pages
- Do not break existing route structure or dashboard nesting

### Forms and Angular safety

- Any template using `formControlName` must have a parent `[formGroup]`
- Any component using `*ngIf`, `*ngFor`, pipes, or common directives must remain supported by module imports
- Because this app is module-based, new components must be declared in `AppModule` unless a new feature module is intentionally introduced

---

## 3. Current Business Rules That Must Not Break

These are existing or recent rules already reflected in the codebase.

### Authentication and session

- Keep login, logout, register, refresh, and session restore working
- Do not break `AuthInterceptor` token usage
- Do not break `AuthGuard`
- Do not hardcode full backend URLs; use `environment.apiUrl`

### Profile and user flow

- `/profile` must continue loading and updating the authenticated user
- Profile edits should keep using the existing service-based flow
- Do not break child creation from the profile area

### Child access and child profile

- The child access flow is now split between:
  - responsible children
  - secondary responsible children
  - associated children linked by access code
- `GET /api/children/me` is the frontend entry point for accessible children
- `POST /api/association-children` associates the authenticated user to a child by `accessCode`
- Frontend must never ask the user for:
  - `userId`
  - `childId`
  when the business flow is access-code based
- Do not bypass backend validation of the access code
- Do not create duplicate association logic on the frontend

### Anamnesis

- `/anamnesis` must continue working with child selection
- If a flow navigates to anamnesis for a child, prefer query param style:
  - `/anamnesis?childId=<id>`
- Do not reintroduce route requirements that conflict with the current structure

### Reports child

- Reports should continue using accessible children, not a separate child source
- Respect management permissions already derived from:
  - admin role
  - responsible user
  - secondary responsible user
  - report owner when applicable

---

## 4. Code Pattern Rules

- Match the naming style already in the codebase
- Keep imports tidy and type-safe
- Reuse existing interfaces before creating new ones
- Reuse existing UI classes before inventing a new visual system
- Prefer extending current patterns over introducing a new architecture
- Use user-friendly error messages in services
- Keep observable-based state consistent with the rest of the app
- Avoid hidden side effects in components
- Keep business logic in services when possible

---

## 5. UI and Styling Rules

- Preserve the current dashboard/product style
- Reuse global UI classes where possible
- Avoid installing new UI libraries unless explicitly requested
- Do not redesign unrelated pages
- Keep responsive behavior intact
- Favor clean, professional layouts with clear hierarchy

---

## 6. What Codex Should Inspect Before Coding

Before changing code, inspect the relevant files in this order when applicable:

1. `src/app/app-routing.module.ts`
2. `src/app/app.module.ts`
3. related page component files
4. related child components
5. related services
6. related interfaces in `src/app/api/interfaces`
7. `src/environments/environment.ts`

If the request touches API integration, verify:

- frontend route path
- HTTP method
- request DTO
- response envelope
- auth expectation

---

## 7. Safe Change Checklist

Before finishing, Codex should verify:

- no existing auth flow was broken
- no existing profile flow was broken
- no existing anamnesis flow was broken
- no existing child access rule was bypassed
- services still map `response.data`
- new components are declared/imported correctly
- no `formControlName` misuse exists
- no obvious route mismatch exists
- no hardcoded localhost or raw backend host was introduced

If possible, run:

- `npm run build`
- `npm test`

If tests fail due to unrelated existing problems, report them clearly instead of masking them.

---

## 8. Output Expectations for Codex

When delivering work in this project, Codex should:

- summarize what changed
- list important routes/services/interfaces affected
- mention validation/build/test results
- call out remaining risks or TODOs
- avoid rewriting unrelated files

---

## 9. Request Section

Paste or write the task for Codex below this line.

### My request for Codex

Describe the feature, bugfix, refactor, or audit you want.

Useful details to include:

- target page, service, or component
- expected backend route(s)
- business rule to preserve
- UI expectations
- validation or error behavior
- files or folders to inspect first
- what must not be broken

### Request

```md
[Write your request here]
```


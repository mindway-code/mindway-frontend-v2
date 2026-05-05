# Core Documentation

## What Core Means

The `core` layer should contain application-level behavior used globally.

Your project does not currently have a `core/` folder, but it would be useful as the app grows.

Recommended future structure:

```txt
src/app/core/
  guards/
  interceptors/
  services/
  config/
  errors/
```

## Current Core-Like Files

Currently, these folders behave like core:

```txt
src/app/auth/guard/
src/app/auth/interceptor/
src/app/services/
src/app/api/interfaces/
```

## Recommended Migration

Current:

```txt
src/app/auth/guard/auth.guard.ts
src/app/auth/interceptor/auth.interceptor.ts
```

Future:

```txt
src/app/core/guards/auth.guard.ts
src/app/core/interceptors/auth.interceptor.ts
```

Only move these files when imports/routes can be safely updated.

## Guards

Guards protect routes.

Example expected behavior:

- If the user is authenticated, allow route.
- If not authenticated, redirect to login or unauthorized page.
- Do not only hide UI. Always protect the route too.

Recommended routes example:

```ts
{
  path: 'dashboard',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./layout/dashboard-layout/dashboard-layout.component')
      .then(m => m.DashboardLayoutComponent),
}
```

## Interceptors

Interceptors should handle cross-cutting HTTP behavior.

Common responsibilities:

- Add auth token to requests
- Handle `401 Unauthorized`
- Redirect user if session expires
- Add headers
- Centralize HTTP error behavior

Recommended Angular 19+ direction:

- Prefer functional interceptors for new code.
- Keep class-based interceptor temporarily if the project already uses it.
- Avoid multiple interceptors doing the same responsibility.

## API Interfaces

Path:

```txt
src/app/api/interfaces/
```

Recommended files:

```txt
api-response.interface.ts
auth.interface.ts
user.interface.ts
profile.interface.ts
pagination.interface.ts
```

Example:

```ts
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: unknown;
}
```

```ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}
```

## Services

Path:

```txt
src/app/services/
```

Services should be injectable and reusable.

Recommended rule:

- Global services stay in `src/app/services`.
- Feature-specific services can later move closer to their feature.

Examples:

```txt
auth.service.ts
profile.service.ts
dashboard.service.ts
notification.service.ts
```

## Error Handling

Use a consistent error message strategy.

Example:

```ts
private getErrorMessage(error: unknown): string {
  return 'Something went wrong. Please try again.';
}
```

Avoid exposing raw technical errors directly in the UI.

## Loading State

Each service that fetches API data should expose:

```ts
readonly loading$: Observable<boolean>;
```

## Error State

Each service that fetches API data should expose:

```ts
readonly error$: Observable<string | null>;
```

## Data State

Each service should expose data streams:

```ts
readonly currentUser$: Observable<User | null>;
readonly profile$: Observable<UserProfile | null>;
readonly dashboardSummary$: Observable<DashboardSummary | null>;
```

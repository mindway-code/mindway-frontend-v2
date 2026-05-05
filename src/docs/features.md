# Features Documentation

## Current Feature Areas

The project currently has these main feature areas:

```txt
auth/
pages/
layout/
shared/
services/
api/interfaces/
```

## Auth Feature

Path:

```txt
src/app/auth/
```

Current files:

```txt
guard/
  auth.guard.ts
interceptor/
  auth.interceptor.ts
login/
register/
register-options/
register-school/
register-teacher/
register-therapist/
```

### Auth Responsibilities

The auth feature should handle:

- Login
- Register
- Register options
- Register by user type
- Auth route protection
- Token or session handling
- Auth HTTP interceptor
- Current user state

### Recommended Auth Service

Create or improve:

```txt
src/app/services/auth.service.ts
```

Responsibilities:

- `login()`
- `logout()`
- `register()`
- `loadCurrentUser()`
- `currentUser$`
- `isAuthenticated$`
- `loading$`
- `error$`

Example public streams:

```ts
readonly currentUser$: Observable<User | null>;
readonly isAuthenticated$: Observable<boolean>;
readonly loading$: Observable<boolean>;
readonly error$: Observable<string | null>;
```

## Pages Feature

Path:

```txt
src/app/pages/
```

Current pages:

```txt
home/
profile/
social-network/
unauthorized/
```

### Home Page

Responsibilities:

- Landing content
- Public information
- Navigation to auth or dashboard
- Promotional sections

Should not contain:
- Direct API calls
- Auth rules
- Global layout duplicated code

### Profile Page

Responsibilities:

- Display user information
- Update user information
- Show platform summary
- Show allowed user actions

Recommended service:

```txt
src/app/services/profile.service.ts
```

Recommended streams:

```ts
profile$: Observable<UserProfile | null>;
loading$: Observable<boolean>;
error$: Observable<string | null>;
```

### Social Network Page

Responsibilities:

- Feed/list content
- Interactions
- Future posts/news/community features

Recommended future structure:

```txt
src/app/pages/social-network/
  components/
    post-card/
    post-list/
    post-form/
  social-network.component.*
```

## Layout Feature

Path:

```txt
src/app/layout/
```

Current layouts:

```txt
common-layout/
dashboard-layout/
personal-layout/
```

### Common Layout

Use for public pages like:

- Home
- Contact
- Info
- About

Should include:

- Public navbar
- Professional footer
- Router outlet

### Dashboard Layout

Use for authenticated/private pages.

Should include:

- Dashboard navigation
- Sidebar if necessary
- Header with user greeting
- Main content outlet

### Personal Layout

Use for user/private profile area if different from dashboard.

If it is not needed, document it as reserved or remove later after confirmation.

## Shared Feature

Path:

```txt
src/app/shared/
```

Current shared areas:

```txt
dashboard/
footer/
navbar/
ui/
```

### Shared Components

Shared components should be reusable and not contain business-specific logic.

Good examples:
- Navbar
- Footer
- Cards
- Buttons
- Inputs
- Empty state
- Loading state

Bad examples:
- Component that directly calls login API
- Component that depends on one page only
- Component with hardcoded route-specific business logic

## Suggested Future Feature Structure

For larger features, prefer:

```txt
src/app/features/
  profile/
    pages/
    components/
    services/
    interfaces/
  dashboard/
    pages/
    components/
    services/
    interfaces/
```

But do not migrate everything immediately unless requested.

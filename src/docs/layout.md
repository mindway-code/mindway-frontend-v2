# Layout Documentation

## Current Layout Structure

```txt
src/app/layout/
  common-layout/
    common-layout.component.html
    common-layout.component.scss
    common-layout.component.ts
  dashboard-layout/
    dashboard-layout.component.css
    dashboard-layout.component.html
    dashboard-layout.component.spec.ts
    dashboard-layout.component.ts
  personal-layout/
```

## Layout Goal

Layouts should define page shells.

A layout is responsible for:

- Main structural wrapper
- Navbar/header
- Footer
- Sidebar
- Router outlet
- Authenticated or public page shell

A layout should not be responsible for:

- Business API calls
- Form submission logic
- Feature-specific data mapping

## Common Layout

Use for public pages.

Examples:

```txt
/
home
contact
info
about
login
register
```

Recommended structure:

```html
<div class="common-layout">
  <app-navbar></app-navbar>

  <main class="common-layout__main">
    <router-outlet></router-outlet>
  </main>

  <app-footer></app-footer>
</div>
```

Recommended CSS:

```scss
.common-layout {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--bg-light);
}

.common-layout__main {
  flex: 1;
  width: min(100%, 1280px);
  margin-inline: auto;
  padding-inline: 1rem;
}
```

## Dashboard Layout

Use for authenticated/private pages.

Examples:

```txt
/dashboard
/profile
/social-network
```

Recommended structure:

```html
<div class="dashboard-layout">
  <aside class="dashboard-layout__sidebar">
    <!-- dashboard navigation -->
  </aside>

  <section class="dashboard-layout__content">
    <header class="dashboard-layout__header">
      <p>Hello, {{ username }}</p>
    </header>

    <main class="dashboard-layout__main">
      <router-outlet></router-outlet>
    </main>
  </section>
</div>
```

Recommended CSS:

```scss
.dashboard-layout {
  min-height: 100dvh;
  display: grid;
  grid-template-columns: 260px 1fr;
  background: var(--bg-light);
}

.dashboard-layout__content {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.dashboard-layout__header {
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-inline: 1rem;
  background: var(--bg-white);
  border-bottom: 1px solid var(--border-light);
}

.dashboard-layout__main {
  flex: 1;
  padding: 1rem;
}
```

Responsive example:

```scss
@media (max-width: 768px) {
  .dashboard-layout {
    grid-template-columns: 1fr;
  }

  .dashboard-layout__sidebar {
    display: none;
  }
}
```

## Personal Layout

Current folder:

```txt
src/app/layout/personal-layout/
```

This folder is currently empty.

Recommended use:

- User profile area
- Account settings
- Personal dashboard
- User-specific summary pages

If `dashboard-layout` already handles all private pages, keep `personal-layout` reserved or remove it later.

## Routing With Layouts

Example route structure:

```ts
export const routes: Routes = [
  {
    path: '',
    component: CommonLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'unauthorized', component: UnauthorizedComponent },
    ],
  },
  {
    path: '',
    component: DashboardLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'profile', component: ProfileComponent },
      { path: 'social-network', component: SocialNetworkComponent },
    ],
  },
];
```

## Navbar and Footer

Current shared components:

```txt
src/app/shared/navbar/
src/app/shared/footer/
```

Rules:

- Do not recreate navbar/footer inside each layout.
- Common layout should reuse shared navbar and footer.
- Dashboard layout may use a different dashboard navigation if needed.
- Footer should usually stay out of dashboard pages unless required.

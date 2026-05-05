# Styles Documentation

## Current Global Style Files

```txt
src/styles.scss
src/app/app.component.scss
src/app/shared/ui/
  button.scss
  card.scss
  input.scss
```

## Style Goal

The styling system should be:

- Consistent
- Easy to maintain
- Token-based
- Reusable
- Compatible with light theme
- Safe to extend without breaking current pages

## Recommended Global Variables

Use CSS variables in `src/styles.scss`.

Example:

```scss
:root {
  margin: 0;

  --font: "Roboto", "Helvetica Neue", Arial, sans-serif;

  /* backgrounds */
  --bg-green: #006c70;
  --bg-accent: #f4b313;
  --bg-light: #f4f7f6;
  --bg-white: #ffffff;

  /* text */
  --text-dark: #212529;
  --text-muted: #6c757d;
  --text-light: #f8f9fa;
  --text-accent: #f4b313;
  --text-green: #006c70;

  /* borders color */
  --border-light: #dfe5e4;
  --border-medium: #c7d1cf;
  --border-dark: #93a1a1;

  /* border radius */
  --border-sm: 0.2rem;
  --border-md: 0.4rem;
  --border-lg: 0.6rem;
  --border-pill: 999rem;

  /* padding */
  --padding-sm: 0.4rem;
  --padding-md: 0.8rem;
  --padding-lg: 1.2rem;

  --radius-sm: 0.5rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;

  /* gap */
  --gap-sm: 0.4rem;
  --gap-md: 0.8rem;
  --gap-lg: 1.2rem;
  --gap-xlg: 2.2rem;
  --gap-xxlg: 3.2rem;

  /* font weight */
  --fw-sm: 300;
  --fw-md: 400;
  --fw-lg: 600;
  --fw-xlg: 700;

  /* box-shadow */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4px 10px rgba(0, 0, 0, 0.12);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.16);
}
```

## Global Reset

Recommended:

```scss
* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  min-height: 100dvh;
  font-family: var(--font);
  color: var(--text-dark);
  background: var(--bg-light);
}
```

## UI Imports

In `styles.scss`, import shared UI files:

```scss
@import "./app/shared/ui/button";
@import "./app/shared/ui/card";
@import "./app/shared/ui/input";
```

## Button UI

Current:

```txt
src/app/shared/ui/button.scss
```

Recommended classes:

```scss
.btn-ui {
  border: 0;
  border-radius: var(--radius-md);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: 0.2s ease;
}

.btn-ui--green {
  background: var(--bg-green);
  color: var(--text-light);
}

.btn-ui--accent {
  background: var(--bg-accent);
  color: var(--text-dark);
}

.btn-ui--outline {
  background: transparent;
  color: var(--text-green);
  border: 1px solid var(--bg-green);
}

.btn-ui--sm {
  min-height: 2.25rem;
  padding-inline: 0.875rem;
  font-size: 0.875rem;
}

.btn-ui--md {
  min-height: 2.75rem;
  padding-inline: 1rem;
  font-size: 1rem;
}
```

## Card UI

Current:

```txt
src/app/shared/ui/card.scss
```

Recommended classes:

```scss
.card-ui {
  background: var(--bg-white);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.card-ui--md {
  padding: 1rem;
}

.card-ui__body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.card-ui__body--center {
  align-items: center;
  text-align: center;
}

.card-ui__title {
  color: var(--text-dark);
}

.card-ui__subtitle {
  color: var(--text-muted);
}
```

## Input UI

Current:

```txt
src/app/shared/ui/input.scss
```

Recommended rules:

- Wrapper class: `.input-group-ui`
- Label inside group
- Input styled by state
- Floating label if needed

Example:

```scss
.input-group-ui {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.input-group-ui__label {
  color: var(--text-muted);
  font-size: 0.875rem;
}

.input-group-ui__control {
  width: 100%;
  min-height: 2.75rem;
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  padding-inline: 0.875rem;
  font: inherit;
  color: var(--text-dark);
  background: var(--bg-white);
}

.input-group-ui__control:focus {
  outline: none;
  border-color: var(--bg-green);
  box-shadow: 0 0 0 3px rgba(0, 108, 112, 0.12);
}
```

## Component SCSS Rules

Use BEM-like class names:

```scss
.profile-page {}
.profile-page__header {}
.profile-page__card {}
.profile-page__actions {}
```

Avoid generic classes inside component files:

```scss
.title {}
.box {}
.item {}
```

## CSS vs SCSS

Some components currently use `.css`, others use `.scss`.

Recommended:
- Prefer `.scss` for consistency.
- Do not rename everything at once.
- Convert one component at a time if needed.

Current `.css` files:
- `register-options.component.css`
- `dashboard-layout.component.css`
- `profile.component.css`

Suggested future:
- Convert to `.scss` when refactoring those components.

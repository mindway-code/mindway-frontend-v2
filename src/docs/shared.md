# Shared Documentation

## Current Shared Structure

```txt
src/app/shared/
  dashboard/
  footer/
    footer.component.html
    footer.component.scss
    footer.component.ts
  navbar/
    navbar.component.html
    navbar.component.scss
    navbar.component.ts
  ui/
    button.scss
    card.scss
    input.scss
```

## Shared Goal

The shared folder should contain reusable UI parts and global styling utilities.

Shared code must be:

- Reusable
- Generic
- Independent from one page
- Easy to style
- Easy to maintain

## Current Shared Components

### Navbar

Path:

```txt
src/app/shared/navbar/
```

Responsibilities:

- Public navigation
- Dashboard link if user is authenticated
- Login/register links if user is not authenticated
- Responsive menu if needed

Should not:
- Submit forms
- Fetch page-specific data
- Duplicate dashboard sidebar behavior

### Footer

Path:

```txt
src/app/shared/footer/
```

Responsibilities:

- Brand information
- Certificates
- Contact links
- Social links
- Copyright
- Public navigation links

Should not:
- Contain page-specific content
- Be copied manually into pages

### Dashboard Shared Folder

Path:

```txt
src/app/shared/dashboard/
```

Recommended future use:

```txt
dashboard-card/
dashboard-summary/
dashboard-stat/
dashboard-empty-state/
```

Keep these components generic enough to reuse.

## Shared UI Styles

Path:

```txt
src/app/shared/ui/
```

Current files:

```txt
button.scss
card.scss
input.scss
```

These files define reusable CSS classes.

Use them like:

```html
<div class="card-ui card-ui--md">
  <div class="card-ui__body">
    <h2 class="card-ui__title">Title</h2>
    <p class="card-ui__subtitle">Subtitle</p>
    <button class="btn-ui btn-ui--green btn-ui--md">Action</button>
  </div>
</div>
```

## When to Create Shared Components

Create a shared component when:

- The same UI appears in 2 or more places.
- The component has reusable behavior.
- The component does not belong to only one feature.

Examples:

```txt
loading-spinner
empty-state
error-state
modal
confirm-dialog
avatar
badge
```

## When Not to Create Shared Components

Do not create shared components for:

- A section used only once.
- A component with page-specific business rules.
- A very small HTML block that does not repeat.

## Recommended Future Shared Structure

```txt
src/app/shared/
  components/
    empty-state/
    loading-state/
    error-state/
    avatar/
    badge/
  layout/
    navbar/
    footer/
  ui/
    button.scss
    card.scss
    input.scss
    typography.scss
```

But do not migrate immediately unless requested.

## Shared Component Rule

A shared component should receive data through `@Input()` and emit events through `@Output()`.

Example:

```ts
@Input() title = '';
@Input() description = '';
@Output() actionClick = new EventEmitter<void>();
```

Avoid direct API calls inside shared UI components.

## Placeholder Image Rule

Current placeholder:

```txt
src/assets/img/placeholder.PNG
```

Use fallback images like:

```html
<img [src]="imageUrl || 'assets/img/placeholder.PNG'" [alt]="imageAlt || 'Placeholder image'" />
```

## Agent Rules

When editing shared files:

1. Do not break existing class names without updating usages.
2. Prefer additive changes.
3. Keep UI styles generic.
4. Avoid business logic.
5. Keep reusable component APIs simple.

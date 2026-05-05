# Initial Configuration Documentation

## Project Type

Angular 19+ frontend project.

Root folder:

```txt
frontendV2/
```

## Important Root Files

```txt
.editorconfig
.gitignore
angular.json
karma.conf.js
package.json
package-lock.json
proxy.conf.json
README.md
tsconfig.app.json
tsconfig.json
tsconfig.spec.json
```

## Angular App Entry Files

```txt
src/index.html
src/main.ts
src/styles.scss
src/test.ts
```

## App Configuration Files

```txt
src/app/app.config.ts
src/app/app.module.ts
src/app/app.routes.ts
src/app/app-routing.module.ts
```

## Important Observation

The project has both standalone-style files and NgModule-style files.

Standalone-style files:
```txt
app.config.ts
app.routes.ts
```

NgModule-style files:
```txt
app.module.ts
app-routing.module.ts
```

This is not automatically wrong, but it can confuse future maintenance.

## Recommended Decision

Choose one main direction.

### Option 1 — Keep NgModule Style

Use:

```txt
app.module.ts
app-routing.module.ts
```

Good if:
- The project was already generated with modules.
- Existing components are not standalone.
- You want simpler migration with less refactor.

### Option 2 — Migrate to Standalone Style

Use:

```txt
app.config.ts
app.routes.ts
```

Good if:
- You want modern Angular style.
- You want route-level lazy loading.
- You want less NgModule boilerplate.

## Current Recommendation

For this project:

1. Keep the current setup working.
2. Document it.
3. Avoid deleting config files immediately.
4. When ready, choose one style and clean the other.

## Environments Folder

Current:

```txt
src/environments/
```

The folder is empty.

Recommended files:

```txt
src/environments/environment.ts
src/environments/environment.development.ts
src/environments/environment.production.ts
```

Example:

```ts
export const environment = {
  production: false,
  apiUrl: '/api',
};
```

Production:

```ts
export const environment = {
  production: true,
  apiUrl: 'https://your-production-api.com/api',
};
```

## Proxy

Current root file:

```txt
proxy.conf.json
```

Use this for local backend calls.

Example:

```json
{
  "/api": {
    "target": "http://localhost:3000",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

## Assets

Current:

```txt
src/assets/
  gif/
  img/
    placeholder.PNG
  svg/
  webp/
    family.webp
    img_login.webp
    man2.webp
    relate.webp
    relate2.webp
    woman.webp
    woman2.webp
```

Rules:

- Use `placeholder.PNG` when an image is missing.
- Keep optimized images in `webp/`.
- Keep SVG icons in `svg/`.
- Do not import large image files unnecessarily inside TypeScript.

## Recommended Import Pattern for Images

In templates:

```html
<img [src]="card.img || 'assets/img/placeholder.PNG'" [alt]="card.alt || 'Image placeholder'" />
```

## Testing

Current:

```txt
karma.conf.js
src/test.ts
*.component.spec.ts
```

The project appears to use Karma/Jasmine.

Recommended:
- Keep existing tests running.
- Add tests for important components first.
- Add service tests after Observable services are created.

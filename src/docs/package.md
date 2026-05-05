# Package Documentation

## Root Package File

```txt
package.json
```

## Package Goal

The package file should clearly define:

- Angular dependencies
- Build commands
- Start command
- Test command
- Lint/format commands if configured
- Project scripts for local development

## Recommended Scripts

Example:

```json
{
  "scripts": {
    "ng": "ng",
    "start": "ng serve --proxy-config proxy.conf.json",
    "start:open": "ng serve --proxy-config proxy.conf.json --open",
    "build": "ng build",
    "build:prod": "ng build --configuration production",
    "test": "ng test",
    "watch": "ng build --watch --configuration development"
  }
}
```

## Optional Future Scripts

If ESLint and Prettier are configured later:

```json
{
  "scripts": {
    "lint": "ng lint",
    "format": "prettier --write \"src/**/*.{ts,html,scss,json,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,html,scss,json,md}\""
  }
}
```

## Dependency Rules

When changing packages:

1. Do not install unnecessary UI libraries.
2. Prefer Angular-compatible packages.
3. Check version compatibility with Angular 19+.
4. Avoid adding packages for things that can be done with CSS/Angular easily.
5. Keep `package-lock.json` committed.

## Common Angular Packages

Expected core packages:

```txt
@angular/animations
@angular/common
@angular/compiler
@angular/core
@angular/forms
@angular/platform-browser
@angular/platform-browser-dynamic
@angular/router
rxjs
tslib
zone.js
```

## Observable Pattern Dependency

The Observable pattern uses RxJS.

Expected package:

```txt
rxjs
```

Use imports like:

```ts
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';
```

Modern RxJS also allows direct operator imports:

```ts
import { catchError, finalize, map, tap } from 'rxjs';
```

## Package Safety

Do not delete dependencies without checking imports.

Before removing a package:

1. Search usage in `src/`.
2. Search usage in `angular.json`.
3. Search usage in styles.
4. Run the project.
5. Run tests/build.

## Recommended Agent Task

When asked to update dependencies:

- Inspect `package.json`.
- Check Angular version.
- Check peer dependency conflicts.
- Prefer minimal changes.
- Explain what was changed.
- Keep the project runnable.

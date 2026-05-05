# Agent Guide — frontendV2

## Project Context

This project is an Angular 19+ frontend application.

Main goal:
- Keep the code clean, modular, and easy to maintain.
- Improve documentation so AI agents and developers understand the project quickly.
- Gradually migrate service logic to an Observable-based pattern.
- Preserve existing business behavior while improving architecture.

## Current Main Structure

```txt
src/
  app/
    api/
      interfaces/
    auth/
    layout/
    pages/
    services/
    shared/
    app.config.ts
    app.module.ts
    app.routes.ts
    app-routing.module.ts
  assets/
  environments/
```

## Important Rules for AI Agents

1. Do not create huge files.
2. Do not mix API calls directly inside components when a service should handle them.
3. Components should focus on:
   - UI rendering
   - form events
   - calling services
   - subscribing through `async` pipe when possible
4. Services should focus on:
   - HTTP communication
   - state streams
   - mapping API responses
   - error handling
5. Prefer typed interfaces from `src/app/api/interfaces`.
6. Keep layout components separated from page components.
7. Keep reusable UI styles in `src/app/shared/ui`.
8. Do not duplicate navbar/footer logic across pages.
9. Use Observable naming convention with `$` suffix:
   - `user$`
   - `loading$`
   - `error$`
   - `profile$`
10. Avoid unnecessary manual subscriptions in components. Prefer:
   - `async` pipe in templates
   - service-level `BehaviorSubject`
   - RxJS operators
   - `takeUntilDestroyed()` when subscription is required

## Preferred Angular Direction

The project currently has both:
- `app.module.ts`
- `app-routing.module.ts`
- `app.config.ts`
- `app.routes.ts`

For Angular 19+, decide one main style and avoid mixing without reason.

Recommended direction:
- If keeping NgModule style, use `AppModule` + `AppRoutingModule`.
- If migrating to standalone style later, use `app.config.ts` + `app.routes.ts`.

For now, do not remove files automatically unless requested. Document the current structure first, then refactor gradually.

## Suggested Refactor Order

1. Document the current structure.
2. Create and type API interfaces.
3. Create Observable-based services.
4. Replace direct component data handling with service streams.
5. Improve auth state handling.
6. Improve layouts.
7. Improve shared UI styles.
8. Clean duplicated or unused files.
9. Add environment configuration.
10. Add tests after behavior is stable.

## Naming Conventions

### Components

Use Angular naming:

```txt
feature-name.component.ts
feature-name.component.html
feature-name.component.scss
```

Examples:

```txt
login.component.ts
dashboard-layout.component.ts
profile.component.ts
```

### Services

Use:

```txt
feature.service.ts
auth.service.ts
user.service.ts
profile.service.ts
```

### Interfaces

Use:

```txt
user.interface.ts
auth.interface.ts
api-response.interface.ts
pagination.interface.ts
```

### Observable Variables

Use `$` suffix:

```ts
currentUser$: Observable<User | null>;
loading$: Observable<boolean>;
error$: Observable<string | null>;
```

## Component Pattern

Preferred component responsibilities:

```ts
export class ExampleComponent {
  data$ = this.exampleService.data$;
  loading$ = this.exampleService.loading$;
  error$ = this.exampleService.error$;

  constructor(private readonly exampleService: ExampleService) {}

  load(): void {
    this.exampleService.load();
  }
}
```

Template:

```html
<section *ngIf="loading$ | async">Loading...</section>

<section *ngIf="error$ | async as error">
  {{ error }}
</section>

<section *ngIf="data$ | async as data">
  <!-- render data -->
</section>
```

## Service Pattern

Preferred service responsibilities:

```ts
@Injectable({ providedIn: 'root' })
export class ExampleService {
  private readonly dataSubject = new BehaviorSubject<Example[]>([]);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);

  readonly data$ = this.dataSubject.asObservable();
  readonly loading$ = this.loadingSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  load(): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.http.get<Example[]>('/api/examples').pipe(
      finalize(() => this.loadingSubject.next(false))
    ).subscribe({
      next: (data) => this.dataSubject.next(data),
      error: () => this.errorSubject.next('Could not load examples.'),
    });
  }
}
```

## Avoid

Avoid this in components:

```ts
ngOnInit(): void {
  this.http.get('/api/users').subscribe(...)
}
```

Avoid untyped data:

```ts
any
object
```

Avoid mixing page layout with global layout.

Avoid copying navbar/footer into multiple pages.

## Expected Documentation Files

```txt
docs/
  agent-guide.md
  features.md
  core.md
  layout.md
  styles.md
  initial-config.md
  package.md
  proxy.md
  services-observable.md
  shared.md
```

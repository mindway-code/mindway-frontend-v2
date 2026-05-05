# Services Observable Pattern

## Goal

Migrate services to an Observable-based pattern.

This helps:

- Keep components cleaner
- Centralize API state
- Reuse data across components
- Handle loading and errors consistently
- Make the app easier for AI agents and developers to understand

## Angular HTTP and Observables

Angular `HttpClient` methods return Observables.

Recommended flow:

```txt
Component -> Service -> HttpClient -> Observable state -> Template async pipe
```

## Naming Convention

Always use `$` suffix for Observable variables:

```ts
users$
currentUser$
loading$
error$
```

## Basic Service Template

```ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, finalize, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ExampleService {
  private readonly apiUrl = '/api/examples';

  private readonly itemsSubject = new BehaviorSubject<Example[]>([]);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);

  readonly items$ = this.itemsSubject.asObservable();
  readonly loading$ = this.loadingSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  loadItems(): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.http.get<Example[]>(this.apiUrl).pipe(
      catchError(() => {
        this.errorSubject.next('Could not load items.');
        return of([]);
      }),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe((items) => {
      this.itemsSubject.next(items);
    });
  }
}
```

## Component Using Observable Service

```ts
import { Component, OnInit } from '@angular/core';
import { ExampleService } from '../../services/example.service';

@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
  styleUrl: './example.component.scss',
})
export class ExampleComponent implements OnInit {
  readonly items$ = this.exampleService.items$;
  readonly loading$ = this.exampleService.loading$;
  readonly error$ = this.exampleService.error$;

  constructor(private readonly exampleService: ExampleService) {}

  ngOnInit(): void {
    this.exampleService.loadItems();
  }
}
```

## Template With Async Pipe

```html
<section *ngIf="loading$ | async" class="loading">
  Loading...
</section>

<section *ngIf="error$ | async as error" class="error">
  {{ error }}
</section>

<section *ngIf="items$ | async as items">
  <article *ngFor="let item of items">
    {{ item.name }}
  </article>
</section>
```

## Auth Service Pattern

Recommended:

```ts
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);

  readonly currentUser$ = this.currentUserSubject.asObservable();
  readonly loading$ = this.loadingSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();

  readonly isAuthenticated$ = this.currentUser$.pipe(
    map((user) => Boolean(user))
  );

  constructor(private readonly http: HttpClient) {}

  login(payload: LoginPayload): Observable<User> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.post<ApiResponse<User>>('/api/auth/login', payload).pipe(
      map((response) => response.data),
      tap((user) => this.currentUserSubject.next(user)),
      catchError((error) => {
        this.errorSubject.next('Invalid email or password.');
        throw error;
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  logout(): void {
    this.currentUserSubject.next(null);
  }
}
```

## Component Login Pattern

For form submit, it is acceptable to subscribe because it is an action.

```ts
onSubmit(): void {
  if (this.form.invalid) return;

  this.authService.login(this.form.value).subscribe({
    next: () => {
      this.router.navigate(['/dashboard']);
    },
    error: () => {
      // error state already handled by service
    },
  });
}
```

## When Manual Subscribe Is Acceptable

Manual subscribe is acceptable for:

- Button actions
- Form submissions
- Navigation after success
- One-time side effects

Manual subscribe should be avoided for:

- Rendering lists
- Rendering current user
- Rendering loading state
- Rendering error state

For rendering, prefer `async` pipe.

## Avoid Nested Subscriptions

Avoid:

```ts
this.authService.login(payload).subscribe(() => {
  this.profileService.getProfile().subscribe(() => {
    // nested subscription
  });
});
```

Prefer:

```ts
this.authService.login(payload).pipe(
  switchMap(() => this.profileService.getProfile())
).subscribe();
```

## Using `takeUntilDestroyed`

When a component must subscribe manually for a stream that lives longer, use `takeUntilDestroyed()`.

```ts
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

constructor() {
  this.service.data$
    .pipe(takeUntilDestroyed())
    .subscribe((data) => {
      // side effect
    });
}
```

## Suggested Service Files

```txt
src/app/services/auth.service.ts
src/app/services/profile.service.ts
src/app/services/dashboard.service.ts
src/app/services/user.service.ts
```

## Suggested API Interfaces

```txt
src/app/api/interfaces/api-response.interface.ts
src/app/api/interfaces/auth.interface.ts
src/app/api/interfaces/user.interface.ts
src/app/api/interfaces/profile.interface.ts
```

## Recommended Migration Checklist

For each service:

- [ ] Create typed interfaces.
- [ ] Add private `BehaviorSubject`s.
- [ ] Expose readonly Observables.
- [ ] Add loading state.
- [ ] Add error state.
- [ ] Move HTTP calls from components to services.
- [ ] Replace direct component state with `async` pipe.
- [ ] Avoid `any`.
- [ ] Keep submit subscriptions only where needed.

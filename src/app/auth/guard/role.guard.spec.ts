import { convertToParamMap, Router } from '@angular/router';
import { BehaviorSubject, firstValueFrom, of } from 'rxjs';
import type { UserRecord } from '../../api/interfaces/user.interface';
import { AuthService } from '../../services/auth.service';
import { RoleGuard } from './role.guard';

describe('RoleGuard', () => {
  let currentUser: BehaviorSubject<UserRecord | null>;
  let auth: Pick<AuthService, 'currentUser$' | 'isAuthenticated$'>;
  let router: jasmine.SpyObj<Router>;
  let guard: RoleGuard;

  beforeEach(() => {
    currentUser = new BehaviorSubject<UserRecord | null>(null);
    auth = { currentUser, currentUser$: currentUser, isAuthenticated$: of(false) } as any;
    router = jasmine.createSpyObj<Router>('Router', ['parseUrl']);
    router.parseUrl.and.callFake((url) => ({ toString: () => url }) as any);
    guard = new RoleGuard(auth as AuthService, router);
  });

  function route(roles: string[] = []): any {
    return { data: { roles }, queryParamMap: convertToParamMap({}) };
  }

  it('allows a user whose role is listed', async () => {
    currentUser.next({ id: 'user-1', role: 'professional' } as UserRecord);
    await expectAsync(firstValueFrom(guard.canActivate(route(['professional'])))).toBeResolvedTo(
      true,
    );
  });

  it('redirects an authenticated user with a forbidden role', async () => {
    currentUser.next({ id: 'user-1', role: 'common' } as UserRecord);
    const result = await firstValueFrom(guard.canActivate(route(['professional'])));
    expect(String(result)).toBe('/unauthorized');
  });

  it('redirects an anonymous user to login', async () => {
    const result = await firstValueFrom(guard.canActivate(route(['admin'])));
    expect(String(result)).toBe('/login');
  });
});

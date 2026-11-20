import { convertToParamMap, Router, type RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, firstValueFrom, of } from 'rxjs';
import type { UserRecord } from '../../api/interfaces/user.interface';
import { AuthService } from '../../services/auth.service';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  const route = { queryParamMap: convertToParamMap({}) } as any;
  const state = { url: '/reports-child' } as RouterStateSnapshot;
  let currentUser: BehaviorSubject<UserRecord | null>;
  let auth: jasmine.SpyObj<AuthService> & { currentUser$: BehaviorSubject<UserRecord | null> };
  let router: jasmine.SpyObj<Router>;
  let guard: AuthGuard;

  beforeEach(() => {
    currentUser = new BehaviorSubject<UserRecord | null>(null);
    auth = Object.assign(jasmine.createSpyObj<AuthService>('AuthService', ['restoreSession']), {
      currentUser$: currentUser,
    });
    router = jasmine.createSpyObj<Router>('Router', ['createUrlTree']);
    router.createUrlTree.and.returnValue({ toString: () => '/login' } as any);
    guard = new AuthGuard(router, auth);
  });

  it('allows an already authenticated user without restoring the session', async () => {
    currentUser.next({ id: 'user-1', role: 'common' } as UserRecord);

    await expectAsync(firstValueFrom(guard.canActivate(route, state))).toBeResolvedTo(true);
    expect(auth.restoreSession).not.toHaveBeenCalled();
  });

  it('allows a successfully restored session', async () => {
    auth.restoreSession.and.returnValue(of({ id: 'user-1', role: 'common' } as UserRecord));

    await expectAsync(firstValueFrom(guard.canActivate(route, state))).toBeResolvedTo(true);
  });

  it('redirects to login with the requested URL when restoration fails', async () => {
    const loginTree = { toString: () => '/login?redirect=%2Freports-child' } as any;
    auth.restoreSession.and.returnValue(of(null));
    router.createUrlTree.and.returnValue(loginTree);

    await expectAsync(firstValueFrom(guard.canActivate(route, state))).toBeResolvedTo(loginTree);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/login'], {
      queryParams: { redirect: '/reports-child' },
    });
  });
});

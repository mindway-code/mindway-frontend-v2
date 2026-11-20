import { FormBuilder } from '@angular/forms';
import { convertToParamMap, Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let auth: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  function create(redirect: string | null = null): LoginComponent {
    auth = jasmine.createSpyObj<AuthService>('AuthService', ['login', 'loadCurrentUser'], {
      loading$: of(false),
      error$: of(null),
    });
    auth.login.and.returnValue(of('token'));
    auth.loadCurrentUser.and.returnValue(of({ id: 'user-1', role: 'common' } as any));
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    const route = { snapshot: { queryParamMap: convertToParamMap({ redirect }) } } as any;
    return new LoginComponent(new FormBuilder(), auth, router, route);
  }

  it('does not call authentication with an invalid form', () => {
    const component = create();
    component.onSubmit();
    expect(auth.login).not.toHaveBeenCalled();
  });

  it('loads the user and returns to the requested page after login', () => {
    const component = create('/reports-child');
    component.form.setValue({ email: 'user@example.test', password: 'password' });
    component.onSubmit();
    expect(auth.login).toHaveBeenCalledWith({ email: 'user@example.test', password: 'password' });
    expect(auth.loadCurrentUser).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/reports-child']);
  });
});

import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  let auth: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let component: RegisterComponent;

  beforeEach(() => {
    auth = jasmine.createSpyObj<AuthService>('AuthService', ['register', 'loadCurrentUser'], {
      loading$: of(false),
      error$: of(null),
    });
    auth.register.and.returnValue(of('token'));
    auth.loadCurrentUser.and.returnValue(of({ id: 'user-1', role: 'common' } as any));
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    component = new RegisterComponent(new FormBuilder(), auth, router);
  });

  it('does not register an invalid form', () => {
    component.onSubmit();
    expect(auth.register).not.toHaveBeenCalled();
  });

  it('registers a common account, loads it and opens the profile', () => {
    component.form.setValue({
      name: 'User Test',
      email: 'user@example.test',
      password: 'password',
      confirmPassword: 'password',
    });
    component.onSubmit();
    expect(auth.register).toHaveBeenCalledWith({
      name: 'User Test',
      email: 'user@example.test',
      password: 'password',
      confirmPassword: 'password',
      role: 'common',
    });
    expect(auth.loadCurrentUser).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/profile']);
  });
});

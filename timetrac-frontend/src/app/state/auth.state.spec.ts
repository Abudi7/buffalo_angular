import { TestBed } from '@angular/core/testing';
import { AuthState } from './auth.state';
import { AuthService } from '../core/auth.service';
import { NgxsModule, Store } from '@ngxs/store';
import { Logout } from './auth.actions';
import { of, throwError } from 'rxjs';

describe('AuthState', () => {
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([AuthState])],
      providers: [
        {
          provide: AuthService,
          useValue: {
            logout: () => of({ status: 'ok' }),
          },
        },
      ],
    });
    store = TestBed.inject(Store);
    localStorage.setItem('token', 'x');
    store.reset({ auth: { user: { id: '1', email: 'a', created_at: '', updated_at: '' }, token: 'x', expires_at: '' } });
  });

  it('clears auth state on logout success', (done) => {
    store.dispatch(new Logout()).subscribe(() => {
      const state = store.snapshot() as any;
      expect(state.auth.token).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
      done();
    });
  });

  it('clears auth state even if API fails', (done) => {
    const svc = TestBed.inject(AuthService) as any;
    svc.logout = () => throwError(() => new Error('network'));
    store.dispatch(new Logout()).subscribe(() => {
      const state = store.snapshot() as any;
      expect(state.auth.token).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
      done();
    });
  });
});



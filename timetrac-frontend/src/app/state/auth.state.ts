// NGXS auth state models the authenticated user and JWT token.
// All mutations are centralized here to keep side-effects observable and testable.
import { Injectable, inject } from '@angular/core';
import { State, Selector, Action, StateContext } from '@ngxs/store';
import { AuthService, User } from '../core/auth.service';
import { Login, Register, LoadMe, Logout } from './auth.actions';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export interface AuthStateModel {
  user: User | null;
  token: string | null;
  expires_at: string | null;
}

@State<AuthStateModel>({
  name: 'auth',
  defaults: { user: null, token: null, expires_at: null }
})
@Injectable()
export class AuthState {
  private auth = inject(AuthService);

  @Selector() static user(s: AuthStateModel) { return s.user; }
  @Selector() static token(s: AuthStateModel) { return s.token; }
  @Selector() static isLoggedIn(s: AuthStateModel) { return !!s.token; }

  @Action(Register)
  register(ctx: StateContext<AuthStateModel>, { email, password }: Register) {
    return this.auth.register(email, password).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        ctx.patchState({ user: res.user, token: res.token, expires_at: res.expires_at });
      })
    );
  }

  @Action(Login)
  login(ctx: StateContext<AuthStateModel>, { email, password }: Login) {
    return this.auth.login(email, password).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        ctx.patchState({ user: res.user, token: res.token, expires_at: res.expires_at });
      })
    );
  }

  @Action(LoadMe)
  loadMe(ctx: StateContext<AuthStateModel>) {
    const token = localStorage.getItem('token');
    if (!token) return;
    return this.auth.me().pipe(
      tap(user => ctx.patchState({ user, token }))
    );
  }

  // Make logout idempotent: clear local state even if server call fails
  @Action(Logout)
  logout(ctx: StateContext<AuthStateModel>) {
    return this.auth.logout().pipe(
      catchError(err => {
        console.warn('Logout API error (ignored):', err);
        return of({});
      }),
      tap(() => {
        localStorage.removeItem('token');
        ctx.setState({ user: null, token: null, expires_at: null });
      })
    );
  }
}

/**
 * AuthState - NGXS Authentication State Management
 * 
 * This state class manages all authentication-related state in the application.
 * It handles user authentication, token management, and session persistence.
 * All authentication mutations are centralized here to keep side-effects
 * observable and testable.
 * 
 * Key Features:
 * - User authentication state management
 * - JWT token storage and validation
 * - Session persistence with localStorage
 * - Centralized authentication logic
 * - Error handling and recovery
 * 
 * Architecture:
 * - Uses NGXS for state management
 * - Integrates with AuthService for API calls
 * - Provides selectors for component consumption
 * - Handles token persistence automatically
 * 
 * @author Abud Developer
 * @version 1.0.0
 * @since 2025-09-10
 */
import { Injectable, inject } from '@angular/core';
import { State, Selector, Action, StateContext } from '@ngxs/store';
import { AuthService, User } from '../core/auth.service';
import { Login, Register, LoadMe, Logout } from './auth.actions';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

/**
 * AuthStateModel Interface - Authentication State Structure
 * 
 * This interface defines the structure of the authentication state
 * managed by the AuthState class. It includes user data, token information,
 * and expiration details.
 * 
 * Fields:
 * - user: Current authenticated user data (null if not logged in)
 * - token: JWT token for API authentication (null if not logged in)
 * - expires_at: Token expiration timestamp (null if not logged in)
 */
export interface AuthStateModel {
  user: User | null;        // Current authenticated user
  token: string | null;     // JWT authentication token
  expires_at: string | null; // Token expiration timestamp
}

/**
 * NGXS State Configuration
 * 
 * Defines the authentication state with default values.
 * The state is initialized with null values for all authentication data.
 */
@State<AuthStateModel>({
  name: 'auth',
  defaults: { user: null, token: null, expires_at: null }
})
@Injectable()
export class AuthState {
  /**
   * Injected AuthService for API communication
   */
  private auth = inject(AuthService);

  // ===== SELECTORS =====
  
  /**
   * Selector for current user data
   * @param s - AuthStateModel instance
   * @returns User object or null if not authenticated
   */
  @Selector() static user(s: AuthStateModel) { return s.user; }
  
  /**
   * Selector for current JWT token
   * @param s - AuthStateModel instance
   * @returns JWT token string or null if not authenticated
   */
  @Selector() static token(s: AuthStateModel) { return s.token; }
  
  /**
   * Selector for authentication status
   * @param s - AuthStateModel instance
   * @returns true if user is authenticated, false otherwise
   */
  @Selector() static isLoggedIn(s: AuthStateModel) { return !!s.token; }

  // ===== ACTIONS =====
  
  /**
   * Handles user registration action
   * 
   * This action processes user registration by calling the AuthService
   * and updating the state with the new user data and JWT token.
   * The token is also stored in localStorage for persistence.
   * 
   * @param ctx - NGXS state context
   * @param email - User's email address
   * @param password - User's password
   */
  @Action(Register)
  register(ctx: StateContext<AuthStateModel>, { email, password }: Register) {
    return this.auth.register(email, password).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        ctx.patchState({ user: res.user, token: res.token, expires_at: res.expires_at });
      })
    );
  }

  /**
   * Handles user login action
   * 
   * This action processes user login by calling the AuthService
   * and updating the state with the user data and JWT token.
   * The token is also stored in localStorage for persistence.
   * 
   * @param ctx - NGXS state context
   * @param email - User's email address
   * @param password - User's password
   */
  @Action(Login)
  login(ctx: StateContext<AuthStateModel>, { email, password }: Login) {
    return this.auth.login(email, password).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        ctx.patchState({ user: res.user, token: res.token, expires_at: res.expires_at });
      })
    );
  }

  /**
   * Handles loading current user profile action
   * 
   * This action loads the current user's profile information using
   * a stored token. It's typically used during app initialization
   * to restore the user session.
   * 
   * @param ctx - NGXS state context
   */
  @Action(LoadMe)
  loadMe(ctx: StateContext<AuthStateModel>) {
    const token = localStorage.getItem('token');
    if (!token) return;
    return this.auth.me().pipe(
      tap(user => ctx.patchState({ user, token }))
    );
  }

  /**
   * Handles user logout action
   * 
   * This action processes user logout by calling the AuthService
   * to revoke the token and clearing all authentication state.
   * It's designed to be idempotent - local state is cleared even
   * if the server call fails.
   * 
   * @param ctx - NGXS state context
   */
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

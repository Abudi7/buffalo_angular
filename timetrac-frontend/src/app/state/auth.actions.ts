/**
 * Authentication Actions - NGXS Action Classes
 * 
 * This file defines all authentication-related actions for the NGXS state management.
 * Actions are dispatched from components and handled by the AuthState class.
 * Each action represents a specific authentication operation.
 * 
 * @author Abud Developer
 * @version 1.0.0
 * @since 2025-09-10
 */

/**
 * Login Action - User Authentication
 * 
 * Dispatched when a user attempts to log in with email and password.
 * This action triggers the login process in the AuthState.
 * 
 * @param email - User's email address
 * @param password - User's password
 */
export class Login {
    static readonly type = '[Auth] Login';
    constructor(public email: string, public password: string) {}
  }

/**
 * Register Action - User Registration
 * 
 * Dispatched when a new user attempts to register an account.
 * This action triggers the registration process in the AuthState.
 * 
 * @param email - User's email address
 * @param password - User's password
 */
  export class Register {
    static readonly type = '[Auth] Register';
    constructor(public email: string, public password: string) {}
  }

/**
 * LoadMe Action - Load Current User Profile
 * 
 * Dispatched to load the current user's profile information.
 * This action is typically used during app initialization to restore
 * the user session from a stored token.
 */
  export class LoadMe {
    static readonly type = '[Auth] Load Me';
  }

/**
 * Logout Action - User Logout
 * 
 * Dispatched when a user logs out of the application.
 * This action triggers the logout process, clearing the user session
 * and revoking the JWT token.
 */
  export class Logout {
    static readonly type = '[Auth] Logout';
  }
  
/**
 * AuthService - Authentication API Service
 * 
 * This service provides a clean interface for all authentication operations.
 * It handles user registration, login, profile retrieval, and logout functionality.
 * The service is intentionally thin and stateless, with state management
 * delegated to NGXS for better separation of concerns.
 * 
 * Key Features:
 * - User registration with email/password validation
 * - Secure login with JWT token generation
 * - Profile retrieval for authenticated users
 * - Secure logout with token revocation
 * - Type-safe API interactions
 * 
 * Architecture:
 * - Injectable service with root-level provider
 * - Uses Angular HttpClient for API communication
 * - Environment-based API endpoint configuration
 * - Stateless design with external state management
 * 
 * @author Abud Developer
 * @version 1.0.0
 * @since 2025-09-10
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

/**
 * User Interface - User Account Data Structure
 * 
 * This interface defines the structure of user account data
 * as returned by the authentication API. It provides type safety
 * for all user-related operations.
 * 
 * Fields:
 * - id: Unique user identifier
 * - email: User's email address (login identifier)
 * - created_at: Account creation timestamp
 * - updated_at: Last modification timestamp
 * 
 * Note: Password hash is not included for security reasons
 */
export interface User {
  id: string;        // Unique user identifier
  email: string;     // User's email address
  created_at: string; // Account creation timestamp
  updated_at: string; // Last modification timestamp
}

/**
 * AuthService Class - Authentication API Service Implementation
 * 
 * Injectable service that provides methods for all authentication operations.
 * Uses Angular's HttpClient for API communication and returns observables
 * for reactive programming patterns.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  /**
   * Base API URL for authentication endpoints
   * Constructed from environment configuration
   */
  private base = environment.API_BASE;
  
  /**
   * Injected HttpClient instance for API communication
   * Automatically includes authentication headers via interceptors
   */
  private http = inject(HttpClient);

  /**
   * Registers a new user account
   * 
   * POST /api/auth/register
   * 
   * This method creates a new user account with the provided email and password.
   * Upon successful registration, it automatically logs in the user and returns
   * the user data along with a JWT token.
   * 
   * @param email - User's email address (will be normalized to lowercase)
   * @param password - User's password (minimum 6 characters)
   * @returns Observable with user data, JWT token, and expiration time
   */
  register(email: string, password: string) {
    return this.http.post<{ user: User; token: string; expires_at: string }>(
      `${this.base}/api/auth/register`, { email, password }
    );
  }

  /**
   * Authenticates a user and returns JWT token
   * 
   * POST /api/auth/login
   * 
   * This method authenticates a user with their email and password.
   * Upon successful authentication, it returns the user data along
   * with a JWT token for subsequent API calls.
   * 
   * @param email - User's email address
   * @param password - User's password
   * @returns Observable with user data, JWT token, and expiration time
   */
  login(email: string, password: string) {
    return this.http.post<{ user: User; token: string; expires_at: string }>(
      `${this.base}/api/auth/login`, { email, password }
    );
  }

  /**
   * Retrieves the current user's profile information
   * 
   * GET /api/me
   * 
   * This method fetches the profile information of the currently
   * authenticated user. It requires a valid JWT token in the
   * Authorization header.
   * 
   * @returns Observable<User> - Current user's profile data
   */
  me() {
    return this.http.get<User>(`${this.base}/api/me`);
  }

  /**
   * Logs out the current user and revokes their token
   * 
   * POST /api/logout
   * 
   * This method securely logs out the user by revoking their JWT token.
   * The token is marked as revoked in the database, preventing its
   * future use even if it hasn't expired.
   * 
   * @returns Observable with logout confirmation status
   */
  logout() {
    return this.http.post<{ status: string }>(`${this.base}/api/logout`, {});
  }
}

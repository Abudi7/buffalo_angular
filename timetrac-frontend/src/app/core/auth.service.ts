// AuthService handles registration, login, me, and logout calls.
// It is intentionally thin and stateless; state lives in NGXS.
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = environment.API_BASE;
  private http = inject(HttpClient);

  register(email: string, password: string) {
    return this.http.post<{ user: User; token: string; expires_at: string }>(
      `${this.base}/api/auth/register`, { email, password }
    );
  }

  login(email: string, password: string) {
    return this.http.post<{ user: User; token: string; expires_at: string }>(
      `${this.base}/api/auth/login`, { email, password }
    );
  }

  me() {
    return this.http.get<User>(`${this.base}/api/me`);
  }

  logout() {
    return this.http.post<{ status: string }>(`${this.base}/api/logout`, {});
  }
}

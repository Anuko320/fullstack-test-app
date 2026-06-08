import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  readonly authenticated = signal(!!localStorage.getItem('accessToken'));

  async login(username: string, password: string): Promise<boolean> {
    try {
      const response = await this.http
        .post<LoginResponse>(`${environment.apiUrl}/auth/login`, {
          username,
          password,
        })
        .toPromise();

      if (response?.accessToken) {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        this.authenticated.set(true);
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.authenticated.set(false);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.authenticated();
  }
}
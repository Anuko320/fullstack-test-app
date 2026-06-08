import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, map, of } from 'rxjs';
import { User } from '../../../core/models/user';
import { environment } from '../../../../environments/environment';

interface ApiResponse {
  data: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private http = inject(HttpClient);

  readonly users = signal<User[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  init(): void {
    this.loading.set(true);
    this.error.set(null);

    this.http
      .get<ApiResponse>(`${environment.apiUrl}/users?limit=100`)
      .pipe(
        map((res) => res.data),
        catchError(() => {
          this.error.set('Не удалось загрузить пользователей.');
          return of<User[]>([]);
        }),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((users) => this.users.set(users));
  }

  reloadFromApi(): void {
    this.init();
  }

  async addUser(input: Omit<User, 'id'>): Promise<void> {
    await this.http
      .post<User>(`${environment.apiUrl}/users`, input)
      .toPromise();
    this.init();
  }

  async deleteUser(id: number): Promise<void> {
    await this.http
      .delete(`${environment.apiUrl}/users/${id}`)
      .toPromise();
    this.init();
  }
  
  async updateUser(updatedUser: User): Promise<void> {
    await this.http
      .patch<User>(`${environment.apiUrl}/users/${updatedUser.id}`, {
        name: updatedUser.name,
        email: updatedUser.email,
        city: updatedUser.city,
      })
      .toPromise();
    this.init();
  }
}
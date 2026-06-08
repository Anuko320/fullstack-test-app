import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, finalize, map, of } from 'rxjs';
import { User } from '../../../core/models/user';
import { environment } from '../../../../environments/environment';

export type SortField = 'id' | 'name' | 'email' | 'city' | 'createdAt';
export type SortOrder = 'ASC' | 'DESC';

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

  loadUsers(options?: {
    search?: string;
    sortBy?: SortField;
    order?: SortOrder;
  }): void {
    this.loading.set(true);
    this.error.set(null);

    let params = new HttpParams().set('limit', '100');

    if (options?.search) {
      params = params.set('search', options.search);
    }
    if (options?.sortBy) {
      params = params.set('sortBy', options.sortBy);
    }
    if (options?.order) {
      params = params.set('order', options.order);
    }

    this.http
      .get<ApiResponse>(`${environment.apiUrl}/users`, { params })
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

  init(): void {
    this.loadUsers();
  }

  reloadFromApi(): void {
    this.loadUsers();
  }

  async addUser(input: Omit<User, 'id'>): Promise<void> {
    await this.http
      .post<User>(`${environment.apiUrl}/users`, input)
      .toPromise();
    this.loadUsers();
  }

  async deleteUser(id: number): Promise<void> {
    await this.http
      .delete(`${environment.apiUrl}/users/${id}`)
      .toPromise();
    this.loadUsers();
  }

  async updateUser(updatedUser: User): Promise<void> {
    await this.http
      .patch<User>(`${environment.apiUrl}/users/${updatedUser.id}`, {
        name: updatedUser.name,
        email: updatedUser.email,
        city: updatedUser.city,
        phone: updatedUser.phone,
        website: updatedUser.website,
      })
      .toPromise();
    this.loadUsers();
  }
}
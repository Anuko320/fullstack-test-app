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
  readonly hasMore = signal(true);
  readonly currentPage = signal(1);

  private currentSearch = '';
  private currentSortBy: SortField = 'id';
  private currentOrder: SortOrder = 'ASC';
  private readonly PAGE_SIZE = 10;

  loadUsers(options?: {
    search?: string;
    sortBy?: SortField;
    order?: SortOrder;
    reset?: boolean;
  }): void {
    const isReset = options?.reset !== false;
    if (isReset) {
    this.users.set([]);
    this.currentPage.set(1);
    this.hasMore.set(true);
  }

    if (options?.search !== undefined) this.currentSearch = options.search;
    if (options?.sortBy) this.currentSortBy = options.sortBy;
    if (options?.order) this.currentOrder = options.order;

    this.loading.set(true);
    this.error.set(null);

    let params = new HttpParams()
      .set('page', this.currentPage())
      .set('limit', this.PAGE_SIZE);

    if (this.currentSearch) {
      params = params.set('search', this.currentSearch);
    }
    if (this.currentSortBy) {
      params = params.set('sortBy', this.currentSortBy);
    }
    if (this.currentOrder) {
      params = params.set('order', this.currentOrder);
    }

    this.http
      .get<ApiResponse>(`${environment.apiUrl}/users`, { params })
      .pipe(
        catchError(() => {
          this.error.set('Не удалось загрузить пользователей.');
          return of<ApiResponse>({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } });
        }),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((res) => {
        if (isReset) {
          this.users.set(res.data);
        } else {
          this.users.update((prev) => [...prev, ...res.data]);
        }
        this.hasMore.set(this.currentPage() < res.meta.totalPages);
      });
  }

  loadMore(): void {
    if (this.loading() || !this.hasMore()) return;
    this.currentPage.update((p) => p + 1);
    this.loadUsers({ reset: false });
  }

  init(): void {
    this.loadUsers({ reset: true });
  }

  reloadFromApi(): void {
    this.loadUsers({ reset: true });
  }

  async addUser(input: Omit<User, 'id'>): Promise<void> {
    await this.http
      .post<User>(`${environment.apiUrl}/users`, input)
      .toPromise();
    this.loadUsers({ reset: true });
  }

  async deleteUser(id: number): Promise<void> {
    await this.http
      .delete(`${environment.apiUrl}/users/${id}`)
      .toPromise();
    this.loadUsers({ reset: true });
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
    this.loadUsers({ reset: true });
  }
}
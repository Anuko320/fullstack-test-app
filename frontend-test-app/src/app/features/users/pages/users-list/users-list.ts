import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  CdkConnectedOverlay,
  CdkOverlayOrigin,
} from '@angular/cdk/overlay';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AuthService } from '../../../../core/services/auth';
import { UsersService, SortField, SortOrder } from '../../services/users.service';

import { Dialog } from '@angular/cdk/dialog';
import { AddUserDialog } from '../../../../shared/add-user-dialog/add-user-dialog';
import { EditUserDialog, EditUserDialogData } from '../../../../shared/edit-user-dialog/edit-user-dialog';
import { AppHeader } from '../../../../shared/app-header/app-header';

const DELETE_MESSAGE_MS = 3000;

@Component({
  selector: 'app-users-list',
  imports: [
    CdkOverlayOrigin,
    CdkConnectedOverlay,
    TranslateModule,
    AppHeader,
  ],
  templateUrl: './users-list.html',
  styleUrl: './users-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersList {
  private readonly usersService = inject(UsersService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translate = inject(TranslateService);
  private deleteMessageTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly dialog = inject(Dialog);

  readonly users = this.usersService.users;
  readonly loading = this.usersService.loading;
  readonly error = this.usersService.error;

  readonly pendingDeleteId = signal<number | null>(null);
  readonly editingUserId = signal<number | null>(null);
  readonly searchInput = signal('');
  readonly sortBy = signal<SortField>('id');
  readonly sortOrder = signal<SortOrder>('ASC');
  readonly showSortDropdown = signal(false);
  readonly deleteMessage = signal<string | null>(null);

  readonly displayedUsers = computed(() => this.users());
  readonly totalUsers = computed(() => this.users().length);
  readonly visibleUsers = computed(() => this.users().length);

  constructor() {
    this.usersService.init();
    this.destroyRef.onDestroy(() => {
      if (this.deleteMessageTimer !== null) {
        window.clearTimeout(this.deleteMessageTimer);
      }
    });
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchInput.set(value);
    this.usersService.loadUsers({
      search: value,
      sortBy: this.sortBy(),
      order: this.sortOrder(),
    });
  }

  clearSearch(): void {
    this.searchInput.set('');
    this.usersService.loadUsers({
      sortBy: this.sortBy(),
      order: this.sortOrder(),
    });
  }

  onSortFieldChange(field: SortField): void {
    this.sortBy.set(field);
    this.showSortDropdown.set(false);
    this.usersService.loadUsers({
      search: this.searchInput(),
      sortBy: field,
      order: this.sortOrder(),
    });
  }

  onSortOrderChange(order: SortOrder): void {
    this.sortOrder.set(order);
    this.usersService.loadUsers({
      search: this.searchInput(),
      sortBy: this.sortBy(),
      order: order,
    });
  }

  retryLoad(): void {
    this.usersService.loadUsers({
      search: this.searchInput(),
      sortBy: this.sortBy(),
      order: this.sortOrder(),
    });
  }

  openAddUserDialog(): void {
    this.dialog.open(AddUserDialog, {
      panelClass: 'dialog-panel',
    });
  }

  requestDelete(id: number): void {
    this.pendingDeleteId.set(id);
  }

  openEditUser(user: { id: number; name: string; email: string; city: string; phone?: string; website?: string }): void {
    this.dialog.open<unknown, EditUserDialogData>(EditUserDialog, {
      data: user,
      panelClass: 'dialog-panel',
    });
  }

  cancelDelete(): void {
    this.pendingDeleteId.set(null);
  }

  async confirmDelete(): Promise<void> {
    const id = this.pendingDeleteId();
    if (id === null) return;

    const user = this.users().find((u) => u.id === id);
    this.pendingDeleteId.set(null);

    await this.usersService.deleteUser(id);

    if (user) {
      this.showDeleteMessage(
        this.translate.instant('users.deleteSuccess', { name: user.name }),
      );
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private showDeleteMessage(message: string): void {
    if (this.deleteMessageTimer !== null) {
      window.clearTimeout(this.deleteMessageTimer);
    }
    this.deleteMessage.set(message);
    this.deleteMessageTimer = window.setTimeout(() => {
      this.deleteMessage.set(null);
      this.deleteMessageTimer = null;
    }, DELETE_MESSAGE_MS);
  }
}
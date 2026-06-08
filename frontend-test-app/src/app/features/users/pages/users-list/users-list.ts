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
import { form, FormField, email, minLength, required, submit } from '@angular/forms/signals';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AuthService } from '../../../../core/services/auth';
import { UsersService } from '../../services/users.service';

import { Dialog } from '@angular/cdk/dialog';
import { AddUserDialog } from '../../../../shared/add-user-dialog/add-user-dialog';

import { EditUserDialog, EditUserDialogData } from '../../../../shared/edit-user-dialog/edit-user-dialog';
import { AppHeader } from '../../../../shared/app-header/app-header';

const DELETE_MESSAGE_MS = 3000;

export type NameSortOrder = 'default' | 'asc' | 'desc';

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
  readonly nameSortOrder = signal<NameSortOrder>('default');

  readonly showAddUserPanel = signal(false);
  readonly showSortDropdown = signal(false);

  readonly deleteMessage = signal<string | null>(null);

  readonly filteredUsers = computed(() => {
    const query = this.searchInput().trim().toLowerCase();
    const list = this.users();

    if (!query) {
      return list;
    }

    return list.filter((user) => user.name.toLowerCase().includes(query));
  });

  readonly displayedUsers = computed(() => {
    const list = [...this.filteredUsers()];
    const order = this.nameSortOrder();

    if (order === 'asc') {
      return list.sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
      );
    }

    if (order === 'desc') {
      return list.sort((a, b) =>
        b.name.localeCompare(a.name, undefined, { sensitivity: 'base' }),
      );
    }

    return list;
  });

  readonly totalUsers = computed(() => this.users().length);
  readonly visibleUsers = computed(() => this.displayedUsers().length);

  readonly newUserModel = signal({
    name: '',
    email: '',
    city: '',
  });

  readonly newUserForm = form(this.newUserModel, (schemaPath) => {
    required(schemaPath.name, { message: 'users.form.nameRequired' });
    minLength(schemaPath.name, 3, { message: 'users.form.nameMinLength' });
    required(schemaPath.email, { message: 'users.form.emailRequired' });
    email(schemaPath.email, { message: 'users.form.emailInvalid' });
    required(schemaPath.city, { message: 'users.form.cityRequired' });
  });

  readonly canAddUser = computed(() => this.newUserForm().valid());

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
  }

  clearSearch(): void {
    this.searchInput.set('');
  }

  onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as NameSortOrder;
    this.nameSortOrder.set(value);
  }

  retryLoad(): void {
    this.usersService.reloadFromApi();
  }

  toggleAddUserPanel(): void {
    this.showAddUserPanel.update((open) => !open);
  }

  closeAddUserPanel(): void {
    this.showAddUserPanel.set(false);
  }

  addUser(): void {
    submit(this.newUserForm, async () => {
      const model = this.newUserModel();
      const editingId = this.editingUserId();

      if (editingId !== null) {
        this.usersService.updateUser({
          id: editingId,
          name: model.name,
          email: model.email,
          city: model.city,
        });

        this.editingUserId.set(null);
      } else {
        this.usersService.addUser({
          name: model.name,
          email: model.email,
          city: model.city,
        });
      }

      this.newUserModel.set({
        name: '',
        email: '',
        city: '',
      });

      this.showAddUserPanel.set(false);
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
  
  openEditUser(user: { id: number; name: string; email: string; city: string }): void {
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

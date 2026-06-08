import { Component, computed, inject, signal } from '@angular/core';
import { form, FormField, email, minLength, required, submit } from '@angular/forms/signals';
import { TranslateModule } from '@ngx-translate/core';
import { DialogRef } from '@angular/cdk/dialog';
import { UsersService } from '../../features/users/services/users.service';

@Component({
  selector: 'app-add-user-dialog',
  imports: [FormField, TranslateModule],
  templateUrl: './add-user-dialog.html',
  styleUrl: './add-user-dialog.scss',
})
export class AddUserDialog {
  private readonly usersService = inject(UsersService);
  private readonly dialogRef = inject(DialogRef);

  readonly newUserModel = signal({ name: '', email: '', city: '' });

  readonly newUserForm = form(this.newUserModel, (schemaPath) => {
    required(schemaPath.name, { message: 'users.form.nameRequired' });
    minLength(schemaPath.name, 3, { message: 'users.form.nameMinLength' });
    required(schemaPath.email, { message: 'users.form.emailRequired' });
    email(schemaPath.email, { message: 'users.form.emailInvalid' });
    required(schemaPath.city, { message: 'users.form.cityRequired' });
  });

  readonly canAddUser = computed(() => this.newUserForm().valid());

  addUser(): void {
    submit(this.newUserForm, async () => {
      const model = this.newUserModel();
      this.usersService.addUser({
        name: model.name,
        email: model.email,
        city: model.city,
      });
      this.dialogRef.close();
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
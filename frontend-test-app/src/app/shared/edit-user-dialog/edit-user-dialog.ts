import { Component, computed, inject, signal } from '@angular/core';
import { form, FormField, email, minLength, required, submit } from '@angular/forms/signals';
import { TranslateModule } from '@ngx-translate/core';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { UsersService } from '../../features/users/services/users.service';

export interface EditUserDialogData {
  id: number;
  name: string;
  email: string;
  city: string;
}
@Component({
  selector: 'app-edit-user-dialog',
  imports: [FormField, TranslateModule],
  templateUrl: './edit-user-dialog.html',
  styleUrl: './edit-user-dialog.scss',
})
export class EditUserDialog {
  private readonly usersService = inject(UsersService);
  private readonly dialogRef = inject(DialogRef);
  private readonly data = inject<EditUserDialogData>(DIALOG_DATA);

  readonly newUserModel = signal({
    name: this.data.name,
    email: this.data.email,
    city: this.data.city,
  });

  readonly newUserForm = form(this.newUserModel, (schemaPath) => {
    required(schemaPath.name, { message: 'users.form.nameRequired' });
    minLength(schemaPath.name, 3, { message: 'users.form.nameMinLength' });
    required(schemaPath.email, { message: 'users.form.emailRequired' });
    email(schemaPath.email, { message: 'users.form.emailInvalid' });
    required(schemaPath.city, { message: 'users.form.cityRequired' });
  });

  readonly canSave = computed(() => this.newUserForm().valid());

  save(): void {
    submit(this.newUserForm, async () => {
      const model = this.newUserModel();
      this.usersService.updateUser({
        id: this.data.id,
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
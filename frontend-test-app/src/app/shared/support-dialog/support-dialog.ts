import { Component, computed, inject, signal } from '@angular/core';
import { form, FormField, email, minLength, required, submit } from '@angular/forms/signals';
import { TranslateModule } from '@ngx-translate/core';
import { DialogRef } from '@angular/cdk/dialog';
import { SupportService } from './support.service';

@Component({
  selector: 'app-support-dialog',
  imports: [FormField, TranslateModule],
  templateUrl: './support-dialog.html',
  styleUrl: './support-dialog.scss',
})
export class SupportDialog {
  private readonly supportService = inject(SupportService);
  private readonly dialogRef = inject(DialogRef);

  readonly loading = signal(false);
  readonly success = signal(false);

  readonly supportModel = signal({
    name: '',
    email: '',
    message: '',
  });

  readonly supportForm = form(this.supportModel, (s) => {
    required(s.name, { message: 'support.form.nameRequired' });
    minLength(s.name, 2, { message: 'support.form.nameMinLength' });
    required(s.email, { message: 'support.form.emailRequired' });
    email(s.email, { message: 'support.form.emailInvalid' });
    required(s.message, { message: 'support.form.messageRequired' });
    minLength(s.message, 10, { message: 'support.form.messageMinLength' });
  });

  readonly canSubmit = computed(() => this.supportForm().valid() && !this.loading());

  sendMessage(): void {
    submit(this.supportForm, async () => {
      this.loading.set(true);
      try {
        const model = this.supportModel();
        await this.supportService.sendSupportRequest(model);
        this.success.set(true);
        setTimeout(() => this.dialogRef.close(), 2000);
      } finally {
        this.loading.set(false);
      }
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}

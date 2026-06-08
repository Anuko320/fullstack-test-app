import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { TranslateModule } from '@ngx-translate/core';

import { AuthService } from '../../../../core/services/auth';

@Component({
  selector: 'app-login',
  imports: [FormField, TranslateModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly errorMessage = signal<string | null>(null);

  readonly loginModel = signal({
    login: '',
    password: '',
  });

  readonly loginForm = form(this.loginModel, (schemaPath) => {
    required(schemaPath.login, { message: 'auth.loginRequired' });
    required(schemaPath.password, { message: 'auth.passwordRequired' });
  });

  onSubmit(): void {
    this.errorMessage.set(null);

    submit(this.loginForm, async () => {
      const { login, password } = this.loginModel();
      const isValid = await this.authService.login(login, password);
      if (isValid) {
        await this.router.navigate(['/users']);
        return;
      }

      this.errorMessage.set('auth.invalidCredentials');
    });
  }
}

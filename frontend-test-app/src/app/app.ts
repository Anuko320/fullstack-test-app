import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Dialog } from '@angular/cdk/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

import { ThemeToggle } from './core/components/theme-toggle/theme-toggle';
import { ThemeService } from './core/services/theme.service';

import { LanguageToggle } from './core/components/language-toggle/language-toggle';

import { AuthService } from './core/services/auth';
import { ConfirmDialog, ConfirmDialogData } from './core/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TranslateModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly dialog = inject(Dialog);

  constructor() {
    inject(ThemeService);
  }

  async logout(): Promise<void> {
    const confirmed = await firstValueFrom(
      this.dialog.open<boolean, ConfirmDialogData, ConfirmDialog>(ConfirmDialog, {
        data: {
          title: 'confirm.logoutTitle',
          message: 'confirm.logoutMessage',
          confirmText: 'confirm.confirm',
          cancelText: 'common.cancel',
        },
        panelClass: 'app-confirm-dialog-panel',
        backdropClass: 'app-confirm-dialog-backdrop',
        disableClose: true,
        role: 'alertdialog',
        ariaModal: true,
        autoFocus: 'first-heading',
      }).closed,
    );

    if (!confirmed) {
      return;
    }

    this.authService.logout();
    void this.router.navigate(['/login']);
  }
}


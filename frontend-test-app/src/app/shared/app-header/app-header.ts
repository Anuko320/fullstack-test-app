import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import { AuthService } from '../../core/services/auth';
import { ThemeService } from '../../core/services/theme.service';
import { LanguageService } from '../../core/services/language.service';
import { ConfirmDialogService } from '../confirm-modal/confirm-dialog.service';

@Component({
  selector: 'app-header',
  imports: [TranslateModule],
  templateUrl: './app-header.html',
  styleUrl: './app-header.scss',
})
export class AppHeader {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  readonly themeService = inject(ThemeService);
  readonly langService = inject(LanguageService);

  readonly menuOpen = signal(false);

  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  logout(): void {
    this.closeMenu();
    this.confirmDialog.open().subscribe((confirmed) => {
      if (confirmed) {
        this.authService.logout();
        void this.router.navigate(['/login']);
      }
    });
  }
}
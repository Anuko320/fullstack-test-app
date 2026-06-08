import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  template: `
    <button
      type="button"
      class="btn btn-secondary theme-toggle"
      (click)="themeService.toggle()"
      [attr.aria-label]="ariaLabel()"
    >
      <span class="theme-toggle-icon" aria-hidden="true">{{ icon() }}</span>
      <span class="theme-toggle-label">{{ label() }}</span>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeToggle {
  readonly themeService = inject(ThemeService);

  readonly label = computed(() =>
    this.themeService.theme() === 'dark' ? 'Light theme' : 'Dark theme',
  );

  readonly icon = computed(() => (this.themeService.theme() === 'dark' ? '☀️' : '🌙'));

  readonly ariaLabel = computed(() =>
    this.themeService.theme() === 'dark'
    ? 'Light'
    : 'Dark',
 );
}

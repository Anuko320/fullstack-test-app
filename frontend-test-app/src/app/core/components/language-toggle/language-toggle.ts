import { Component, computed, inject } from '@angular/core';

import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-language-toggle',
  standalone: true,
  template: `
    <button
      type="button"
      class="btn btn-secondary"
      (click)="languageService.toggle()"
    >
      {{ label() }}
    </button>
  `,
})
export class LanguageToggle {
  readonly languageService = inject(LanguageService);

  readonly label = computed(() =>
    this.languageService.language() === 'en' ? 'Русский' : 'English',
  );
}

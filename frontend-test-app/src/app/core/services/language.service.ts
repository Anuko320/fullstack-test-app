import { Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type Language = 'en' | 'ru';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  readonly language = signal<Language>('en');

  constructor(private readonly translate: TranslateService) {
    this.translate.addLangs(['en', 'ru']);
    this.translate.setFallbackLang('en');
    this.translate.use(this.language());
  }

  toggle(): void {
    this.language.update((lang) => {
      const nextLang = lang === 'en' ? 'ru' : 'en';
      this.translate.use(nextLang);
      return nextLang;
    });
  }
}

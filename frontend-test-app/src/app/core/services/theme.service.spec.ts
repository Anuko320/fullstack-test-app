import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { ThemeService, THEME_STORAGE_KEY } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockReturnValue({
        matches: false,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }),
    });

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
  });

  it('should default to dark theme when system prefers dark and no stored preference', () => {
    // переопределяем matchMedia — система настроена на тёмную тему
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockReturnValue({
        matches: true, // ← тёмная тема в системе
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }),
    });
  
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
  
    const service = TestBed.inject(ThemeService);
    expect(service.theme()).toBe('dark');
  });
  

  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('should default to light theme when no preference is stored', () => {
    const service = TestBed.inject(ThemeService);
    expect(service.theme()).toBe('light');
  });

  it('should toggle theme and persist choice', () => {
    const service = TestBed.inject(ThemeService);

    service.toggle();
    TestBed.flushEffects();

    expect(service.theme()).toBe('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    service.toggle();
    TestBed.flushEffects();

    expect(service.theme()).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('should restore stored theme on init', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');

    const service = TestBed.inject(ThemeService);
    expect(service.theme()).toBe('dark');
  });

  it('should default to light theme when matchMedia is not available', () => {
    // убираем matchMedia — как будто браузер его не поддерживает
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: undefined,
    });
  
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
  
    const service = TestBed.inject(ThemeService);
    expect(service.theme()).toBe('light');
  });
});

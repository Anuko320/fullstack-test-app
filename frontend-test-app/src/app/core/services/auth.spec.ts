import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth';
import { Router } from '@angular/router';
import { vi } from 'vitest';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: Router,
          useValue: { navigate: vi.fn() }, // мок роутера — просто заглушка
        },
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should authenticate with valid credentials', async () => {
    const loginPromise = service.login('admin', 'admin');

    // перехватываем HTTP запрос и возвращаем фейковый ответ
    const req = httpMock.expectOne((r) => r.url.includes('/auth/login'));
    req.flush({ accessToken: 'fake-token', refreshToken: 'fake-refresh', expiresIn: '1h' });

    const result = await loginPromise;
    expect(result).toBe(true);
    expect(service.isAuthenticated()).toBe(true);
  });

  it('should reject invalid credentials', async () => {
    const loginPromise = service.login('wrong', 'wrong');

    const req = httpMock.expectOne((r) => r.url.includes('/auth/login'));
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    const result = await loginPromise;
    expect(result).toBe(false);
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should logout and clear authentication', async () => {
    // сначала логинимся
    const loginPromise = service.login('admin', 'admin');
    const req = httpMock.expectOne((r) => r.url.includes('/auth/login'));
    req.flush({ accessToken: 'fake-token', refreshToken: 'fake-refresh', expiresIn: '1h' });
    await loginPromise;

    service.logout();

    expect(service.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('accessToken')).toBeNull();
  });

  it('should return false when network error occurs', async () => {
    const loginPromise = service.login('admin', 'admin');
  
    const req = httpMock.expectOne((r) => r.url.includes('/auth/login'));
    req.error(new ProgressEvent('network error')); // симулируем сетевую ошибку
  
    const result = await loginPromise;
    expect(result).toBe(false);
  });

  it('should return false when response has no accessToken', async () => {
    const loginPromise = service.login('admin', 'admin');
  
    const req = httpMock.expectOne((r) => r.url.includes('/auth/login'));
    // сервер вернул 200 но без accessToken
    req.flush({});
  
    const result = await loginPromise;
    expect(result).toBe(false);
  });
});
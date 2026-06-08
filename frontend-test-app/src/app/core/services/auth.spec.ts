import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should authenticate with valid credentials', () => {
    expect(service.login('admin', 'admin')).toBe(true);
    expect(service.isAuthenticated()).toBe(true);
    expect(service.authenticated()).toBe(true);
  });

  it('should reject invalid credentials', () => {
    expect(service.login('wrong', 'wrong')).toBe(false);
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should logout and clear authentication', () => {
    service.login('admin', 'admin');
    service.logout();

    expect(service.isAuthenticated()).toBe(false);
    expect(service.authenticated()).toBe(false);
    expect(localStorage.getItem('isAuthenticated')).toBeNull();
  });
});

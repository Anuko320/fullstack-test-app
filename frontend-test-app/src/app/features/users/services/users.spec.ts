import { TestBed } from '@angular/core/testing';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { UsersService, USERS_STORAGE_KEY } from './users.service';
import { User } from '../../../core/models/user';

describe('UsersService', () => {
  let service: UsersService;
  let httpMock: HttpTestingController;

  const mockApiUsers = [
    {
      id: 1,
      name: 'Leanne Graham',
      email: 'Sincere@april.biz',
      address: { city: 'Gwenborough' },
    },
  ];

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(UsersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load users from localStorage on init', () => {
    const stored: User[] = [
      { id: 99, name: 'Stored User', email: 'stored@test.com', city: 'Berlin' },
    ];
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(stored));

    service.init();

    expect(service.users()).toEqual(stored);
    httpMock.expectNone('https://jsonplaceholder.typicode.com/users');
  });

  it('should migrate legacy phone field to city from storage', () => {
    localStorage.setItem(
      USERS_STORAGE_KEY,
      JSON.stringify([{ id: 1, name: 'Legacy', email: 'l@test.com', phone: 'Paris' }]),
    );

    service.init();

    expect(service.users()[0].city).toBe('Paris');
  });

  it('should fetch users from API when storage is empty', () => {
    service.init();

    const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users');
    expect(req.request.method).toBe('GET');
    req.flush(mockApiUsers);

    expect(service.users()).toEqual([
      {
        id: 1,
        name: 'Leanne Graham',
        email: 'Sincere@april.biz',
        city: 'Gwenborough',
      },
    ]);
    expect(localStorage.getItem(USERS_STORAGE_KEY)).toBeTruthy();
  });

  it('should add and delete users locally and persist to localStorage', () => {
    service.users.set([{ id: 1, name: 'A', email: 'a@test.com', city: 'Rome' }]);

    service.addUser({ name: 'B', email: 'b@test.com', city: 'Milan' });
    expect(service.users().length).toBe(2);
    expect(service.users()[0].name).toBe('B');

    const removed = service.deleteUser(1);
    expect(removed?.name).toBe('A');
    expect(service.users().length).toBe(1);

    const stored = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY)!) as User[];
    expect(stored).toEqual(service.users());
  });

  it('should set error when API fails', () => {
    service.init();

    const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users');
    req.flush('Error', { status: 500, statusText: 'Server Error' });

    expect(service.error()).toContain('API недоступно');
    expect(service.users()).toEqual([]);
  });
});

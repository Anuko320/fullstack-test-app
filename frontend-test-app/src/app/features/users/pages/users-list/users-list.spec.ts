import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { provideTranslateService } from '@ngx-translate/core';
import { vi } from 'vitest';

import { UsersList } from './users-list';
import { UsersService } from '../../services/users.service';
import { AuthService } from '../../../../core/services/auth';
import { User } from '../../../../core/models/user';

describe('UsersList', () => {
  let component: UsersList;
  let fixture: ComponentFixture<UsersList>;
  let usersSignal: ReturnType<typeof signal<User[]>>;
  let deleteUserSpy: ReturnType<typeof vi.fn>;

  const mockUsers: User[] = [
    { id: 1, name: 'Alice', email: 'alice@test.com', city: 'London' },
    { id: 2, name: 'Bob', email: 'bob@test.com', city: 'Paris' },
  ];

  beforeEach(async () => {
    usersSignal = signal<User[]>(mockUsers);
    deleteUserSpy = vi.fn((id: number) => mockUsers.find((u) => u.id === id));

    await TestBed.configureTestingModule({
      imports: [UsersList],
      providers: [
        provideRouter([]),
        provideTranslateService({
          fallbackLang: 'en',
          lang: 'en',
        }),
        {
          provide: UsersService,
          useValue: {
            users: usersSignal,
            loading: signal(false),
            error: signal<string | null>(null),
            init: () => undefined,
            addUser: vi.fn(),
            deleteUser: deleteUserSpy,
            reloadFromApi: vi.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            logout: vi.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersList);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter users by name in real time', () => {
    component.searchInput.set('alice');
    fixture.detectChanges();

    expect(component.filteredUsers().length).toBe(1);
    expect(component.filteredUsers()[0].name).toBe('Alice');
  });

  it('should not filter by email', () => {
    component.searchInput.set('bob@test.com');
    fixture.detectChanges();

    expect(component.filteredUsers().length).toBe(0);
  });

  it('should show empty state when no users match search', () => {
    component.searchInput.set('zzz');
    fixture.detectChanges();

    expect(component.filteredUsers().length).toBe(0);

    const emptyEl = fixture.nativeElement.querySelector('.empty-state');
    expect(emptyEl?.textContent).toContain('users.nothingFound');
  });

  it('should sort users alphabetically A to Z', () => {
    usersSignal.set([
      { id: 1, name: 'Charlie', email: 'c@test.com', city: 'Berlin' },
      { id: 2, name: 'Alice', email: 'a@test.com', city: 'London' },
      { id: 3, name: 'Bob', email: 'b@test.com', city: 'Paris' },
    ]);
    component.nameSortOrder.set('asc');
    fixture.detectChanges();

    const names = component.displayedUsers().map((u) => u.name);
    expect(names).toEqual(['Alice', 'Bob', 'Charlie']);
  });

  it('should sort users alphabetically Z to A', () => {
    usersSignal.set([
      { id: 1, name: 'Charlie', email: 'c@test.com', city: 'Berlin' },
      { id: 2, name: 'Alice', email: 'a@test.com', city: 'London' },
    ]);
    component.nameSortOrder.set('desc');
    fixture.detectChanges();

    const names = component.displayedUsers().map((u) => u.name);
    expect(names).toEqual(['Charlie', 'Alice']);
  });

  it('should invalidate short name in add user form', () => {
    component.newUserModel.set({ name: 'Ab', email: 'test@test.com', city: 'Berlin' });
    fixture.detectChanges();

    expect(component.newUserForm().invalid()).toBe(true);
    expect(component.canAddUser()).toBe(false);
  });

  it('should invalidate incorrect email in add user form', () => {
    component.newUserModel.set({ name: 'Alice', email: 'not-an-email', city: 'Berlin' });
    fixture.detectChanges();

    expect(component.newUserForm().invalid()).toBe(true);
    expect(component.canAddUser()).toBe(false);
  });

  it('should delete user locally via service', () => {
    component.requestDelete(1);
    component.confirmDelete();

    expect(deleteUserSpy).toHaveBeenCalledWith(1);
    expect(component.deleteMessage()).toContain('users.deleteSuccess');
  });
});

describe('UsersList loading state', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersList],
      providers: [
        provideRouter([]),
        provideTranslateService({
          fallbackLang: 'en',
          lang: 'en',
        }),
        {
          provide: UsersService,
          useValue: {
            users: signal<User[]>([]),
            loading: signal(true),
            error: signal<string | null>(null),
            init: () => undefined,
            addUser: vi.fn(),
            deleteUser: vi.fn(),
            reloadFromApi: vi.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: { logout: vi.fn() },
        },
      ],
    }).compileComponents();
  });

  it('should show loader when loading', () => {
    const fixture = TestBed.createComponent(UsersList);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.loader-spinner')).toBeTruthy();
  });
});

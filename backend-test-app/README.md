# Users API — Backend (NestJS + SQLite)

REST API для управления пользователями с JWT-авторизацией.

## Стек

- **Framework**: NestJS 10 + TypeScript
- **База данных**: SQLite (файл `database.sqlite` создаётся автоматически)
- **ORM**: TypeORM
- **Аутентификация**: JWT (access + refresh токены) + bcrypt
- **Уведомления**: Resend (форма поддержки)

---

## Быстрый старт

### Вариант 1: Docker (рекомендуется)

Из корня проекта (где лежит `docker-compose.yml`):

```bash
docker compose up --build
```

Запустит бэкенд и фронтенд одновременно, с hot-reload.

### Вариант 2: Локально

#### 1. Установить зависимости

```bash
npm install
```

#### 2. Настроить переменные окружения

```bash
cp .env.example .env
```

Открой `.env` и поменяй `JWT_SECRET` на любую случайную строку.

#### 3. Заполнить БД начальными данными

```bash
npm run seed
```

Создаёт пользователя `admin / admin` и 10 пользователей из JSONPlaceholder.

#### 4. Запустить сервер

```bash
npm run start:dev
```

Сервер запустится на `http://localhost:3000`
Swagger документация: `http://localhost:3000/api/docs`

---

## Переменные окружения (.env)

| Переменная | Описание |
|---|---|
| `JWT_SECRET` | Секрет для access-токена |
| `JWT_EXPIRES_IN` | Срок жизни токена (по умолчанию `1h`) |
| `JWT_REFRESH_SECRET` | Секрет для refresh-токена |
| `JWT_REFRESH_EXPIRES_IN` | Срок жизни refresh (по умолчанию `7d`) |
| `PORT` | Порт сервера (по умолчанию `3000`) |
| `FRONTEND_URL` | URL фронтенда для CORS (по умолчанию `http://localhost:4200`) |
| `RESEND_API_KEY` | API-ключ Resend для отправки писем поддержки |
| `SUPPORT_EMAIL` | Email, на который приходят заявки в поддержку |

---

## API Endpoints

### Auth
| Метод | URL | Описание |
|---|---|---|
| `POST` | `/auth/login` | Логин → access + refresh токены |
| `POST` | `/auth/refresh` | Обновить токены |

### Users (нужен Bearer токен)
| Метод | URL | Описание |
|---|---|---|
| `GET` | `/users` | Список с поиском, пагинацией, сортировкой |
| `GET` | `/users/:id` | Один пользователь |
| `POST` | `/users` | Создать |
| `PATCH` | `/users/:id` | Обновить |
| `DELETE` | `/users/:id` | Удалить |

**Пример запроса:**
```
GET /users?search=leanne&page=1&limit=10&sortBy=name&order=ASC
Authorization: Bearer <token>
```

### Support
| Метод | URL | Описание |
|---|---|---|
| `POST` | `/support` | Отправить сообщение в поддержку (name, email, message) |

---

## CI/CD

При каждом push в `main` GitHub Actions автоматически прогоняет тесты бэкенда и фронтенда (`.github/workflows/ci.yml`).

---

## Примечания

- База данных SQLite хранится в файле `database.sqlite` в корне проекта
- При первом запуске таблицы создаются автоматически (`synchronize: true`)
- Файл `database.sqlite` добавлен в `.gitignore` — не коммитить в репозиторий
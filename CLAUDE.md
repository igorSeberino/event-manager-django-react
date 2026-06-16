# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sistema de gerenciamento de eventos acadêmicos. Full-stack com Django REST Framework (backend) e React + Vite (frontend). Interface em português (PT-BR), código em inglês.

## Commands

### Via Docker (ambiente padrão)

```bash
docker compose up --build          # Sobe todos os serviços (db, backend, frontend)
docker compose up -d               # Sobe em background
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py populate_db
docker compose exec backend python manage.py createsuperuser
docker compose exec backend python manage.py makemigrations
docker compose exec frontend npm run lint
```

### Backend (from `backend/` — sem Docker)

```bash
python manage.py runserver         # Dev server em localhost:8000
python manage.py migrate
python manage.py makemigrations
python manage.py populate_db       # Popular banco com dados de teste
python manage.py createsuperuser
```

### Frontend (from `frontend/` — sem Docker)

```bash
npm run dev       # Dev server em localhost:5173 (proxy /api -> localhost:8000)
npm run build
npm run lint
```

### Quality (from project root)

```bash
prettier --write .                 # Formatar JS/JSON/CSS/MD
.venv/Scripts/python -m black backend/   # Formatar Python (sem Docker)
docker compose exec backend python -m black .   # Formatar Python (com Docker)
```

Pre-commit hooks (Husky + lint-staged) rodam ESLint, Prettier e Black automaticamente nos arquivos staged.

## Architecture

### Backend (`backend/`)

Arquitetura em camadas por app Django: **accounts**, **events**, **registrations**, **scripts**, **config**.

Cada app segue o padrão: `models.py` → `serializers.py` → `services.py` → `views.py` → `permissions.py` → `urls.py`

- **Service layer**: toda lógica de negócio fica em `services.py`, não nas views. Views delegam para services após validação do serializer.
- **Exceptions**: `config/exceptions.py` define `ServiceError`, `ValidationError`, `PermissionDenied`, `NotFound`, `Conflict`. O handler em `config/exception_handler.py` converte para respostas padronizadas `{ "error": { "code", "message", "field?" } }`.
- **Auth**: JWT via HttpOnly cookies. `config/authentication.py` (`JWTAuthFromCookie`) extrai token do cookie. `config/middleware.py` (`TokenRefreshMiddleware`) faz refresh automático do access token expirado.
- **Models**: todos usam UUID como primary key. User estende `AbstractUser` com `email` como `USERNAME_FIELD`.
- **Roles**: `ADMIN` (acesso total), `ORGANIZER` (cria/gerencia próprios eventos), `USER` (se inscreve em eventos).
- **Pagination**: `StandardResultsSetPagination` com `PAGE_SIZE=9`, configurável via `?page_size=N` (máx 1000).
- **Database**: MySQL 8.0, configurado via python-decouple (`.env`).
- **Cookies**: `config/cookies.py` — dev (`DEBUG=True`): `Secure=False, SameSite=Lax`; prod: `Secure=True, SameSite=None`.

### Models

#### accounts.User

Estende `AbstractUser`. Campo `username` removido; `email` é o `USERNAME_FIELD`.

| Campo      | Tipo          | Detalhes                       |
| ---------- | ------------- | ------------------------------ |
| id         | UUID          | PK auto                        |
| name       | CharField     |                                |
| email      | EmailField    | unique                         |
| role       | CharField     | `ADMIN` / `ORGANIZER` / `USER` |
| created_at | DateTimeField | auto                           |

#### events.Event

| Campo            | Tipo             | Detalhes                                        |
| ---------------- | ---------------- | ----------------------------------------------- |
| id               | UUID             | PK auto                                         |
| title            | CharField        |                                                 |
| description      | TextField        |                                                 |
| location         | CharField        |                                                 |
| event_date       | DateTimeField    | deve ser no futuro ao criar                     |
| capacity         | IntegerField     |                                                 |
| status           | CharField        | `PENDING` / `APPROVED` / `REJECTED`             |
| rejection_reason | TextField        | preenchido pelo admin ao rejeitar               |
| closed_at        | DateTimeField    | nullable; definido pelo organizador ao encerrar |
| organizer        | FK → User        |                                                 |
| category         | FK → Category    | nullable                                        |
| subcategory      | FK → SubCategory | nullable                                        |

Propriedade `is_finished`: `True` quando `closed_at` está preenchido.

**Fluxo de status do evento:**

```
PENDING → APPROVED → (organizer encerra) → closed_at definido
        → REJECTED → (organizer reenvia) → PENDING
```

#### events.Category / events.SubCategory

`Category` tem `id` (UUID) e `name`. `SubCategory` adiciona FK para `Category`.

#### registrations.Registration

| Campo         | Tipo          | Detalhes      |
| ------------- | ------------- | ------------- |
| id            | UUID          | PK auto       |
| user          | FK → User     | cascade       |
| event         | FK → Event    | cascade       |
| check_in      | BooleanField  | default False |
| registered_at | DateTimeField | auto          |

`attendance_status` (campo virtual no serializer): `PRESENT` (check_in=True), `ABSENT` (evento encerrado sem check-in), `PENDING` (evento ainda ativo).

### Frontend (`frontend/`)

SPA React 19 + Vite + Tailwind CSS 4.

- **Routing** (`App.jsx`): rotas públicas + `ProtectedRoute` por role.
- **API** (`services/api.js`): Axios com `baseURL="/api"` e `withCredentials: true`. Vite proxy redireciona `/api` para o backend.
- **Auth state** (`context/AuthProvider.jsx`): contexto React com `useAuth()` hook, persiste user em `sessionStorage`.
- **Styling**: Tailwind utility classes; paleta `#475053`, `#2E94B9`, `#ACDCEE`, `#F0FBFF`; glassmorphism com `backdrop-blur`; ícones via `lucide-react`.

#### Rotas

| Rota                     | Componente           | Acesso                   |
| ------------------------ | -------------------- | ------------------------ |
| `/`                      | `Home`               | público                  |
| `/login`                 | `Login`              | público                  |
| `/cadastro`              | `Cadastro`           | público                  |
| `/eventos`               | `Eventos`            | público                  |
| `/eventos/:id`           | `EventoDetalhe`      | público                  |
| `/eventos/criar`         | `CreateEvent`        | ORGANIZER / ADMIN        |
| `/eventos/:id/editar`    | `EditEvent`          | ORGANIZER (dono) / ADMIN |
| `/meus-eventos`          | `MyEvents`           | ORGANIZER / ADMIN        |
| `/eventos/:id/inscritos` | `EventRegistrations` | ORGANIZER (dono) / ADMIN |
| `/minhas-inscricoes`     | `MinhasInscricoes`   | AUTH                     |
| `/perfil`                | `Perfil`             | AUTH                     |
| `/admin`                 | `AdminDashboard`     | ADMIN                    |
| `/admin/eventos`         | `ManageEvents`       | ADMIN                    |
| `/admin/usuarios`        | `ManageUsers`        | ADMIN                    |
| `/admin/categorias`      | `ManageCategories`   | ADMIN                    |

### API Endpoints

Todas as rotas sob `/api/`. URL base configurada em `config/urls.py`:

- `/api/accounts/` → `accounts/urls.py`
- `/api/events/` → `events/urls.py`
- `/api/registrations/` → `registrations/urls.py`

#### Accounts

| Método               | Endpoint              | Descrição                                      | Role          |
| -------------------- | --------------------- | ---------------------------------------------- | ------------- |
| POST                 | `/api/token/`         | Login — retorna user no body, seta cookies JWT | any           |
| POST                 | `/api/token/refresh/` | Refresh do access token via cookie             | any           |
| POST                 | `/api/logout/`        | Limpa cookies de auth                          | AUTH          |
| GET/POST             | `/api/users/`         | Listar / criar usuários                        | any / public  |
| GET/PUT/PATCH/DELETE | `/api/users/{id}/`    | Detalhe / editar / deletar                     | owner / ADMIN |

#### Events

| Método               | Endpoint                     | Descrição                                  | Role              |
| -------------------- | ---------------------------- | ------------------------------------------ | ----------------- |
| GET                  | `/api/events/`               | Listar eventos (filtros, busca, paginação) | any               |
| POST                 | `/api/events/`               | Criar evento                               | ORGANIZER / ADMIN |
| GET/PUT/PATCH/DELETE | `/api/events/{id}/`          | Detalhe / editar / deletar                 | owner / ADMIN     |
| POST                 | `/api/events/{id}/approve/`  | Aprovar evento                             | ADMIN             |
| POST                 | `/api/events/{id}/reject/`   | Rejeitar com motivo                        | ADMIN             |
| POST                 | `/api/events/{id}/resubmit/` | Reenviar após rejeição                     | owner             |
| POST                 | `/api/events/{id}/close/`    | Encerrar evento                            | owner             |
| GET/POST             | `/api/categories/`           | Listar / criar categorias                  | any / ADMIN       |
| GET/PUT/PATCH/DELETE | `/api/categories/{id}/`      | Detalhe / editar / deletar                 | ADMIN             |
| GET/POST             | `/api/subcategories/`        | Listar / criar subcategorias               | any / ADMIN       |
| GET/PUT/PATCH/DELETE | `/api/subcategories/{id}/`   | Detalhe / editar / deletar                 | ADMIN             |

**Filtros de `/api/events/`:** `?status=`, `?category=`, `?subcategory=`, `?organizer=`, `?search=` (title/description/location), `?ordering=event_date|-event_date|title|capacity`.

#### Registrations

| Método               | Endpoint                   | Descrição                     | Role                      |
| -------------------- | -------------------------- | ----------------------------- | ------------------------- |
| GET/POST             | `/api/registrations/`      | Listar / criar inscrições     | AUTH                      |
| GET/PUT/PATCH/DELETE | `/api/registrations/{id}/` | Detalhe / check-in / cancelar | owner / ORGANIZER / ADMIN |

**Check-in** (`PATCH /api/registrations/{id}/`): apenas ORGANIZER do evento ou ADMIN podem definir `check_in=True`. Bloqueado após `is_finished`.

### Scripts App

**`populate_db`** (`scripts/management/commands/populate_db.py`):

- Limpa e re-popula o banco de forma idempotente (`@transaction.atomic`).
- Cria: 1 admin, 10 organizers, 100 participantes.
- Cria: 6 categorias (Tecnologia, Saúde, Negócios, Educação, Ciências, Artes e Cultura) com 4–7 subcategorias cada.
- Cria: 35 eventos acadêmicos distribuídos entre os organizers.
- ~40% dos eventos são passados (com `closed_at` definido), restante em vários estados.
- Gera inscrições com taxas de check-in realistas (~75% para eventos passados).

Credenciais do admin de teste: `admin@eventmanager.com` / `Admin@123`

## Frontend Lint Rules

O projeto usa `eslint-plugin-react-hooks` (recommended config) com a regra `react-hooks/set-state-in-effect`. Não chamar `setState` de forma síncrona no corpo de um `useEffect` — mover para event handlers, callbacks assíncronos (`.then()`, `.catch()`, `.finally()`) ou inicializar o estado com o valor correto via `useState`.

## Key Patterns

- Views usam `serializer.is_valid(raise_exception=True)` e passam `validated_data` para a service layer.
- Services lançam exceções tipadas (`ServiceError` subclasses) que o exception handler global converte em HTTP responses com formato `{ "error": { "code", "message", "field?" } }`.
- Permissões são checadas em dois níveis: permission classes nas views (acesso à view) e lógica nos services (regras de negócio).
- O login retorna dados do user no body e seta tokens JWT como HttpOnly cookies (`access_token`, `refresh_token`) na response.
- Validação de senha: mínimo 1 maiúscula + 1 minúscula + 1 número + 1 caractere especial.
- `EventForm.jsx` é o componente compartilhado entre `CreateEvent` e `EditEvent`.
- Eventos encerrados (`is_finished=True`) bloqueiam: edição, nova inscrição, check-in e cancelamento de inscrição.

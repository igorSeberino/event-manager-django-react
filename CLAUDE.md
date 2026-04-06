# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sistema de gerenciamento de eventos acadêmicos. Full-stack com Django REST Framework (backend) e React + Vite (frontend). Interface em português (PT-BR), código em inglês.

## Commands

### Backend (from `backend/`)

```bash
python manage.py runserver                    # Dev server em localhost:8000
python manage.py migrate                      # Aplicar migrations
python manage.py makemigrations               # Gerar migrations
python manage.py populate_db                  # Popular banco com dados de teste
python manage.py createsuperuser              # Criar superusuário
```

### Frontend (from `frontend/`)

```bash
npm run dev       # Dev server em localhost:5173 (proxy /api -> localhost:8000)
npm run build     # Build de produção
npm run lint      # ESLint
```

### Quality (from project root)

```bash
prettier --write .                           # Formatar JS/JSON/CSS/MD
.venv/Scripts/python -m black backend/       # Formatar Python
```

Pre-commit hooks (Husky + lint-staged) rodam ESLint, Prettier e Black automaticamente nos arquivos staged.

## Architecture

### Backend (`backend/`)

Arquitetura em camadas por app Django: **accounts**, **events**, **registrations**, **scripts**.

Cada app segue o padrão: `models.py` -> `serializers.py` -> `services.py` -> `views.py` -> `permissions.py` -> `urls.py`

- **Service layer**: toda lógica de negócio fica em `services.py`, não nas views. Views delegam para services após validação do serializer.
- **Exceptions**: `config/exceptions.py` define `ServiceError`, `ValidationError`, `PermissionDenied`, `NotFound`, `Conflict`. O handler em `config/exception_handler.py` converte para respostas padronizadas `{ "error": { "code", "message", "field?" } }`.
- **Auth**: JWT via HttpOnly cookies. `config/authentication.py` (`JWTAuthFromCookie`) extrai token do cookie. `config/middleware.py` (`TokenRefreshMiddleware`) faz refresh automático do access token expirado.
- **Models**: todos usam UUID como primary key. User estende AbstractUser com email como USERNAME_FIELD.
- **Roles**: ADMIN (acesso total), ORGANIZER (cria/gerencia próprios eventos), USER (se inscreve em eventos).
- **Pagination**: `PageNumberPagination` com PAGE_SIZE=9.
- **Database**: MySQL, configurado via python-decouple (.env).

### Frontend (`frontend/`)

SPA React 19 + Vite + Tailwind CSS 4.

- **Routing** (`App.jsx`): `/`, `/login`, `/cadastro`, `/eventos`, `/eventos/:id`, `/minhas-inscricoes`, `/perfil`
- **API** (`services/api.js`): Axios com `baseURL="/api"` e `withCredentials: true`. Vite proxy redireciona `/api` para o backend.
- **Auth state** (`context/AuthProvider.jsx`): contexto React com `useAuth()` hook, persiste user em sessionStorage.
- **Styling**: Tailwind utility classes, design system com paleta `#475053`, `#2E94B9`, `#ACDCEE`, `#F0FBFF`.

### API Endpoints

Todas as rotas sob `/api/`:

- `accounts/urls.py`: `/users/`, `/token/`, `/token/refresh/`, `/logout/`
- `events/urls.py`: `/events/`, `/categories/`, `/subcategories/`
- `registrations/urls.py`: `/registrations/`

## Frontend Lint Rules

O projeto usa `eslint-plugin-react-hooks` (recommended config) que inclui a regra `react-hooks/set-state-in-effect`. Não chamar `setState` de forma síncrona no corpo de um `useEffect` — mover para event handlers, callbacks assíncronos (`.then()`, `.catch()`, `.finally()`) ou inicializar o estado com o valor correto via `useState`.

## Key Patterns

- Views usam `serializer.is_valid(raise_exception=True)` e passam `validated_data` para a service layer.
- Services lançam exceções tipadas (`ServiceError` subclasses) que o exception handler global converte em HTTP responses.
- Permissões são checadas em dois níveis: permission classes nas views (acesso à view) e lógica nos services (regras de negócio).
- O login retorna dados do user no body e seta tokens JWT como HttpOnly cookies na response.

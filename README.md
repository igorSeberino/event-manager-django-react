# Sistema de Gerenciamento de Eventos Acadêmicos

## Sobre o Projeto

Sistema web para gerenciamento de eventos acadêmicos — palestras, workshops, minicursos, seminários e oficinas. Centraliza o controle de eventos e inscrições em uma única plataforma, com fluxo completo de aprovação, presença e roles de acesso.

---

## Funcionalidades

### Autenticação e Usuários

- Cadastro, login e logout com JWT via cookies HttpOnly
- Refresh automático do access token por middleware
- Perfil de usuário editável (nome, email, senha)
- Roles distintos: **Administrador**, **Organizador** e **Participante**
- Validação de senha: mínimo 1 maiúscula, 1 minúscula, 1 número e 1 caractere especial

### Eventos

- Criação, edição e exclusão de eventos (organizador ou admin)
- Categorização por categoria e subcategoria
- Busca por título, descrição e local; filtros por status, categoria e organizador
- Fluxo de aprovação completo:
  - Organizador cria evento → status **PENDENTE**
  - Admin aprova → **APROVADO** / rejeita com motivo → **REJEITADO**
  - Organizador reenvia evento rejeitado → volta para **PENDENTE**
  - Organizador encerra o evento → `closed_at` definido (irreversível)
- Edição, nova inscrição e check-in bloqueados após encerramento

### Inscrições e Presença

- Inscrição e cancelamento de inscrição em eventos aprovados
- Controle de capacidade — inscrição bloqueada quando evento está lotado
- Check-in marcado pelo organizador ou admin durante o evento
- Status de presença automático após encerramento: **Presente**, **Ausente** ou **Pendente**

### Painel do Organizador

- Lista de eventos criados pelo organizador
- Gestão de inscritos por evento: lista de participantes, check-in e marcação de faltas
- Botão de encerrar evento com confirmação

### Painel Administrativo

- Aprovação e rejeição de eventos com motivo
- Gerenciamento de usuários (criação, edição, exclusão, alteração de role)
- Gerenciamento de categorias e subcategorias

---

## Tecnologias Utilizadas

### Backend

- **Python 3.12** — linguagem principal
- **Django 6.0** — framework web
- **Django REST Framework 3.16** — construção da API RESTful
- **Simple JWT** — autenticação via tokens JWT em cookies HttpOnly
- **django-filter** — filtros avançados nas listagens
- **django-cors-headers** — suporte a CORS
- **python-decouple** — configuração via `.env`

### Frontend

- **React 19** — biblioteca de UI
- **React Router 7** — navegação e rotas protegidas por role
- **Axios** — cliente HTTP com `withCredentials`
- **Tailwind CSS 4** — estilização utilitária
- **Lucide React** — ícones
- **Vite 7** — bundler e dev server

### Infraestrutura

- **MySQL 8.0** — banco de dados relacional
- **Docker + Docker Compose** — orquestração dos serviços (db, backend, frontend)

### Qualidade de Código

- **Black** — formatação automática Python
- **ESLint + Prettier** — formatação e análise estática JavaScript/React
- **Husky + lint-staged** — hooks de pre-commit automáticos

---

## Como Executar

### Com Docker (recomendado)

Pré-requisito: [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e em execução.

```bash
# 1. Criar o arquivo de variáveis de ambiente
cp .env.example .env          # Windows PowerShell: Copy-Item .env.example .env

# 2. Subir todos os serviços (db + backend + frontend)
docker compose up --build

# 3. Em outro terminal, popular o banco com dados de exemplo
docker compose exec backend python manage.py populate_db
```

Acesse:

- **Frontend:** http://localhost:5173
- **API:** http://localhost:8000/api/
- **Admin Django:** http://localhost:8000/admin/

Usuário admin de teste (após `populate_db`): `admin@eventmanager.com` / `Admin@123`

Para parar: `Ctrl + C` e depois `docker compose down`  
Para apagar também os dados do banco: `docker compose down -v`

| Ação                       | Comando                                                |
| -------------------------- | ------------------------------------------------------ |
| Subir em segundo plano     | `docker compose up -d`                                 |
| Ver logs ao vivo           | `docker compose logs -f`                               |
| Aplicar migrations         | `docker compose exec backend python manage.py migrate` |
| Lint do frontend           | `docker compose exec frontend npm run lint`            |
| Parar e remover containers | `docker compose down`                                  |

### Sem Docker (manual)

<details>
<summary><strong>Backend</strong> (Python 3.12 + MySQL)</summary>

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate           # Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
# Configure o .env com um MySQL local (DB_HOST=127.0.0.1)
python manage.py migrate
python manage.py populate_db
python manage.py runserver        # http://localhost:8000
```

</details>

<details>
<summary><strong>Frontend</strong> (Node 20+)</summary>

```bash
cd frontend
npm install
npm run dev                       # http://localhost:5173 (proxy /api -> :8000)
```

</details>

---

## Arquitetura

O sistema segue uma arquitetura **cliente-servidor baseada em API REST**, com frontend e backend separados. A documentação arquitetural usa o **modelo C4** para representar o sistema em diferentes níveis de abstração.

Arquivos de modelagem em `./docs/architecture/` (formato PlantUML).

### Nível 1 — Contexto do Sistema

![Diagrama C4 - Contexto do Sistema](./docs/architecture/c4-context.png)

### Nível 2 — Diagrama de Contêineres

![Diagrama C4 - Contêineres](./docs/architecture/c4-containers.png)

### Nível 3 — Componentes do Backend (Django)

![Diagrama C4 - Componentes do Backend](./docs/architecture/c4-components-backend.png)

### Nível 3 — Componentes do Frontend (React)

![Diagrama C4 - Componentes do Frontend](./docs/architecture/c4-components-frontend.png)

---

## Modelo de Dados

### Diagrama Entidade-Relacionamento

![Diagrama ER - Modelagem do Banco de Dados](./docs/database/erd.png)

Arquivo de modelagem em `./docs/database/erd.puml` (formato PlantUML).

### Entidades

| Entidade          | Descrição                                                                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Users**         | Usuários com roles ADMIN, ORGANIZER e USER. Autenticação por email.                                                                  |
| **Events**        | Eventos com título, data, local, capacidade, status de aprovação, motivo de rejeição, data de encerramento e categoria/subcategoria. |
| **Categories**    | Grandes áreas temáticas dos eventos (ex: Tecnologia, Saúde).                                                                         |
| **Subcategories** | Áreas específicas vinculadas a uma categoria (ex: Inteligência Artificial, Cardiologia).                                             |
| **Registrations** | Inscrição de um usuário em um evento, com flag de check-in e status de presença.                                                     |

---

## Estrutura do Repositório

```
event-manager-django-react/
├── backend/
│   ├── accounts/         # Usuários e autenticação (JWT via cookie)
│   ├── events/           # Eventos, categorias e subcategorias
│   ├── registrations/    # Inscrições e check-in
│   ├── scripts/          # Comandos de gestão (populate_db)
│   ├── config/           # Settings, URLs, auth, middleware, paginação, exceções
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── context/      # AuthContext e AuthProvider
│   │   ├── pages/        # Páginas (públicas, organizador, admin)
│   │   ├── components/   # Navbar, AdminSidebar, ProtectedRoute
│   │   └── services/     # Instância Axios (api.js)
│   └── Dockerfile
├── docs/
│   ├── architecture/     # Diagramas C4 (PlantUML + PNG)
│   └── database/         # Diagrama ER (PlantUML + PNG)
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Possíveis Melhorias Futuras

- QR Code para check-in de presença
- Geração de certificados em PDF
- Notificações por email (confirmação de inscrição, aprovação de evento)
- Exportação da lista de presença (CSV/PDF)
- Deploy em nuvem

---

## Autor

Igor Thiago Seberino

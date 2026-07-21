# Autenticação local (desenvolvimento)

> **Não use estas credenciais em produção.** Com `NODE_ENV=production`, o login mock com senha compartilhada fica **hard-disabled** (flags `ALLOW_DEMO_LOGIN` / `AUTH_DEMO_ENABLED` são ignoradas). Contas seed também são bloqueadas no backend (`LMS_BLOCK_DEMO_SEED_LOGINS`).

## Variáveis (front — `.env.local`)

```env
NEXT_PUBLIC_USE_JAVA_API=true
LMS_API_URL=http://localhost:8080
LMS_API_TOKEN=local-dev-token
LMS_JWT_SECRET=local-dev-jwt-secret-at-least-32-chars
AUTH_SECRET=dev-secret-change-me
LMS_SEED_PASSWORD=demo1234
ALLOW_DEMO_LOGIN=true
# Em prod os mocks ficam ocultos; para staging com UI demo:
# NEXT_PUBLIC_SHOW_MOCK_MODULES=true
```

`AUTH_DEMO_ENABLED` continua como alias legado de `ALLOW_DEMO_LOGIN` **somente fora de produção**.

Em produção, módulos mock (auditoria, config, comunicação, integrações, certificados, avaliações) ficam ocultos salvo `NEXT_PUBLIC_SHOW_MOCK_MODULES=true`. Ver `src/lib/mock-module-gates.ts`.

O login Java devolve `accessToken` (JWT HS256). O BFF Next guarda na cookie de sessão e envia `Authorization: Bearer <JWT>` para `/api/v1/**` — **não** usa mais `X-User-Email`.

Microsoft SSO (opcional em local):

```env
AZURE_AD_CLIENT_ID=...
AZURE_AD_CLIENT_SECRET=...
AZURE_AD_TENANT_ID=...
AUTH_ALLOWED_EMAIL_DOMAIN=navoxi.com
```

## Backend local

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

Profile `local` ativa seed (`LMS_SEED_ENABLED=true` implícito) e senha inicial `LMS_SEED_PASSWORD` (default `demo1234`).

JIT Microsoft (opcional em local):

```env
LMS_JIT_PROVISIONING=true
LMS_ALLOWED_EMAIL_DOMAINS=navoxi.com
LMS_BOOTSTRAP_ADMIN_EMAILS=voce@navoxi.com
LMS_JIT_DEFAULT_UNIT=matriz
```

## Contas seed (somente local)

| E-mail | Perfil | Unidade |
|---|---|---|
| `ana.souza@navoxi.com` | Administrador Premium | Navoxi · Matriz |
| `bruno.ferreira@navoxi.com` | Administrador de Unidade | Navoxi · Matriz |
| `carla.mendes@navoxi.com` | Gestor de Conteúdo | Navoxi · Matriz |
| `henrique.castro@navoxi.com` | Instrutor | Navoxi · Matriz |
| `diego.alves@navoxi.com` | Aluno | Navoxi · Matriz |
| `felipe.rocha@navoxi.com` | Administrador de Unidade | Navoxi · Nordeste |

Senha inicial: valor de `LMS_SEED_PASSWORD` / `demo1234`.

## Fluxos de login

| Fluxo | Quando |
|---|---|
| Microsoft Entra SSO | `AZURE_AD_*` configurado — caminho principal; JIT cria user no Postgres se habilitado |
| `POST /api/auth/login` → Java BCrypt | Break-glass para contas `local`/`both` já no DB |
| Fallback mock (`DEMO_LOGIN_PASSWORD` / default local) | Não-prod + `ALLOW_DEMO_LOGIN` ≠ `false` + backend indisponível |

A rota `POST /api/auth/demo-login` foi removida; use apenas `/api/auth/login`.

Role/unit após SSO vêm **sempre do Postgres** (`UserAccount`). Novos usuários JIT entram como `aluno` (ou `admin_premium` se banco vazio / e-mail em `LMS_BOOTSTRAP_ADMIN_EMAILS`). Promoção: Administração → PATCH `/api/v1/users/{id}`.

## Produção pública

| Variável | Valor |
|---|---|
| `NODE_ENV` | `production` → demo login **sempre off** (flags ignoradas) |
| `ALLOW_DEMO_LOGIN` | ignorado em prod — não setar |
| `AUTH_DEMO_ENABLED` | deprecated / ignorado em prod — não setar |
| `LMS_SEED_ENABLED` | `false` (prod Java força off) |
| `LMS_BLOCK_DEMO_SEED_LOGINS` | `true` (default profile `prod`) |
| `LMS_JIT_PROVISIONING` | `true` (default profile `prod`) |
| `LMS_ALLOWED_EMAIL_DOMAINS` | domínio corporativo |
| `LMS_BOOTSTRAP_ADMIN_EMAILS` | e-mail(s) do primeiro admin real (secret/env) |
| `AZURE_AD_TENANT_ID` | tenant específico (não `common`) |
| `AUTH_ALLOWED_EMAIL_DOMAIN` | mesmo domínio (obrigatório em prod com SSO) |
| `LMS_JWT_SECRET` | secret HS256 ≥32 chars (obrigatório em prod) |
| `LMS_API_TOKEN` | secret forte ≥24 chars (**não** `local-dev-token`) |
| `CORS_ORIGINS` | URL do front (obrigatório em prod) |

Login: **SSO Microsoft (principal)** + **senha BCrypt break-glass** para contas reais `local`/`both` já provisionadas. Contas seed de demo não autenticam por senha. Não usar seed em prod pública.

Rate limit de login (profile `prod`): 10 tentativas / 60s por IP e por e-mail. Local: off por default (`LMS_LOGIN_RATE_LIMIT_ENABLED=true` para testar).

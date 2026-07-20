# Autenticação local (desenvolvimento)

> **Não use estas credenciais em produção.** Em deploy público, `ALLOW_DEMO_LOGIN` deve estar off e login mock com senha compartilhada é bloqueado.

## Variáveis (front — `.env.local`)

```env
NEXT_PUBLIC_USE_JAVA_API=true
LMS_API_URL=http://localhost:8080
LMS_API_TOKEN=local-dev-token
AUTH_SECRET=dev-secret-change-me
LMS_SEED_PASSWORD=demo1234
ALLOW_DEMO_LOGIN=true
```

`AUTH_DEMO_ENABLED` continua funcionando como alias legado de `ALLOW_DEMO_LOGIN`.

## Backend local

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

Profile `local` ativa seed (`LMS_SEED_ENABLED=true` implícito) e senha inicial `LMS_SEED_PASSWORD` (default `demo1234`).

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
| `POST /api/auth/login` → Java BCrypt | Backend disponível (preferencial) |
| Fallback mock (`demo1234` / `DEMO_LOGIN_PASSWORD`) | `ALLOW_DEMO_LOGIN=true` e backend indisponível |
| Microsoft Entra SSO | `AZURE_AD_*` configurado |

A rota `POST /api/auth/demo-login` foi removida; use apenas `/api/auth/login`.

## Produção pública

| Variável | Valor |
|---|---|
| `ALLOW_DEMO_LOGIN` | omitido ou `false` |
| `AUTH_DEMO_ENABLED` | deprecated — não setar |
| `LMS_SEED_ENABLED` | `false` |
| `LMS_BLOCK_DEMO_SEED_LOGINS` | `true` (default profile `prod`) |
| `AZURE_AD_TENANT_ID` | tenant específico (não `common`) |

Login permitido: **SSO Microsoft** + **senha real** (usuários cadastrados no backend com BCrypt).

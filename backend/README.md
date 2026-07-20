# Navoxi LMS API (Java / Spring Boot)

Backend da Fase 1: cursos, módulos, aulas, progresso e matrículas.

## Stack

- Java 21
- Spring Boot 3.4
- Spring Data JPA
- H2 (`local`) / PostgreSQL + Flyway (`prod`)
- springdoc OpenAPI

## Rodar local

Pré-requisito: JDK 21+ e Maven 3.9+.

```bash
cd backend
mvn -DskipTests package
java -jar target/navoxi-lms-api-0.1.0-SNAPSHOT.jar --spring.profiles.active=local
# ou:
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

- Health: http://localhost:8080/api/v1/health
- Swagger: http://localhost:8080/swagger-ui.html
- H2 console: http://localhost:8080/h2-console (`jdbc:h2:mem:lms`)

Autenticação por senha (BCrypt): `POST /api/v1/auth/login` com body `{ "email", "password" }` e header `Authorization: Bearer <LMS_API_TOKEN>`. Senha inicial dos usuários seed: `LMS_SEED_PASSWORD` (default `demo1234` no profile `local`).

Em **local**, para simular usuário autenticado nas rotas protegidas, use header `X-User-Email` com um e-mail cadastrado (ex.: durante testes manuais). **Não use contas seed em produção.**

**Bloqueio de contas demo em produção:** `LMS_BLOCK_DEMO_SEED_LOGINS=true` (default no profile `prod`) impede login das contas seed documentadas no README, mesmo que existam no banco.

Microsoft SSO (whitelist): `POST /api/v1/auth/sso/microsoft` com `{ "email", "name", "microsoftOid" }` — só usuários já cadastrados e ativos.

## Endpoints principais

| Método | Rota |
|---|---|
| GET | `/api/v1/health` |
| GET/POST | `/api/v1/courses` |
| GET/PUT | `/api/v1/courses/{id}` |
| GET | `/api/v1/courses/{id}/modules` |
| GET/POST | `/api/v1/courses/{id}/lessons` |
| DELETE | `/api/v1/courses/{id}/lessons` |
| GET | `/api/v1/modules` |
| GET | `/api/v1/lessons` |
| PUT/DELETE | `/api/v1/lessons/{id}` |
| POST | `/api/v1/lessons/{id}/complete` |
| POST | `/api/v1/auth/login` |
| POST | `/api/v1/auth/sso/microsoft` |
| GET | `/api/v1/users/me` |
| GET | `/api/v1/users/me/enrollments` |
| GET | `/api/v1/users/me/progress` |

## Produção (Railway)

1. Criar serviço a partir de `backend/`
2. Adicionar Postgres e definir:
   - `SPRING_PROFILES_ACTIVE=prod`
   - `DATABASE_URL` (JDBC: `jdbc:postgresql://host:port/db`)
   - `DATABASE_USERNAME` / `DATABASE_PASSWORD`
   - `CORS_ORIGINS` com a URL do front
3. Healthcheck: `/api/v1/health`
4. Variáveis recomendadas:
   - `LMS_SEED_ENABLED=false`
   - `LMS_BLOCK_DEMO_SEED_LOGINS=true` (default com `SPRING_PROFILES_ACTIVE=prod`)
   - `LMS_API_TOKEN` com valor forte

## Front

No Next.js:

```env
NEXT_PUBLIC_USE_JAVA_API=true
LMS_API_URL=http://localhost:8080
LMS_API_TOKEN=local-dev-token
AUTH_SECRET=dev-secret-change-me
```

Todas as rotas `/api/v1/**` (exceto health) exigem `Authorization: Bearer <LMS_API_TOKEN>` e `X-User-Email`.

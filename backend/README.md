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

Demo header: `X-User-Email: henrique.castro@navoxi.com` ou `diego.alves@navoxi.com`.

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

## Front

No Next.js:

```env
NEXT_PUBLIC_USE_JAVA_API=true
LMS_API_URL=http://localhost:8080
LMS_API_TOKEN=local-dev-token
AUTH_SECRET=dev-secret-change-me
```

Todas as rotas `/api/v1/**` (exceto health) exigem `Authorization: Bearer <LMS_API_TOKEN>` e `X-User-Email`.

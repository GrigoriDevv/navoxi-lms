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

Autenticação por senha (BCrypt): `POST /api/v1/auth/login` com body `{ "email", "password" }` e header `Authorization: Bearer <LMS_API_TOKEN>`. Resposta inclui `accessToken` (JWT). Contas seed: [`docs/local-dev-auth.md`](../docs/local-dev-auth.md).

Rotas de dados exigem `Authorization: Bearer <accessToken JWT>` emitido no login — **não** use `X-User-Email`. Em testes manuais, faça login e copie o `accessToken`.

**JWT:** `LMS_JWT_SECRET` (prod obrigatório, ≥32 chars). TTL default 7d (`LMS_JWT_TTL_SECONDS`).

**Bloqueio de contas demo em produção:** `LMS_BLOCK_DEMO_SEED_LOGINS=true` (default no profile `prod`) impede login das contas seed, mesmo que existam no banco. No front, com `NODE_ENV=production` o fallback mock com senha compartilhada fica hard-disabled (`ALLOW_DEMO_LOGIN` / `AUTH_DEMO_ENABLED` ignorados).

Microsoft SSO: `POST /api/v1/auth/sso/microsoft` com `{ "email", "name", "microsoftOid" }`. Com `LMS_JIT_PROVISIONING=true` (default em `prod`), cria `UserAccount` no primeiro login (default `aluno`; bootstrap admin via `LMS_BOOTSTRAP_ADMIN_EMAILS` ou banco vazio). Domínio: `LMS_ALLOWED_EMAIL_DOMAINS`.

Admin directory: `GET/POST/PATCH/DELETE /api/v1/users` (roles `admin_premium` / `admin_unidade`). Create pré-provisiona SSO (`authProvider=microsoft` default) ou local/both com senha; DELETE é soft-delete (`inativo`).

**Escopo de unidade:** list/get/mutate de cursos, catálogo, aulas e matrículas filtram por `UserAccount.unitId` no servidor (`UnitScope`). Só `admin_premium` vê todas as unidades. O `useAuthScope` do front é UX — não substitui o filtro da API.

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
| GET | `/api/v1/users` |
| POST | `/api/v1/users` |
| PATCH | `/api/v1/users/{id}` |
| DELETE | `/api/v1/users/{id}` (soft: `status=inativo`) |
| GET | `/api/v1/users/me` |
| GET | `/api/v1/users/me/export` |
| DELETE | `/api/v1/users/me` |
| GET | `/api/v1/users/me/enrollments` |
| GET | `/api/v1/users/me/progress` |
| GET | `/api/v1/attempts/mine` |
| GET/POST | `/api/v1/evaluations/{id}/attempts` |
| GET | `/api/v1/attempts/{id}` |
| PUT | `/api/v1/attempts/{id}/answers` |
| POST | `/api/v1/attempts/{id}/submit` |
| PATCH | `/api/v1/attempts/{id}/answers/{answerId}/grade` |
| GET | `/api/v1/permissions` |
| GET/PATCH | `/api/v1/permissions/{id}` |
| GET | `/api/v1/scheduled-jobs` |
| GET/PATCH | `/api/v1/scheduled-jobs/{id}` |
| GET | `/api/v1/reports/completion` |
| GET | `/api/v1/reports/pending` |
| GET | `/api/v1/certificates/me` |
| GET | `/api/v1/certificates/{id}/pdf` |
| GET | `/api/v1/certificates/verify/{hash}` (público) |
| GET | `/api/v1/certificates/verify/{hash}/pdf` (público) |
| PATCH | `/api/v1/certificates/{id}/revoke` |
| GET | `/api/v1/search?q=&types=&limit=` |

Busca (`GET /api/v1/search`): `q` ≥2 chars; `types` opcional CSV `course,lesson,question` (default os três); `limit` default 20 max 50. ILIKE em título de curso/aula e texto de pergunta; escopo `UnitScope` (`admin_premium` global).

Submit auto-corrige questões `multipla` / `verdadeiro` (`corrigida` + `scorePct`); com dissertativa → `aguardando_correcao`.

`PATCH .../grade` (staff): corrige dissertativa (`isCorrect` + `feedback`); quando todas as dissertativas tiverem `isCorrect`, a tentativa vai para `corrigida` e `scorePct` passa a considerar todas as questões.

Permissions e scheduled jobs são configuração global (`admin_premium`). A matriz de permissões é persistência/exibição: o enforcement continua nos `@PreAuthorize` por role.

Relatórios (`admin_premium` global; `admin_unidade` restrito à própria unidade):

- `GET /reports/completion?courseId=&turmaId=&unitId=` — agrega matrículas não canceladas por curso/turma (`enrolled`, `completed`, `inProgress`, `notStarted`, `avgProgressPct`, `completionRatePct`). Turma vem do `turmaId` desnormalizado da matrícula (bucket nulo = sem turma).
- `GET /reports/pending?courseId=&turmaId=&unitId=&userId=` — pendências por aluno: aulas sem `LessonProgress` e avaliações `publicada`/`aplicada` sem tentativa `corrigida` (estado `nao_iniciada` / `em_andamento` / `aguardando_correcao`). Só retorna linhas com alguma pendência.

Certificados (Flyway `V12`; PDF via OpenPDF; validade `LMS_CERTIFICATE_VALIDITY_MONTHS`, default 24):

- Emissão automática quando a matrícula fica `concluida` **e** cada avaliação `publicada`/`aplicada` do curso (turma matching) tem tentativa `corrigida` com `scorePct >= passingScorePct` (default 70). Curso sem avaliações → emite só com conclusão das aulas.
- `GET /certificates/me`, `GET /certificates/{id}/pdf` (dono ou staff), `PATCH /certificates/{id}/revoke` (staff).
- Públicos: `GET /certificates/verify/{hash}` e `.../pdf` (sem JWT). Front: `/certificados/verificar/[hash]`.

### Email (SMTP)

Canal opcional espelhando notificações in-app (`NotificationService.notify` → SMTP). Default **off** (`LMS_MAIL_ENABLED=false`).

- Eventos cobertos: novo material (já via `LessonService`), resultado de correção (ao fechar tentativa `corrigida`), prova prestes a fechar (job horário, janela `LMS_DEADLINE_REMINDER_WINDOW_HOURS`, default 24h; dedupe `details=deadline-reminder:{evalId}`).
- Envs: `LMS_MAIL_*`, `LMS_PUBLIC_APP_URL`, `SPRING_MAIL_*` (host/user/pass). Compatível com Amazon SES SMTP e Resend SMTP.
- Ao criar um usuário local sem informar senha, o backend gera uma credencial temporária, armazena somente o hash e envia as instruções de primeiro acesso por SMTP. A criação é recusada quando o SMTP está desabilitado.
- Resend: use `smtp.resend.com:587`, usuário `resend`, e a API key `re_...` como `SPRING_MAIL_PASSWORD`. `LMS_MAIL_FROM` precisa usar um domínio verificado no Resend.
- Falha SMTP: WARN, não reverte a notificação persistida.

### LGPD (MVP)

- Tabela `access_log` (Flyway `V4`): quem, ação, recurso, IP, user-agent, quando. Escrita em login, SSO, `GET /users/me`, export e delete.
- `GET /api/v1/users/me/export` — portabilidade JSON (perfil, matrículas, progresso, solicitações, notificações, access_log do titular).
- `DELETE /api/v1/users/me` — direito ao esquecimento via scrub irreversível de PII + `status=inativo` (evita cascade em matrículas/progresso). JWT deixa de autenticar.
- **Retenção:** progresso 24 meses / `access_log` 12 meses — job diário se `LMS_RETENTION_ENABLED=true`. Política: [`docs/lgpd-data-retention.md`](../docs/lgpd-data-retention.md).
- Criptografia em repouso do Postgres em produção: ver [Produção (Railway) — Encryption at rest](#encryption-at-rest-postgres).
- **Criptografia em coluna:** avaliada e **não aplicável** ao modelo atual (sem CPF/dado sensível). Decisão e gatilhos: [`docs/lgpd-column-encryption.md`](../docs/lgpd-column-encryption.md).

## Produção (Railway)

1. Criar serviço a partir de `backend/`
2. Adicionar Postgres e definir:
   - `SPRING_PROFILES_ACTIVE=prod` (já no Dockerfile)
   - `DATABASE_URL` (JDBC: `jdbc:postgresql://host:port/db`)
   - `DATABASE_USERNAME` / `DATABASE_PASSWORD`
   - `CORS_ORIGINS` com a URL do front (**obrigatório** — app não sobe sem)
   - `LMS_API_TOKEN` forte (≥24 chars; **não** `local-dev-token`)
   - `LMS_JWT_SECRET` ≥32 chars (obrigatório em prod)
3. Healthcheck: `/api/v1/health`
4. Defaults de hardening no profile `prod`:
   - Seed **off** (hardcoded; `LMS_SEED_ENABLED` ignorado)
   - `LMS_BLOCK_DEMO_SEED_LOGINS=true`
   - Rate limit login: 10 req / 60s por IP e por e-mail (`LMS_LOGIN_RATE_LIMIT_*`)
   - Rate limit API (mutações + `GET /users/me/export`): 60 req / 60s por IP e por usuário (`LMS_API_RATE_LIMIT_*`; off em local)
5. Fail-fast no boot se token fraco, CORS vazio ou seed ligado fora do profile `local`.

### Encryption at rest (Postgres)

O Postgres no Railway usa volume persistente. **Não há toggle** de disk encryption no dashboard nem configuração no Spring: o provedor cifra os dados **em repouso na camada de storage** (AES-256; checkbox de compliance “encrypted at rest”). Não é TDE nem criptografia por coluna na aplicação.

Fontes: [Trust Center](https://trust.railway.com/), [Station — databases encrypted at rest](https://station.railway.com/questions/are-databases-encrypted-at-rest-0e719d6c), [blog compliance (AES-256)](https://blog.railway.com/p/secure-cloud-hosting-for-compliance).

Em trânsito (assunto separado): preferir **Private Network** entre API e Postgres; o TCP proxy público não deve ser o caminho padrão de produção.

### Checklist env (API Railway)

| Variável | Prod |
|---|---|
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `LMS_API_TOKEN` | secret forte (≥24) |
| `LMS_JWT_SECRET` | ≥32 chars |
| `CORS_ORIGINS` | URL(s) do front, CSV |
| `LMS_SEED_ENABLED` | omitir / false (prod força off) |
| `LMS_LOGIN_RATE_LIMIT_ENABLED` | `true` (default prod) |
| `LMS_LOGIN_RATE_LIMIT_MAX` | `10` (default) |
| `LMS_LOGIN_RATE_LIMIT_WINDOW_SECONDS` | `60` (default) |
| `LMS_API_RATE_LIMIT_ENABLED` | `true` (default prod; off em local) |
| `LMS_API_RATE_LIMIT_MAX` | `60` (default) |
| `LMS_API_RATE_LIMIT_WINDOW_SECONDS` | `60` (default) |
| `LMS_MAIL_ENABLED` | `false` até SMTP configurado |
| `LMS_MAIL_FROM` | remetente verificado no provedor |
| `LMS_PUBLIC_APP_URL` | URL do front (links no email) |
| `SPRING_MAIL_HOST` / `PORT` / `USERNAME` / `PASSWORD` | SMTP (SES/Resend/etc.) |
| `LMS_DEADLINE_REMINDER_ENABLED` | `true` (default) |
| `LMS_DEADLINE_REMINDER_WINDOW_HOURS` | `24` (default) |

## Front

No Next.js:

```env
NEXT_PUBLIC_USE_JAVA_API=true
LMS_API_URL=http://localhost:8080
LMS_API_TOKEN=local-dev-token
LMS_JWT_SECRET=local-dev-jwt-secret-at-least-32-chars
AUTH_SECRET=dev-secret-change-me
```

Em **produção** do Next, `LMS_API_TOKEN` fraco/ausente lança erro (mesmo valor forte do Java).

- `POST /api/v1/auth/**` (Next→Java): `Authorization: Bearer <LMS_API_TOKEN>`
- Demais `/api/v1/**`: `Authorization: Bearer <accessToken JWT>` do login (via BFF)

`LMS_API_TOKEN` é **server-only**: nunca em `NEXT_PUBLIC_*` e lido apenas em [`src/lib/api-config.server.ts`](../src/lib/api-config.server.ts) (marcado com `import "server-only"`), consumido só pelas rotas `/api/auth/**`. Gate contínuo: `npm run check:secrets` / CI (`scripts/check-lms-api-token-server-only.mjs`). Validado com canário no build: o valor não aparece em `.next/static` (bundle client).

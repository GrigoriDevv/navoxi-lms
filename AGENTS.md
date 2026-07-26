<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Data wiring

Inventário para não tratar mock como backend real. Detalhes de produto e rotas: [README.md — Limitações do MVP](README.md#limitações-do-mvp--o-que-não-vender-como-pronto).

| Área | Persistência | Flag / gate |
|------|--------------|-------------|
| Auth (login, JWT, sessão) | Postgres via Spring | `NEXT_PUBLIC_USE_JAVA_API=true` |
| Aprendizagem core (cursos, módulos, aulas, matrículas, progresso, solicitações) | Postgres via BFF `/api/lms/*` | idem; React Query em `src/lib/lms/` |
| Questões e avaliações | Postgres via BFF (`questions`, `evaluations`) | idem; `use-questions` / `use-evaluations` + `use-repository-store` |
| Posts e destaques | Postgres via BFF (`posts`, `destaques`) | idem; `use-posts` / `use-destaques` + `use-communication-store` |
| Permissions e scheduled jobs | Postgres via BFF (`permissions`, `scheduled-jobs`) | idem; `use-permissions` / `use-scheduled-jobs` + `use-admin-store` |
| Relatórios de conclusão (`reports/completion`, `reports/pending`) | Postgres via BFF (`reports`) — agregados read-only | idem; `lmsApi.getCompletionReport` / `getPendingReport` (sem hook/UI; página `/relatorios` ainda mostra KPIs mock) |
| Certificados (`certificates/me`, PDF, verify público, revoke) | Postgres via Spring + OpenPDF on-the-fly | idem; emissão automática (matrícula `concluida` + avaliações aprovadas); `lmsApi.listMyCertificates` / download / verify; página pública `/certificados/verificar/[hash]`. Lista `/aprendizagem/certificados` **ainda mock** (gated) |
| Notificações | Postgres | idem (`use-notifications-store`) |
| Admin usuários (`GET/POST/PATCH/DELETE /api/v1/users`) | Postgres | idem; página `/administracao` |
| **FE-1 restantes** (`contents`, `alertRules`, `internalMails`, `automations`, `integrations`) | **Mock** — `seed.*` + estado React | Domain hooks FE-4: `use-communication-store` (alertRules/internalMails/automations), `use-repository-store` (só `contents`), `use-admin-store` (integrations + settings/audit/users locais); `// MOCK` nos slices; `/comunicacao`, `/configuracoes` e `/integracoes` permanecem gated (ainda têm mocks mistos). Migração Java: [FE-5](docs/fe-5-mock-to-java-migration.md) |
| Aprendizagem demo (turmas, trilhas, salas, interesses) | **Mock** | `use-learning-store.ts` quando Java API off ou campos sem endpoint |
| Lista UI de certificados (`/aprendizagem/certificados`) | **Mock** (seed) | gated em `MOCK_ONLY_PATHS`; emissão/verify/PDF já no Java |
| Outros mock admin (`users` lista local, `messages`, `auditLogs`, `settings`) | **Mock** | `use-admin-store` / communication; admin Java de usuários usa API direta |
| Preferências UI | localStorage | `use-auth-store` |

```mermaid
flowchart TB
  subgraph java [Postgres via Spring BFF]
    Auth[auth session JWT]
    Learn[courses modules lessons enroll progress]
    EnrollReq[enrollment-requests]
    QuestionsEval[questions evaluations]
    PostsDestaques[posts destaques]
    PermsJobs[permissions scheduled-jobs]
 Reports[reports completion pending]
 Certificates[certificates issue pdf verify]
 Notif[notifications]
    UsersAdmin[GET POST PATCH DELETE users]
    AccessLog[access_log LGPD]
  end
  subgraph mock [seed plus React domain hooks]
    CommMock[use-communication-store alertRules mail automations]
    RepoContents[use-repository-store contents]
    AdminMock[use-admin-store integrations settings audit]
    LearnMock[turmas trilhas salas interesses certListMock]
  end
  UI[Pages] --> java
  UI --> mock
```

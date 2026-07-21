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
| Notificações | Postgres | idem (`use-notifications-store`) |
| Admin usuários (`GET/PATCH /api/v1/users`) | Postgres | idem; página `/administracao` |
| **11 slices FE-1** em `store.tsx` (`posts`, `questions`, `evaluations`, `contents`, `destaques`, `alertRules`, `internalMails`, `automations`, `integrations`, `permissions`, `scheduledJobs`) | **Mock** — `seed.*` + estado React | Marcados com `// MOCK: not wired to backend`; rotas ocultas em prod via `src/lib/mock-module-gates.ts` |
| Aprendizagem demo (turmas, trilhas, salas, certificados, interesses) | **Mock** | `use-learning-store.ts` quando Java API off ou campos sem endpoint |
| Outros em `store.tsx` (`users`, `messages`, `auditLogs`, `settings`) | **Mock** | Lista `users` local; admin Java usa API direta |
| Preferências UI | localStorage | `use-auth-store` |

```mermaid
flowchart TB
  subgraph java [Postgres via Spring BFF]
    Auth[auth session JWT]
    Learn[courses modules lessons enroll progress]
    EnrollReq[enrollment-requests]
    Notif[notifications]
    UsersAdmin[GET PATCH users]
  end
  subgraph mock [seed plus React state]
    Store11[store.tsx 11 FE-1 slices]
    LearnMock[turmas trilhas salas certificados]
    Other[users messages audit settings]
  end
  UI[Pages] --> java
  UI --> mock
```

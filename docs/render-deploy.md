# Deploy no Render (Blueprint)

Hospeda **API Spring** (`lms-api`), **front Next** (`navoxi-lms`) e **Postgres** (`lms-db`) a partir de [`render.yaml`](../render.yaml). O deploy Railway existente **não** é removido.

## Pré-requisitos

- Conta [Render](https://dashboard.render.com) com o GitHub `GrigoriDevv/navoxi-lms` conectado
- Branch com `render.yaml` na raiz (ex.: `main` após merge)

## Passo a passo

1. Dashboard → **New** → **Blueprint**
2. Selecione o repositório e o branch
3. Review dos serviços: `lms-api`, `navoxi-lms`, `lms-db`, env group `lms-secrets`
4. Quando pedir **`LMS_CERTIFICATE_VERIFY_BASE_URL`**, use:
   `https://<nome-do-serviço-navoxi-lms>.onrender.com/certificados/verificar`
   (pode ajustar depois do primeiro deploy, quando a URL pública existir)
5. Apply / Create → aguarde o build (API Docker ~5–10 min; Next ~3–5 min)

## Secrets / env (checklist)

| Variável | Onde | Como |
|----------|------|------|
| `LMS_API_TOKEN` | env group `lms-secrets` | `generateValue` no Blueprint (compartilhado API+front) |
| `LMS_JWT_SECRET` | `lms-api` | `generateValue` (≥32; obrigatório em `prod`) |
| `AUTH_SECRET` | `navoxi-lms` | `generateValue` |
| `DATABASE_URL` | `lms-api` | `fromDatabase` → `lms-db` |
| `CORS_ORIGINS` | `lms-api` | URL pública do front (`RENDER_EXTERNAL_URL`) |
| `LMS_PUBLIC_APP_URL` | `lms-api` | idem |
| `LMS_API_URL` | `navoxi-lms` | URL pública da API |
| `NEXT_PUBLIC_APP_URL` | `navoxi-lms` | URL pública do front |
| `NEXT_PUBLIC_USE_JAVA_API` | `navoxi-lms` | `true` |
| `LMS_CERTIFICATE_VERIFY_BASE_URL` | `lms-api` | prompt no sync (`…/certificados/verificar`) |

**Não** setar em prod pública: `NEXT_PUBLIC_SHOW_MOCK_MODULES`, `LMS_SEED_ENABLED=true`, token `local-dev-token`.

## Validação

```bash
curl -sS https://<lms-api>.onrender.com/api/v1/health
# {"service":"…","status":"UP"}

curl -sS https://<navoxi-lms>.onrender.com/api/health
# {"status":"ok"}
```

Abra o front, faça login (contas seed bloqueadas em prod por default — use usuário real/SSO ou ajuste flags só em staging).

## Limitações free

- Web services **dormem** após ~15 min idle; o primeiro request (sobretudo Java) pode levar 1–2 min
- Postgres **free expira em ~30 dias** (depois upgrade ou perda dos dados)
- Sem S3 / SMTP até configurar `LMS_S3_*` / `LMS_MAIL_*`

## Troubleshooting

| Sintoma | Causa provável |
|---------|----------------|
| API crash loop / `LMS_JWT_SECRET é obrigatório` | Secret ausente no serviço `lms-api` |
| API sobe mas front 401/CORS | `CORS_ORIGINS` ≠ URL do front; redeploy após sync do Blueprint |
| Front não fala com API | `LMS_API_URL` / `LMS_API_TOKEN` divergentes |
| OOM no build/run Java | Free instance pequena — subir plano do `lms-api` |

## Atualizar

Push na branch linkada ao Blueprint → Render redeploya serviços afetados (sync automático, salvo desabilitado no dashboard).

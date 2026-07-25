# Política de retenção de dados (LGPD)

Base: retenção limitada aos fins do tratamento (LGPD Arts. 15 e 16). Este documento define prazos do Navoxi LMS e o que o job automático faz versus a exclusão a pedido do titular.

## Prazos

| Dado | Prazo | Ação |
|------|-------|------|
| `lesson_progress` | **24 meses** após `completed_at` | Delete das linhas |
| `access_log` | **12 meses** após `created_at` | Delete das linhas |
| Avaliações (catálogo `evaluations` / questions) | N/A — não são dado do titular | Quando existirem **respostas/tentativas** do aluno: 24 meses após a tentativa |
| Certificados | **5 anos** após emissão (ou até `expiresAt`) | Hoje são **mock** no frontend; job Java quando houver tabela Postgres |

Overrides opcionais via env (meses): `LMS_RETENTION_PROGRESS_MONTHS`, `LMS_RETENTION_ACCESS_LOG_MONTHS`.

## Job automático vs exclusão a pedido

| Mecanismo | Quando | Efeito |
|-----------|--------|--------|
| **Retention purge** (`RetentionPurgeService`) | Cron diário 03:30 UTC se `LMS_RETENTION_ENABLED=true` | Remove progresso e logs **expirados**; registra `access_log` com ação `retention.purge` |
| **Exclusão do titular** ([`UserPrivacyService`](../backend/src/main/java/com/navoxi/lms/service/UserPrivacyService.java)) | `DELETE /api/v1/users/me` | Scrub de PII + `status=inativo` imediato (direito ao esquecimento) |

O purge **não** substitui o direito ao esquecimento: só aplica prazos de retenção operacional/auditoria.

## Configuração

| Variável | Default | Notas |
|----------|---------|-------|
| `LMS_RETENTION_ENABLED` | `false` (local); `true` (profile `prod`) | Liga o scheduler |
| `LMS_RETENTION_PROGRESS_MONTHS` | `24` | Idade máxima de `lesson_progress` |
| `LMS_RETENTION_ACCESS_LOG_MONTHS` | `12` | Idade máxima de `access_log` |

## Fora de escopo (neste ciclo)

- Tabela/persistência de certificados
- Tentativas/respostas de avaliação do aluno
- Anonimização parcial de linhas (purge usa **delete**)

## Relacionados

- Criptografia em coluna (avaliada, N/A no MVP): [`lgpd-column-encryption.md`](lgpd-column-encryption.md)

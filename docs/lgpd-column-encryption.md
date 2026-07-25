# Criptografia em nível de coluna (LGPD) — decisão

**Status:** avaliado — **não aplicável** ao MVP atual (2026-07).

## Decisão

Não implementar `pgcrypto` nem AES por coluna enquanto o modelo não armazenar CPF, dado de saúde, biometria ou outro **dado sensível** (LGPD Art. 5, II).

Controles atuais suficientes:

- **Encryption at rest** do Postgres no provedor (Railway / storage AES-256) — ver [backend README — Encryption at rest](../backend/README.md#encryption-at-rest-postgres)
- **Senha:** `password_hash` com BCrypt (nunca plaintext)
- **Trânsito:** TLS na borda; preferir Private Network API↔Postgres em produção

Criptografia em coluna **não** substitui encryption at rest do volume, e o inverso também é verdadeiro.

## Inventário (modelo atual)

| Campo / área | Tipo LGPD | Cifrado em coluna? |
|--------------|-----------|-------------------|
| `users.name`, `email`, `department` | Dado pessoal comum | Não — at-rest do disco |
| `users.password_hash` | Credencial | Hash BCrypt (não é cifra reversível) |
| Matrículas, progresso, solicitações | Operacional + vínculo ao titular | Não |
| `access_log` (IP, UA, ação) | Registro de acesso | Não — retenção curta (12m) |
| CPF / RG / telefone / saúde / biometria | — | **Ausente** do schema |

## Gatilhos para reavaliar

Reabrir este tema **antes** de mergear qualquer mudança que:

1. Persista **CPF** (ou documento identificador equivalente)
2. Persista **dado sensível** Art. 5 II (saúde, biometria, origem racial/étnica, etc.)
3. Exija busca por igualdade sobre campo que passaria a ser cifrado (exige desenho de blind index / HMAC)

## Quando aplicável — abordagem preferida

1. **Preferir não armazenar** o atributo se o negócio não exigir (minimização).
2. Se obrigatório armazenar:
   - **App-level AES-GCM** com chave em env (`LMS_FIELD_ENCRYPTION_KEY`, rotacionável) **ou** `pgcrypto` com chave **fora** do banco
   - Campos cifrados **não** indexáveis por valor claro; para lookup usar HMAC truncado / blind index separado
   - Documentar rotação de chave e impacto em export/delete LGPD
3. Nunca tratar encryption at rest do volume como “criptografia de coluna”.

## Relacionados

- Retenção: [`lgpd-data-retention.md`](lgpd-data-retention.md)
- Portabilidade / exclusão do titular: `UserPrivacyService` + `GET/DELETE /api/v1/users/me`

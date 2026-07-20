ALTER TABLE users
  ADD COLUMN password_hash VARCHAR(255),
  ADD COLUMN microsoft_oid VARCHAR(128),
  ADD COLUMN auth_provider VARCHAR(16) NOT NULL DEFAULT 'local';

CREATE UNIQUE INDEX users_microsoft_oid_unique ON users (microsoft_oid)
  WHERE microsoft_oid IS NOT NULL;

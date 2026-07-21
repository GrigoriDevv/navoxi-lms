-- LGPD Art. 37: registro mínimo de acesso a dados pessoais / operações sensíveis
CREATE TABLE access_log (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36),
  action VARCHAR(64) NOT NULL,
  resource VARCHAR(255),
  ip_address VARCHAR(64),
  user_agent VARCHAR(512),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_access_log_user ON access_log (user_id);
CREATE INDEX idx_access_log_created ON access_log (created_at);
CREATE INDEX idx_access_log_action ON access_log (action);

ALTER TABLE access_log
  ADD CONSTRAINT fk_access_log_user
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

CREATE TABLE posts (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  author VARCHAR(255) NOT NULL,
  unit_id VARCHAR(32) NOT NULL,
  status VARCHAR(32) NOT NULL,
  published_at VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE destaques (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  unit_id VARCHAR(32) NOT NULL,
  visible BOOLEAN NOT NULL DEFAULT TRUE,
  pinned BOOLEAN NOT NULL DEFAULT FALSE,
  published_at VARCHAR(64) NOT NULL,
  expires_at VARCHAR(64),
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_posts_unit ON posts(unit_id);
CREATE INDEX idx_destaques_unit ON destaques(unit_id);

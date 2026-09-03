CREATE INDEX idx_posts_created_at_id
  ON posts (created_at DESC, id DESC);

DROP INDEX idx_posts_unit;

CREATE INDEX idx_posts_unit_created_at_id
  ON posts (unit_id, created_at DESC, id DESC);

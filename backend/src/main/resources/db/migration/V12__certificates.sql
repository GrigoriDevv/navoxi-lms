ALTER TABLE evaluations
  ADD COLUMN passing_score_pct NUMERIC(5, 2) NOT NULL DEFAULT 70;

CREATE TABLE certificates (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id VARCHAR(36) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrollment_id VARCHAR(36) NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  user_name VARCHAR(255) NOT NULL,
  course_title VARCHAR(255) NOT NULL,
  unit_id VARCHAR(32) NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  validation_hash VARCHAR(64) NOT NULL,
  status VARCHAR(32) NOT NULL,
  CONSTRAINT uq_certificates_user_course UNIQUE (user_id, course_id),
  CONSTRAINT uq_certificates_validation_hash UNIQUE (validation_hash)
);

CREATE INDEX idx_certificates_user ON certificates(user_id);
CREATE INDEX idx_certificates_hash ON certificates(validation_hash);

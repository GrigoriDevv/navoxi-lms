CREATE TABLE enrollment_requests (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id VARCHAR(36) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_name VARCHAR(255) NOT NULL,
  course_title VARCHAR(255) NOT NULL,
  turma_id VARCHAR(36),
  turma_name VARCHAR(255),
  unit_id VARCHAR(32) NOT NULL,
  requested_at VARCHAR(64) NOT NULL,
  status VARCHAR(32) NOT NULL,
  reviewer VARCHAR(255),
  reviewed_at VARCHAR(64)
);

CREATE UNIQUE INDEX uq_enrollment_requests_pending
  ON enrollment_requests (user_id, course_id)
  WHERE status = 'pendente';

CREATE INDEX idx_enrollment_requests_status ON enrollment_requests(status);
CREATE INDEX idx_enrollment_requests_unit ON enrollment_requests(unit_id);
CREATE INDEX idx_enrollment_requests_user ON enrollment_requests(user_id);

CREATE UNIQUE INDEX uq_enrollments_active
  ON enrollments (user_id, course_id)
  WHERE status = 'ativa';

CREATE TABLE notifications (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(32) NOT NULL,
  read_flag BOOLEAN NOT NULL DEFAULT FALSE,
  timestamp_label VARCHAR(64) NOT NULL,
  href VARCHAR(512),
  module VARCHAR(128),
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read_flag);

CREATE TABLE questions (
  id VARCHAR(36) PRIMARY KEY,
  text TEXT NOT NULL,
  type VARCHAR(32) NOT NULL,
  category VARCHAR(128) NOT NULL,
  unit_id VARCHAR(32) NOT NULL,
  usage_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE evaluations (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  course_id VARCHAR(36) NOT NULL,
  turma_id VARCHAR(36),
  unit_id VARCHAR(32) NOT NULL,
  question_count INT NOT NULL DEFAULT 0,
  status VARCHAR(32) NOT NULL,
  due_date VARCHAR(64) NOT NULL,
  applied_at VARCHAR(64),
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE evaluation_questions (
  evaluation_id VARCHAR(36) NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  question_id VARCHAR(36) NOT NULL,
  sort_order INT NOT NULL,
  PRIMARY KEY (evaluation_id, sort_order)
);

CREATE INDEX idx_questions_unit ON questions(unit_id);
CREATE INDEX idx_evaluations_unit ON evaluations(unit_id);
CREATE INDEX idx_evaluation_questions_eval ON evaluation_questions(evaluation_id);

CREATE TABLE evaluation_attempts (
  id VARCHAR(36) PRIMARY KEY,
  evaluation_id VARCHAR(36) NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  attempt_number INT NOT NULL,
  status VARCHAR(32) NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  submitted_at TIMESTAMPTZ,
  score_pct DOUBLE PRECISION
);

CREATE UNIQUE INDEX uq_evaluation_attempts_number
  ON evaluation_attempts (evaluation_id, user_id, attempt_number);

CREATE UNIQUE INDEX uq_evaluation_attempts_open
  ON evaluation_attempts (evaluation_id, user_id)
  WHERE status = 'em_andamento';

CREATE INDEX idx_evaluation_attempts_user ON evaluation_attempts(user_id);
CREATE INDEX idx_evaluation_attempts_eval ON evaluation_attempts(evaluation_id);

CREATE TABLE attempt_answers (
  id VARCHAR(36) PRIMARY KEY,
  attempt_id VARCHAR(36) NOT NULL REFERENCES evaluation_attempts(id) ON DELETE CASCADE,
  question_id VARCHAR(36) NOT NULL,
  response_text TEXT,
  selected_option VARCHAR(255),
  is_correct BOOLEAN
);

CREATE UNIQUE INDEX uq_attempt_answers_question
  ON attempt_answers (attempt_id, question_id);

CREATE INDEX idx_attempt_answers_attempt ON attempt_answers(attempt_id);

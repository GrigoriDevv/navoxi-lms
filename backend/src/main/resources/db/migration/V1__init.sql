CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(32) NOT NULL,
  unit_id VARCHAR(32) NOT NULL,
  department VARCHAR(255) NOT NULL,
  status VARCHAR(32) NOT NULL,
  last_access VARCHAR(64),
  avatar_color VARCHAR(32) NOT NULL
);

CREATE TABLE courses (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(128) NOT NULL,
  instructor VARCHAR(255) NOT NULL,
  unit_id VARCHAR(32) NOT NULL,
  modality VARCHAR(32) NOT NULL,
  audience VARCHAR(255) NOT NULL,
  workload INT NOT NULL,
  status VARCHAR(32) NOT NULL,
  enrolled INT NOT NULL DEFAULT 0,
  completion INT NOT NULL DEFAULT 0,
  cover VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE course_modules (
  id VARCHAR(36) PRIMARY KEY,
  course_id VARCHAR(36) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  sort_order INT NOT NULL
);

CREATE TABLE course_lessons (
  id VARCHAR(36) PRIMARY KEY,
  course_id VARCHAR(36) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  module_id VARCHAR(36) NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
  sort_order INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  youtube_video_id VARCHAR(64),
  video_url TEXT,
  duration_sec INT
);

CREATE TABLE enrollments (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id VARCHAR(36) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_name VARCHAR(255) NOT NULL,
  course_title VARCHAR(255) NOT NULL,
  turma_id VARCHAR(36),
  turma_name VARCHAR(255),
  unit_id VARCHAR(32) NOT NULL,
  enrolled_at VARCHAR(64) NOT NULL,
  progress INT NOT NULL DEFAULT 0,
  status VARCHAR(32) NOT NULL
);

CREATE TABLE lesson_progress (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id VARCHAR(36) NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
  completed_at VARCHAR(64) NOT NULL,
  UNIQUE (user_id, lesson_id)
);

CREATE INDEX idx_modules_course ON course_modules(course_id);
CREATE INDEX idx_lessons_course ON course_lessons(course_id);
CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_progress_user ON lesson_progress(user_id);

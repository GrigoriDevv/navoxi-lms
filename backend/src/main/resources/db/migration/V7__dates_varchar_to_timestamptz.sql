ALTER TABLE enrollments
  ALTER COLUMN enrolled_at TYPE TIMESTAMPTZ
  USING to_timestamp(enrolled_at, 'YYYY-MM-DD HH24:MI');

ALTER TABLE lesson_progress
  ALTER COLUMN completed_at TYPE TIMESTAMPTZ
  USING to_timestamp(completed_at, 'YYYY-MM-DD HH24:MI');

ALTER TABLE enrollment_requests
  ALTER COLUMN requested_at TYPE TIMESTAMPTZ
  USING to_timestamp(requested_at, 'YYYY-MM-DD HH24:MI');

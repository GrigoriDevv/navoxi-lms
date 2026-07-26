ALTER TABLE questions
  ADD COLUMN options_json TEXT,
  ADD COLUMN correct_key VARCHAR(255);

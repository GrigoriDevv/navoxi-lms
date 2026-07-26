-- Align with score_pct (V8) and Double entity mapping under Hibernate validate.
ALTER TABLE evaluations
  ALTER COLUMN passing_score_pct TYPE DOUBLE PRECISION
  USING passing_score_pct::double precision;

package com.navoxi.lms.repository;

import com.navoxi.lms.domain.entity.AttemptAnswer;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AttemptAnswerRepository extends JpaRepository<AttemptAnswer, String> {
  Optional<AttemptAnswer> findByAttemptIdAndQuestionId(String attemptId, String questionId);
}

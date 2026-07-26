package com.navoxi.lms.repository;

import com.navoxi.lms.domain.entity.EvaluationAttempt;
import com.navoxi.lms.domain.enums.AttemptStatus;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EvaluationAttemptRepository extends JpaRepository<EvaluationAttempt, String> {

  List<EvaluationAttempt> findByUserIdOrderByStartedAtDesc(String userId);

  List<EvaluationAttempt> findByUserIdIn(Collection<String> userIds);

  List<EvaluationAttempt> findByEvaluationIdOrderByStartedAtDesc(String evaluationId);

  List<EvaluationAttempt> findByEvaluationIdAndUserIdOrderByAttemptNumberAsc(
      String evaluationId, String userId);

  Optional<EvaluationAttempt> findByEvaluationIdAndUserIdAndStatus(
      String evaluationId, String userId, AttemptStatus status);

  @Query(
      "select coalesce(max(a.attemptNumber), 0) from EvaluationAttempt a"
          + " where a.evaluation.id = :evaluationId and a.user.id = :userId")
  Integer maxAttemptNumber(
      @Param("evaluationId") String evaluationId, @Param("userId") String userId);
}

package com.navoxi.lms.repository;

import com.navoxi.lms.domain.entity.Evaluation;
import com.navoxi.lms.domain.enums.UnitId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EvaluationRepository extends JpaRepository<Evaluation, String> {
  List<Evaluation> findByUnitId(UnitId unitId);
}

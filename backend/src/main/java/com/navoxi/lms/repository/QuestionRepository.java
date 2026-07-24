package com.navoxi.lms.repository;

import com.navoxi.lms.domain.entity.Question;
import com.navoxi.lms.domain.enums.UnitId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuestionRepository extends JpaRepository<Question, String> {
  List<Question> findByUnitId(UnitId unitId);
}

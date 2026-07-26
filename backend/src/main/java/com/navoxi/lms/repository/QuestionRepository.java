package com.navoxi.lms.repository;

import com.navoxi.lms.domain.entity.Question;
import com.navoxi.lms.domain.enums.UnitId;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface QuestionRepository extends JpaRepository<Question, String> {
  List<Question> findByUnitId(UnitId unitId);

  @Query(
      "select q from Question q where lower(q.text) like lower(:pattern) order by q.updatedAt desc")
  List<Question> searchByText(@Param("pattern") String pattern, Pageable pageable);

  @Query(
      "select q from Question q where q.unitId = :unitId and lower(q.text) like lower(:pattern)"
          + " order by q.updatedAt desc")
  List<Question> searchByUnitAndText(
      @Param("unitId") UnitId unitId, @Param("pattern") String pattern, Pageable pageable);
}

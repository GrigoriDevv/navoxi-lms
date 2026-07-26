package com.navoxi.lms.repository;

import com.navoxi.lms.domain.entity.Course;
import com.navoxi.lms.domain.enums.UnitId;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CourseRepository extends JpaRepository<Course, String> {
  List<Course> findByUnitId(UnitId unitId);

  @Query(
      "select c from Course c where lower(c.title) like lower(:pattern) order by c.title")
  List<Course> searchByTitle(@Param("pattern") String pattern, Pageable pageable);

  @Query(
      "select c from Course c where c.unitId = :unitId and lower(c.title) like lower(:pattern)"
          + " order by c.title")
  List<Course> searchByUnitAndTitle(
      @Param("unitId") UnitId unitId, @Param("pattern") String pattern, Pageable pageable);
}

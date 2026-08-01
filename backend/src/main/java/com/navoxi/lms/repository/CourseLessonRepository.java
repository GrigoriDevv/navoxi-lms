package com.navoxi.lms.repository;

import com.navoxi.lms.domain.entity.CourseLesson;
import com.navoxi.lms.domain.enums.UnitId;
import java.util.Collection;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CourseLessonRepository extends JpaRepository<CourseLesson, String> {
  List<CourseLesson> findByCourseIdOrderBySortOrderAsc(String courseId);

  List<CourseLesson> findByCourseIdIn(Collection<String> courseIds);

  void deleteByCourseId(String courseId);

  long countByCourseId(String courseId);

  @Query(
      "select l from CourseLesson l join fetch l.course c"
          + " where lower(l.title) like lower(:pattern) order by l.title")
  List<CourseLesson> searchByTitle(@Param("pattern") String pattern, Pageable pageable);

  @Query(
      "select l from CourseLesson l join fetch l.course c"
          + " where c.unitId = :unitId and lower(l.title) like lower(:pattern) order by l.title")
  List<CourseLesson> searchByUnitAndTitle(
      @Param("unitId") UnitId unitId, @Param("pattern") String pattern, Pageable pageable);
}

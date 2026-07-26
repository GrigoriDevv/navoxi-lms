package com.navoxi.lms.repository;

import com.navoxi.lms.domain.entity.CourseLesson;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseLessonRepository extends JpaRepository<CourseLesson, String> {
  List<CourseLesson> findByCourseIdOrderBySortOrderAsc(String courseId);

  List<CourseLesson> findByCourseIdIn(Collection<String> courseIds);

  void deleteByCourseId(String courseId);

  long countByCourseId(String courseId);
}

package com.navoxi.lms.repository;

import com.navoxi.lms.domain.entity.CourseLesson;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseLessonRepository extends JpaRepository<CourseLesson, String> {
  List<CourseLesson> findByCourseIdOrderBySortOrderAsc(String courseId);

  void deleteByCourseId(String courseId);

  long countByCourseId(String courseId);
}

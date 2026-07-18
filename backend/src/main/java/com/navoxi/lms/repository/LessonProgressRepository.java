package com.navoxi.lms.repository;

import com.navoxi.lms.domain.entity.LessonProgress;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LessonProgressRepository extends JpaRepository<LessonProgress, String> {
  Optional<LessonProgress> findByUserIdAndLessonId(String userId, String lessonId);

  List<LessonProgress> findByUserId(String userId);

  @Query(
      "select count(p) from LessonProgress p where p.user.id = :userId and p.lesson.course.id = :courseId")
  long countByUserAndCourse(@Param("userId") String userId, @Param("courseId") String courseId);

  void deleteByLessonId(String lessonId);

  void deleteByLesson_Course_Id(String courseId);
}

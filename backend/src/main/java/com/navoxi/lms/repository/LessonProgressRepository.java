package com.navoxi.lms.repository;

import com.navoxi.lms.domain.entity.LessonProgress;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LessonProgressRepository extends JpaRepository<LessonProgress, String> {
  Optional<LessonProgress> findByUserIdAndLessonId(String userId, String lessonId);

  List<LessonProgress> findByUserId(String userId);

  void deleteByLessonId(String lessonId);

  void deleteByLesson_Course_Id(String courseId);
}

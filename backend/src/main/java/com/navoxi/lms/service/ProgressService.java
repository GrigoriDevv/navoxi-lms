package com.navoxi.lms.service;

import com.navoxi.lms.domain.entity.CourseLesson;
import com.navoxi.lms.domain.entity.LessonProgress;
import com.navoxi.lms.domain.entity.UserAccount;
import com.navoxi.lms.repository.CourseLessonRepository;
import com.navoxi.lms.repository.LessonProgressRepository;
import com.navoxi.lms.web.ApiExceptionHandler.NotFoundException;
import com.navoxi.lms.web.dto.LessonProgressDto;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProgressService {

  private static final DateTimeFormatter FMT =
      DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

  private final CourseLessonRepository lessons;
  private final LessonProgressRepository progress;

  public ProgressService(CourseLessonRepository lessons, LessonProgressRepository progress) {
    this.lessons = lessons;
    this.progress = progress;
  }

  @Transactional(readOnly = true)
  public List<LessonProgressDto> listForUser(String userId) {
    return progress.findByUserId(userId).stream().map(CourseMapper::toDto).toList();
  }

  @Transactional
  public LessonProgressDto complete(UserAccount user, String lessonId) {
    CourseLesson lesson =
        lessons.findById(lessonId).orElseThrow(() -> new NotFoundException("Aula não encontrada"));

    return progress
        .findByUserIdAndLessonId(user.getId(), lessonId)
        .map(CourseMapper::toDto)
        .orElseGet(
            () -> {
              LessonProgress p = new LessonProgress();
              p.setUser(user);
              p.setLesson(lesson);
              p.setCompletedAt(LocalDateTime.now().format(FMT));
              return CourseMapper.toDto(progress.save(p));
            });
  }
}

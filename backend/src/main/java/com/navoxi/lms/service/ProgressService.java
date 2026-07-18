package com.navoxi.lms.service;

import com.navoxi.lms.domain.entity.CourseLesson;
import com.navoxi.lms.domain.entity.Enrollment;
import com.navoxi.lms.domain.entity.LessonProgress;
import com.navoxi.lms.domain.entity.UserAccount;
import com.navoxi.lms.domain.enums.EnrollmentStatus;
import com.navoxi.lms.domain.enums.NotificationType;
import com.navoxi.lms.repository.CourseLessonRepository;
import com.navoxi.lms.repository.EnrollmentRepository;
import com.navoxi.lms.repository.LessonProgressRepository;
import com.navoxi.lms.web.ApiExceptionHandler.ForbiddenException;
import com.navoxi.lms.web.ApiExceptionHandler.NotFoundException;
import com.navoxi.lms.web.dto.LessonProgressDto;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProgressService {

  private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

  private final CourseLessonRepository lessons;
  private final LessonProgressRepository progress;
  private final EnrollmentRepository enrollments;
  private final EnrollmentService enrollmentService;
  private final NotificationService notifications;

  public ProgressService(
      CourseLessonRepository lessons,
      LessonProgressRepository progress,
      EnrollmentRepository enrollments,
      EnrollmentService enrollmentService,
      NotificationService notifications) {
    this.lessons = lessons;
    this.progress = progress;
    this.enrollments = enrollments;
    this.enrollmentService = enrollmentService;
    this.notifications = notifications;
  }

  @Transactional(readOnly = true)
  public List<LessonProgressDto> listForUser(String userId) {
    return progress.findByUserId(userId).stream().map(CourseMapper::toDto).toList();
  }

  @Transactional
  public LessonProgressDto complete(UserAccount user, String lessonId) {
    CourseLesson lesson =
        lessons.findById(lessonId).orElseThrow(() -> new NotFoundException("Aula não encontrada"));

    String courseId = lesson.getCourse().getId();
    Enrollment enrollment =
        enrollments
            .findByUserIdAndCourseIdAndStatus(user.getId(), courseId, EnrollmentStatus.ativa)
            .or(() ->
                enrollments.findByUserIdAndCourseIdAndStatus(
                    user.getId(), courseId, EnrollmentStatus.concluida))
            .orElseThrow(
                () ->
                    new ForbiddenException(
                        "Matrícula ativa no curso é obrigatória para concluir a aula"));

    LessonProgressDto existing =
        progress
            .findByUserIdAndLessonId(user.getId(), lessonId)
            .map(CourseMapper::toDto)
            .orElse(null);
    if (existing != null) {
      return existing;
    }

    LessonProgress p = new LessonProgress();
    p.setUser(user);
    p.setLesson(lesson);
    p.setCompletedAt(LocalDateTime.now().format(FMT));
    LessonProgressDto saved = CourseMapper.toDto(progress.save(p));

    long total = lessons.countByCourseId(courseId);
    long done = progress.countByUserAndCourse(user.getId(), courseId);
    int percent = total == 0 ? 0 : (int) Math.round((done * 100.0) / total);
    boolean wasComplete = enrollment.getStatus() == EnrollmentStatus.concluida;
    enrollmentService.updateProgress(enrollment, percent);

    if (!wasComplete && percent >= 100) {
      notifications.notify(
          user,
          "Curso concluído",
          "Parabéns! Você concluiu \"" + lesson.getCourse().getTitle() + "\".",
          NotificationType.curso,
          "/aprendizagem/cursos/" + courseId,
          "Aprendizagem",
          "Progresso: 100%");
    }

    return saved;
  }
}

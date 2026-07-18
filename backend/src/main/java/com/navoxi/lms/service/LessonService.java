package com.navoxi.lms.service;

import com.navoxi.lms.domain.entity.Course;
import com.navoxi.lms.domain.entity.CourseLesson;
import com.navoxi.lms.domain.entity.CourseModule;
import com.navoxi.lms.domain.entity.Enrollment;
import com.navoxi.lms.domain.enums.EnrollmentStatus;
import com.navoxi.lms.domain.enums.NotificationType;
import com.navoxi.lms.repository.CourseLessonRepository;
import com.navoxi.lms.repository.CourseModuleRepository;
import com.navoxi.lms.repository.EnrollmentRepository;
import com.navoxi.lms.repository.LessonProgressRepository;
import com.navoxi.lms.web.ApiExceptionHandler.BadRequestException;
import com.navoxi.lms.web.ApiExceptionHandler.NotFoundException;
import com.navoxi.lms.web.dto.LessonDto;
import com.navoxi.lms.web.dto.LessonRequest;
import com.navoxi.lms.web.dto.LessonUpdateRequest;
import com.navoxi.lms.web.dto.ModuleDto;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LessonService {

  private final CourseService courseService;
  private final CourseModuleRepository modules;
  private final CourseLessonRepository lessons;
  private final LessonProgressRepository progress;
  private final EnrollmentRepository enrollments;
  private final NotificationService notifications;

  public LessonService(
      CourseService courseService,
      CourseModuleRepository modules,
      CourseLessonRepository lessons,
      LessonProgressRepository progress,
      EnrollmentRepository enrollments,
      NotificationService notifications) {
    this.courseService = courseService;
    this.modules = modules;
    this.lessons = lessons;
    this.progress = progress;
    this.enrollments = enrollments;
    this.notifications = notifications;
  }

  @Transactional(readOnly = true)
  public List<ModuleDto> listModules(String courseId) {
    courseService.require(courseId);
    return modules.findByCourseIdOrderBySortOrderAsc(courseId).stream()
        .map(CourseMapper::toDto)
        .toList();
  }

  @Transactional(readOnly = true)
  public List<LessonDto> listLessons(String courseId) {
    courseService.require(courseId);
    return lessons.findByCourseIdOrderBySortOrderAsc(courseId).stream()
        .map(CourseMapper::toDto)
        .toList();
  }

  @Transactional
  public LessonDto publish(String courseId, LessonRequest req) {
    if ((req.youtubeVideoId() == null || req.youtubeVideoId().isBlank())
        && (req.videoUrl() == null || req.videoUrl().isBlank())) {
      throw new BadRequestException("Informe youtubeVideoId ou videoUrl");
    }

    Course course = courseService.require(courseId);
    CourseModule module = resolveModule(course, req.moduleId(), req.moduleTitle());

    int nextOrder =
        lessons.findByCourseIdOrderBySortOrderAsc(courseId).stream()
                .mapToInt(CourseLesson::getSortOrder)
                .max()
                .orElse(0)
            + 1;

    CourseLesson lesson = new CourseLesson();
    lesson.setCourse(course);
    lesson.setModule(module);
    lesson.setSortOrder(nextOrder);
    lesson.setTitle(req.title().trim());
    lesson.setYoutubeVideoId(blankToNull(req.youtubeVideoId()));
    lesson.setVideoUrl(blankToNull(req.videoUrl()));
    lesson.setDurationSec(req.durationSec());
    CourseLesson saved = lessons.save(lesson);

    for (Enrollment enrollment :
        enrollments.findByCourseIdAndStatus(courseId, EnrollmentStatus.ativa)) {
      notifications.notify(
          enrollment.getUser(),
          "Nova aula disponível",
          "Nova aula publicada em \"" + course.getTitle() + "\".",
          NotificationType.curso,
          "/aprendizagem/cursos/" + courseId + "?aula=" + saved.getId(),
          "Aprendizagem",
          "Aula: " + saved.getTitle());
    }

    return CourseMapper.toDto(saved);
  }

  @Transactional
  public LessonDto update(String lessonId, LessonUpdateRequest req) {
    CourseLesson lesson =
        lessons.findById(lessonId).orElseThrow(() -> new NotFoundException("Aula não encontrada"));

    if (req.title() != null && !req.title().isBlank()) {
      lesson.setTitle(req.title().trim());
    }
    if (req.moduleId() != null && !req.moduleId().isBlank()) {
      CourseModule module =
          modules
              .findById(req.moduleId())
              .orElseThrow(() -> new NotFoundException("Módulo não encontrado"));
      if (!module.getCourse().getId().equals(lesson.getCourse().getId())) {
        throw new BadRequestException("Módulo não pertence ao curso da aula");
      }
      lesson.setModule(module);
    }
    if (req.order() != null) {
      lesson.setSortOrder(req.order());
    }
    if (req.youtubeVideoId() != null) {
      lesson.setYoutubeVideoId(blankToNull(req.youtubeVideoId()));
      if (lesson.getYoutubeVideoId() != null) {
        lesson.setVideoUrl(null);
      }
    }
    if (req.videoUrl() != null) {
      lesson.setVideoUrl(blankToNull(req.videoUrl()));
      if (lesson.getVideoUrl() != null) {
        lesson.setYoutubeVideoId(null);
      }
    }
    return CourseMapper.toDto(lessons.save(lesson));
  }

  @Transactional
  public void delete(String lessonId) {
    if (!lessons.existsById(lessonId)) {
      throw new NotFoundException("Aula não encontrada");
    }
    progress.deleteByLessonId(lessonId);
    lessons.deleteById(lessonId);
  }

  @Transactional
  public void deleteAllForCourse(String courseId) {
    courseService.require(courseId);
    progress.deleteByLesson_Course_Id(courseId);
    lessons.deleteByCourseId(courseId);
  }

  private CourseModule resolveModule(Course course, String moduleId, String moduleTitle) {
    if (moduleId != null && !moduleId.isBlank()) {
      CourseModule existing =
          modules
              .findById(moduleId)
              .orElseThrow(() -> new NotFoundException("Módulo não encontrado"));
      if (!existing.getCourse().getId().equals(course.getId())) {
        throw new BadRequestException("Módulo não pertence ao curso");
      }
      return existing;
    }

    int next =
        modules.findByCourseIdOrderBySortOrderAsc(course.getId()).stream()
                .mapToInt(CourseModule::getSortOrder)
                .max()
                .orElse(0)
            + 1;
    CourseModule created = new CourseModule();
    created.setCourse(course);
    created.setTitle(
        moduleTitle != null && !moduleTitle.isBlank() ? moduleTitle.trim() : "Módulo");
    created.setSortOrder(next);
    return modules.save(created);
  }

  private static String blankToNull(String value) {
    if (value == null || value.isBlank()) {
      return null;
    }
    return value.trim();
  }
}

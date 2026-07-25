package com.navoxi.lms.service;

import com.navoxi.lms.config.S3Properties;
import com.navoxi.lms.domain.entity.Course;
import com.navoxi.lms.domain.entity.CourseLesson;
import com.navoxi.lms.domain.entity.CourseModule;
import com.navoxi.lms.domain.entity.Enrollment;
import com.navoxi.lms.domain.entity.UserAccount;
import com.navoxi.lms.domain.enums.EnrollmentStatus;
import com.navoxi.lms.domain.enums.NotificationType;
import com.navoxi.lms.repository.CourseLessonRepository;
import com.navoxi.lms.repository.CourseModuleRepository;
import com.navoxi.lms.repository.EnrollmentRepository;
import com.navoxi.lms.repository.LessonProgressRepository;
import com.navoxi.lms.security.UnitScope;
import com.navoxi.lms.web.ApiExceptionHandler.BadRequestException;
import com.navoxi.lms.web.ApiExceptionHandler.NotFoundException;
import com.navoxi.lms.web.dto.LessonDto;
import com.navoxi.lms.web.dto.LessonRequest;
import com.navoxi.lms.web.dto.LessonUpdateRequest;
import com.navoxi.lms.web.dto.ModuleDto;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Arrays;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
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
  private final Set<String> videoUrlAllowedHosts;

  public LessonService(
      CourseService courseService,
      CourseModuleRepository modules,
      CourseLessonRepository lessons,
      LessonProgressRepository progress,
      EnrollmentRepository enrollments,
      NotificationService notifications,
      S3Properties s3Properties,
      @Value("${lms.media.video-url-allowed-hosts:}") String videoUrlAllowedHostsCsv) {
    this.courseService = courseService;
    this.modules = modules;
    this.lessons = lessons;
    this.progress = progress;
    this.enrollments = enrollments;
    this.notifications = notifications;
    this.videoUrlAllowedHosts =
        buildAllowedHosts(videoUrlAllowedHostsCsv, s3Properties.getPublicBaseUrl());
  }

  @Transactional(readOnly = true)
  public List<ModuleDto> listModules(UserAccount actor, String courseId) {
    courseService.requireAccessible(actor, courseId);
    return modules.findByCourseIdOrderBySortOrderAsc(courseId).stream()
        .map(CourseMapper::toDto)
        .toList();
  }

  @Transactional(readOnly = true)
  public List<LessonDto> listLessons(UserAccount actor, String courseId) {
    courseService.requireAccessible(actor, courseId);
    return lessons.findByCourseIdOrderBySortOrderAsc(courseId).stream()
        .map(CourseMapper::toDto)
        .toList();
  }

  @Transactional
  public LessonDto publish(UserAccount actor, String courseId, LessonRequest req) {
    if ((req.youtubeVideoId() == null || req.youtubeVideoId().isBlank())
        && (req.videoUrl() == null || req.videoUrl().isBlank())) {
      throw new BadRequestException("Informe youtubeVideoId ou videoUrl");
    }

    String videoUrl = normalizeVideoUrl(req.videoUrl(), videoUrlAllowedHosts);

    Course course = courseService.requireAccessible(actor, courseId);
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
    lesson.setVideoUrl(videoUrl);
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
  public LessonDto update(UserAccount actor, String lessonId, LessonUpdateRequest req) {
    CourseLesson lesson =
        lessons.findById(lessonId).orElseThrow(() -> new NotFoundException("Aula não encontrada"));
    UnitScope.assertCanAccessCourse(actor, lesson.getCourse());

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
      lesson.setVideoUrl(normalizeVideoUrl(req.videoUrl(), videoUrlAllowedHosts));
      if (lesson.getVideoUrl() != null) {
        lesson.setYoutubeVideoId(null);
      }
    }
    return CourseMapper.toDto(lessons.save(lesson));
  }

  @Transactional
  public void delete(UserAccount actor, String lessonId) {
    CourseLesson lesson =
        lessons.findById(lessonId).orElseThrow(() -> new NotFoundException("Aula não encontrada"));
    UnitScope.assertCanAccessCourse(actor, lesson.getCourse());
    progress.deleteByLessonId(lessonId);
    lessons.deleteById(lessonId);
  }

  @Transactional
  public void deleteAllForCourse(UserAccount actor, String courseId) {
    courseService.requireAccessible(actor, courseId);
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

  static Set<String> buildAllowedHosts(String csv, String publicBaseUrl) {
    LinkedHashSet<String> hosts = new LinkedHashSet<>();
    if (csv != null && !csv.isBlank()) {
      Arrays.stream(csv.split(","))
          .map(String::trim)
          .filter(s -> !s.isEmpty())
          .map(s -> s.toLowerCase(Locale.ROOT))
          .forEach(hosts::add);
    }
    if (publicBaseUrl != null && !publicBaseUrl.isBlank()) {
      try {
        URI base = new URI(publicBaseUrl.trim());
        if (base.getHost() != null && !base.getHost().isBlank()) {
          hosts.add(base.getHost().toLowerCase(Locale.ROOT));
        }
      } catch (URISyntaxException ignored) {
        // ignore malformed public base; S3 config is validated elsewhere
      }
    }
    return Set.copyOf(hosts);
  }

  /**
   * Rejects dangerous schemes and optional host allowlist. Only http(s) URLs are stored.
   * Empty {@code allowedHosts} = any http(s) host (local/demo).
   */
  static String normalizeVideoUrl(String value) {
    return normalizeVideoUrl(value, Set.of());
  }

  static String normalizeVideoUrl(String value, Collection<String> allowedHosts) {
    String trimmed = blankToNull(value);
    if (trimmed == null) {
      return null;
    }

    URI uri;
    try {
      uri = new URI(trimmed);
    } catch (URISyntaxException ex) {
      throw new BadRequestException("videoUrl inválida");
    }

    String scheme = uri.getScheme() == null ? "" : uri.getScheme().toLowerCase(Locale.ROOT);
    if ("data".equals(scheme) || "blob".equals(scheme)) {
      throw new BadRequestException(
          "videoUrl não pode ser data URL ou blob. Faça upload via /api/v1/media/videos.");
    }
    if (!"http".equals(scheme) && !"https".equals(scheme)) {
      throw new BadRequestException("videoUrl deve ser uma URL http(s)");
    }
    if (uri.getRawUserInfo() != null) {
      throw new BadRequestException("videoUrl não pode conter credenciais");
    }
    String host = uri.getHost();
    if (host == null || host.isBlank()) {
      throw new BadRequestException("videoUrl deve ter um host válido");
    }

    if (allowedHosts != null && !allowedHosts.isEmpty()) {
      String normalizedHost = host.toLowerCase(Locale.ROOT);
      Set<String> allowed =
          allowedHosts.stream()
              .filter(h -> h != null && !h.isBlank())
              .map(h -> h.toLowerCase(Locale.ROOT))
              .collect(Collectors.toSet());
      if (!allowed.contains(normalizedHost)) {
        throw new BadRequestException("videoUrl host não permitido");
      }
    }

    return trimmed;
  }
}

package com.navoxi.lms.web;

import com.navoxi.lms.domain.entity.Course;
import com.navoxi.lms.domain.entity.Enrollment;
import com.navoxi.lms.domain.entity.UserAccount;
import com.navoxi.lms.domain.enums.EnrollmentStatus;
import com.navoxi.lms.domain.enums.NotificationType;
import com.navoxi.lms.repository.CourseRepository;
import com.navoxi.lms.repository.EnrollmentRepository;
import com.navoxi.lms.service.CourseMapper;
import com.navoxi.lms.service.EnrollmentService;
import com.navoxi.lms.service.NotificationService;
import com.navoxi.lms.web.ApiExceptionHandler.BadRequestException;
import com.navoxi.lms.web.ApiExceptionHandler.NotFoundException;
import com.navoxi.lms.web.dto.EnrollmentCreateRequest;
import com.navoxi.lms.web.dto.EnrollmentDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/enrollments")
public class EnrollmentController {

  private final CurrentUserResolver currentUser;
  private final CourseRepository courses;
  private final EnrollmentRepository enrollments;
  private final EnrollmentService enrollmentService;
  private final NotificationService notifications;

  public EnrollmentController(
      CurrentUserResolver currentUser,
      CourseRepository courses,
      EnrollmentRepository enrollments,
      EnrollmentService enrollmentService,
      NotificationService notifications) {
    this.currentUser = currentUser;
    this.courses = courses;
    this.enrollments = enrollments;
    this.enrollmentService = enrollmentService;
    this.notifications = notifications;
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public EnrollmentDto enroll(@Valid @RequestBody EnrollmentCreateRequest body) {
    UserAccount user = currentUser.require();
    Course course =
        courses
            .findById(body.courseId())
            .orElseThrow(() -> new NotFoundException("Curso não encontrado"));
    if (enrollments.existsByUserIdAndCourseIdAndStatus(
        user.getId(), course.getId(), EnrollmentStatus.ativa)) {
      throw new BadRequestException("Já existe matrícula ativa neste curso");
    }
    Enrollment saved =
        enrollmentService.createActive(user, course, body.turmaId(), body.turmaName());
    notifications.notify(
        user,
        "Inscrição confirmada",
        "Você foi matriculado em \"" + course.getTitle() + "\".",
        NotificationType.curso,
        "/aprendizagem/catalogo?tab=inscricoes",
        "Aprendizagem",
        null);
    return CourseMapper.toDto(saved);
  }
}

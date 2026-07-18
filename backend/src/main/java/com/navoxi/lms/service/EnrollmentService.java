package com.navoxi.lms.service;

import com.navoxi.lms.domain.entity.Course;
import com.navoxi.lms.domain.entity.Enrollment;
import com.navoxi.lms.domain.entity.UserAccount;
import com.navoxi.lms.domain.enums.EnrollmentStatus;
import com.navoxi.lms.repository.CourseRepository;
import com.navoxi.lms.repository.EnrollmentRepository;
import com.navoxi.lms.web.dto.EnrollmentDto;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EnrollmentService {

  private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

  private final EnrollmentRepository enrollments;
  private final CourseRepository courses;

  public EnrollmentService(EnrollmentRepository enrollments, CourseRepository courses) {
    this.enrollments = enrollments;
    this.courses = courses;
  }

  @Transactional(readOnly = true)
  public List<EnrollmentDto> listForUser(UserAccount user) {
    return enrollments.findByUserId(user.getId()).stream().map(CourseMapper::toDto).toList();
  }

  @Transactional
  public Enrollment createActive(
      UserAccount user, Course course, String turmaId, String turmaName) {
    return enrollments
        .findByUserIdAndCourseIdAndStatus(user.getId(), course.getId(), EnrollmentStatus.ativa)
        .orElseGet(
            () -> {
              Enrollment e = new Enrollment();
              e.setUser(user);
              e.setCourse(course);
              e.setUserName(user.getName());
              e.setCourseTitle(course.getTitle());
              e.setTurmaId(blankToNull(turmaId));
              e.setTurmaName(blankToNull(turmaName));
              e.setUnitId(user.getUnitId());
              e.setEnrolledAt(LocalDateTime.now().format(FMT));
              e.setProgress(0);
              e.setStatus(EnrollmentStatus.ativa);
              Enrollment saved = enrollments.save(e);
              course.setEnrolled(course.getEnrolled() + 1);
              courses.save(course);
              return saved;
            });
  }

  @Transactional
  public void updateProgress(Enrollment enrollment, int percent) {
    enrollment.setProgress(Math.max(0, Math.min(100, percent)));
    if (percent >= 100) {
      enrollment.setStatus(EnrollmentStatus.concluida);
    }
    enrollments.save(enrollment);
  }

  private static String blankToNull(String value) {
    return value == null || value.isBlank() ? null : value.trim();
  }
}

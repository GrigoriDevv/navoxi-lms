package com.navoxi.lms.service;

import com.navoxi.lms.domain.entity.Enrollment;
import com.navoxi.lms.domain.entity.EnrollmentRequest;
import com.navoxi.lms.repository.EnrollmentRepository;
import com.navoxi.lms.repository.EnrollmentRequestRepository;
import org.springframework.stereotype.Service;

/**
 * Keeps denormalized {@code user_name} / {@code course_title} on enrollments and requests in sync
 * when the source user or course is renamed.
 */
@Service
public class DenormalizedLabelSync {

  private final EnrollmentRepository enrollments;
  private final EnrollmentRequestRepository enrollmentRequests;

  public DenormalizedLabelSync(
      EnrollmentRepository enrollments, EnrollmentRequestRepository enrollmentRequests) {
    this.enrollments = enrollments;
    this.enrollmentRequests = enrollmentRequests;
  }

  public void syncUserName(String userId, String name) {
    for (Enrollment e : enrollments.findByUserId(userId)) {
      e.setUserName(name);
    }
    for (EnrollmentRequest r : enrollmentRequests.findByUserIdOrderByRequestedAtDesc(userId)) {
      r.setUserName(name);
    }
  }

  public void syncCourseTitle(String courseId, String title) {
    for (Enrollment e : enrollments.findByCourseId(courseId)) {
      e.setCourseTitle(title);
    }
    for (EnrollmentRequest r : enrollmentRequests.findByCourseId(courseId)) {
      r.setCourseTitle(title);
    }
  }
}

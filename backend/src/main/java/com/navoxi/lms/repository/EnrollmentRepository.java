package com.navoxi.lms.repository;

import com.navoxi.lms.domain.entity.Enrollment;
import com.navoxi.lms.domain.enums.EnrollmentStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EnrollmentRepository extends JpaRepository<Enrollment, String> {
  List<Enrollment> findByUserId(String userId);

  List<Enrollment> findByUserIdAndStatus(String userId, EnrollmentStatus status);

  List<Enrollment> findByCourseIdAndStatus(String courseId, EnrollmentStatus status);

  boolean existsByUserIdAndCourseIdAndStatus(
      String userId, String courseId, EnrollmentStatus status);
}

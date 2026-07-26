package com.navoxi.lms.repository;

import com.navoxi.lms.domain.entity.Enrollment;
import com.navoxi.lms.domain.enums.EnrollmentStatus;
import com.navoxi.lms.domain.enums.UnitId;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EnrollmentRepository extends JpaRepository<Enrollment, String> {
  List<Enrollment> findByUserId(String userId);

  List<Enrollment> findByStatusNot(EnrollmentStatus status);

  List<Enrollment> findByUnitIdAndStatusNot(UnitId unitId, EnrollmentStatus status);

  List<Enrollment> findByUserIdAndStatus(String userId, EnrollmentStatus status);

  List<Enrollment> findByCourseIdAndStatus(String courseId, EnrollmentStatus status);

  List<Enrollment> findByCourseId(String courseId);

  boolean existsByUserIdAndCourseIdAndStatus(
      String userId, String courseId, EnrollmentStatus status);

  Optional<Enrollment> findByUserIdAndCourseIdAndStatus(
      String userId, String courseId, EnrollmentStatus status);
}

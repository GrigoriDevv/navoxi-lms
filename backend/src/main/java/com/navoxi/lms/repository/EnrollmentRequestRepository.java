package com.navoxi.lms.repository;

import com.navoxi.lms.domain.entity.EnrollmentRequest;
import com.navoxi.lms.domain.enums.EnrollmentRequestStatus;
import com.navoxi.lms.domain.enums.UnitId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EnrollmentRequestRepository extends JpaRepository<EnrollmentRequest, String> {
  List<EnrollmentRequest> findByUserIdOrderByRequestedAtDesc(String userId);

  List<EnrollmentRequest> findAllByOrderByRequestedAtDesc();

  List<EnrollmentRequest> findByUnitIdOrderByRequestedAtDesc(UnitId unitId);

  List<EnrollmentRequest> findByCourseId(String courseId);

  boolean existsByUserIdAndCourseIdAndStatus(
      String userId, String courseId, EnrollmentRequestStatus status);
}

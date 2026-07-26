package com.navoxi.lms.repository;

import com.navoxi.lms.domain.entity.Certificate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CertificateRepository extends JpaRepository<Certificate, String> {
  List<Certificate> findByUserIdOrderByIssuedAtDesc(String userId);

  Optional<Certificate> findByUserIdAndCourseId(String userId, String courseId);

  Optional<Certificate> findByValidationHash(String validationHash);

  boolean existsByUserIdAndCourseId(String userId, String courseId);
}

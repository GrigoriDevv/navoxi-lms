package com.navoxi.lms.service;

import com.navoxi.lms.domain.entity.UserAccount;
import com.navoxi.lms.repository.EnrollmentRepository;
import com.navoxi.lms.web.dto.EnrollmentDto;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EnrollmentService {

  private final EnrollmentRepository enrollments;

  public EnrollmentService(EnrollmentRepository enrollments) {
    this.enrollments = enrollments;
  }

  @Transactional(readOnly = true)
  public List<EnrollmentDto> listForUser(UserAccount user) {
    return enrollments.findByUserId(user.getId()).stream().map(CourseMapper::toDto).toList();
  }
}

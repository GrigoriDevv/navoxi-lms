package com.navoxi.lms.web.dto;

import com.navoxi.lms.domain.enums.EnrollmentRequestStatus;
import com.navoxi.lms.domain.enums.UnitId;

public record EnrollmentRequestDto(
    String id,
    String userId,
    String userName,
    String courseId,
    String courseTitle,
    String turmaId,
    String turmaName,
    UnitId unitId,
    String requestedAt,
    EnrollmentRequestStatus status,
    String reviewer) {}

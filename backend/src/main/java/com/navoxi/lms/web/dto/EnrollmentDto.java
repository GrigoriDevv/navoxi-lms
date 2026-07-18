package com.navoxi.lms.web.dto;

import com.navoxi.lms.domain.enums.EnrollmentStatus;
import com.navoxi.lms.domain.enums.UnitId;

public record EnrollmentDto(
    String id,
    String userId,
    String userName,
    String courseId,
    String courseTitle,
    String turmaId,
    String turmaName,
    UnitId unitId,
    String enrolledAt,
    Integer progress,
    EnrollmentStatus status) {}

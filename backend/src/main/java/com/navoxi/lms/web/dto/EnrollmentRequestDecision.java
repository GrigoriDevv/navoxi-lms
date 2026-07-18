package com.navoxi.lms.web.dto;

import com.navoxi.lms.domain.enums.EnrollmentRequestStatus;
import jakarta.validation.constraints.NotNull;

public record EnrollmentRequestDecision(@NotNull EnrollmentRequestStatus status) {}

package com.navoxi.lms.web.dto;

import jakarta.validation.constraints.NotBlank;

public record EnrollmentRequestCreate(
    @NotBlank String courseId, String turmaId, String turmaName) {}

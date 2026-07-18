package com.navoxi.lms.web.dto;

import com.navoxi.lms.domain.enums.CourseModality;
import com.navoxi.lms.domain.enums.CourseStatus;
import com.navoxi.lms.domain.enums.UnitId;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CourseRequest(
    @NotBlank String title,
    @NotBlank String category,
    @NotBlank String instructor,
    @NotNull UnitId unitId,
    @NotNull CourseModality modality,
    @NotBlank String audience,
    @NotNull @Min(1) Integer workload,
    @NotNull CourseStatus status,
    String cover) {}

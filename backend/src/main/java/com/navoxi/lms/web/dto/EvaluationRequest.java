package com.navoxi.lms.web.dto;

import com.navoxi.lms.domain.enums.EvaluationStatus;
import com.navoxi.lms.domain.enums.UnitId;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record EvaluationRequest(
    @NotBlank String name,
    @NotBlank String courseId,
    String turmaId,
    @NotNull UnitId unitId,
    @NotNull List<String> questionIds,
    @NotNull EvaluationStatus status,
    @NotBlank String dueDate) {}

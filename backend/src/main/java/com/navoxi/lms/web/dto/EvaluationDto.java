package com.navoxi.lms.web.dto;

import com.navoxi.lms.domain.enums.EvaluationStatus;
import com.navoxi.lms.domain.enums.UnitId;
import java.util.List;

public record EvaluationDto(
    String id,
    String name,
    String courseId,
    String turmaId,
    UnitId unitId,
    List<String> questionIds,
    Integer questionCount,
    EvaluationStatus status,
    String dueDate,
    String appliedAt,
    Double passingScorePct) {}

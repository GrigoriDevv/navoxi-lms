package com.navoxi.lms.web.dto;

import com.navoxi.lms.domain.enums.UnitId;

/** Linha agregada de conclusão por curso/turma (matrículas canceladas fora da base). */
public record CourseCompletionRowDto(
    String courseId,
    String courseTitle,
    String turmaId,
    String turmaName,
    UnitId unitId,
    int enrolled,
    int completed,
    int inProgress,
    int notStarted,
    int avgProgressPct,
    int completionRatePct) {}

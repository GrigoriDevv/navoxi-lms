package com.navoxi.lms.web.dto;

import com.navoxi.lms.domain.enums.UnitId;
import java.util.List;

/** Pendências de um aluno em uma matrícula: aulas não concluídas e avaliações sem correção. */
public record StudentPendingRowDto(
    String userId,
    String userName,
    String userEmail,
    String courseId,
    String courseTitle,
    String turmaId,
    String turmaName,
    UnitId unitId,
    int progressPct,
    int lessonsTotal,
    int lessonsCompleted,
    int lessonsPending,
    List<String> pendingLessonTitles,
    int evaluationsTotal,
    int evaluationsPending,
    List<PendingEvaluationDto> pendingEvaluations) {}

package com.navoxi.lms.web.dto;

import com.navoxi.lms.domain.enums.AttemptStatus;
import java.util.List;

public record AttemptDto(
    String id,
    String evaluationId,
    String userId,
    String userName,
    int attemptNumber,
    AttemptStatus status,
    String startedAt,
    String submittedAt,
    Double scorePct,
    List<AttemptAnswerDto> answers) {}

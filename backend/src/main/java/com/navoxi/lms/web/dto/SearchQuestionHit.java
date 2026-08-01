package com.navoxi.lms.web.dto;

import com.navoxi.lms.domain.enums.QuestionType;
import com.navoxi.lms.domain.enums.UnitId;

public record SearchQuestionHit(
    String id, String text, String category, QuestionType type, UnitId unitId, String href) {}

package com.navoxi.lms.web.dto;

import com.navoxi.lms.domain.enums.QuestionType;
import com.navoxi.lms.domain.enums.UnitId;
import java.util.List;

public record QuestionDto(
    String id,
    String text,
    QuestionType type,
    String category,
    UnitId unitId,
    Integer usageCount,
    List<String> options,
    String correctKey) {}

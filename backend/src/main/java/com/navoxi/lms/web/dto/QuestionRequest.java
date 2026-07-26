package com.navoxi.lms.web.dto;

import com.navoxi.lms.domain.enums.QuestionType;
import com.navoxi.lms.domain.enums.UnitId;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record QuestionRequest(
    @NotBlank String text,
    @NotNull QuestionType type,
    @NotBlank String category,
    @NotNull UnitId unitId,
    List<String> options,
    String correctKey) {}

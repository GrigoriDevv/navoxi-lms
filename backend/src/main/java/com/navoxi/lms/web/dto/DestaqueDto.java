package com.navoxi.lms.web.dto;

import com.navoxi.lms.domain.enums.UnitId;

public record DestaqueDto(
    String id,
    String title,
    String body,
    UnitId unitId,
    Boolean visible,
    Boolean pinned,
    String publishedAt,
    String expiresAt) {}

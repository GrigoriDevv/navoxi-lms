package com.navoxi.lms.web.dto;

import com.navoxi.lms.domain.enums.UnitId;

/** Request body for create/update. Null fields are omitted on PATCH (preserve existing). */
public record DestaqueRequest(
    String title,
    String body,
    UnitId unitId,
    Boolean visible,
    Boolean pinned,
    String publishedAt,
    String expiresAt) {}

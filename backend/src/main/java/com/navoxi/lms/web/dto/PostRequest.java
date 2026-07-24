package com.navoxi.lms.web.dto;

import com.navoxi.lms.domain.enums.PostStatus;
import com.navoxi.lms.domain.enums.UnitId;

/** Request body for create/update. Null fields are omitted on PATCH (preserve existing). */
public record PostRequest(
    String title,
    String body,
    String author,
    UnitId unitId,
    PostStatus status,
    String publishedAt) {}

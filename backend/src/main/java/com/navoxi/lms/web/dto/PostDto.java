package com.navoxi.lms.web.dto;

import com.navoxi.lms.domain.enums.PostStatus;
import com.navoxi.lms.domain.enums.UnitId;

public record PostDto(
    String id,
    String title,
    String body,
    String author,
    UnitId unitId,
    PostStatus status,
    String publishedAt) {}

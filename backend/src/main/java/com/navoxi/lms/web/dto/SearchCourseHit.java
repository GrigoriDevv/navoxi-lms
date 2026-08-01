package com.navoxi.lms.web.dto;

import com.navoxi.lms.domain.enums.UnitId;

public record SearchCourseHit(
    String id, String title, String category, UnitId unitId, String href) {}

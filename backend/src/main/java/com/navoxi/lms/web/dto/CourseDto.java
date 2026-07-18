package com.navoxi.lms.web.dto;

import com.navoxi.lms.domain.enums.CourseModality;
import com.navoxi.lms.domain.enums.CourseStatus;
import com.navoxi.lms.domain.enums.UnitId;

public record CourseDto(
    String id,
    String title,
    String category,
    String instructor,
    UnitId unitId,
    CourseModality modality,
    String audience,
    Integer workload,
    CourseStatus status,
    Integer enrolled,
    Integer completion,
    String cover) {}

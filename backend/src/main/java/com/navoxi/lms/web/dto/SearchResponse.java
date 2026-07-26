package com.navoxi.lms.web.dto;

import java.util.List;

public record SearchResponse(
    String query,
    List<SearchCourseHit> courses,
    List<SearchLessonHit> lessons,
    List<SearchQuestionHit> questions) {}

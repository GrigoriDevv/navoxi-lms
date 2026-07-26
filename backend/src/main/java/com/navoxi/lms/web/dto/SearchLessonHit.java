package com.navoxi.lms.web.dto;

public record SearchLessonHit(
    String id, String title, String courseId, String courseTitle, String href) {}

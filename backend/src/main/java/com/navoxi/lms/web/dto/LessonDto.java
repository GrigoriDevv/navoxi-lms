package com.navoxi.lms.web.dto;

public record LessonDto(
    String id,
    String courseId,
    String moduleId,
    Integer order,
    String title,
    String youtubeVideoId,
    String videoUrl,
    Integer durationSec) {}

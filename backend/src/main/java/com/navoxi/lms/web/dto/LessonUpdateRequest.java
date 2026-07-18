package com.navoxi.lms.web.dto;

public record LessonUpdateRequest(
    String title, String moduleId, String youtubeVideoId, String videoUrl, Integer order) {}

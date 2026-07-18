package com.navoxi.lms.web.dto;

import jakarta.validation.constraints.NotBlank;

public record LessonRequest(
    String moduleId,
    String moduleTitle,
    @NotBlank String title,
    String youtubeVideoId,
    String videoUrl,
    Integer durationSec) {}

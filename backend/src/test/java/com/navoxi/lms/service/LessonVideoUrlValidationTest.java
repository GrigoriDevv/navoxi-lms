package com.navoxi.lms.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.navoxi.lms.web.ApiExceptionHandler.BadRequestException;
import org.junit.jupiter.api.Test;

class LessonVideoUrlValidationTest {

  @Test
  void rejectsDataUrl() {
    assertThatThrownBy(() -> LessonService.normalizeVideoUrl("data:video/mp4;base64,AAAA"))
        .isInstanceOf(BadRequestException.class)
        .hasMessageContaining("data URL");
  }

  @Test
  void rejectsBlobUrl() {
    assertThatThrownBy(() -> LessonService.normalizeVideoUrl("blob:http://localhost/abc"))
        .isInstanceOf(BadRequestException.class)
        .hasMessageContaining("blob");
  }

  @Test
  void acceptsHttps() {
    assertThat(LessonService.normalizeVideoUrl("https://cdn.example.com/a.mp4"))
        .isEqualTo("https://cdn.example.com/a.mp4");
  }

  @Test
  void blankBecomesNull() {
    assertThat(LessonService.normalizeVideoUrl("  ")).isNull();
    assertThat(LessonService.normalizeVideoUrl(null)).isNull();
  }
}

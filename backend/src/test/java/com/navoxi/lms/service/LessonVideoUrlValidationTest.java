package com.navoxi.lms.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.navoxi.lms.web.ApiExceptionHandler.BadRequestException;
import java.util.Set;
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
  void rejectsDangerousSchemes() {
    assertThatThrownBy(() -> LessonService.normalizeVideoUrl("javascript:alert(1)"))
        .isInstanceOf(BadRequestException.class)
        .hasMessageContaining("http(s)");
    assertThatThrownBy(() -> LessonService.normalizeVideoUrl("file:///etc/passwd"))
        .isInstanceOf(BadRequestException.class)
        .hasMessageContaining("http(s)");
    assertThatThrownBy(() -> LessonService.normalizeVideoUrl("ftp://x/a"))
        .isInstanceOf(BadRequestException.class)
        .hasMessageContaining("http(s)");
  }

  @Test
  void rejectsUserInfo() {
    assertThatThrownBy(
            () -> LessonService.normalizeVideoUrl("https://user:pass@evil.com/a.mp4"))
        .isInstanceOf(BadRequestException.class)
        .hasMessageContaining("credenciais");
  }

  @Test
  void rejectsHostOutsideAllowlist() {
    assertThatThrownBy(
            () ->
                LessonService.normalizeVideoUrl(
                    "https://evil.com/a.mp4", Set.of("cdn.example.com")))
        .isInstanceOf(BadRequestException.class)
        .hasMessageContaining("host");
  }

  @Test
  void acceptsHttpsOnAllowlist() {
    assertThat(
            LessonService.normalizeVideoUrl(
                "https://cdn.example.com/a.mp4", Set.of("cdn.example.com")))
        .isEqualTo("https://cdn.example.com/a.mp4");
  }

  @Test
  void acceptsHttpsWhenAllowlistEmpty() {
    assertThat(LessonService.normalizeVideoUrl("https://cdn.example.com/a.mp4"))
        .isEqualTo("https://cdn.example.com/a.mp4");
  }

  @Test
  void blankBecomesNull() {
    assertThat(LessonService.normalizeVideoUrl("  ")).isNull();
    assertThat(LessonService.normalizeVideoUrl(null)).isNull();
  }

  @Test
  void buildAllowedHostsMergesCsvAndPublicBase() {
    assertThat(
            LessonService.buildAllowedHosts(
                "cdn.example.com, Other.CDN.com", "https://bucket.s3.amazonaws.com/path"))
        .containsExactlyInAnyOrder("cdn.example.com", "other.cdn.com", "bucket.s3.amazonaws.com");
  }
}

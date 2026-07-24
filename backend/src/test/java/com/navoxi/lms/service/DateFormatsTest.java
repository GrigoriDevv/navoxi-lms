package com.navoxi.lms.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import org.junit.jupiter.api.Test;

class DateFormatsTest {

  @Test
  void roundTripPreservesWallClockMinute() {
    Instant parsed = DateFormats.parse("2026-05-15 10:00");
    assertThat(DateFormats.format(parsed)).isEqualTo("2026-05-15 10:00");
  }

  @Test
  void nullSafe() {
    assertThat(DateFormats.format(null)).isNull();
    assertThat(DateFormats.parse(null)).isNull();
    assertThat(DateFormats.parse("  ")).isNull();
  }
}

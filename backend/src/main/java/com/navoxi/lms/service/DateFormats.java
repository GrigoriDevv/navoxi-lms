package com.navoxi.lms.service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

/** Wall-clock formatting for API DTOs (America/Sao_Paulo). */
public final class DateFormats {

  public static final ZoneId ZONE = ZoneId.of("America/Sao_Paulo");
  public static final DateTimeFormatter WALL_CLOCK =
      DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

  private DateFormats() {}

  public static String format(Instant instant) {
    if (instant == null) {
      return null;
    }
    return LocalDateTime.ofInstant(instant, ZONE).format(WALL_CLOCK);
  }

  public static Instant parse(String value) {
    if (value == null || value.isBlank()) {
      return null;
    }
    return LocalDateTime.parse(value.trim(), WALL_CLOCK).atZone(ZONE).toInstant();
  }
}

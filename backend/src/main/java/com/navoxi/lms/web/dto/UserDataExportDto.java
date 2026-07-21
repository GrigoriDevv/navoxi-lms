package com.navoxi.lms.web.dto;

import java.time.Instant;
import java.util.List;

/** Portabilidade (LGPD Art. 18): pacote JSON dos dados pessoais do titular. */
public record UserDataExportDto(
    Instant exportedAt,
    UserDto profile,
    List<EnrollmentDto> enrollments,
    List<LessonProgressDto> progress,
    List<EnrollmentRequestDto> enrollmentRequests,
    List<NotificationDto> notifications,
    List<AccessLogEntryDto> accessLog) {

  public record AccessLogEntryDto(
      String id, String action, String resource, String ipAddress, Instant createdAt) {}
}

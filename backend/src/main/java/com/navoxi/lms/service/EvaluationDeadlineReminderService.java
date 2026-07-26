package com.navoxi.lms.service;

import com.navoxi.lms.domain.entity.Enrollment;
import com.navoxi.lms.domain.entity.Evaluation;
import com.navoxi.lms.domain.enums.AttemptStatus;
import com.navoxi.lms.domain.enums.EnrollmentStatus;
import com.navoxi.lms.domain.enums.EvaluationStatus;
import com.navoxi.lms.domain.enums.NotificationType;
import com.navoxi.lms.repository.EnrollmentRepository;
import com.navoxi.lms.repository.EvaluationAttemptRepository;
import com.navoxi.lms.repository.EvaluationRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.EnumSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EvaluationDeadlineReminderService {

  private static final Logger log = LoggerFactory.getLogger(EvaluationDeadlineReminderService.class);
  private static final Set<EvaluationStatus> ACTIVE =
      EnumSet.of(EvaluationStatus.publicada, EvaluationStatus.aplicada);

  public static final String DETAILS_PREFIX = "deadline-reminder:";

  private final EvaluationRepository evaluations;
  private final EnrollmentRepository enrollments;
  private final EvaluationAttemptRepository attempts;
  private final NotificationService notifications;
  private final long windowHours;

  public EvaluationDeadlineReminderService(
      EvaluationRepository evaluations,
      EnrollmentRepository enrollments,
      EvaluationAttemptRepository attempts,
      NotificationService notifications,
      @Value("${lms.deadline-reminder.window-hours:24}") long windowHours) {
    this.evaluations = evaluations;
    this.enrollments = enrollments;
    this.attempts = attempts;
    this.notifications = notifications;
    this.windowHours = windowHours <= 0 ? 24 : windowHours;
  }

  /** Returns how many reminder notifications were created. */
  @Transactional
  public int sendDueReminders(Instant now) {
    Instant windowEnd = now.plusSeconds(windowHours * 3600);
    int sent = 0;
    List<Evaluation> all = evaluations.findAll();
    for (Evaluation evaluation : all) {
      if (!ACTIVE.contains(evaluation.getStatus())) {
        continue;
      }
      Optional<Instant> due = parseDueDate(evaluation.getDueDate());
      if (due.isEmpty()) {
        continue;
      }
      Instant dueAt = due.get();
      if (dueAt.isBefore(now) || dueAt.isAfter(windowEnd)) {
        continue;
      }
      String marker = DETAILS_PREFIX + evaluation.getId();
      List<Enrollment> courseEnrollments =
          enrollments.findByCourseIdAndStatus(evaluation.getCourseId(), EnrollmentStatus.ativa);
      for (Enrollment enrollment : courseEnrollments) {
        String userId = enrollment.getUser().getId();
        if (attempts
            .findByEvaluationIdAndUserIdAndStatus(evaluation.getId(), userId, AttemptStatus.corrigida)
            .isPresent()) {
          continue;
        }
        if (notifications.existsWithDetails(userId, marker)) {
          continue;
        }
        notifications.notify(
            enrollment.getUser(),
            "Prova prestes a fechar",
            "A avaliação \""
                + evaluation.getName()
                + "\" encerra em breve (prazo: "
                + evaluation.getDueDate()
                + ").",
            NotificationType.prazo,
            "/aprendizagem/cursos/" + evaluation.getCourseId(),
            "Aprendizagem",
            marker);
        sent++;
      }
    }
    return sent;
  }

  static Optional<Instant> parseDueDate(String raw) {
    if (raw == null || raw.isBlank()) {
      return Optional.empty();
    }
    String value = raw.trim();
    try {
      return Optional.of(Instant.parse(value));
    } catch (DateTimeParseException ignored) {
      // fall through
    }
    try {
      LocalDateTime ldt = LocalDateTime.parse(value, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
      return Optional.of(ldt.toInstant(ZoneOffset.UTC));
    } catch (DateTimeParseException ignored) {
      // fall through
    }
    try {
      LocalDate day = LocalDate.parse(value, DateTimeFormatter.ISO_LOCAL_DATE);
      return Optional.of(day.atTime(23, 59, 59).toInstant(ZoneOffset.UTC));
    } catch (DateTimeParseException ex) {
      log.debug("Ignoring unparseable evaluation dueDate={}", value);
      return Optional.empty();
    }
  }
}

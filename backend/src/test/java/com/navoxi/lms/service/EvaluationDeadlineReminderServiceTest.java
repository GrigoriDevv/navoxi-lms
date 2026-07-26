package com.navoxi.lms.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.navoxi.lms.domain.entity.Enrollment;
import com.navoxi.lms.domain.entity.Evaluation;
import com.navoxi.lms.domain.entity.EvaluationAttempt;
import com.navoxi.lms.domain.entity.UserAccount;
import com.navoxi.lms.domain.enums.AttemptStatus;
import com.navoxi.lms.domain.enums.EnrollmentStatus;
import com.navoxi.lms.domain.enums.EvaluationStatus;
import com.navoxi.lms.domain.enums.NotificationType;
import com.navoxi.lms.repository.EnrollmentRepository;
import com.navoxi.lms.repository.EvaluationAttemptRepository;
import com.navoxi.lms.repository.EvaluationRepository;
import com.navoxi.lms.repository.NotificationRepository;
import com.navoxi.lms.service.mail.EmailSender;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;

class EvaluationDeadlineReminderServiceTest {

  @Test
  void parseDueDateSupportsIsoAndDateOnly() {
    assertThat(EvaluationDeadlineReminderService.parseDueDate("2026-07-27T12:00:00Z"))
        .contains(Instant.parse("2026-07-27T12:00:00Z"));
    assertThat(EvaluationDeadlineReminderService.parseDueDate("2026-07-27"))
        .contains(Instant.parse("2026-07-27T23:59:59Z"));
    assertThat(EvaluationDeadlineReminderService.parseDueDate("not-a-date")).isEmpty();
  }

  @Test
  void sendsOnceAndDedupesOnSecondRun() {
    EvaluationRepository evaluations = mock(EvaluationRepository.class);
    EnrollmentRepository enrollments = mock(EnrollmentRepository.class);
    EvaluationAttemptRepository attempts = mock(EvaluationAttemptRepository.class);
    RecordingNotifications notifications = new RecordingNotifications();

    Instant now = Instant.parse("2026-07-26T12:00:00Z");
    Evaluation evaluation = new Evaluation();
    evaluation.setId("ev1");
    evaluation.setName("Prova final");
    evaluation.setCourseId("c1");
    evaluation.setStatus(EvaluationStatus.publicada);
    evaluation.setDueDate(now.plus(12, ChronoUnit.HOURS).toString());

    UserAccount aluno = new UserAccount();
    aluno.setId("u1");
    aluno.setEmail("aluno@navoxi.com");
    Enrollment enrollment = new Enrollment();
    enrollment.setUser(aluno);
    enrollment.setStatus(EnrollmentStatus.ativa);

    when(evaluations.findAll()).thenReturn(List.of(evaluation));
    when(enrollments.findByCourseIdAndStatus("c1", EnrollmentStatus.ativa))
        .thenReturn(List.of(enrollment));
    when(attempts.findByEvaluationIdAndUserIdAndStatus("ev1", "u1", AttemptStatus.corrigida))
        .thenReturn(Optional.empty());

    EvaluationDeadlineReminderService service =
        new EvaluationDeadlineReminderService(
            evaluations, enrollments, attempts, notifications, 24);

    assertThat(service.sendDueReminders(now)).isEqualTo(1);
    assertThat(service.sendDueReminders(now)).isEqualTo(0);
    assertThat(notifications.titles).containsExactly("Prova prestes a fechar");
    assertThat(notifications.details).containsExactly("deadline-reminder:ev1");
  }

  @Test
  void skipsUsersWithCorrectedAttempt() {
    EvaluationRepository evaluations = mock(EvaluationRepository.class);
    EnrollmentRepository enrollments = mock(EnrollmentRepository.class);
    EvaluationAttemptRepository attempts = mock(EvaluationAttemptRepository.class);
    RecordingNotifications notifications = new RecordingNotifications();

    Instant now = Instant.parse("2026-07-26T12:00:00Z");
    Evaluation evaluation = new Evaluation();
    evaluation.setId("ev1");
    evaluation.setName("Prova");
    evaluation.setCourseId("c1");
    evaluation.setStatus(EvaluationStatus.aplicada);
    evaluation.setDueDate(now.plus(6, ChronoUnit.HOURS).toString());

    UserAccount aluno = new UserAccount();
    aluno.setId("u1");
    Enrollment enrollment = new Enrollment();
    enrollment.setUser(aluno);

    when(evaluations.findAll()).thenReturn(List.of(evaluation));
    when(enrollments.findByCourseIdAndStatus("c1", EnrollmentStatus.ativa))
        .thenReturn(List.of(enrollment));
    when(attempts.findByEvaluationIdAndUserIdAndStatus("ev1", "u1", AttemptStatus.corrigida))
        .thenReturn(Optional.of(new EvaluationAttempt()));

    EvaluationDeadlineReminderService service =
        new EvaluationDeadlineReminderService(
            evaluations, enrollments, attempts, notifications, 24);

    assertThat(service.sendDueReminders(now)).isEqualTo(0);
    assertThat(notifications.titles).isEmpty();
  }

  /** Hand-rolled stub — Mockito inline mocks fail on this JDK for concrete services. */
  private static final class RecordingNotifications extends NotificationService {
    final List<String> titles = new ArrayList<>();
    final List<String> details = new ArrayList<>();
    private final List<String> storedDetails = new ArrayList<>();

    RecordingNotifications() {
      super(
          mock(NotificationRepository.class),
          mock(EmailSender.class),
          false,
          "http://localhost:3000");
    }

    @Override
    public void notify(
        UserAccount user,
        String title,
        String message,
        NotificationType type,
        String href,
        String module,
        String details) {
      titles.add(title);
      this.details.add(details);
      storedDetails.add(details);
    }

    @Override
    public boolean existsWithDetails(String userId, String details) {
      return storedDetails.contains(details);
    }
  }
}

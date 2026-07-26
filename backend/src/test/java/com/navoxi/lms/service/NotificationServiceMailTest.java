package com.navoxi.lms.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.navoxi.lms.domain.entity.Notification;
import com.navoxi.lms.domain.entity.UserAccount;
import com.navoxi.lms.domain.enums.NotificationType;
import com.navoxi.lms.repository.NotificationRepository;
import com.navoxi.lms.service.mail.EmailSender;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

class NotificationServiceMailTest {

  @Test
  void dualWriteSendsEmailWhenEnabled() {
    NotificationRepository repo = mock(NotificationRepository.class);
    EmailSender mail = mock(EmailSender.class);
    when(repo.save(any(Notification.class))).thenAnswer(inv -> inv.getArgument(0));

    NotificationService service =
        new NotificationService(repo, mail, true, "https://app.example.com/");

    UserAccount user = new UserAccount();
    user.setId("u1");
    user.setEmail("aluno@navoxi.com");

    service.notify(
        user,
        "Nova aula disponível",
        "Conteúdo novo no curso.",
        NotificationType.curso,
        "/aprendizagem/cursos/c1",
        "Aprendizagem",
        "lesson:1");

    verify(mail)
        .send(
            "aluno@navoxi.com",
            "Nova aula disponível",
            "Conteúdo novo no curso.\n\nhttps://app.example.com/aprendizagem/cursos/c1");
  }

  @Test
  void dualWriteSkipsEmailWhenDisabled() {
    NotificationRepository repo = mock(NotificationRepository.class);
    EmailSender mail = mock(EmailSender.class);
    when(repo.save(any(Notification.class))).thenAnswer(inv -> inv.getArgument(0));

    NotificationService service =
        new NotificationService(repo, mail, false, "http://localhost:3000");

    UserAccount user = new UserAccount();
    user.setId("u1");
    user.setEmail("aluno@navoxi.com");

    service.notify(user, "Título", "Msg", NotificationType.info, "/x", "Módulo", "d1");

    verify(mail, never()).send(any(), any(), any());
    ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
    verify(repo).save(captor.capture());
    assertThat(captor.getValue().getTitle()).isEqualTo("Título");
  }

  @Test
  void smtpFailureDoesNotThrow() {
    NotificationRepository repo = mock(NotificationRepository.class);
    EmailSender mail =
        (to, subject, body) -> {
          throw new RuntimeException("smtp down");
        };
    when(repo.save(any(Notification.class))).thenAnswer(inv -> inv.getArgument(0));

    NotificationService service =
        new NotificationService(repo, mail, true, "http://localhost:3000");

    UserAccount user = new UserAccount();
    user.setId("u1");
    user.setEmail("aluno@navoxi.com");

    service.notify(user, "T", "M", NotificationType.info, null, null, null);
    verify(repo).save(any(Notification.class));
  }
}

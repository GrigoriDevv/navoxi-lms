package com.navoxi.lms.service;

import com.navoxi.lms.domain.entity.Notification;
import com.navoxi.lms.domain.entity.UserAccount;
import com.navoxi.lms.domain.enums.NotificationType;
import com.navoxi.lms.repository.NotificationRepository;
import com.navoxi.lms.service.mail.EmailSender;
import com.navoxi.lms.web.ApiExceptionHandler.ForbiddenException;
import com.navoxi.lms.web.ApiExceptionHandler.NotFoundException;
import com.navoxi.lms.web.dto.NotificationDto;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationService {

  private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

  private final NotificationRepository notifications;
  private final EmailSender emailSender;
  private final boolean mailEnabled;
  private final String publicAppUrl;

  public NotificationService(
      NotificationRepository notifications,
      EmailSender emailSender,
      @Value("${lms.mail.enabled:false}") boolean mailEnabled,
      @Value("${lms.public-app-url:http://localhost:3000}") String publicAppUrl) {
    this.notifications = notifications;
    this.emailSender = emailSender;
    this.mailEnabled = mailEnabled;
    this.publicAppUrl =
        publicAppUrl == null || publicAppUrl.isBlank()
            ? "http://localhost:3000"
            : publicAppUrl.replaceAll("/+$", "");
  }

  @Transactional(readOnly = true)
  public List<NotificationDto> listForUser(UserAccount user) {
    return notifications.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
        .map(CourseMapper::toDto)
        .toList();
  }

  @Transactional
  public NotificationDto markRead(UserAccount user, String id) {
    Notification n =
        notifications.findById(id).orElseThrow(() -> new NotFoundException("Notificação não encontrada"));
    if (!n.getUser().getId().equals(user.getId())) {
      throw new ForbiddenException("Notificação de outro usuário");
    }
    n.setReadFlag(true);
    return CourseMapper.toDto(notifications.save(n));
  }

  @Transactional
  public int markAllRead(UserAccount user) {
    return notifications.markAllReadForUser(user.getId());
  }

  @Transactional
  public void notify(
      UserAccount user,
      String title,
      String message,
      NotificationType type,
      String href,
      String module,
      String details) {
    Notification n = new Notification();
    n.setUser(user);
    n.setTitle(title);
    n.setMessage(message);
    n.setType(type);
    n.setReadFlag(false);
    n.setTimestampLabel("Agora");
    n.setHref(href);
    n.setModule(module);
    n.setDetails(details);
    notifications.save(n);

    if (mailEnabled) {
      try {
        emailSender.send(user.getEmail(), title, buildEmailBody(message, href));
      } catch (RuntimeException ex) {
        log.warn("Email dual-write failed user={} title={}: {}", user.getId(), title, ex.getMessage());
      }
    }
  }

  public boolean existsWithDetails(String userId, String details) {
    return notifications.existsByUser_IdAndDetails(userId, details);
  }

  private String buildEmailBody(String message, String href) {
    StringBuilder body = new StringBuilder();
    if (message != null && !message.isBlank()) {
      body.append(message.trim());
    }
    if (href != null && !href.isBlank()) {
      if (body.length() > 0) {
        body.append("\n\n");
      }
      String link = href.startsWith("http") ? href : publicAppUrl + (href.startsWith("/") ? href : "/" + href);
      body.append(link);
    }
    return body.toString();
  }
}

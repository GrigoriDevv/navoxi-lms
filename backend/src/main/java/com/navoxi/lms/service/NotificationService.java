package com.navoxi.lms.service;

import com.navoxi.lms.domain.entity.Notification;
import com.navoxi.lms.domain.entity.UserAccount;
import com.navoxi.lms.domain.enums.NotificationType;
import com.navoxi.lms.repository.NotificationRepository;
import com.navoxi.lms.web.ApiExceptionHandler.ForbiddenException;
import com.navoxi.lms.web.ApiExceptionHandler.NotFoundException;
import com.navoxi.lms.web.dto.NotificationDto;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationService {

  private final NotificationRepository notifications;

  public NotificationService(NotificationRepository notifications) {
    this.notifications = notifications;
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
  }
}

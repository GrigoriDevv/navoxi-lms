package com.navoxi.lms.web;

import com.navoxi.lms.domain.entity.UserAccount;
import com.navoxi.lms.service.AccessLogService;
import com.navoxi.lms.service.CourseMapper;
import com.navoxi.lms.service.EnrollmentService;
import com.navoxi.lms.service.NotificationService;
import com.navoxi.lms.service.ProgressService;
import com.navoxi.lms.service.UserPrivacyService;
import com.navoxi.lms.web.dto.EnrollmentDto;
import com.navoxi.lms.web.dto.LessonProgressDto;
import com.navoxi.lms.web.dto.NotificationDto;
import com.navoxi.lms.web.dto.UserDataExportDto;
import com.navoxi.lms.web.dto.UserDto;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users/me")
public class UserController {

  private final CurrentUserResolver currentUser;
  private final EnrollmentService enrollments;
  private final ProgressService progress;
  private final NotificationService notifications;
  private final UserPrivacyService privacy;
  private final AccessLogService accessLogs;

  public UserController(
      CurrentUserResolver currentUser,
      EnrollmentService enrollments,
      ProgressService progress,
      NotificationService notifications,
      UserPrivacyService privacy,
      AccessLogService accessLogs) {
    this.currentUser = currentUser;
    this.enrollments = enrollments;
    this.progress = progress;
    this.notifications = notifications;
    this.privacy = privacy;
    this.accessLogs = accessLogs;
  }

  @GetMapping
  public UserDto me() {
    UserAccount user = currentUser.require();
    accessLogs.record(user.getId(), AccessLogService.ACTION_USERS_ME, "/api/v1/users/me");
    return CourseMapper.toDto(user);
  }

  @GetMapping("/export")
  public UserDataExportDto export() {
    UserAccount user = currentUser.require();
    accessLogs.record(user.getId(), AccessLogService.ACTION_USERS_EXPORT, "/api/v1/users/me/export");
    return privacy.export(user);
  }

  @DeleteMapping
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void deleteMe() {
    privacy.erase(currentUser.require());
  }

  @GetMapping("/enrollments")
  public List<EnrollmentDto> enrollments() {
    UserAccount user = currentUser.require();
    return enrollments.listForUser(user);
  }

  @GetMapping("/progress")
  public List<LessonProgressDto> progress() {
    UserAccount user = currentUser.require();
    return progress.listForUser(user.getId());
  }

  @GetMapping("/notifications")
  public List<NotificationDto> listNotifications() {
    return notifications.listForUser(currentUser.require());
  }

  @PostMapping("/notifications/{id}/read")
  public NotificationDto markNotificationRead(@PathVariable String id) {
    return notifications.markRead(currentUser.require(), id);
  }

  @PostMapping("/notifications/read-all")
  public Map<String, Integer> markAllNotificationsRead() {
    int updated = notifications.markAllRead(currentUser.require());
    return Map.of("updated", updated);
  }
}

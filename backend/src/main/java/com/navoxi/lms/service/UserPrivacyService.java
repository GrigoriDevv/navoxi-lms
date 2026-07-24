package com.navoxi.lms.service;

import com.navoxi.lms.domain.entity.AccessLog;
import com.navoxi.lms.domain.entity.UserAccount;
import com.navoxi.lms.domain.enums.AuthProvider;
import com.navoxi.lms.domain.enums.UserStatus;
import com.navoxi.lms.repository.AccessLogRepository;
import com.navoxi.lms.repository.EnrollmentRepository;
import com.navoxi.lms.repository.EnrollmentRequestRepository;
import com.navoxi.lms.repository.LessonProgressRepository;
import com.navoxi.lms.repository.NotificationRepository;
import com.navoxi.lms.repository.UserAccountRepository;
import com.navoxi.lms.web.ApiExceptionHandler.BadRequestException;
import com.navoxi.lms.web.dto.UserDataExportDto;
import com.navoxi.lms.web.dto.UserDataExportDto.AccessLogEntryDto;
import java.time.Instant;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * LGPD mínimo: portabilidade (export) e exclusão/anonimização do titular autenticado.
 */
@Service
public class UserPrivacyService {

  private static final String ANON_NAME = "Usuário removido";
  private static final String ANON_DEPARTMENT = "—";
  private static final String ANON_AVATAR = "#6b7280";

  private final UserAccountRepository users;
  private final EnrollmentRepository enrollments;
  private final EnrollmentRequestRepository enrollmentRequests;
  private final LessonProgressRepository progress;
  private final NotificationRepository notifications;
  private final AccessLogRepository accessLogs;
  private final AccessLogService accessLogService;
  private final DenormalizedLabelSync labelSync;

  public UserPrivacyService(
      UserAccountRepository users,
      EnrollmentRepository enrollments,
      EnrollmentRequestRepository enrollmentRequests,
      LessonProgressRepository progress,
      NotificationRepository notifications,
      AccessLogRepository accessLogs,
      AccessLogService accessLogService,
      DenormalizedLabelSync labelSync) {
    this.users = users;
    this.enrollments = enrollments;
    this.enrollmentRequests = enrollmentRequests;
    this.progress = progress;
    this.notifications = notifications;
    this.accessLogs = accessLogs;
    this.accessLogService = accessLogService;
    this.labelSync = labelSync;
  }

  @Transactional(readOnly = true)
  public UserDataExportDto export(UserAccount user) {
    String userId = user.getId();
    List<AccessLogEntryDto> logEntries =
        accessLogs.findByUserIdOrderByCreatedAtDesc(userId).stream()
            .map(UserPrivacyService::toAccessLogDto)
            .toList();

    return new UserDataExportDto(
        Instant.now(),
        CourseMapper.toDto(user),
        enrollments.findByUserId(userId).stream().map(CourseMapper::toDto).toList(),
        progress.findByUserId(userId).stream().map(CourseMapper::toDto).toList(),
        enrollmentRequests.findByUserIdOrderByRequestedAtDesc(userId).stream()
            .map(CourseMapper::toDto)
            .toList(),
        notifications.findByUserIdOrderByCreatedAtDesc(userId).stream()
            .map(CourseMapper::toDto)
            .toList(),
        logEntries);
  }

  /**
   * Direito ao esquecimento: scrub irreversível de PII + desativa conta. Mantém o row para não
   * quebrar FKs de matrícula/progresso; JWT deixa de autenticar (status ≠ ativo).
   */
  @Transactional
  public void erase(UserAccount user) {
    if (user.getStatus() != UserStatus.ativo) {
      throw new BadRequestException("Conta já desativada ou removida");
    }

    String userId = user.getId();
    accessLogService.record(userId, AccessLogService.ACTION_USERS_DELETE, "/api/v1/users/me");

    labelSync.syncUserName(userId, ANON_NAME);
    notifications.deleteByUserId(userId);

    user.setName(ANON_NAME);
    user.setEmail("deleted-" + userId + "@deleted.local");
    user.setDepartment(ANON_DEPARTMENT);
    user.setPasswordHash(null);
    user.setMicrosoftOid(null);
    user.setAuthProvider(AuthProvider.local);
    user.setLastAccess(null);
    user.setAvatarColor(ANON_AVATAR);
    user.setStatus(UserStatus.inativo);
    users.save(user);
  }

  private static AccessLogEntryDto toAccessLogDto(AccessLog log) {
    return new AccessLogEntryDto(
        log.getId(), log.getAction(), log.getResource(), log.getIpAddress(), log.getCreatedAt());
  }
}

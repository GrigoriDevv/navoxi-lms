package com.navoxi.lms.service;

import com.navoxi.lms.repository.AccessLogRepository;
import com.navoxi.lms.repository.LessonProgressRepository;
import java.time.Instant;
import java.time.Period;
import java.time.ZoneOffset;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Purge por prazo de retenção LGPD: remove progresso e access_log expirados.
 * Ver {@code docs/lgpd-data-retention.md}.
 */
@Service
public class RetentionPurgeService {

  private static final Logger log = LoggerFactory.getLogger(RetentionPurgeService.class);

  private final LessonProgressRepository progress;
  private final AccessLogRepository accessLogs;
  private final AccessLogService accessLogService;
  private final int progressMonths;
  private final int accessLogMonths;

  public RetentionPurgeService(
      LessonProgressRepository progress,
      AccessLogRepository accessLogs,
      AccessLogService accessLogService,
      @Value("${lms.retention.progress-months:24}") int progressMonths,
      @Value("${lms.retention.access-log-months:12}") int accessLogMonths) {
    this.progress = progress;
    this.accessLogs = accessLogs;
    this.accessLogService = accessLogService;
    this.progressMonths = Math.max(1, progressMonths);
    this.accessLogMonths = Math.max(1, accessLogMonths);
  }

  /**
   * @return summary with deleted counts (progress, accessLog)
   */
  @Transactional
  public PurgeResult purgeExpired(Instant now) {
    Instant progressCutoff = now.atZone(ZoneOffset.UTC).minus(Period.ofMonths(progressMonths)).toInstant();
    Instant accessLogCutoff =
        now.atZone(ZoneOffset.UTC).minus(Period.ofMonths(accessLogMonths)).toInstant();

    long progressDeleted = progress.deleteByCompletedAtBefore(progressCutoff);
    long accessLogDeleted = accessLogs.deleteByCreatedAtBefore(accessLogCutoff);

    String resource =
        "progressDeleted=" + progressDeleted + ",accessLogDeleted=" + accessLogDeleted;
    accessLogService.record(null, AccessLogService.ACTION_RETENTION_PURGE, resource);

    log.info(
        "retention.purge progressDeleted={} accessLogDeleted={} progressCutoff={} accessLogCutoff={}",
        progressDeleted,
        accessLogDeleted,
        progressCutoff,
        accessLogCutoff);

    return new PurgeResult(progressDeleted, accessLogDeleted, progressCutoff, accessLogCutoff);
  }

  public record PurgeResult(
      long progressDeleted, long accessLogDeleted, Instant progressCutoff, Instant accessLogCutoff) {}
}

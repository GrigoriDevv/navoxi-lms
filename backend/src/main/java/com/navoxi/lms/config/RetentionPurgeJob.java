package com.navoxi.lms.config;

import com.navoxi.lms.service.RetentionPurgeService;
import java.time.Instant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class RetentionPurgeJob {

  private static final Logger log = LoggerFactory.getLogger(RetentionPurgeJob.class);

  private final RetentionPurgeService purgeService;
  private final boolean enabled;

  public RetentionPurgeJob(
      RetentionPurgeService purgeService,
      @Value("${lms.retention.enabled:false}") boolean enabled) {
    this.purgeService = purgeService;
    this.enabled = enabled;
  }

  /** Daily at 03:30 UTC. */
  @Scheduled(cron = "0 30 3 * * *", zone = "UTC")
  public void runDaily() {
    if (!enabled) {
      return;
    }
    try {
      RetentionPurgeService.PurgeResult result = purgeService.purgeExpired(Instant.now());
      log.info(
          "Retention purge finished progressDeleted={} accessLogDeleted={}",
          result.progressDeleted(),
          result.accessLogDeleted());
    } catch (RuntimeException ex) {
      log.error("Retention purge failed", ex);
    }
  }
}

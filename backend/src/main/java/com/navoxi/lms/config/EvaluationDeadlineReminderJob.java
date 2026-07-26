package com.navoxi.lms.config;

import com.navoxi.lms.service.EvaluationDeadlineReminderService;
import java.time.Instant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class EvaluationDeadlineReminderJob {

  private static final Logger log = LoggerFactory.getLogger(EvaluationDeadlineReminderJob.class);

  private final EvaluationDeadlineReminderService reminders;
  private final boolean enabled;

  public EvaluationDeadlineReminderJob(
      EvaluationDeadlineReminderService reminders,
      @Value("${lms.deadline-reminder.enabled:true}") boolean enabled) {
    this.reminders = reminders;
    this.enabled = enabled;
  }

  /** Hourly at minute 15 UTC. */
  @Scheduled(cron = "0 15 * * * *", zone = "UTC")
  public void runHourly() {
    if (!enabled) {
      return;
    }
    try {
      int sent = reminders.sendDueReminders(Instant.now());
      if (sent > 0) {
        log.info("Deadline reminders sent={}", sent);
      }
    } catch (RuntimeException ex) {
      log.error("Deadline reminder job failed", ex);
    }
  }
}

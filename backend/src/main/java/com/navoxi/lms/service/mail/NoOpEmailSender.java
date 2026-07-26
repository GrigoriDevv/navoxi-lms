package com.navoxi.lms.service.mail;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "lms.mail.enabled", havingValue = "false", matchIfMissing = true)
public class NoOpEmailSender implements EmailSender {

  private static final Logger log = LoggerFactory.getLogger(NoOpEmailSender.class);

  @Override
  public void send(String to, String subject, String body) {
    log.debug("Mail disabled — skip to={} subject={}", to, subject);
  }
}

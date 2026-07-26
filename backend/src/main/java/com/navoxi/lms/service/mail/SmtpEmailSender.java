package com.navoxi.lms.service.mail;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "lms.mail.enabled", havingValue = "true")
public class SmtpEmailSender implements EmailSender {

  private static final Logger log = LoggerFactory.getLogger(SmtpEmailSender.class);

  private final JavaMailSender mailSender;
  private final String from;

  public SmtpEmailSender(
      JavaMailSender mailSender, @Value("${lms.mail.from:noreply@navoxi.local}") String from) {
    this.mailSender = mailSender;
    this.from = from;
  }

  @Override
  public void send(String to, String subject, String body) {
    if (to == null || to.isBlank()) {
      log.warn("Skip email: empty recipient subject={}", subject);
      return;
    }
    try {
      SimpleMailMessage message = new SimpleMailMessage();
      message.setFrom(from);
      message.setTo(to.trim());
      message.setSubject(subject == null ? "" : subject);
      message.setText(body == null ? "" : body);
      mailSender.send(message);
    } catch (RuntimeException ex) {
      log.warn("SMTP send failed to={} subject={}: {}", to, subject, ex.getMessage());
    }
  }
}

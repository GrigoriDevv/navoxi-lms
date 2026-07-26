package com.navoxi.lms.service.mail;

/** Outbound email channel (SMTP or no-op). Failures must not break in-app notify. */
public interface EmailSender {

  void send(String to, String subject, String body);
}

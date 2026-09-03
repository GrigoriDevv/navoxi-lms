package com.navoxi.lms.service.mail;

/** Outbound email channel (SMTP or no-op). Callers decide whether a delivery failure is fatal. */
public interface EmailSender {

  void send(String to, String subject, String body);
}

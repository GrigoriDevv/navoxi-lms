package com.navoxi.lms.security;

import java.util.Locale;
import java.util.Set;

/** E-mails das contas seed documentadas no README (somente demo/local). */
public final class DemoSeedEmails {

  private static final Set<String> SEED_EMAILS =
      Set.of(
          "ana.souza@navoxi.com",
          "bruno.ferreira@navoxi.com",
          "carla.mendes@navoxi.com",
          "henrique.castro@navoxi.com",
          "diego.alves@navoxi.com",
          "felipe.rocha@navoxi.com");

  private DemoSeedEmails() {}

  public static boolean isSeedEmail(String email) {
    if (email == null || email.isBlank()) {
      return false;
    }
    return SEED_EMAILS.contains(email.trim().toLowerCase(Locale.ROOT));
  }
}

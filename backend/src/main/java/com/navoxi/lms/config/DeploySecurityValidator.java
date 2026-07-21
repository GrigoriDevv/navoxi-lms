package com.navoxi.lms.config;

import jakarta.annotation.PostConstruct;
import java.util.Arrays;
import java.util.Locale;
import java.util.Set;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

/**
 * Fail-fast em profiles não-local: token fraco, CORS vazio, seed ligado.
 */
@Configuration
public class DeploySecurityValidator {

  private static final Set<String> WEAK_TOKENS =
      Set.of(
          "local-dev-token",
          "changeme",
          "change-me",
          "secret",
          "password",
          "token",
          "apikey",
          "api-token");

  private static final int MIN_TOKEN_LENGTH = 24;

  private final Environment env;
  private final String apiToken;
  private final String corsOrigins;
  private final boolean seedEnabled;

  public DeploySecurityValidator(
      Environment env,
      @Value("${lms.api-token:}") String apiToken,
      @Value("${lms.cors.allowed-origins:}") String corsOrigins,
      @Value("${lms.seed.enabled:false}") boolean seedEnabled) {
    this.env = env;
    this.apiToken = apiToken == null ? "" : apiToken.trim();
    this.corsOrigins = corsOrigins == null ? "" : corsOrigins.trim();
    this.seedEnabled = seedEnabled;
  }

  @PostConstruct
  void validateNonLocalHardening() {
    if (isLocalOrTestProfile()) {
      return;
    }

    if (apiToken.isEmpty() || isWeakToken(apiToken)) {
      throw new IllegalStateException(
          "LMS_API_TOKEN fraco ou ausente: defina um secret forte (≥"
              + MIN_TOKEN_LENGTH
              + " chars) e não use local-dev-token / defaults de desenvolvimento");
    }

    if (corsOrigins.isEmpty()) {
      throw new IllegalStateException(
          "CORS_ORIGINS é obrigatório fora do profile local (ex.: https://seu-front.up.railway.app)");
    }

    if (seedEnabled) {
      throw new IllegalStateException(
          "LMS_SEED_ENABLED deve ser false fora do profile local");
    }
  }

  static boolean isWeakToken(String token) {
    if (token == null || token.isBlank()) {
      return true;
    }
    String normalized = token.trim().toLowerCase(Locale.ROOT);
    if (WEAK_TOKENS.contains(normalized)) {
      return true;
    }
    if (normalized.startsWith("local-dev")) {
      return true;
    }
    return token.trim().length() < MIN_TOKEN_LENGTH;
  }

  private boolean isLocalOrTestProfile() {
    String[] active = env.getActiveProfiles();
    if (active.length == 0) {
      return Arrays.stream(env.getDefaultProfiles())
          .anyMatch(p -> "local".equals(p) || "test".equals(p));
    }
    return Arrays.stream(active).anyMatch(p -> "local".equals(p) || "test".equals(p));
  }
}

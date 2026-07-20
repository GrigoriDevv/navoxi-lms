package com.navoxi.lms.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

@Configuration
public class JwtSecretValidator {

  private final Environment env;
  private final String jwtSecret;

  public JwtSecretValidator(
      Environment env, @Value("${lms.jwt.secret:}") String jwtSecret) {
    this.env = env;
    this.jwtSecret = jwtSecret == null ? "" : jwtSecret;
  }

  @PostConstruct
  void validateProdSecret() {
    boolean prod = false;
    for (String profile : env.getActiveProfiles()) {
      if ("prod".equals(profile)) {
        prod = true;
        break;
      }
    }
    if (!prod) {
      return;
    }
    String explicit = env.getProperty("LMS_JWT_SECRET");
    if (explicit == null || explicit.isBlank()) {
      throw new IllegalStateException(
          "LMS_JWT_SECRET é obrigatório no profile prod");
    }
    if ("local-dev-token".equals(jwtSecret) || jwtSecret.length() < 32) {
      throw new IllegalStateException(
          "LMS_JWT_SECRET deve ter pelo menos 32 caracteres e não usar o default de desenvolvimento");
    }
  }
}

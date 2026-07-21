package com.navoxi.lms.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

class DeploySecurityValidatorTest {

  @Test
  void weakTokenDetection() {
    assertThat(DeploySecurityValidator.isWeakToken(null)).isTrue();
    assertThat(DeploySecurityValidator.isWeakToken("")).isTrue();
    assertThat(DeploySecurityValidator.isWeakToken("local-dev-token")).isTrue();
    assertThat(DeploySecurityValidator.isWeakToken("short")).isTrue();
    assertThat(DeploySecurityValidator.isWeakToken("a-strong-deploy-token-value-ok")).isFalse();
  }

  @Test
  void localProfileSkipsHardening() {
    MockEnvironment env = new MockEnvironment();
    env.setActiveProfiles("local");
    DeploySecurityValidator validator =
        new DeploySecurityValidator(env, "local-dev-token", "", true);
    validator.validateNonLocalHardening();
  }

  @Test
  void prodRejectsWeakApiToken() {
    MockEnvironment env = new MockEnvironment();
    env.setActiveProfiles("prod");
    DeploySecurityValidator validator =
        new DeploySecurityValidator(
            env, "local-dev-token", "https://app.example.com", false);
    assertThatThrownBy(validator::validateNonLocalHardening)
        .isInstanceOf(IllegalStateException.class)
        .hasMessageContaining("LMS_API_TOKEN");
  }

  @Test
  void prodRejectsEmptyCors() {
    MockEnvironment env = new MockEnvironment();
    env.setActiveProfiles("prod");
    DeploySecurityValidator validator =
        new DeploySecurityValidator(
            env, "a-strong-deploy-token-value-ok", "", false);
    assertThatThrownBy(validator::validateNonLocalHardening)
        .isInstanceOf(IllegalStateException.class)
        .hasMessageContaining("CORS_ORIGINS");
  }

  @Test
  void prodRejectsSeedEnabled() {
    MockEnvironment env = new MockEnvironment();
    env.setActiveProfiles("prod");
    DeploySecurityValidator validator =
        new DeploySecurityValidator(
            env, "a-strong-deploy-token-value-ok", "https://app.example.com", true);
    assertThatThrownBy(validator::validateNonLocalHardening)
        .isInstanceOf(IllegalStateException.class)
        .hasMessageContaining("LMS_SEED_ENABLED");
  }

  @Test
  void prodAcceptsStrongConfig() {
    MockEnvironment env = new MockEnvironment();
    env.setActiveProfiles("prod");
    DeploySecurityValidator validator =
        new DeploySecurityValidator(
            env, "a-strong-deploy-token-value-ok", "https://app.example.com", false);
    validator.validateNonLocalHardening();
  }
}

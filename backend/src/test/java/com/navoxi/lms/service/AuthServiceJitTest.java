package com.navoxi.lms.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.navoxi.lms.domain.entity.UserAccount;
import com.navoxi.lms.domain.enums.AuthProvider;
import com.navoxi.lms.domain.enums.Role;
import com.navoxi.lms.repository.UserAccountRepository;
import com.navoxi.lms.web.ApiExceptionHandler.ForbiddenException;
import com.navoxi.lms.web.dto.AuthSessionDto;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest(
    properties = {
      "spring.datasource.url=jdbc:h2:mem:lms-jit;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE",
      "lms.seed.enabled=false",
      "lms.auth.jit-provisioning-enabled=true",
      "lms.auth.allowed-email-domains=navoxi.com",
      "lms.auth.bootstrap-admin-emails=bootstrap.admin@navoxi.com",
      "lms.auth.default-unit-id=matriz"
    })
@ActiveProfiles("local")
@Transactional
class AuthServiceJitTest {

  @Autowired private AuthService authService;
  @Autowired private UserAccountRepository users;

  @Test
  void jitCreatesFirstUserAsAdminPremium() {
    users.deleteAll();
    AuthSessionDto session =
        authService.resolveMicrosoftLogin("first@navoxi.com", "First User", "oid-first");
    assertThat(session.role()).isEqualTo(Role.admin_premium);
    assertThat(session.provider()).isEqualTo("microsoft");
    UserAccount saved = users.findByEmailIgnoreCase("first@navoxi.com").orElseThrow();
    assertThat(saved.getAuthProvider()).isEqualTo(AuthProvider.microsoft);
    assertThat(saved.getMicrosoftOid()).isEqualTo("oid-first");
  }

  @Test
  void jitCreatesSubsequentUserAsAluno() {
    users.deleteAll();
    authService.resolveMicrosoftLogin("first@navoxi.com", "First", "oid-1");
    AuthSessionDto session =
        authService.resolveMicrosoftLogin("second@navoxi.com", "Second", "oid-2");
    assertThat(session.role()).isEqualTo(Role.aluno);
  }

  @Test
  void jitBootstrapEmailBecomesAdmin() {
    users.deleteAll();
    authService.resolveMicrosoftLogin("first@navoxi.com", "First", "oid-1");
    AuthSessionDto session =
        authService.resolveMicrosoftLogin(
            "bootstrap.admin@navoxi.com", "Bootstrap", "oid-boot");
    assertThat(session.role()).isEqualTo(Role.admin_premium);
  }

  @Test
  void jitRejectsDisallowedDomain() {
    assertThatThrownBy(
            () ->
                authService.resolveMicrosoftLogin(
                    "outsider@evil.com", "Outsider", "oid-evil"))
        .isInstanceOf(ForbiddenException.class)
        .hasMessageContaining("Domínio");
  }

  @Test
  void jitRejectsOidCollision() {
    users.deleteAll();
    authService.resolveMicrosoftLogin("a@navoxi.com", "A", "shared-oid");
    assertThatThrownBy(
            () -> authService.resolveMicrosoftLogin("b@navoxi.com", "B", "shared-oid"))
        .isInstanceOf(ForbiddenException.class);
  }
}

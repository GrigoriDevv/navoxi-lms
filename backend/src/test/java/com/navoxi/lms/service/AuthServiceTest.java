package com.navoxi.lms.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.navoxi.lms.domain.entity.UserAccount;
import com.navoxi.lms.domain.enums.AuthProvider;
import com.navoxi.lms.domain.enums.Role;
import com.navoxi.lms.domain.enums.UnitId;
import com.navoxi.lms.domain.enums.UserStatus;
import com.navoxi.lms.repository.UserAccountRepository;
import com.navoxi.lms.web.ApiExceptionHandler.ForbiddenException;
import com.navoxi.lms.web.ApiExceptionHandler.UnauthorizedException;
import com.navoxi.lms.web.dto.AuthSessionDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@ActiveProfiles("local")
@Transactional
class AuthServiceTest {

  @Autowired private AuthService authService;
  @Autowired private UserAccountRepository users;
  @Autowired private PasswordEncoder passwordEncoder;

  @BeforeEach
  void seedUser() {
    if (users.findByEmailIgnoreCase("auth.test@navoxi.com").isPresent()) {
      return;
    }
    UserAccount u = new UserAccount();
    u.setId("u-auth-test");
    u.setName("Auth Test");
    u.setEmail("auth.test@navoxi.com");
    u.setRole(Role.aluno);
    u.setUnitId(UnitId.matriz);
    u.setDepartment("QA");
    u.setStatus(UserStatus.ativo);
    u.setLastAccess("—");
    u.setAvatarColor("#2563eb");
    u.setAuthProvider(AuthProvider.both);
    u.setPasswordHash(passwordEncoder.encode("secret123"));
    users.save(u);
  }

  @Test
  void loginWithValidPassword() {
    AuthSessionDto session = authService.login("auth.test@navoxi.com", "secret123");
    assertThat(session.email()).isEqualTo("auth.test@navoxi.com");
    assertThat(session.provider()).isEqualTo("password");
    assertThat(session.role()).isEqualTo(Role.aluno);
  }

  @Test
  void loginWithWrongPassword() {
    assertThatThrownBy(() -> authService.login("auth.test@navoxi.com", "wrong"))
        .isInstanceOf(UnauthorizedException.class);
  }

  @Test
  void loginWithUnknownEmail() {
    assertThatThrownBy(() -> authService.login("missing@navoxi.com", "secret123"))
        .isInstanceOf(UnauthorizedException.class);
  }

  @Test
  void microsoftLoginWhitelistOk() {
    AuthSessionDto session =
        authService.resolveMicrosoftLogin(
            "auth.test@navoxi.com", "Auth Test Microsoft", "ms-oid-1");
    assertThat(session.provider()).isEqualTo("microsoft");
    assertThat(session.email()).isEqualTo("auth.test@navoxi.com");
  }

  @Test
  void microsoftLoginUnknownEmailForbidden() {
    assertThatThrownBy(
            () ->
                authService.resolveMicrosoftLogin(
                    "unknown@navoxi.com", "Unknown", "ms-oid-2"))
        .isInstanceOf(ForbiddenException.class);
  }

  @Test
  void blockedUserCannotLogin() {
    UserAccount blocked = users.findByEmailIgnoreCase("auth.test@navoxi.com").orElseThrow();
    blocked.setStatus(UserStatus.bloqueado);
    users.save(blocked);

    assertThatThrownBy(() -> authService.login("auth.test@navoxi.com", "secret123"))
        .isInstanceOf(UnauthorizedException.class);
  }
}

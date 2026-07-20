package com.navoxi.lms.service;

import com.navoxi.lms.domain.entity.UserAccount;
import com.navoxi.lms.domain.enums.AuthProvider;
import com.navoxi.lms.domain.enums.UserStatus;
import com.navoxi.lms.repository.UserAccountRepository;
import com.navoxi.lms.web.ApiExceptionHandler.ForbiddenException;
import com.navoxi.lms.web.ApiExceptionHandler.UnauthorizedException;
import com.navoxi.lms.web.dto.AuthSessionDto;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

  private static final DateTimeFormatter LAST_ACCESS_FMT =
      DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

  private final UserAccountRepository users;
  private final PasswordEncoder passwordEncoder;

  public AuthService(UserAccountRepository users, PasswordEncoder passwordEncoder) {
    this.users = users;
    this.passwordEncoder = passwordEncoder;
  }

  @Transactional
  public AuthSessionDto login(String email, String password) {
    UserAccount user =
        users
            .findByEmailIgnoreCase(normalizeEmail(email))
            .orElseThrow(() -> new UnauthorizedException("E-mail ou senha inválidos"));

    assertActive(user);
    assertPasswordAllowed(user);

    if (user.getPasswordHash() == null
        || !passwordEncoder.matches(password, user.getPasswordHash())) {
      throw new UnauthorizedException("E-mail ou senha inválidos");
    }

    touchLastAccess(user);
    return toSession(user, "password");
  }

  @Transactional
  public AuthSessionDto resolveMicrosoftLogin(String email, String name, String microsoftOid) {
    UserAccount user =
        users
            .findByEmailIgnoreCase(normalizeEmail(email))
            .orElseThrow(
                () ->
                    new ForbiddenException(
                        "Conta não autorizada. Solicite acesso ao administrador."));

    assertActive(user);
    assertMicrosoftAllowed(user);

    if (name != null && !name.isBlank() && !name.equals(user.getName())) {
      user.setName(name.trim());
    }
    if (microsoftOid != null && !microsoftOid.isBlank()) {
      user.setMicrosoftOid(microsoftOid.trim());
    }
    touchLastAccess(user);
    return toSession(user, "microsoft");
  }

  private static void assertActive(UserAccount user) {
    if (user.getStatus() != UserStatus.ativo) {
      throw new UnauthorizedException("E-mail ou senha inválidos");
    }
  }

  private static void assertPasswordAllowed(UserAccount user) {
    AuthProvider provider = user.getAuthProvider();
    if (provider != AuthProvider.local && provider != AuthProvider.both) {
      throw new UnauthorizedException("E-mail ou senha inválidos");
    }
  }

  private static void assertMicrosoftAllowed(UserAccount user) {
    AuthProvider provider = user.getAuthProvider();
    if (provider != AuthProvider.microsoft && provider != AuthProvider.both) {
      throw new ForbiddenException("Conta não autorizada. Solicite acesso ao administrador.");
    }
  }

  private void touchLastAccess(UserAccount user) {
    user.setLastAccess(LocalDateTime.now().format(LAST_ACCESS_FMT));
    users.save(user);
  }

  private static String normalizeEmail(String email) {
    return email.trim().toLowerCase();
  }

  static AuthSessionDto toSession(UserAccount user, String provider) {
    return new AuthSessionDto(
        user.getId(),
        user.getEmail(),
        user.getName(),
        user.getRole(),
        user.getUnitId(),
        user.getAvatarColor(),
        provider);
  }
}

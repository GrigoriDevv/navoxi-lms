package com.navoxi.lms.service;

import com.navoxi.lms.config.JitAuthProperties;
import com.navoxi.lms.domain.entity.UserAccount;
import com.navoxi.lms.domain.enums.AuthProvider;
import com.navoxi.lms.domain.enums.Role;
import com.navoxi.lms.domain.enums.UnitId;
import com.navoxi.lms.domain.enums.UserStatus;
import com.navoxi.lms.repository.UserAccountRepository;
import com.navoxi.lms.security.DemoSeedGuard;
import com.navoxi.lms.security.JwtService;
import com.navoxi.lms.web.ApiExceptionHandler.ForbiddenException;
import com.navoxi.lms.web.ApiExceptionHandler.UnauthorizedException;
import com.navoxi.lms.web.dto.AuthSessionDto;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

  private static final DateTimeFormatter LAST_ACCESS_FMT =
      DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

  private static final String[] AVATAR_COLORS = {
    "#2563eb", "#7c3aed", "#0ea5e9", "#059669", "#d97706", "#dc2626"
  };

  private final UserAccountRepository users;
  private final PasswordEncoder passwordEncoder;
  private final DemoSeedGuard demoSeedGuard;
  private final JitAuthProperties jitAuth;
  private final JwtService jwtService;
  private final AccessLogService accessLogs;
  private final DenormalizedLabelSync labelSync;

  public AuthService(
      UserAccountRepository users,
      PasswordEncoder passwordEncoder,
      DemoSeedGuard demoSeedGuard,
      JitAuthProperties jitAuth,
      JwtService jwtService,
      AccessLogService accessLogs,
      DenormalizedLabelSync labelSync) {
    this.users = users;
    this.passwordEncoder = passwordEncoder;
    this.demoSeedGuard = demoSeedGuard;
    this.jitAuth = jitAuth;
    this.jwtService = jwtService;
    this.accessLogs = accessLogs;
    this.labelSync = labelSync;
  }

  @Transactional
  public AuthSessionDto login(String email, String password) {
    String normalizedEmail = normalizeEmail(email);
    if (demoSeedGuard.isBlocked(normalizedEmail)) {
      throw new UnauthorizedException("E-mail ou senha inválidos");
    }

    UserAccount user =
        users
            .findByEmailIgnoreCase(normalizedEmail)
            .orElseThrow(() -> new UnauthorizedException("E-mail ou senha inválidos"));

    assertActive(user);
    assertPasswordAllowed(user);

    if (user.getPasswordHash() == null
        || !passwordEncoder.matches(password, user.getPasswordHash())) {
      throw new UnauthorizedException("E-mail ou senha inválidos");
    }

    touchLastAccess(user);
    accessLogs.record(user.getId(), AccessLogService.ACTION_AUTH_LOGIN, "/api/v1/auth/login");
    return toSession(user, "password");
  }

  @Transactional
  public AuthSessionDto resolveMicrosoftLogin(String email, String name, String microsoftOid) {
    String normalizedEmail = normalizeEmail(email);
    String oid = microsoftOid == null || microsoftOid.isBlank() ? null : microsoftOid.trim();

    if (oid != null) {
      users
          .findByMicrosoftOid(oid)
          .ifPresent(
              existing -> {
                if (!existing.getEmail().equalsIgnoreCase(normalizedEmail)) {
                  throw new ForbiddenException(
                      "Conta não autorizada. Solicite acesso ao administrador.");
                }
              });
    }

    UserAccount user = users.findByEmailIgnoreCase(normalizedEmail).orElse(null);
    if (user == null) {
      if (!jitAuth.isJitProvisioningEnabled()) {
        throw new ForbiddenException(
            "Conta não autorizada. Solicite acesso ao administrador.");
      }
      user = provisionJitUser(normalizedEmail, name, oid);
    } else {
      assertActive(user);
      assertMicrosoftAllowed(user);

      if (name != null && !name.isBlank() && !name.equals(user.getName())) {
        String newName = name.trim();
        user.setName(newName);
        labelSync.syncUserName(user.getId(), newName);
      }
      if (oid != null) {
        user.setMicrosoftOid(oid);
      }
    }

    touchLastAccess(user);
    accessLogs.record(
        user.getId(), AccessLogService.ACTION_AUTH_SSO, "/api/v1/auth/sso/microsoft");
    return toSession(user, "microsoft");
  }

  private UserAccount provisionJitUser(String normalizedEmail, String name, String oid) {
    if (!jitAuth.isDomainAllowed(normalizedEmail)) {
      throw new ForbiddenException("Domínio de e-mail não autorizado para esta organização");
    }

    Role role =
        (users.count() == 0 || jitAuth.isBootstrapAdmin(normalizedEmail))
            ? Role.admin_premium
            : Role.aluno;

    UnitId unitId;
    try {
      unitId = UnitId.valueOf(jitAuth.getDefaultUnitId());
    } catch (IllegalArgumentException ex) {
      unitId = UnitId.matriz;
    }

    String displayName =
        name != null && !name.isBlank()
            ? name.trim()
            : normalizedEmail.split("@")[0];

    UserAccount user = new UserAccount();
    user.setName(displayName);
    user.setEmail(normalizedEmail);
    user.setRole(role);
    user.setUnitId(unitId);
    user.setDepartment("—");
    user.setStatus(UserStatus.ativo);
    user.setLastAccess("—");
    user.setAvatarColor(pickAvatarColor(normalizedEmail));
    user.setAuthProvider(AuthProvider.microsoft);
    if (oid != null) {
      user.setMicrosoftOid(oid);
    }
    return users.save(user);
  }

  private static String pickAvatarColor(String email) {
    int idx = Math.floorMod(email.hashCode(), AVATAR_COLORS.length);
    return AVATAR_COLORS[idx];
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
    return email.trim().toLowerCase(Locale.ROOT);
  }

  private AuthSessionDto toSession(UserAccount user, String provider) {
    return new AuthSessionDto(
        user.getId(),
        user.getEmail(),
        user.getName(),
        user.getRole(),
        user.getUnitId(),
        user.getAvatarColor(),
        provider,
        jwtService.issue(user));
  }
}

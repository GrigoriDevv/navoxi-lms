package com.navoxi.lms.config;

import java.util.Arrays;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JitAuthProperties {

  private final boolean jitProvisioningEnabled;
  private final String defaultUnitId;
  private final Set<String> allowedEmailDomains;
  private final Set<String> bootstrapAdminEmails;

  public JitAuthProperties(
      @Value("${lms.auth.jit-provisioning-enabled:false}") boolean jitProvisioningEnabled,
      @Value("${lms.auth.default-unit-id:matriz}") String defaultUnitId,
      @Value("${lms.auth.allowed-email-domains:}") String allowedEmailDomains,
      @Value("${lms.auth.bootstrap-admin-emails:}") String bootstrapAdminEmails) {
    this.jitProvisioningEnabled = jitProvisioningEnabled;
    this.defaultUnitId = defaultUnitId == null || defaultUnitId.isBlank() ? "matriz" : defaultUnitId.trim();
    this.allowedEmailDomains = parseCsv(allowedEmailDomains);
    this.bootstrapAdminEmails = parseCsv(bootstrapAdminEmails);
  }

  public boolean isJitProvisioningEnabled() {
    return jitProvisioningEnabled;
  }

  public String getDefaultUnitId() {
    return defaultUnitId;
  }

  public Set<String> getAllowedEmailDomains() {
    return allowedEmailDomains;
  }

  public Set<String> getBootstrapAdminEmails() {
    return bootstrapAdminEmails;
  }

  public boolean isDomainAllowed(String email) {
    if (allowedEmailDomains.isEmpty()) {
      return true;
    }
    int at = email.lastIndexOf('@');
    if (at < 0 || at == email.length() - 1) {
      return false;
    }
    String domain = email.substring(at + 1).toLowerCase(Locale.ROOT);
    return allowedEmailDomains.contains(domain);
  }

  public boolean isBootstrapAdmin(String email) {
    return bootstrapAdminEmails.contains(email.toLowerCase(Locale.ROOT));
  }

  private static Set<String> parseCsv(String raw) {
    if (raw == null || raw.isBlank()) {
      return Set.of();
    }
    return Arrays.stream(raw.split(","))
        .map(String::trim)
        .filter(s -> !s.isEmpty())
        .map(s -> s.toLowerCase(Locale.ROOT))
        .collect(Collectors.toUnmodifiableSet());
  }
}

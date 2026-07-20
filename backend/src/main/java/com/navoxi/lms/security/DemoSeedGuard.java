package com.navoxi.lms.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class DemoSeedGuard {

  private final boolean blockSeedLogins;

  public DemoSeedGuard(
      @Value("${lms.demo.block-seed-logins:false}") boolean blockSeedLogins) {
    this.blockSeedLogins = blockSeedLogins;
  }

  public boolean isBlocked(String normalizedEmail) {
    return blockSeedLogins && DemoSeedEmails.isSeedEmail(normalizedEmail);
  }
}

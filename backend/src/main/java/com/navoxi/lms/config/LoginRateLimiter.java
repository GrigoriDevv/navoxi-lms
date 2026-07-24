package com.navoxi.lms.config;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.Ticker;
import com.navoxi.lms.web.ApiExceptionHandler.TooManyRequestsException;
import java.time.Duration;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Locale;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Rate limit in-memory para login/SSO (Caffeine TTL). Adequado a single-instance Railway.
 */
@Component
public class LoginRateLimiter {

  private static final long MAX_TRACKED_KEYS = 50_000L;

  private final boolean enabled;
  private final int maxAttempts;
  private final long windowMs;
  private final Cache<String, Deque<Long>> attemptsByKey;

  public LoginRateLimiter(
      @Value("${lms.auth.login-rate-limit.enabled:true}") boolean enabled,
      @Value("${lms.auth.login-rate-limit.max-attempts:10}") int maxAttempts,
      @Value("${lms.auth.login-rate-limit.window-seconds:60}") int windowSeconds) {
    this(enabled, maxAttempts, windowSeconds, Ticker.systemTicker());
  }

  LoginRateLimiter(boolean enabled, int maxAttempts, int windowSeconds, Ticker ticker) {
    this.enabled = enabled;
    this.maxAttempts = Math.max(1, maxAttempts);
    this.windowMs = Math.max(1, windowSeconds) * 1000L;
    this.attemptsByKey =
        Caffeine.newBuilder()
            .expireAfterAccess(Duration.ofMillis(this.windowMs))
            .maximumSize(MAX_TRACKED_KEYS)
            .ticker(ticker)
            .build();
  }

  public void check(String clientKey, String email) {
    if (!enabled) {
      return;
    }
    long now = System.currentTimeMillis();
    String ipKey = "ip:" + normalize(clientKey, "unknown");
    String emailKey = "email:" + normalize(email, "unknown");
    consume(ipKey, now);
    consume(emailKey, now);
  }

  private void consume(String key, long now) {
    Deque<Long> q = attemptsByKey.get(key, k -> new ArrayDeque<>());
    synchronized (q) {
      while (!q.isEmpty() && now - q.peekFirst() >= windowMs) {
        q.removeFirst();
      }
      if (q.size() >= maxAttempts) {
        throw new TooManyRequestsException(
            "Muitas tentativas de login. Aguarde e tente novamente.");
      }
      q.addLast(now);
    }
  }

  /** Package-private for tests: force Caffeine to apply pending expirations. */
  void cleanUp() {
    attemptsByKey.cleanUp();
  }

  /** Package-private for tests: approximate number of tracked IP/email keys. */
  int trackedKeyCount() {
    return (int) attemptsByKey.estimatedSize();
  }

  private static String normalize(String value, String fallback) {
    if (value == null || value.isBlank()) {
      return fallback;
    }
    return value.trim().toLowerCase(Locale.ROOT);
  }
}

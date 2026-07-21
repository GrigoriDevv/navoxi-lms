package com.navoxi.lms.config;

import com.navoxi.lms.web.ApiExceptionHandler.TooManyRequestsException;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Rate limit in-memory para login/SSO (sem dep extra). Adequado a single-instance Railway.
 */
@Component
public class LoginRateLimiter {

  private final boolean enabled;
  private final int maxAttempts;
  private final long windowMs;
  private final Map<String, Deque<Long>> attemptsByKey = new ConcurrentHashMap<>();

  public LoginRateLimiter(
      @Value("${lms.auth.login-rate-limit.enabled:true}") boolean enabled,
      @Value("${lms.auth.login-rate-limit.max-attempts:10}") int maxAttempts,
      @Value("${lms.auth.login-rate-limit.window-seconds:60}") int windowSeconds) {
    this.enabled = enabled;
    this.maxAttempts = Math.max(1, maxAttempts);
    this.windowMs = Math.max(1, windowSeconds) * 1000L;
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
    Deque<Long> q = attemptsByKey.computeIfAbsent(key, k -> new ArrayDeque<>());
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

  private static String normalize(String value, String fallback) {
    if (value == null || value.isBlank()) {
      return fallback;
    }
    return value.trim().toLowerCase(Locale.ROOT);
  }
}

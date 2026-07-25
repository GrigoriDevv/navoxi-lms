package com.navoxi.lms.config;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.Ticker;
import com.navoxi.lms.web.ApiExceptionHandler.TooManyRequestsException;
import java.time.Duration;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Locale;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Rate limit in-memory para mutações / endpoints sensíveis da API (Caffeine TTL).
 * Adequado a single-instance Railway.
 */
@Component
public class ApiRateLimiter {

  private static final long MAX_TRACKED_KEYS = 50_000L;

  private final boolean enabled;
  private final int maxRequests;
  private final long windowMs;
  private final int windowSeconds;
  private final Cache<String, Deque<Long>> attemptsByKey;

  @Autowired
  public ApiRateLimiter(
      @Value("${lms.api-rate-limit.enabled:true}") boolean enabled,
      @Value("${lms.api-rate-limit.max-requests:60}") int maxRequests,
      @Value("${lms.api-rate-limit.window-seconds:60}") int windowSeconds) {
    this(enabled, maxRequests, windowSeconds, Ticker.systemTicker());
  }

  ApiRateLimiter(boolean enabled, int maxRequests, int windowSeconds, Ticker ticker) {
    this.enabled = enabled;
    this.maxRequests = Math.max(1, maxRequests);
    this.windowSeconds = Math.max(1, windowSeconds);
    this.windowMs = this.windowSeconds * 1000L;
    this.attemptsByKey =
        Caffeine.newBuilder()
            .expireAfterAccess(Duration.ofMillis(this.windowMs))
            .maximumSize(MAX_TRACKED_KEYS)
            .ticker(ticker)
            .build();
  }

  public boolean isEnabled() {
    return enabled;
  }

  public int windowSeconds() {
    return windowSeconds;
  }

  /**
   * Consome uma unidade do bucket para IP e, se informado, para o usuário autenticado.
   *
   * @throws TooManyRequestsException se algum bucket estourar
   */
  public void check(String clientIp, String userId) {
    if (!enabled) {
      return;
    }
    long now = System.currentTimeMillis();
    consume("ip:" + normalize(clientIp, "unknown"), now);
    if (userId != null && !userId.isBlank()) {
      consume("user:" + normalize(userId, "unknown"), now);
    }
  }

  private void consume(String key, long now) {
    Deque<Long> q = attemptsByKey.get(key, k -> new ArrayDeque<>());
    synchronized (q) {
      while (!q.isEmpty() && now - q.peekFirst() >= windowMs) {
        q.removeFirst();
      }
      if (q.size() >= maxRequests) {
        throw new TooManyRequestsException(
            "Muitas requisições. Aguarde e tente novamente.");
      }
      q.addLast(now);
    }
  }

  void cleanUp() {
    attemptsByKey.cleanUp();
  }

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

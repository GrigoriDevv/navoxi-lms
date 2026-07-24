package com.navoxi.lms.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.github.benmanes.caffeine.cache.Ticker;
import com.navoxi.lms.web.ApiExceptionHandler.TooManyRequestsException;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.Test;

class LoginRateLimiterTest {

  @Test
  void allowsWithinLimitThenBlocks() {
    LoginRateLimiter limiter = new LoginRateLimiter(true, 3, 60);
    assertThatCode(() -> limiter.check("1.1.1.1", "a@navoxi.com")).doesNotThrowAnyException();
    assertThatCode(() -> limiter.check("1.1.1.1", "a@navoxi.com")).doesNotThrowAnyException();
    assertThatCode(() -> limiter.check("1.1.1.1", "a@navoxi.com")).doesNotThrowAnyException();
    assertThatThrownBy(() -> limiter.check("1.1.1.1", "a@navoxi.com"))
        .isInstanceOf(TooManyRequestsException.class);
  }

  @Test
  void disabledDoesNotBlock() {
    LoginRateLimiter limiter = new LoginRateLimiter(false, 1, 60);
    for (int i = 0; i < 5; i++) {
      assertThatCode(() -> limiter.check("1.1.1.1", "a@navoxi.com")).doesNotThrowAnyException();
    }
  }

  @Test
  void differentEmailsHaveIndependentCountersForEmailKey() {
    LoginRateLimiter limiter = new LoginRateLimiter(true, 2, 60);
    assertThatCode(() -> limiter.check("9.9.9.9", "one@navoxi.com")).doesNotThrowAnyException();
    assertThatCode(() -> limiter.check("9.9.9.9", "one@navoxi.com")).doesNotThrowAnyException();
    // IP counter already at 2 — next any email from same IP should fail
    assertThatThrownBy(() -> limiter.check("9.9.9.9", "two@navoxi.com"))
        .isInstanceOf(TooManyRequestsException.class);
  }

  @Test
  void expiredKeysAreEvictedFromCache() {
    FakeTicker ticker = new FakeTicker();
    LoginRateLimiter limiter = new LoginRateLimiter(true, 5, 60, ticker);

    assertThatCode(() -> limiter.check("2.2.2.2", "expire@navoxi.com")).doesNotThrowAnyException();
    assertThat(limiter.trackedKeyCount()).isGreaterThan(0);

    ticker.advanceMillis(61_000);
    limiter.cleanUp();

    assertThat(limiter.trackedKeyCount()).isZero();
  }

  @Test
  void afterExpiryCountersResetAndAllowAgain() {
    FakeTicker ticker = new FakeTicker();
    LoginRateLimiter limiter = new LoginRateLimiter(true, 2, 60, ticker);

    assertThatCode(() -> limiter.check("3.3.3.3", "reset@navoxi.com")).doesNotThrowAnyException();
    assertThatCode(() -> limiter.check("3.3.3.3", "reset@navoxi.com")).doesNotThrowAnyException();
    assertThatThrownBy(() -> limiter.check("3.3.3.3", "reset@navoxi.com"))
        .isInstanceOf(TooManyRequestsException.class);

    ticker.advanceMillis(61_000);
    limiter.cleanUp();

    assertThatCode(() -> limiter.check("3.3.3.3", "reset@navoxi.com")).doesNotThrowAnyException();
    assertThatCode(() -> limiter.check("3.3.3.3", "reset@navoxi.com")).doesNotThrowAnyException();
  }

  /** Advances only for Caffeine; wall-clock timestamps in deques stay real-time. */
  private static final class FakeTicker implements Ticker {
    private final AtomicLong nanos = new AtomicLong();

    @Override
    public long read() {
      return nanos.get();
    }

    void advanceMillis(long millis) {
      nanos.addAndGet(millis * 1_000_000L);
    }
  }
}

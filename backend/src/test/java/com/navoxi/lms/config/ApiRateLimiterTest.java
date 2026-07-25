package com.navoxi.lms.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.github.benmanes.caffeine.cache.Ticker;
import com.navoxi.lms.web.ApiExceptionHandler.TooManyRequestsException;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.Test;

class ApiRateLimiterTest {

  @Test
  void allowsWithinLimitThenBlocksOnIp() {
    ApiRateLimiter limiter = new ApiRateLimiter(true, 2, 60);
    assertThatCode(() -> limiter.check("1.1.1.1", "u1")).doesNotThrowAnyException();
    assertThatCode(() -> limiter.check("1.1.1.1", "u1")).doesNotThrowAnyException();
    assertThatThrownBy(() -> limiter.check("1.1.1.1", "u1"))
        .isInstanceOf(TooManyRequestsException.class);
  }

  @Test
  void disabledDoesNotBlock() {
    ApiRateLimiter limiter = new ApiRateLimiter(false, 1, 60);
    for (int i = 0; i < 5; i++) {
      assertThatCode(() -> limiter.check("1.1.1.1", "u1")).doesNotThrowAnyException();
    }
  }

  @Test
  void userBucketIndependentOfOtherUsersSameIpUntilIpHits() {
    ApiRateLimiter limiter = new ApiRateLimiter(true, 2, 60);
    assertThatCode(() -> limiter.check("8.8.8.8", "user-a")).doesNotThrowAnyException();
    assertThatCode(() -> limiter.check("8.8.8.8", "user-a")).doesNotThrowAnyException();
    assertThatThrownBy(() -> limiter.check("8.8.8.8", "user-b"))
        .isInstanceOf(TooManyRequestsException.class);
  }

  @Test
  void afterExpiryCountersReset() {
    FakeTicker ticker = new FakeTicker();
    ApiRateLimiter limiter = new ApiRateLimiter(true, 2, 60, ticker);

    assertThatCode(() -> limiter.check("3.3.3.3", "u-reset")).doesNotThrowAnyException();
    assertThatCode(() -> limiter.check("3.3.3.3", "u-reset")).doesNotThrowAnyException();
    assertThatThrownBy(() -> limiter.check("3.3.3.3", "u-reset"))
        .isInstanceOf(TooManyRequestsException.class);

    ticker.advanceMillis(61_000);
    limiter.cleanUp();

    assertThatCode(() -> limiter.check("3.3.3.3", "u-reset")).doesNotThrowAnyException();
    assertThat(limiter.trackedKeyCount()).isGreaterThan(0);
  }

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

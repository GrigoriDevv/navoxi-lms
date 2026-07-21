package com.navoxi.lms.config;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.navoxi.lms.web.ApiExceptionHandler.TooManyRequestsException;
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
}

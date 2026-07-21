package com.navoxi.lms.web;

import com.navoxi.lms.config.LoginRateLimiter;
import com.navoxi.lms.service.AuthService;
import com.navoxi.lms.web.dto.AuthLoginRequest;
import com.navoxi.lms.web.dto.AuthMicrosoftRequest;
import com.navoxi.lms.web.dto.AuthSessionDto;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

  private final AuthService authService;
  private final LoginRateLimiter loginRateLimiter;

  public AuthController(AuthService authService, LoginRateLimiter loginRateLimiter) {
    this.authService = authService;
    this.loginRateLimiter = loginRateLimiter;
  }

  @PostMapping("/login")
  public AuthSessionDto login(
      @Valid @RequestBody AuthLoginRequest body, HttpServletRequest request) {
    loginRateLimiter.check(clientKey(request), body.email());
    return authService.login(body.email(), body.password());
  }

  @PostMapping("/sso/microsoft")
  public AuthSessionDto microsoft(
      @Valid @RequestBody AuthMicrosoftRequest body, HttpServletRequest request) {
    loginRateLimiter.check(clientKey(request), body.email());
    return authService.resolveMicrosoftLogin(body.email(), body.name(), body.microsoftOid());
  }

  private static String clientKey(HttpServletRequest request) {
    String forwarded = request.getHeader("X-Forwarded-For");
    if (forwarded != null && !forwarded.isBlank()) {
      return forwarded.split(",")[0].trim();
    }
    String remote = request.getRemoteAddr();
    return remote == null ? "unknown" : remote;
  }
}

package com.navoxi.lms.web;

import com.navoxi.lms.service.AuthService;
import com.navoxi.lms.web.dto.AuthLoginRequest;
import com.navoxi.lms.web.dto.AuthMicrosoftRequest;
import com.navoxi.lms.web.dto.AuthSessionDto;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

  private final AuthService authService;

  public AuthController(AuthService authService) {
    this.authService = authService;
  }

  @PostMapping("/login")
  public AuthSessionDto login(@Valid @RequestBody AuthLoginRequest body) {
    return authService.login(body.email(), body.password());
  }

  @PostMapping("/sso/microsoft")
  public AuthSessionDto microsoft(@Valid @RequestBody AuthMicrosoftRequest body) {
    return authService.resolveMicrosoftLogin(body.email(), body.name(), body.microsoftOid());
  }
}

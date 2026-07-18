package com.navoxi.lms.web;

import com.navoxi.lms.domain.entity.UserAccount;
import com.navoxi.lms.web.ApiExceptionHandler.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class CurrentUserResolver {

  public UserAccount require() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth != null && auth.getPrincipal() instanceof UserAccount user) {
      return user;
    }
    throw new UnauthorizedException("Usuário não autenticado");
  }
}

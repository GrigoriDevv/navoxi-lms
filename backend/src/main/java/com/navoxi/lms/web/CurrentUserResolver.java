package com.navoxi.lms.web;

import com.navoxi.lms.domain.entity.UserAccount;
import com.navoxi.lms.repository.UserAccountRepository;
import com.navoxi.lms.web.ApiExceptionHandler.BadRequestException;
import com.navoxi.lms.web.ApiExceptionHandler.NotFoundException;
import org.springframework.stereotype.Component;

@Component
public class CurrentUserResolver {

  private final UserAccountRepository users;

  public CurrentUserResolver(UserAccountRepository users) {
    this.users = users;
  }

  public UserAccount require(String emailHeader) {
    if (emailHeader == null || emailHeader.isBlank()) {
      throw new BadRequestException("Header X-User-Email é obrigatório");
    }
    return users
        .findByEmailIgnoreCase(emailHeader.trim())
        .orElseThrow(() -> new NotFoundException("Usuário não encontrado: " + emailHeader));
  }
}

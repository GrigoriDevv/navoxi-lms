package com.navoxi.lms.service;

import com.navoxi.lms.domain.entity.UserAccount;
import com.navoxi.lms.domain.enums.Role;
import com.navoxi.lms.domain.enums.UnitId;
import com.navoxi.lms.domain.enums.UserStatus;
import com.navoxi.lms.repository.UserAccountRepository;
import com.navoxi.lms.web.ApiExceptionHandler.ForbiddenException;
import com.navoxi.lms.web.ApiExceptionHandler.NotFoundException;
import com.navoxi.lms.web.dto.UserDto;
import com.navoxi.lms.web.dto.UserUpdateRequest;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserAdminService {

  private final UserAccountRepository users;

  public UserAdminService(UserAccountRepository users) {
    this.users = users;
  }

  @Transactional(readOnly = true)
  public List<UserDto> list(UserAccount actor) {
    assertCanManageUsers(actor);
    List<UserAccount> list =
        actor.getRole() == Role.admin_premium
            ? users.findAll()
            : users.findByUnitId(actor.getUnitId());
    return list.stream()
        .sorted(Comparator.comparing(UserAccount::getName, String.CASE_INSENSITIVE_ORDER))
        .map(CourseMapper::toDto)
        .toList();
  }

  @Transactional
  public UserDto update(UserAccount actor, String id, UserUpdateRequest body) {
    assertCanManageUsers(actor);

    UserAccount target =
        users.findById(id).orElseThrow(() -> new NotFoundException("Usuário não encontrado"));

    if (actor.getRole() == Role.admin_unidade) {
      if (target.getUnitId() != actor.getUnitId()) {
        throw new ForbiddenException("Sem permissão para alterar usuários de outra unidade");
      }
      if (body.role() == Role.admin_premium) {
        throw new ForbiddenException("Sem permissão para promover a Administrador Premium");
      }
      if (body.unitId() != null && body.unitId() != actor.getUnitId()) {
        throw new ForbiddenException("Sem permissão para mover usuário para outra unidade");
      }
    }

    if (body.role() != null) {
      target.setRole(body.role());
    }
    if (body.unitId() != null) {
      target.setUnitId(body.unitId());
    }
    if (body.status() != null) {
      target.setStatus(body.status());
    }

    return CourseMapper.toDto(users.save(target));
  }

  private static void assertCanManageUsers(UserAccount actor) {
    if (actor.getRole() != Role.admin_premium && actor.getRole() != Role.admin_unidade) {
      throw new ForbiddenException("Sem permissão");
    }
  }
}

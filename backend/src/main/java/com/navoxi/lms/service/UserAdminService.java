package com.navoxi.lms.service;

import com.navoxi.lms.domain.entity.UserAccount;
import com.navoxi.lms.domain.enums.AuthProvider;
import com.navoxi.lms.domain.enums.Role;
import com.navoxi.lms.domain.enums.UnitId;
import com.navoxi.lms.domain.enums.UserStatus;
import com.navoxi.lms.repository.UserAccountRepository;
import com.navoxi.lms.web.ApiExceptionHandler.BadRequestException;
import com.navoxi.lms.web.ApiExceptionHandler.ConflictException;
import com.navoxi.lms.web.ApiExceptionHandler.ForbiddenException;
import com.navoxi.lms.web.ApiExceptionHandler.NotFoundException;
import com.navoxi.lms.web.dto.UserCreateRequest;
import com.navoxi.lms.web.dto.UserDto;
import com.navoxi.lms.web.dto.UserUpdateRequest;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserAdminService {

  private static final String[] AVATAR_COLORS = {
    "#2563eb", "#7c3aed", "#0ea5e9", "#059669", "#d97706", "#dc2626"
  };

  private final UserAccountRepository users;
  private final PasswordEncoder passwordEncoder;
  private final DenormalizedLabelSync labelSync;

  public UserAdminService(
      UserAccountRepository users,
      PasswordEncoder passwordEncoder,
      DenormalizedLabelSync labelSync) {
    this.users = users;
    this.passwordEncoder = passwordEncoder;
    this.labelSync = labelSync;
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
  public UserDto create(UserAccount actor, UserCreateRequest body) {
    assertCanManageUsers(actor);

    if (body == null) {
      throw new BadRequestException("Corpo da requisição obrigatório");
    }
    String name = requireNonBlank(body.name(), "Nome");
    String email = normalizeEmail(requireNonBlank(body.email(), "E-mail"));
    if (body.role() == null) {
      throw new BadRequestException("Perfil obrigatório");
    }
    if (body.unitId() == null) {
      throw new BadRequestException("Unidade obrigatória");
    }
    String department =
        body.department() == null || body.department().isBlank() ? "—" : body.department().trim();

    AuthProvider provider = body.authProvider() != null ? body.authProvider() : AuthProvider.microsoft;
    assertCreateAllowed(actor, body.role(), body.unitId());

    if (users.findByEmailIgnoreCase(email).isPresent()) {
      throw new ConflictException("E-mail já cadastrado");
    }

    UserAccount user = new UserAccount();
    user.setName(name);
    user.setEmail(email);
    user.setRole(body.role());
    user.setUnitId(body.unitId());
    user.setDepartment(department);
    user.setStatus(UserStatus.ativo);
    user.setLastAccess("—");
    user.setAvatarColor(pickAvatarColor(email));
    user.setAuthProvider(provider);

    if (provider == AuthProvider.local || provider == AuthProvider.both) {
      String password = body.password();
      if (password == null || password.length() < 8) {
        throw new BadRequestException("Senha obrigatória com no mínimo 8 caracteres");
      }
      user.setPasswordHash(passwordEncoder.encode(password));
    }

    return CourseMapper.toDto(users.save(user));
  }

  @Transactional
  public UserDto update(UserAccount actor, String id, UserUpdateRequest body) {
    assertCanManageUsers(actor);

    UserAccount target =
        users.findById(id).orElseThrow(() -> new NotFoundException("Usuário não encontrado"));

    assertCanMutateTarget(actor, target);

    if (body.role() != null) {
      if (actor.getRole() == Role.admin_unidade && body.role() == Role.admin_premium) {
        throw new ForbiddenException("Sem permissão para promover a Administrador Premium");
      }
      target.setRole(body.role());
    }
    if (body.unitId() != null) {
      if (actor.getRole() == Role.admin_unidade && body.unitId() != actor.getUnitId()) {
        throw new ForbiddenException("Sem permissão para mover usuário para outra unidade");
      }
      target.setUnitId(body.unitId());
    }
    if (body.status() != null) {
      target.setStatus(body.status());
    }
    if (body.name() != null) {
      String newName = requireNonBlank(body.name(), "Nome");
      if (!newName.equals(target.getName())) {
        target.setName(newName);
        labelSync.syncUserName(target.getId(), newName);
      }
    }
    if (body.department() != null) {
      String dept = body.department().isBlank() ? "—" : body.department().trim();
      target.setDepartment(dept);
    }

    return CourseMapper.toDto(users.save(target));
  }

  @Transactional
  public UserDto softDelete(UserAccount actor, String id) {
    assertCanManageUsers(actor);

    if (actor.getId().equals(id)) {
      throw new BadRequestException("Não é possível desativar a própria conta");
    }

    UserAccount target =
        users.findById(id).orElseThrow(() -> new NotFoundException("Usuário não encontrado"));

    assertCanMutateTarget(actor, target);

    target.setStatus(UserStatus.inativo);
    return CourseMapper.toDto(users.save(target));
  }

  private void assertCreateAllowed(UserAccount actor, Role role, UnitId unitId) {
    if (actor.getRole() == Role.admin_unidade) {
      if (unitId != actor.getUnitId()) {
        throw new ForbiddenException("Sem permissão para criar usuários em outra unidade");
      }
      if (role == Role.admin_premium) {
        throw new ForbiddenException("Sem permissão para criar Administrador Premium");
      }
    }
  }

  private void assertCanMutateTarget(UserAccount actor, UserAccount target) {
    if (actor.getRole() == Role.admin_unidade && target.getUnitId() != actor.getUnitId()) {
      throw new ForbiddenException("Sem permissão para alterar usuários de outra unidade");
    }
  }

  private static void assertCanManageUsers(UserAccount actor) {
    if (actor.getRole() != Role.admin_premium && actor.getRole() != Role.admin_unidade) {
      throw new ForbiddenException("Sem permissão");
    }
  }

  private static String requireNonBlank(String value, String label) {
    if (value == null || value.isBlank()) {
      throw new BadRequestException(label + " obrigatório");
    }
    return value.trim();
  }

  private static String normalizeEmail(String email) {
    return email.trim().toLowerCase(Locale.ROOT);
  }

  private static String pickAvatarColor(String email) {
    int idx = Math.floorMod(email.hashCode(), AVATAR_COLORS.length);
    return AVATAR_COLORS[idx];
  }
}

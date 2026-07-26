package com.navoxi.lms.service;

import com.navoxi.lms.domain.entity.Permission;
import com.navoxi.lms.domain.enums.Role;
import com.navoxi.lms.repository.PermissionRepository;
import com.navoxi.lms.web.ApiExceptionHandler.BadRequestException;
import com.navoxi.lms.web.ApiExceptionHandler.NotFoundException;
import com.navoxi.lms.web.dto.PermissionDto;
import com.navoxi.lms.web.dto.PermissionRequest;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PermissionService {

  private final PermissionRepository permissions;

  public PermissionService(PermissionRepository permissions) {
    this.permissions = permissions;
  }

  @Transactional(readOnly = true)
  public List<PermissionDto> list() {
    return permissions.findAll().stream().map(PermissionJobMapper::toDto).toList();
  }

  @Transactional(readOnly = true)
  public PermissionDto get(String id) {
    return PermissionJobMapper.toDto(require(id));
  }

  @Transactional
  public PermissionDto update(String id, PermissionRequest req) {
    Permission p = require(id);
    if (req.name() != null) {
      p.setName(req.name());
    }
    if (req.description() != null) {
      p.setDescription(req.description());
    }
    if (req.roles() != null) {
      p.setRoles(parseRoles(req.roles()));
    }
    return PermissionJobMapper.toDto(permissions.save(p));
  }

  Permission require(String id) {
    return permissions
        .findById(id)
        .orElseThrow(() -> new NotFoundException("Permissão não encontrada"));
  }

  static List<Role> parseRoles(List<String> raw) {
    List<Role> roles = new ArrayList<>();
    for (String value : raw) {
      if (value == null || value.isBlank()) {
        throw new BadRequestException("roles não pode conter valor vazio");
      }
      try {
        roles.add(Role.valueOf(value.trim()));
      } catch (IllegalArgumentException e) {
        throw new BadRequestException("Perfil inválido em roles: " + value);
      }
    }
    return roles;
  }
}

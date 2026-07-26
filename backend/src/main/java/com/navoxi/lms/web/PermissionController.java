package com.navoxi.lms.web;

import com.navoxi.lms.service.PermissionService;
import com.navoxi.lms.web.dto.PermissionDto;
import com.navoxi.lms.web.dto.PermissionRequest;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/permissions")
@PreAuthorize("hasRole('admin_premium')")
public class PermissionController {

  private final PermissionService permissions;

  public PermissionController(PermissionService permissions) {
    this.permissions = permissions;
  }

  @GetMapping
  public List<PermissionDto> list() {
    return permissions.list();
  }

  @GetMapping("/{id}")
  public PermissionDto get(@PathVariable String id) {
    return permissions.get(id);
  }

  @PatchMapping("/{id}")
  public PermissionDto update(@PathVariable String id, @RequestBody PermissionRequest request) {
    return permissions.update(id, request);
  }
}

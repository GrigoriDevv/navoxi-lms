package com.navoxi.lms.web;

import com.navoxi.lms.service.UserAdminService;
import com.navoxi.lms.web.dto.UserDto;
import com.navoxi.lms.web.dto.UserUpdateRequest;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
public class AdminUsersController {

  private final CurrentUserResolver currentUser;
  private final UserAdminService userAdmin;

  public AdminUsersController(CurrentUserResolver currentUser, UserAdminService userAdmin) {
    this.currentUser = currentUser;
    this.userAdmin = userAdmin;
  }

  @GetMapping
  @PreAuthorize("hasAnyRole('admin_premium', 'admin_unidade')")
  public List<UserDto> list() {
    return userAdmin.list(currentUser.require());
  }

  @PatchMapping("/{id}")
  @PreAuthorize("hasAnyRole('admin_premium', 'admin_unidade')")
  public UserDto update(@PathVariable String id, @RequestBody UserUpdateRequest body) {
    return userAdmin.update(currentUser.require(), id, body);
  }
}

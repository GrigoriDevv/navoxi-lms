package com.navoxi.lms.service;

import com.navoxi.lms.domain.entity.Permission;
import com.navoxi.lms.domain.entity.ScheduledJob;
import com.navoxi.lms.web.dto.PermissionDto;
import com.navoxi.lms.web.dto.ScheduledJobDto;
import java.util.ArrayList;
import java.util.List;

public final class PermissionJobMapper {

  private PermissionJobMapper() {}

  public static PermissionDto toDto(Permission p) {
    List<com.navoxi.lms.domain.enums.Role> roles =
        p.getRoles() != null ? List.copyOf(p.getRoles()) : List.of();
    return new PermissionDto(p.getId(), p.getName(), p.getDescription(), roles);
  }

  public static ScheduledJobDto toDto(ScheduledJob j) {
    return new ScheduledJobDto(
        j.getId(),
        j.getName(),
        j.getSchedule(),
        j.getModule(),
        j.getAction(),
        Boolean.TRUE.equals(j.getEnabled()),
        j.getLastRun(),
        j.getNextRun());
  }

  static List<com.navoxi.lms.domain.enums.Role> copyRoles(
      List<com.navoxi.lms.domain.enums.Role> roles) {
    return roles != null ? new ArrayList<>(roles) : new ArrayList<>();
  }
}

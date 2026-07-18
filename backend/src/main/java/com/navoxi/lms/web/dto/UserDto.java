package com.navoxi.lms.web.dto;

import com.navoxi.lms.domain.enums.Role;
import com.navoxi.lms.domain.enums.UnitId;
import com.navoxi.lms.domain.enums.UserStatus;

public record UserDto(
    String id,
    String name,
    String email,
    Role role,
    UnitId unitId,
    String department,
    UserStatus status,
    String lastAccess,
    String avatarColor) {}

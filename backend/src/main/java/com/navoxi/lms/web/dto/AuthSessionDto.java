package com.navoxi.lms.web.dto;

import com.navoxi.lms.domain.enums.Role;
import com.navoxi.lms.domain.enums.UnitId;

public record AuthSessionDto(
    String id,
    String email,
    String name,
    Role role,
    UnitId unitId,
    String avatarColor,
    String provider) {}

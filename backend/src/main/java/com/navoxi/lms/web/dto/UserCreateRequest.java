package com.navoxi.lms.web.dto;

import com.navoxi.lms.domain.enums.AuthProvider;
import com.navoxi.lms.domain.enums.Role;
import com.navoxi.lms.domain.enums.UnitId;

public record UserCreateRequest(
    String name,
    String email,
    Role role,
    UnitId unitId,
    String department,
    AuthProvider authProvider,
    String password) {}

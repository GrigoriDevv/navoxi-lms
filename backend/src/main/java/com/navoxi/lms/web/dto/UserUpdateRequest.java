package com.navoxi.lms.web.dto;

import com.navoxi.lms.domain.enums.Role;
import com.navoxi.lms.domain.enums.UnitId;
import com.navoxi.lms.domain.enums.UserStatus;

public record UserUpdateRequest(Role role, UnitId unitId, UserStatus status) {}

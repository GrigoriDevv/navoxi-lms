package com.navoxi.lms.web.dto;

import com.navoxi.lms.domain.enums.Role;
import java.util.List;

public record PermissionDto(String id, String name, String description, List<Role> roles) {}

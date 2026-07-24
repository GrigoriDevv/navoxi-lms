package com.navoxi.lms.web.dto;

import com.navoxi.lms.domain.enums.Role;
import java.util.List;

/** PATCH body. Null fields preserve existing values. */
public record PermissionRequest(String name, String description, List<Role> roles) {}

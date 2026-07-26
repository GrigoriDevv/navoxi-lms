package com.navoxi.lms.web.dto;

import java.util.List;

/** PATCH body. Null fields preserve existing values. Roles são validadas contra o enum Role. */
public record PermissionRequest(String name, String description, List<String> roles) {}

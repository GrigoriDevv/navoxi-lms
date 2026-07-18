package com.navoxi.lms.web.dto;

import com.navoxi.lms.domain.enums.NotificationType;

public record NotificationDto(
    String id,
    String userId,
    String title,
    String message,
    NotificationType type,
    boolean read,
    String timestamp,
    String href,
    String module,
    String details) {}

package com.navoxi.lms.web.dto;

public record ScheduledJobDto(
    String id,
    String name,
    String schedule,
    String module,
    String action,
    boolean enabled,
    String lastRun,
    String nextRun) {}

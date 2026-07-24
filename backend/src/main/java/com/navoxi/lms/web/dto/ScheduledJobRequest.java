package com.navoxi.lms.web.dto;

/** PATCH body. Null fields preserve existing values. */
public record ScheduledJobRequest(
    String name,
    String schedule,
    String module,
    String action,
    Boolean enabled,
    String lastRun,
    String nextRun) {}

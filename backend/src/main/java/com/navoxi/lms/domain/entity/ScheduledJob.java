package com.navoxi.lms.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "scheduled_jobs")
public class ScheduledJob {

  @Id
  @Column(length = 36)
  private String id;

  @Column(nullable = false, length = 255)
  private String name;

  @Column(nullable = false, length = 128)
  private String schedule;

  @Column(nullable = false, length = 128)
  private String module;

  @Column(nullable = false, length = 255)
  private String action;

  @Column(nullable = false)
  private Boolean enabled = true;

  @Column(name = "last_run", length = 64)
  private String lastRun;

  @Column(name = "next_run", length = 64)
  private String nextRun;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  @PrePersist
  void onCreate() {
    if (id == null || id.isBlank()) {
      id = UUID.randomUUID().toString();
    }
    if (enabled == null) {
      enabled = true;
    }
    Instant now = Instant.now();
    createdAt = now;
    updatedAt = now;
  }

  @PreUpdate
  void onUpdate() {
    updatedAt = Instant.now();
  }

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getSchedule() {
    return schedule;
  }

  public void setSchedule(String schedule) {
    this.schedule = schedule;
  }

  public String getModule() {
    return module;
  }

  public void setModule(String module) {
    this.module = module;
  }

  public String getAction() {
    return action;
  }

  public void setAction(String action) {
    this.action = action;
  }

  public Boolean getEnabled() {
    return enabled;
  }

  public void setEnabled(Boolean enabled) {
    this.enabled = enabled;
  }

  public String getLastRun() {
    return lastRun;
  }

  public void setLastRun(String lastRun) {
    this.lastRun = lastRun;
  }

  public String getNextRun() {
    return nextRun;
  }

  public void setNextRun(String nextRun) {
    this.nextRun = nextRun;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public Instant getUpdatedAt() {
    return updatedAt;
  }
}

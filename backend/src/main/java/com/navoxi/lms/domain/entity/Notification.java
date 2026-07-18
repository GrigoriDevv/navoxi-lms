package com.navoxi.lms.domain.entity;

import com.navoxi.lms.domain.enums.NotificationType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "notifications")
public class Notification {

  @Id
  @Column(length = 36)
  private String id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id", nullable = false)
  private UserAccount user;

  @Column(nullable = false)
  private String title;

  @Column(nullable = false, columnDefinition = "TEXT")
  private String message;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 32)
  private NotificationType type;

  @Column(name = "read_flag", nullable = false)
  private boolean readFlag = false;

  @Column(name = "timestamp_label", nullable = false)
  private String timestampLabel;

  @Column
  private String href;

  @Column
  private String module;

  @Column(columnDefinition = "TEXT")
  private String details;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  @PrePersist
  void onCreate() {
    if (id == null || id.isBlank()) {
      id = UUID.randomUUID().toString();
    }
    if (createdAt == null) {
      createdAt = Instant.now();
    }
    if (timestampLabel == null || timestampLabel.isBlank()) {
      timestampLabel = "Agora";
    }
  }

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public UserAccount getUser() {
    return user;
  }

  public void setUser(UserAccount user) {
    this.user = user;
  }

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public String getMessage() {
    return message;
  }

  public void setMessage(String message) {
    this.message = message;
  }

  public NotificationType getType() {
    return type;
  }

  public void setType(NotificationType type) {
    this.type = type;
  }

  public boolean isReadFlag() {
    return readFlag;
  }

  public void setReadFlag(boolean readFlag) {
    this.readFlag = readFlag;
  }

  public String getTimestampLabel() {
    return timestampLabel;
  }

  public void setTimestampLabel(String timestampLabel) {
    this.timestampLabel = timestampLabel;
  }

  public String getHref() {
    return href;
  }

  public void setHref(String href) {
    this.href = href;
  }

  public String getModule() {
    return module;
  }

  public void setModule(String module) {
    this.module = module;
  }

  public String getDetails() {
    return details;
  }

  public void setDetails(String details) {
    this.details = details;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(Instant createdAt) {
    this.createdAt = createdAt;
  }
}

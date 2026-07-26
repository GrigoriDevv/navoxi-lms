package com.navoxi.lms.domain.entity;

import com.navoxi.lms.domain.converter.StringListJsonConverter;
import com.navoxi.lms.domain.enums.QuestionType;
import com.navoxi.lms.domain.enums.UnitId;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "questions")
public class Question {

  @Id
  @Column(length = 36)
  private String id;

  @Column(nullable = false, columnDefinition = "TEXT")
  private String text;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 32)
  private QuestionType type;

  @Column(nullable = false, length = 128)
  private String category;

  @Enumerated(EnumType.STRING)
  @Column(name = "unit_id", nullable = false, length = 32)
  private UnitId unitId;

  @Column(name = "usage_count", nullable = false)
  private Integer usageCount = 0;

  @Convert(converter = StringListJsonConverter.class)
  @Column(name = "options_json", columnDefinition = "TEXT")
  private List<String> options;

  @Column(name = "correct_key", length = 255)
  private String correctKey;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  @PrePersist
  void onCreate() {
    if (id == null || id.isBlank()) {
      id = UUID.randomUUID().toString();
    }
    if (usageCount == null) {
      usageCount = 0;
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

  public String getText() {
    return text;
  }

  public void setText(String text) {
    this.text = text;
  }

  public QuestionType getType() {
    return type;
  }

  public void setType(QuestionType type) {
    this.type = type;
  }

  public String getCategory() {
    return category;
  }

  public void setCategory(String category) {
    this.category = category;
  }

  public UnitId getUnitId() {
    return unitId;
  }

  public void setUnitId(UnitId unitId) {
    this.unitId = unitId;
  }

  public Integer getUsageCount() {
    return usageCount;
  }

  public void setUsageCount(Integer usageCount) {
    this.usageCount = usageCount;
  }

  public List<String> getOptions() {
    return options;
  }

  public void setOptions(List<String> options) {
    this.options = options;
  }

  public String getCorrectKey() {
    return correctKey;
  }

  public void setCorrectKey(String correctKey) {
    this.correctKey = correctKey;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public Instant getUpdatedAt() {
    return updatedAt;
  }
}

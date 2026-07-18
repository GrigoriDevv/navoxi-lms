package com.navoxi.lms.domain.entity;

import com.navoxi.lms.domain.enums.CourseModality;
import com.navoxi.lms.domain.enums.CourseStatus;
import com.navoxi.lms.domain.enums.UnitId;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "courses")
public class Course {

  @Id
  @Column(length = 36)
  private String id;

  @Column(nullable = false)
  private String title;

  @Column(nullable = false)
  private String category;

  @Column(nullable = false)
  private String instructor;

  @Enumerated(EnumType.STRING)
  @Column(name = "unit_id", nullable = false, length = 32)
  private UnitId unitId;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 32)
  private CourseModality modality;

  @Column(nullable = false)
  private String audience;

  @Column(nullable = false)
  private Integer workload;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 32)
  private CourseStatus status;

  @Column(nullable = false)
  private Integer enrolled = 0;

  @Column(nullable = false)
  private Integer completion = 0;

  @Column(nullable = false)
  private String cover;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  @PrePersist
  void onCreate() {
    if (id == null || id.isBlank()) {
      id = UUID.randomUUID().toString();
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

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public String getCategory() {
    return category;
  }

  public void setCategory(String category) {
    this.category = category;
  }

  public String getInstructor() {
    return instructor;
  }

  public void setInstructor(String instructor) {
    this.instructor = instructor;
  }

  public UnitId getUnitId() {
    return unitId;
  }

  public void setUnitId(UnitId unitId) {
    this.unitId = unitId;
  }

  public CourseModality getModality() {
    return modality;
  }

  public void setModality(CourseModality modality) {
    this.modality = modality;
  }

  public String getAudience() {
    return audience;
  }

  public void setAudience(String audience) {
    this.audience = audience;
  }

  public Integer getWorkload() {
    return workload;
  }

  public void setWorkload(Integer workload) {
    this.workload = workload;
  }

  public CourseStatus getStatus() {
    return status;
  }

  public void setStatus(CourseStatus status) {
    this.status = status;
  }

  public Integer getEnrolled() {
    return enrolled;
  }

  public void setEnrolled(Integer enrolled) {
    this.enrolled = enrolled;
  }

  public Integer getCompletion() {
    return completion;
  }

  public void setCompletion(Integer completion) {
    this.completion = completion;
  }

  public String getCover() {
    return cover;
  }

  public void setCover(String cover) {
    this.cover = cover;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public Instant getUpdatedAt() {
    return updatedAt;
  }
}

package com.navoxi.lms.domain.entity;

import com.navoxi.lms.domain.enums.EvaluationStatus;
import com.navoxi.lms.domain.enums.UnitId;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "evaluations")
public class Evaluation {

  @Id
  @Column(length = 36)
  private String id;

  @Column(nullable = false)
  private String name;

  @Column(name = "course_id", nullable = false, length = 36)
  private String courseId;

  @Column(name = "turma_id", length = 36)
  private String turmaId;

  @Enumerated(EnumType.STRING)
  @Column(name = "unit_id", nullable = false, length = 32)
  private UnitId unitId;

  @ElementCollection
  @CollectionTable(
      name = "evaluation_questions",
      joinColumns = @JoinColumn(name = "evaluation_id"))
  @OrderColumn(name = "sort_order")
  @Column(name = "question_id", nullable = false, length = 36)
  private List<String> questionIds = new ArrayList<>();

  @Column(name = "question_count", nullable = false)
  private Integer questionCount = 0;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 32)
  private EvaluationStatus status;

  @Column(name = "due_date", nullable = false, length = 64)
  private String dueDate;

  @Column(name = "applied_at", length = 64)
  private String appliedAt;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  @PrePersist
  void onCreate() {
    if (id == null || id.isBlank()) {
      id = UUID.randomUUID().toString();
    }
    if (questionIds == null) {
      questionIds = new ArrayList<>();
    }
    if (questionCount == null) {
      questionCount = questionIds.size();
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

  public String getCourseId() {
    return courseId;
  }

  public void setCourseId(String courseId) {
    this.courseId = courseId;
  }

  public String getTurmaId() {
    return turmaId;
  }

  public void setTurmaId(String turmaId) {
    this.turmaId = turmaId;
  }

  public UnitId getUnitId() {
    return unitId;
  }

  public void setUnitId(UnitId unitId) {
    this.unitId = unitId;
  }

  public List<String> getQuestionIds() {
    return questionIds;
  }

  public void setQuestionIds(List<String> questionIds) {
    this.questionIds = questionIds != null ? questionIds : new ArrayList<>();
  }

  public Integer getQuestionCount() {
    return questionCount;
  }

  public void setQuestionCount(Integer questionCount) {
    this.questionCount = questionCount;
  }

  public EvaluationStatus getStatus() {
    return status;
  }

  public void setStatus(EvaluationStatus status) {
    this.status = status;
  }

  public String getDueDate() {
    return dueDate;
  }

  public void setDueDate(String dueDate) {
    this.dueDate = dueDate;
  }

  public String getAppliedAt() {
    return appliedAt;
  }

  public void setAppliedAt(String appliedAt) {
    this.appliedAt = appliedAt;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public Instant getUpdatedAt() {
    return updatedAt;
  }
}

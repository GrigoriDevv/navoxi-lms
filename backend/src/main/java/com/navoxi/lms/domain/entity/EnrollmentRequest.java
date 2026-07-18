package com.navoxi.lms.domain.entity;

import com.navoxi.lms.domain.enums.EnrollmentRequestStatus;
import com.navoxi.lms.domain.enums.UnitId;
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
import java.util.UUID;

@Entity
@Table(name = "enrollment_requests")
public class EnrollmentRequest {

  @Id
  @Column(length = 36)
  private String id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id", nullable = false)
  private UserAccount user;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "course_id", nullable = false)
  private Course course;

  @Column(name = "user_name", nullable = false)
  private String userName;

  @Column(name = "course_title", nullable = false)
  private String courseTitle;

  @Column(name = "turma_id")
  private String turmaId;

  @Column(name = "turma_name")
  private String turmaName;

  @Enumerated(EnumType.STRING)
  @Column(name = "unit_id", nullable = false, length = 32)
  private UnitId unitId;

  @Column(name = "requested_at", nullable = false)
  private String requestedAt;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 32)
  private EnrollmentRequestStatus status;

  @Column
  private String reviewer;

  @Column(name = "reviewed_at")
  private String reviewedAt;

  @PrePersist
  void onCreate() {
    if (id == null || id.isBlank()) {
      id = UUID.randomUUID().toString();
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

  public Course getCourse() {
    return course;
  }

  public void setCourse(Course course) {
    this.course = course;
  }

  public String getUserName() {
    return userName;
  }

  public void setUserName(String userName) {
    this.userName = userName;
  }

  public String getCourseTitle() {
    return courseTitle;
  }

  public void setCourseTitle(String courseTitle) {
    this.courseTitle = courseTitle;
  }

  public String getTurmaId() {
    return turmaId;
  }

  public void setTurmaId(String turmaId) {
    this.turmaId = turmaId;
  }

  public String getTurmaName() {
    return turmaName;
  }

  public void setTurmaName(String turmaName) {
    this.turmaName = turmaName;
  }

  public UnitId getUnitId() {
    return unitId;
  }

  public void setUnitId(UnitId unitId) {
    this.unitId = unitId;
  }

  public String getRequestedAt() {
    return requestedAt;
  }

  public void setRequestedAt(String requestedAt) {
    this.requestedAt = requestedAt;
  }

  public EnrollmentRequestStatus getStatus() {
    return status;
  }

  public void setStatus(EnrollmentRequestStatus status) {
    this.status = status;
  }

  public String getReviewer() {
    return reviewer;
  }

  public void setReviewer(String reviewer) {
    this.reviewer = reviewer;
  }

  public String getReviewedAt() {
    return reviewedAt;
  }

  public void setReviewedAt(String reviewedAt) {
    this.reviewedAt = reviewedAt;
  }
}

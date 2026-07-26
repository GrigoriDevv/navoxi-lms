package com.navoxi.lms.domain.entity;

import com.navoxi.lms.domain.enums.CertificateStatus;
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
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "certificates")
public class Certificate {

  @Id
  @Column(length = 36)
  private String id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id", nullable = false)
  private UserAccount user;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "course_id", nullable = false)
  private Course course;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "enrollment_id", nullable = false)
  private Enrollment enrollment;

  @Column(name = "user_name", nullable = false)
  private String userName;

  @Column(name = "course_title", nullable = false)
  private String courseTitle;

  @Enumerated(EnumType.STRING)
  @Column(name = "unit_id", nullable = false, length = 32)
  private UnitId unitId;

  @Column(name = "issued_at", nullable = false)
  private Instant issuedAt;

  @Column(name = "expires_at", nullable = false)
  private Instant expiresAt;

  @Column(name = "validation_hash", nullable = false, unique = true, length = 64)
  private String validationHash;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 32)
  private CertificateStatus status;

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

  public Enrollment getEnrollment() {
    return enrollment;
  }

  public void setEnrollment(Enrollment enrollment) {
    this.enrollment = enrollment;
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

  public UnitId getUnitId() {
    return unitId;
  }

  public void setUnitId(UnitId unitId) {
    this.unitId = unitId;
  }

  public Instant getIssuedAt() {
    return issuedAt;
  }

  public void setIssuedAt(Instant issuedAt) {
    this.issuedAt = issuedAt;
  }

  public Instant getExpiresAt() {
    return expiresAt;
  }

  public void setExpiresAt(Instant expiresAt) {
    this.expiresAt = expiresAt;
  }

  public String getValidationHash() {
    return validationHash;
  }

  public void setValidationHash(String validationHash) {
    this.validationHash = validationHash;
  }

  public CertificateStatus getStatus() {
    return status;
  }

  public void setStatus(CertificateStatus status) {
    this.status = status;
  }
}

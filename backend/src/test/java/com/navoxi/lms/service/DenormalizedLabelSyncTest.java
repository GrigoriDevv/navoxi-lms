package com.navoxi.lms.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.navoxi.lms.domain.entity.Enrollment;
import com.navoxi.lms.domain.entity.EnrollmentRequest;
import com.navoxi.lms.domain.entity.UserAccount;
import com.navoxi.lms.domain.enums.AuthProvider;
import com.navoxi.lms.domain.enums.CourseModality;
import com.navoxi.lms.domain.enums.CourseStatus;
import com.navoxi.lms.domain.enums.EnrollmentRequestStatus;
import com.navoxi.lms.domain.enums.EnrollmentStatus;
import com.navoxi.lms.domain.enums.Role;
import com.navoxi.lms.domain.enums.UnitId;
import com.navoxi.lms.domain.enums.UserStatus;
import com.navoxi.lms.repository.CourseRepository;
import com.navoxi.lms.repository.EnrollmentRepository;
import com.navoxi.lms.repository.EnrollmentRequestRepository;
import com.navoxi.lms.repository.UserAccountRepository;
import com.navoxi.lms.web.dto.CourseRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest(
    properties = {
      "spring.datasource.url=jdbc:h2:mem:lms-label-sync;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE",
      "lms.seed.enabled=false"
    })
@ActiveProfiles("local")
@Transactional
class DenormalizedLabelSyncTest {

  @Autowired private CourseService courseService;
  @Autowired private AuthService authService;
  @Autowired private UserAccountRepository users;
  @Autowired private CourseRepository courses;
  @Autowired private EnrollmentRepository enrollments;
  @Autowired private EnrollmentRequestRepository enrollmentRequests;
  @Autowired private PasswordEncoder passwordEncoder;

  private UserAccount admin;
  private UserAccount aluno;
  private String courseId;

  @BeforeEach
  void seed() {
    enrollmentRequests.deleteAll();
    enrollments.deleteAll();
    courses.deleteAll();
    users.deleteAll();

    admin = saveUser("u-admin-sync", "Admin Sync", "admin.sync@navoxi.com", Role.admin_premium);
    aluno = saveUser("u-aluno-sync", "Aluno Sync", "aluno.sync@navoxi.com", Role.aluno);
    aluno.setAuthProvider(AuthProvider.both);
    users.save(aluno);

    courseId =
        courseService
            .create(
                admin,
                new CourseRequest(
                    "Título Antigo",
                    "TI",
                    "Instrutor",
                    UnitId.matriz,
                    CourseModality.online,
                    "Todos",
                    4,
                    CourseStatus.publicado,
                    "#2563eb"))
            .id();

    Enrollment e = new Enrollment();
    e.setId("enr-sync-1");
    e.setUser(aluno);
    e.setCourse(courses.findById(courseId).orElseThrow());
    e.setUserName(aluno.getName());
    e.setCourseTitle("Título Antigo");
    e.setUnitId(UnitId.matriz);
    e.setEnrolledAt("2026-06-01 10:00");
    e.setProgress(0);
    e.setStatus(EnrollmentStatus.ativa);
    enrollments.save(e);

    EnrollmentRequest r = new EnrollmentRequest();
    r.setId("req-sync-1");
    r.setUser(aluno);
    r.setCourse(courses.findById(courseId).orElseThrow());
    r.setUserName(aluno.getName());
    r.setCourseTitle("Título Antigo");
    r.setUnitId(UnitId.matriz);
    r.setRequestedAt("2026-06-02 10:00");
    r.setStatus(EnrollmentRequestStatus.pendente);
    enrollmentRequests.save(r);
  }

  @Test
  void courseTitleUpdateSyncsEnrollmentAndRequest() {
    courseService.update(
        admin,
        courseId,
        new CourseRequest(
            "Título Novo",
            "TI",
            "Instrutor",
            UnitId.matriz,
            CourseModality.online,
            "Todos",
            4,
            CourseStatus.publicado,
            "#2563eb"));

    assertThat(enrollments.findById("enr-sync-1").orElseThrow().getCourseTitle())
        .isEqualTo("Título Novo");
    assertThat(enrollmentRequests.findById("req-sync-1").orElseThrow().getCourseTitle())
        .isEqualTo("Título Novo");
  }

  @Test
  void ssoNameChangeSyncsEnrollmentAndRequest() {
    authService.resolveMicrosoftLogin("aluno.sync@navoxi.com", "Aluno Renomeado", "oid-sync-1");

    assertThat(users.findById("u-aluno-sync").orElseThrow().getName()).isEqualTo("Aluno Renomeado");
    assertThat(enrollments.findById("enr-sync-1").orElseThrow().getUserName())
        .isEqualTo("Aluno Renomeado");
    assertThat(enrollmentRequests.findById("req-sync-1").orElseThrow().getUserName())
        .isEqualTo("Aluno Renomeado");
  }

  private UserAccount saveUser(String id, String name, String email, Role role) {
    UserAccount u = new UserAccount();
    u.setId(id);
    u.setName(name);
    u.setEmail(email);
    u.setRole(role);
    u.setUnitId(UnitId.matriz);
    u.setDepartment("QA");
    u.setStatus(UserStatus.ativo);
    u.setLastAccess("—");
    u.setAvatarColor("#2563eb");
    u.setAuthProvider(AuthProvider.both);
    u.setPasswordHash(passwordEncoder.encode("secret123"));
    return users.save(u);
  }
}

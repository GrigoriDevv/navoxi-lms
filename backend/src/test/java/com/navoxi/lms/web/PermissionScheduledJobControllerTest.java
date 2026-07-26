package com.navoxi.lms.web;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.navoxi.lms.domain.entity.Permission;
import com.navoxi.lms.domain.entity.ScheduledJob;
import com.navoxi.lms.domain.enums.Role;
import com.navoxi.lms.repository.PermissionRepository;
import com.navoxi.lms.repository.ScheduledJobRepository;
import com.navoxi.lms.repository.UserAccountRepository;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest(
    properties = {
      "spring.datasource.url=jdbc:h2:mem:lms-permissions-jobs;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE",
      "lms.seed.enabled=false"
    })
@AutoConfigureMockMvc
@ActiveProfiles("local")
@Transactional
class PermissionScheduledJobControllerTest {

  @Autowired private MockMvc mockMvc;
  @Autowired private ObjectMapper objectMapper;
  @Autowired private UserAccountRepository users;
  @Autowired private PermissionRepository permissions;
  @Autowired private ScheduledJobRepository jobs;
  @Autowired private PasswordEncoder passwordEncoder;

  private String alunoJwt;
  private String adminJwt;
  private String unitAdminJwt;

  @BeforeEach
  void seed() throws Exception {
    jobs.deleteAll();
    permissions.deleteAll();
    users.deleteAll();

    LearningTestFixtures.saveUser(
        users, passwordEncoder, "u-aluno", "aluno@navoxi.com", Role.aluno, "secret123");
    LearningTestFixtures.saveUser(
        users, passwordEncoder, "u-admin", "admin@navoxi.com", Role.admin_premium, "secret123");
    LearningTestFixtures.saveUser(
        users,
        passwordEncoder,
        "u-ne",
        "admin.ne@navoxi.com",
        Role.admin_unidade,
        "secret123");

    Permission p = new Permission();
    p.setId("p-test");
    p.setName("Publicar cursos");
    p.setDescription("Publicar e arquivar");
    p.setRoles(new ArrayList<>(List.of(Role.admin_premium, Role.instrutor)));
    permissions.save(p);

    ScheduledJob j = new ScheduledJob();
    j.setId("sj-test");
    j.setName("Lembretes");
    j.setSchedule("Diário · 08:00");
    j.setModule("Aprendizagem");
    j.setAction("Notificar");
    j.setEnabled(true);
    j.setLastRun("2026-06-12 08:00");
    j.setNextRun("2026-06-13 08:00");
    jobs.save(j);

    alunoJwt =
        AuthTestSupport.loginAccessToken(mockMvc, objectMapper, "aluno@navoxi.com", "secret123");
    adminJwt =
        AuthTestSupport.loginAccessToken(mockMvc, objectMapper, "admin@navoxi.com", "secret123");
    unitAdminJwt =
        AuthTestSupport.loginAccessToken(
            mockMvc, objectMapper, "admin.ne@navoxi.com", "secret123");
  }

  @Test
  void listPermissionsRequiresAuth() throws Exception {
    mockMvc.perform(get("/api/v1/permissions")).andExpect(status().isUnauthorized());
  }

  @Test
  void listPermissionsForbiddenForAluno() throws Exception {
    mockMvc
        .perform(get("/api/v1/permissions").header("Authorization", "Bearer " + alunoJwt))
        .andExpect(status().isForbidden());
  }

  @Test
  void listAndPatchPermissionsForAdmin() throws Exception {
    mockMvc
        .perform(get("/api/v1/permissions").header("Authorization", "Bearer " + adminJwt))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(1))
        .andExpect(jsonPath("$[0].id").value("p-test"));

    mockMvc
        .perform(get("/api/v1/permissions/p-test").header("Authorization", "Bearer " + adminJwt))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.name").value("Publicar cursos"));

    mockMvc
        .perform(
            patch("/api/v1/permissions/p-test")
                .header("Authorization", "Bearer " + adminJwt)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    { "roles": ["admin_premium", "admin_unidade", "gestor_conteudo"] }
                    """))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.roles.length()").value(3))
        .andExpect(jsonPath("$.roles[0]").value("admin_premium"))
        .andExpect(jsonPath("$.name").value("Publicar cursos"));
  }

  @Test
  void patchPermissionForbiddenForAluno() throws Exception {
    mockMvc
        .perform(
            patch("/api/v1/permissions/p-test")
                .header("Authorization", "Bearer " + alunoJwt)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    { "roles": ["aluno"] }
                    """))
        .andExpect(status().isForbidden());
  }

  /** Config global é exclusiva de admin_premium: as telas `/identidade` e `/configuracoes` também. */
  @Test
  void platformConfigForbiddenForUnitAdmin() throws Exception {
    mockMvc
        .perform(get("/api/v1/permissions").header("Authorization", "Bearer " + unitAdminJwt))
        .andExpect(status().isForbidden());

    mockMvc
        .perform(
            patch("/api/v1/scheduled-jobs/sj-test")
                .header("Authorization", "Bearer " + unitAdminJwt)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    { "enabled": false }
                    """))
        .andExpect(status().isForbidden());
  }

  @Test
  void patchPermissionRejectsUnknownRole() throws Exception {
    mockMvc
        .perform(
            patch("/api/v1/permissions/p-test")
                .header("Authorization", "Bearer " + adminJwt)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    { "roles": ["admin_premium", "super_root"] }
                    """))
        .andExpect(status().isBadRequest());
  }

  @Test
  void listScheduledJobsForbiddenForAluno() throws Exception {
    mockMvc
        .perform(get("/api/v1/scheduled-jobs").header("Authorization", "Bearer " + alunoJwt))
        .andExpect(status().isForbidden());
  }

  @Test
  void listAndPatchScheduledJobPreservesOmittedFields() throws Exception {
    mockMvc
        .perform(get("/api/v1/scheduled-jobs").header("Authorization", "Bearer " + adminJwt))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(1))
        .andExpect(jsonPath("$[0].id").value("sj-test"));

    mockMvc
        .perform(
            patch("/api/v1/scheduled-jobs/sj-test")
                .header("Authorization", "Bearer " + adminJwt)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    { "enabled": false }
                    """))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.enabled").value(false))
        .andExpect(jsonPath("$.schedule").value("Diário · 08:00"))
        .andExpect(jsonPath("$.name").value("Lembretes"))
        .andExpect(jsonPath("$.module").value("Aprendizagem"));

    mockMvc
        .perform(
            patch("/api/v1/scheduled-jobs/sj-test")
                .header("Authorization", "Bearer " + adminJwt)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    { "schedule": "Diário · 09:00" }
                    """))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.schedule").value("Diário · 09:00"))
        .andExpect(jsonPath("$.enabled").value(false))
        .andExpect(jsonPath("$.action").value("Notificar"));
  }
}

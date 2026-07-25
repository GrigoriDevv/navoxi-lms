package com.navoxi.lms.web;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.navoxi.lms.domain.entity.UserAccount;
import com.navoxi.lms.domain.enums.AuthProvider;
import com.navoxi.lms.domain.enums.Role;
import com.navoxi.lms.domain.enums.UnitId;
import com.navoxi.lms.domain.enums.UserStatus;
import com.navoxi.lms.repository.UserAccountRepository;
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
      "spring.datasource.url=jdbc:h2:mem:lms-admin-users;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE",
      "lms.seed.enabled=false"
    })
@AutoConfigureMockMvc
@ActiveProfiles("local")
@Transactional
class AdminUsersControllerTest {

  @Autowired private MockMvc mockMvc;
  @Autowired private UserAccountRepository users;
  @Autowired private PasswordEncoder passwordEncoder;
  @Autowired private ObjectMapper objectMapper;

  private String alunoId;
  private String adminJwt;

  @BeforeEach
  void seed() throws Exception {
    users.deleteAll();
    UserAccount admin = new UserAccount();
    admin.setId("u-admin");
    admin.setName("Admin");
    admin.setEmail("admin@navoxi.com");
    admin.setRole(Role.admin_premium);
    admin.setUnitId(UnitId.matriz);
    admin.setDepartment("TI");
    admin.setStatus(UserStatus.ativo);
    admin.setLastAccess("—");
    admin.setAvatarColor("#2563eb");
    admin.setAuthProvider(AuthProvider.both);
    admin.setPasswordHash(passwordEncoder.encode("secret123"));
    users.save(admin);

    UserAccount aluno = new UserAccount();
    aluno.setId("u-aluno");
    aluno.setName("Aluno");
    aluno.setEmail("aluno@navoxi.com");
    aluno.setRole(Role.aluno);
    aluno.setUnitId(UnitId.matriz);
    aluno.setDepartment("Ops");
    aluno.setStatus(UserStatus.ativo);
    aluno.setLastAccess("—");
    aluno.setAvatarColor("#0ea5e9");
    aluno.setAuthProvider(AuthProvider.both);
    aluno.setPasswordHash(passwordEncoder.encode("secret123"));
    users.save(aluno);
    alunoId = aluno.getId();

    adminJwt =
        AuthTestSupport.loginAccessToken(mockMvc, objectMapper, "admin@navoxi.com", "secret123");
  }

  @Test
  void listUsersAsAdmin() throws Exception {
    mockMvc
        .perform(get("/api/v1/users").header("Authorization", "Bearer " + adminJwt))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].email").exists());
  }

  @Test
  void patchRoleAsAdmin() throws Exception {
    mockMvc
        .perform(
            patch("/api/v1/users/" + alunoId)
                .header("Authorization", "Bearer " + adminJwt)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"role\":\"instrutor\"}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.role").value("instrutor"));
  }

  @Test
  void patchNameAsAdmin() throws Exception {
    mockMvc
        .perform(
            patch("/api/v1/users/" + alunoId)
                .header("Authorization", "Bearer " + adminJwt)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Aluno Renomeado\",\"department\":\"RH\"}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.name").value("Aluno Renomeado"))
        .andExpect(jsonPath("$.department").value("RH"));
  }

  @Test
  void createUserAsAdmin() throws Exception {
    mockMvc
        .perform(
            post("/api/v1/users")
                .header("Authorization", "Bearer " + adminJwt)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "name": "Novo Instrutor",
                      "email": "instrutor.novo@navoxi.com",
                      "role": "instrutor",
                      "unitId": "matriz",
                      "department": "TI",
                      "authProvider": "microsoft"
                    }
                    """))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.email").value("instrutor.novo@navoxi.com"))
        .andExpect(jsonPath("$.role").value("instrutor"))
        .andExpect(jsonPath("$.status").value("ativo"));
  }

  @Test
  void createDuplicateEmailConflicts() throws Exception {
    mockMvc
        .perform(
            post("/api/v1/users")
                .header("Authorization", "Bearer " + adminJwt)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "name": "Dup",
                      "email": "aluno@navoxi.com",
                      "role": "aluno",
                      "unitId": "matriz",
                      "department": "Ops"
                    }
                    """))
        .andExpect(status().isConflict());
  }

  @Test
  void createForbiddenForAluno() throws Exception {
    String alunoJwt =
        AuthTestSupport.loginAccessToken(mockMvc, objectMapper, "aluno@navoxi.com", "secret123");
    mockMvc
        .perform(
            post("/api/v1/users")
                .header("Authorization", "Bearer " + alunoJwt)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "name": "X",
                      "email": "x@navoxi.com",
                      "role": "aluno",
                      "unitId": "matriz",
                      "department": "Ops"
                    }
                    """))
        .andExpect(status().isForbidden());
  }

  @Test
  void softDeleteAsAdmin() throws Exception {
    mockMvc
        .perform(
            delete("/api/v1/users/" + alunoId).header("Authorization", "Bearer " + adminJwt))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("inativo"));
  }

  @Test
  void softDeleteSelfRejected() throws Exception {
    mockMvc
        .perform(delete("/api/v1/users/u-admin").header("Authorization", "Bearer " + adminJwt))
        .andExpect(status().isBadRequest());
  }

  @Test
  void listForbiddenForAluno() throws Exception {
    String alunoJwt =
        AuthTestSupport.loginAccessToken(mockMvc, objectMapper, "aluno@navoxi.com", "secret123");
    mockMvc
        .perform(get("/api/v1/users").header("Authorization", "Bearer " + alunoJwt))
        .andExpect(status().isForbidden());
  }
}

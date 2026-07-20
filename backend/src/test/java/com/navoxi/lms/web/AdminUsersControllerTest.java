package com.navoxi.lms.web;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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

  private String alunoId;

  @BeforeEach
  void seed() {
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
    aluno.setAuthProvider(AuthProvider.microsoft);
    users.save(aluno);
    alunoId = aluno.getId();
  }

  @Test
  void listUsersAsAdmin() throws Exception {
    mockMvc
        .perform(
            get("/api/v1/users")
                .header("Authorization", "Bearer local-dev-token")
                .header("X-User-Email", "admin@navoxi.com"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].email").exists());
  }

  @Test
  void patchRoleAsAdmin() throws Exception {
    mockMvc
        .perform(
            patch("/api/v1/users/" + alunoId)
                .header("Authorization", "Bearer local-dev-token")
                .header("X-User-Email", "admin@navoxi.com")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"role\":\"instrutor\"}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.role").value("instrutor"));
  }

  @Test
  void listForbiddenForAluno() throws Exception {
    mockMvc
        .perform(
            get("/api/v1/users")
                .header("Authorization", "Bearer local-dev-token")
                .header("X-User-Email", "aluno@navoxi.com"))
        .andExpect(status().isForbidden());
  }
}

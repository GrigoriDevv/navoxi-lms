package com.navoxi.lms.web;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.navoxi.lms.domain.entity.AccessLog;
import com.navoxi.lms.domain.entity.UserAccount;
import com.navoxi.lms.domain.enums.AuthProvider;
import com.navoxi.lms.domain.enums.Role;
import com.navoxi.lms.domain.enums.UnitId;
import com.navoxi.lms.domain.enums.UserStatus;
import com.navoxi.lms.repository.AccessLogRepository;
import com.navoxi.lms.repository.UserAccountRepository;
import com.navoxi.lms.service.AccessLogService;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest(
    properties = {
      "spring.datasource.url=jdbc:h2:mem:lms-lgpd;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE",
      "lms.seed.enabled=false"
    })
@AutoConfigureMockMvc
@ActiveProfiles("local")
@Transactional
class UserPrivacyControllerTest {

  @Autowired private MockMvc mockMvc;
  @Autowired private ObjectMapper objectMapper;
  @Autowired private UserAccountRepository users;
  @Autowired private AccessLogRepository accessLogs;
  @Autowired private PasswordEncoder passwordEncoder;

  private String jwt;

  @BeforeEach
  void seed() throws Exception {
    users.deleteAll();
    accessLogs.deleteAll();

    UserAccount aluno = new UserAccount();
    aluno.setId("u-lgpd-aluno");
    aluno.setName("Aluno LGPD");
    aluno.setEmail("lgpd.aluno@navoxi.com");
    aluno.setRole(Role.aluno);
    aluno.setUnitId(UnitId.matriz);
    aluno.setDepartment("RH");
    aluno.setStatus(UserStatus.ativo);
    aluno.setLastAccess("—");
    aluno.setAvatarColor("#2563eb");
    aluno.setAuthProvider(AuthProvider.local);
    aluno.setPasswordHash(passwordEncoder.encode("demo1234"));
    users.save(aluno);

    jwt = AuthTestSupport.loginAccessToken(mockMvc, objectMapper, "lgpd.aluno@navoxi.com", "demo1234");
  }

  @Test
  void exportReturnsOwnPersonalData() throws Exception {
    mockMvc
        .perform(get("/api/v1/users/me/export").header("Authorization", "Bearer " + jwt))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.profile.email").value("lgpd.aluno@navoxi.com"))
        .andExpect(jsonPath("$.profile.name").value("Aluno LGPD"))
        .andExpect(jsonPath("$.enrollments").isArray())
        .andExpect(jsonPath("$.progress").isArray())
        .andExpect(jsonPath("$.exportedAt").isNotEmpty());

    List<AccessLog> logs = accessLogs.findByUserIdOrderByCreatedAtDesc("u-lgpd-aluno");
    assertThat(logs.stream().map(AccessLog::getAction))
        .contains(AccessLogService.ACTION_USERS_EXPORT, AccessLogService.ACTION_AUTH_LOGIN);
  }

  @Test
  void deleteAnonymizesAndBlocksFurtherAccess() throws Exception {
    mockMvc
        .perform(delete("/api/v1/users/me").header("Authorization", "Bearer " + jwt))
        .andExpect(status().isNoContent());

    UserAccount erased = users.findById("u-lgpd-aluno").orElseThrow();
    assertThat(erased.getStatus()).isEqualTo(UserStatus.inativo);
    assertThat(erased.getName()).isEqualTo("Usuário removido");
    assertThat(erased.getEmail()).isEqualTo("deleted-u-lgpd-aluno@deleted.local");
    assertThat(erased.getPasswordHash()).isNull();
    assertThat(erased.getMicrosoftOid()).isNull();

    mockMvc
        .perform(get("/api/v1/users/me").header("Authorization", "Bearer " + jwt))
        .andExpect(status().isUnauthorized());

    assertThat(
            accessLogs.findByUserIdOrderByCreatedAtDesc("u-lgpd-aluno").stream()
                .map(AccessLog::getAction))
        .contains(AccessLogService.ACTION_USERS_DELETE);
  }

  @Test
  void exportRequiresUserJwt() throws Exception {
    mockMvc
        .perform(
            get("/api/v1/users/me/export").header("Authorization", "Bearer local-dev-token"))
        .andExpect(status().isUnauthorized());
  }
}

package com.navoxi.lms.web;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
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
      "spring.datasource.url=jdbc:h2:mem:lms-api-rate;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE",
      "lms.seed.enabled=false",
      "lms.api-rate-limit.enabled=true",
      "lms.api-rate-limit.max-requests=2",
      "lms.api-rate-limit.window-seconds=60"
    })
@AutoConfigureMockMvc
@ActiveProfiles("local")
@Transactional
class ApiRateLimitFilterTest {

  @Autowired private MockMvc mockMvc;
  @Autowired private UserAccountRepository users;
  @Autowired private PasswordEncoder passwordEncoder;
  @Autowired private ObjectMapper objectMapper;

  private String adminJwt;

  @BeforeEach
  void seed() throws Exception {
    users.deleteAll();
    UserAccount admin = new UserAccount();
    admin.setId("u-admin-rl");
    admin.setName("Admin RL");
    admin.setEmail("admin.rl@navoxi.com");
    admin.setRole(Role.admin_premium);
    admin.setUnitId(UnitId.matriz);
    admin.setDepartment("TI");
    admin.setStatus(UserStatus.ativo);
    admin.setLastAccess("—");
    admin.setAvatarColor("#2563eb");
    admin.setAuthProvider(AuthProvider.both);
    admin.setPasswordHash(passwordEncoder.encode("secret123"));
    users.save(admin);

    adminJwt =
        AuthTestSupport.loginAccessToken(mockMvc, objectMapper, "admin.rl@navoxi.com", "secret123");
  }

  @Test
  void mutatingEndpointReturns429AfterMax() throws Exception {
    String bodyTemplate =
        """
        {
          "name": "User %d",
          "email": "user%d@navoxi.com",
          "role": "aluno",
          "unitId": "matriz",
          "department": "Ops",
          "authProvider": "microsoft"
        }
        """;

    for (int i = 0; i < 2; i++) {
      mockMvc
          .perform(
              post("/api/v1/users")
                  .header("Authorization", "Bearer " + adminJwt)
                  .contentType(MediaType.APPLICATION_JSON)
                  .content(bodyTemplate.formatted(i, i)))
          .andExpect(status().isCreated());
    }

    mockMvc
        .perform(
            post("/api/v1/users")
                .header("Authorization", "Bearer " + adminJwt)
                .contentType(MediaType.APPLICATION_JSON)
                .content(bodyTemplate.formatted(99, 99)))
        .andExpect(status().isTooManyRequests())
        .andExpect(header().string("Retry-After", "60"));
  }

  @Test
  void healthIsNotRateLimited() throws Exception {
    for (int i = 0; i < 5; i++) {
      mockMvc.perform(get("/api/v1/health")).andExpect(status().isOk());
    }
  }
}

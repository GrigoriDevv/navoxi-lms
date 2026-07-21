package com.navoxi.lms.web;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
      "lms.auth.login-rate-limit.enabled=true",
      "lms.auth.login-rate-limit.max-attempts=2",
      "lms.auth.login-rate-limit.window-seconds=60"
    })
@AutoConfigureMockMvc
@ActiveProfiles("local")
@Transactional
class AuthControllerRateLimitTest {

  @Autowired private MockMvc mockMvc;

  @Test
  void loginReturns429AfterMaxAttempts() throws Exception {
    String body = "{\"email\":\"nobody@navoxi.com\",\"password\":\"wrong\"}";
    for (int i = 0; i < 2; i++) {
      mockMvc
          .perform(
              post("/api/v1/auth/login")
                  .header("Authorization", "Bearer local-dev-token")
                  .contentType(MediaType.APPLICATION_JSON)
                  .content(body))
          .andExpect(status().isUnauthorized());
    }
    mockMvc
        .perform(
            post("/api/v1/auth/login")
                .header("Authorization", "Bearer local-dev-token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
        .andExpect(status().isTooManyRequests());
  }
}

package com.navoxi.lms.web;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
@Transactional
class AuthControllerTest {

  @Autowired private MockMvc mockMvc;
  @Autowired private ObjectMapper objectMapper;

  @Test
  void loginEndpointRequiresApiToken() throws Exception {
    mockMvc
        .perform(
            post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"diego.alves@navoxi.com\",\"password\":\"demo1234\"}"))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void loginEndpointWithTokenReturnsJwt() throws Exception {
    mockMvc
        .perform(
            post("/api/v1/auth/login")
                .header("Authorization", "Bearer local-dev-token")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"diego.alves@navoxi.com\",\"password\":\"demo1234\"}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.email").value("diego.alves@navoxi.com"))
        .andExpect(jsonPath("$.provider").value("password"))
        .andExpect(jsonPath("$.accessToken").isString());
  }

  @Test
  void usersMeRequiresUserJwtNotApiToken() throws Exception {
    mockMvc
        .perform(
            get("/api/v1/users/me")
                .header("Authorization", "Bearer local-dev-token")
                .header("X-User-Email", "diego.alves@navoxi.com"))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void usersMeWithUserJwt() throws Exception {
    String jwt =
        AuthTestSupport.loginAccessToken(
            mockMvc, objectMapper, "diego.alves@navoxi.com", "demo1234");
    mockMvc
        .perform(get("/api/v1/users/me").header("Authorization", "Bearer " + jwt))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.email").value("diego.alves@navoxi.com"));
  }
}

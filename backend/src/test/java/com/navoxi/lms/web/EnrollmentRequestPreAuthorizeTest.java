package com.navoxi.lms.web;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.navoxi.lms.domain.enums.Role;
import com.navoxi.lms.repository.CourseRepository;
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
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest(
    properties = {
      "spring.datasource.url=jdbc:h2:mem:lms-enroll-req;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE",
      "lms.seed.enabled=false"
    })
@AutoConfigureMockMvc
@ActiveProfiles("local")
@Transactional
class EnrollmentRequestPreAuthorizeTest {

  @Autowired private MockMvc mockMvc;
  @Autowired private ObjectMapper objectMapper;
  @Autowired private UserAccountRepository users;
  @Autowired private CourseRepository courses;
  @Autowired private PasswordEncoder passwordEncoder;

  private String alunoJwt;
  private String adminJwt;
  private String requestId;

  @BeforeEach
  void seed() throws Exception {
    users.deleteAll();
    courses.deleteAll();
    LearningTestFixtures.saveUser(
        users, passwordEncoder, "u-aluno", "aluno@navoxi.com", Role.aluno, "secret123");
    LearningTestFixtures.saveUser(
        users, passwordEncoder, "u-admin", "admin@navoxi.com", Role.admin_premium, "secret123");
    String courseId =
        LearningTestFixtures.saveCourse(courses, "c-req", "Curso Solicitação").getId();

    alunoJwt =
        AuthTestSupport.loginAccessToken(mockMvc, objectMapper, "aluno@navoxi.com", "secret123");
    adminJwt =
        AuthTestSupport.loginAccessToken(mockMvc, objectMapper, "admin@navoxi.com", "secret123");

    MvcResult created =
        mockMvc
            .perform(
                post("/api/v1/enrollment-requests")
                    .header("Authorization", "Bearer " + alunoJwt)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"courseId\":\"" + courseId + "\"}"))
            .andExpect(status().isCreated())
            .andReturn();
    JsonNode node = objectMapper.readTree(created.getResponse().getContentAsString());
    requestId = node.get("id").asText();
  }

  @Test
  void decideForbiddenForAluno() throws Exception {
    mockMvc
        .perform(
            post("/api/v1/enrollment-requests/" + requestId + "/decision")
                .header("Authorization", "Bearer " + alunoJwt)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"status\":\"aprovada\"}"))
        .andExpect(status().isForbidden());
  }

  @Test
  void decideAllowedForAdmin() throws Exception {
    mockMvc
        .perform(
            post("/api/v1/enrollment-requests/" + requestId + "/decision")
                .header("Authorization", "Bearer " + adminJwt)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"status\":\"aprovada\"}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("aprovada"));
  }
}

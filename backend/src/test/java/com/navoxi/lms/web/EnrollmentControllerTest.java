package com.navoxi.lms.web;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest(
    properties = {
      "spring.datasource.url=jdbc:h2:mem:lms-enroll;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE",
      "lms.seed.enabled=false"
    })
@AutoConfigureMockMvc
@ActiveProfiles("local")
@Transactional
class EnrollmentControllerTest {

  @Autowired private MockMvc mockMvc;
  @Autowired private ObjectMapper objectMapper;
  @Autowired private UserAccountRepository users;
  @Autowired private CourseRepository courses;
  @Autowired private PasswordEncoder passwordEncoder;

  private String alunoJwt;
  private String courseId;

  @BeforeEach
  void seed() throws Exception {
    users.deleteAll();
    courses.deleteAll();
    LearningTestFixtures.saveUser(
        users, passwordEncoder, "u-aluno", "aluno@navoxi.com", Role.aluno, "secret123");
    courseId =
        LearningTestFixtures.saveCourse(courses, "c-enroll", "Curso Matrícula").getId();
    alunoJwt =
        AuthTestSupport.loginAccessToken(mockMvc, objectMapper, "aluno@navoxi.com", "secret123");
  }

  @Test
  void enrollRequiresUserJwt() throws Exception {
    mockMvc
        .perform(
            post("/api/v1/enrollments")
                .header("Authorization", "Bearer local-dev-token")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"courseId\":\"" + courseId + "\"}"))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void enrollWithUserJwt() throws Exception {
    mockMvc
        .perform(
            post("/api/v1/enrollments")
                .header("Authorization", "Bearer " + alunoJwt)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"courseId\":\"" + courseId + "\"}"))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.courseId").value(courseId))
        .andExpect(jsonPath("$.status").value("ativa"));
  }
}

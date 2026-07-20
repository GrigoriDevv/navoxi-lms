package com.navoxi.lms.web;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.navoxi.lms.domain.enums.Role;
import com.navoxi.lms.domain.enums.UnitId;
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
      "spring.datasource.url=jdbc:h2:mem:lms-unit-scope;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE",
      "lms.seed.enabled=false"
    })
@AutoConfigureMockMvc
@ActiveProfiles("local")
@Transactional
class UnitScopeControllerTest {

  @Autowired private MockMvc mockMvc;
  @Autowired private ObjectMapper objectMapper;
  @Autowired private UserAccountRepository users;
  @Autowired private CourseRepository courses;
  @Autowired private PasswordEncoder passwordEncoder;

  private String nordesteJwt;
  private String premiumJwt;
  private String matrizCourseId;
  private String nordesteCourseId;

  @BeforeEach
  void seed() throws Exception {
    users.deleteAll();
    courses.deleteAll();

    LearningTestFixtures.saveUser(
        users,
        passwordEncoder,
        "u-ne",
        "admin.ne@navoxi.com",
        Role.admin_unidade,
        UnitId.nordeste,
        "secret123");
    LearningTestFixtures.saveUser(
        users,
        passwordEncoder,
        "u-premium",
        "admin@navoxi.com",
        Role.admin_premium,
        UnitId.matriz,
        "secret123");
    LearningTestFixtures.saveUser(
        users,
        passwordEncoder,
        "u-aluno-ne",
        "aluno.ne@navoxi.com",
        Role.aluno,
        UnitId.nordeste,
        "secret123");

    matrizCourseId =
        LearningTestFixtures.saveCourse(courses, "c-matriz", "Curso Matriz", UnitId.matriz)
            .getId();
    nordesteCourseId =
        LearningTestFixtures.saveCourse(courses, "c-ne", "Curso Nordeste", UnitId.nordeste)
            .getId();

    nordesteJwt =
        AuthTestSupport.loginAccessToken(
            mockMvc, objectMapper, "admin.ne@navoxi.com", "secret123");
    premiumJwt =
        AuthTestSupport.loginAccessToken(mockMvc, objectMapper, "admin@navoxi.com", "secret123");
  }

  @Test
  void unitAdminListsOnlyOwnUnitCourses() throws Exception {
    mockMvc
        .perform(get("/api/v1/courses").header("Authorization", "Bearer " + nordesteJwt))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(1))
        .andExpect(jsonPath("$[0].id").value(nordesteCourseId));
  }

  @Test
  void unitAdminCannotGetForeignCourse() throws Exception {
    mockMvc
        .perform(
            get("/api/v1/courses/" + matrizCourseId)
                .header("Authorization", "Bearer " + nordesteJwt))
        .andExpect(status().isForbidden());
  }

  @Test
  void premiumListsAllUnits() throws Exception {
    mockMvc
        .perform(get("/api/v1/courses").header("Authorization", "Bearer " + premiumJwt))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(2));
  }

  @Test
  void alunoCannotEnrollForeignUnitCourse() throws Exception {
    String alunoJwt =
        AuthTestSupport.loginAccessToken(
            mockMvc, objectMapper, "aluno.ne@navoxi.com", "secret123");
    mockMvc
        .perform(
            post("/api/v1/enrollments")
                .header("Authorization", "Bearer " + alunoJwt)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"courseId\":\"" + matrizCourseId + "\"}"))
        .andExpect(status().isForbidden());
  }

  @Test
  void unitAdminCannotCreateCourseInForeignUnit() throws Exception {
    mockMvc
        .perform(
            post("/api/v1/courses")
                .header("Authorization", "Bearer " + nordesteJwt)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "title": "Hack",
                      "category": "TI",
                      "instructor": "QA",
                      "unitId": "matriz",
                      "modality": "online",
                      "audience": "Todos",
                      "workload": 4,
                      "status": "rascunho",
                      "cover": "https://example.com/c.jpg"
                    }
                    """))
        .andExpect(status().isForbidden());
  }
}

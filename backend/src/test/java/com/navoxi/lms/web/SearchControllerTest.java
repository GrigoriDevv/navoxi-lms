package com.navoxi.lms.web;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.navoxi.lms.domain.entity.Course;
import com.navoxi.lms.domain.entity.CourseLesson;
import com.navoxi.lms.domain.entity.Question;
import com.navoxi.lms.domain.enums.QuestionType;
import com.navoxi.lms.domain.enums.Role;
import com.navoxi.lms.domain.enums.UnitId;
import com.navoxi.lms.repository.CourseLessonRepository;
import com.navoxi.lms.repository.CourseModuleRepository;
import com.navoxi.lms.repository.CourseRepository;
import com.navoxi.lms.repository.QuestionRepository;
import com.navoxi.lms.repository.UserAccountRepository;
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
      "spring.datasource.url=jdbc:h2:mem:lms-search;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE",
      "lms.seed.enabled=false"
    })
@AutoConfigureMockMvc
@ActiveProfiles("local")
@Transactional
class SearchControllerTest {

  @Autowired private MockMvc mockMvc;
  @Autowired private ObjectMapper objectMapper;
  @Autowired private UserAccountRepository users;
  @Autowired private CourseRepository courses;
  @Autowired private CourseModuleRepository modules;
  @Autowired private CourseLessonRepository lessons;
  @Autowired private QuestionRepository questions;
  @Autowired private PasswordEncoder passwordEncoder;

  private String adminJwt;
  private String unidadeJwt;
  private String alunoJwt;

  @BeforeEach
  void seed() throws Exception {
    lessons.deleteAll();
    modules.deleteAll();
    questions.deleteAll();
    courses.deleteAll();
    users.deleteAll();

    LearningTestFixtures.saveUser(
        users, passwordEncoder, "u-admin", "admin@navoxi.com", Role.admin_premium, "secret123");
    LearningTestFixtures.saveUser(
        users,
        passwordEncoder,
        "u-ne",
        "unidade@navoxi.com",
        Role.admin_unidade,
        UnitId.nordeste,
        "secret123");
    LearningTestFixtures.saveUser(
        users, passwordEncoder, "u-aluno", "aluno@navoxi.com", Role.aluno, "secret123");

    Course matriz = LearningTestFixtures.saveCourse(courses, "c-matriz", "Compliance LGPD Matriz");
    CourseLesson lesson =
        LearningTestFixtures.saveLesson(modules, lessons, matriz, "m-s1", "l-s1");
    lesson.setTitle("Introdução à privacidade");
    lessons.save(lesson);

    Course nordeste =
        LearningTestFixtures.saveCourse(courses, "c-ne", "Curso Nordeste Especial", UnitId.nordeste);

    Question q = new Question();
    q.setId("q-search-1");
    q.setText("Qual o prazo de retenção LGPD?");
    q.setType(QuestionType.dissertativa);
    q.setCategory("Compliance");
    q.setUnitId(UnitId.matriz);
    questions.save(q);

    Question qNe = new Question();
    qNe.setId("q-search-2");
    qNe.setText("Pergunta exclusiva Nordeste");
    qNe.setType(QuestionType.multipla);
    qNe.setCategory("Regional");
    qNe.setUnitId(UnitId.nordeste);
    questions.save(qNe);

    adminJwt =
        AuthTestSupport.loginAccessToken(mockMvc, objectMapper, "admin@navoxi.com", "secret123");
    unidadeJwt =
        AuthTestSupport.loginAccessToken(mockMvc, objectMapper, "unidade@navoxi.com", "secret123");
    alunoJwt =
        AuthTestSupport.loginAccessToken(mockMvc, objectMapper, "aluno@navoxi.com", "secret123");

    // silence unused in some IDEs
    org.junit.jupiter.api.Assertions.assertNotNull(nordeste.getId());
  }

  @Test
  void shortQueryReturns400() throws Exception {
    mockMvc
        .perform(get("/api/v1/search").param("q", "a").header("Authorization", "Bearer " + adminJwt))
        .andExpect(status().isBadRequest());
  }

  @Test
  void adminFindsAcrossTypes() throws Exception {
    mockMvc
        .perform(
            get("/api/v1/search")
                .param("q", "LGPD")
                .header("Authorization", "Bearer " + adminJwt))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.query").value("LGPD"))
        .andExpect(jsonPath("$.courses[0].title").value("Compliance LGPD Matriz"))
        .andExpect(jsonPath("$.courses[0].href").value("/aprendizagem/cursos/c-matriz"))
        .andExpect(jsonPath("$.questions[0].id").value("q-search-1"));
  }

  @Test
  void findsLessonByTitle() throws Exception {
    mockMvc
        .perform(
            get("/api/v1/search")
                .param("q", "privacidade")
                .param("types", "lesson")
                .header("Authorization", "Bearer " + adminJwt))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.courses").isEmpty())
        .andExpect(jsonPath("$.lessons[0].title").value("Introdução à privacidade"))
        .andExpect(jsonPath("$.lessons[0].courseId").value("c-matriz"))
        .andExpect(
            jsonPath("$.lessons[0].href").value("/aprendizagem/cursos/c-matriz?aula=l-s1"));
  }

  @Test
  void unitAdminScopedToOwnUnit() throws Exception {
    mockMvc
        .perform(
            get("/api/v1/search")
                .param("q", "Nordeste")
                .header("Authorization", "Bearer " + unidadeJwt))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.courses[0].id").value("c-ne"))
        .andExpect(jsonPath("$.questions[0].id").value("q-search-2"));

    mockMvc
        .perform(
            get("/api/v1/search")
                .param("q", "LGPD")
                .header("Authorization", "Bearer " + unidadeJwt))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.courses").isEmpty())
        .andExpect(jsonPath("$.questions").isEmpty());
  }

  @Test
  void alunoCanSearchOwnUnit() throws Exception {
    mockMvc
        .perform(
            get("/api/v1/search")
                .param("q", "Compliance")
                .header("Authorization", "Bearer " + alunoJwt))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.courses[0].id").value("c-matriz"));
  }

  @Test
  void requiresAuth() throws Exception {
    mockMvc.perform(get("/api/v1/search").param("q", "LGPD")).andExpect(status().isUnauthorized());
  }
}

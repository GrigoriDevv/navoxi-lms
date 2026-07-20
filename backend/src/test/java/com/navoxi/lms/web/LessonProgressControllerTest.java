package com.navoxi.lms.web;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.navoxi.lms.domain.entity.Course;
import com.navoxi.lms.domain.enums.Role;
import com.navoxi.lms.repository.CourseLessonRepository;
import com.navoxi.lms.repository.CourseModuleRepository;
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
      "spring.datasource.url=jdbc:h2:mem:lms-progress;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE",
      "lms.seed.enabled=false"
    })
@AutoConfigureMockMvc
@ActiveProfiles("local")
@Transactional
class LessonProgressControllerTest {

  @Autowired private MockMvc mockMvc;
  @Autowired private ObjectMapper objectMapper;
  @Autowired private UserAccountRepository users;
  @Autowired private CourseRepository courses;
  @Autowired private CourseModuleRepository modules;
  @Autowired private CourseLessonRepository lessons;
  @Autowired private PasswordEncoder passwordEncoder;

  private String alunoJwt;
  private String lessonId;

  @BeforeEach
  void seed() throws Exception {
    users.deleteAll();
    lessons.deleteAll();
    modules.deleteAll();
    courses.deleteAll();

    LearningTestFixtures.saveUser(
        users, passwordEncoder, "u-aluno", "aluno@navoxi.com", Role.aluno, "secret123");
    Course course = LearningTestFixtures.saveCourse(courses, "c-prog", "Curso Progresso");
    lessonId =
        LearningTestFixtures.saveLesson(modules, lessons, course, "m-prog", "l-prog").getId();
    alunoJwt =
        AuthTestSupport.loginAccessToken(mockMvc, objectMapper, "aluno@navoxi.com", "secret123");

    mockMvc
        .perform(
            post("/api/v1/enrollments")
                .header("Authorization", "Bearer " + alunoJwt)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"courseId\":\"" + course.getId() + "\"}"))
        .andExpect(status().isCreated());
  }

  @Test
  void completeLessonAndListProgress() throws Exception {
    mockMvc
        .perform(
            post("/api/v1/lessons/" + lessonId + "/complete")
                .header("Authorization", "Bearer " + alunoJwt))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.lessonId").value(lessonId));

    mockMvc
        .perform(get("/api/v1/users/me/progress").header("Authorization", "Bearer " + alunoJwt))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].lessonId").value(lessonId));
  }
}

package com.navoxi.lms.web;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.navoxi.lms.domain.entity.Course;
import com.navoxi.lms.domain.entity.Enrollment;
import com.navoxi.lms.domain.enums.EnrollmentStatus;
import com.navoxi.lms.domain.enums.Role;
import com.navoxi.lms.domain.enums.UnitId;
import com.navoxi.lms.repository.CourseLessonRepository;
import com.navoxi.lms.repository.CourseModuleRepository;
import com.navoxi.lms.repository.CourseRepository;
import com.navoxi.lms.repository.EnrollmentRepository;
import com.navoxi.lms.repository.EvaluationAttemptRepository;
import com.navoxi.lms.repository.EvaluationRepository;
import com.navoxi.lms.repository.LessonProgressRepository;
import com.navoxi.lms.repository.NotificationRepository;
import com.navoxi.lms.repository.QuestionRepository;
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
      "spring.datasource.url=jdbc:h2:mem:lms-reports;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE",
      "lms.seed.enabled=false"
    })
@AutoConfigureMockMvc
@ActiveProfiles("local")
@Transactional
class ReportControllerTest {

  @Autowired private MockMvc mockMvc;
  @Autowired private ObjectMapper objectMapper;
  @Autowired private UserAccountRepository users;
  @Autowired private CourseRepository courses;
  @Autowired private CourseModuleRepository modules;
  @Autowired private CourseLessonRepository lessons;
  @Autowired private EnrollmentRepository enrollments;
  @Autowired private LessonProgressRepository lessonProgress;
  @Autowired private QuestionRepository questions;
  @Autowired private EvaluationRepository evaluations;
  @Autowired private EvaluationAttemptRepository attempts;
  @Autowired private NotificationRepository notifications;
  @Autowired private PasswordEncoder passwordEncoder;

  private String aluno1Jwt;
  private String aluno2Jwt;
  private String adminJwt;
  private String adminSulJwt;
  private String evaluationId;
  private String questionId;

  @BeforeEach
  void seed() throws Exception {
    notifications.deleteAll();
    attempts.deleteAll();
    evaluations.deleteAll();
    questions.deleteAll();
    lessonProgress.deleteAll();
    enrollments.deleteAll();
    lessons.deleteAll();
    modules.deleteAll();
    courses.deleteAll();
    users.deleteAll();

    LearningTestFixtures.saveUser(
        users, passwordEncoder, "u-aluno1", "aluno1@navoxi.com", Role.aluno, "secret123");
    LearningTestFixtures.saveUser(
        users, passwordEncoder, "u-aluno2", "aluno2@navoxi.com", Role.aluno, "secret123");
    LearningTestFixtures.saveUser(
        users, passwordEncoder, "u-admin", "admin@navoxi.com", Role.admin_premium, "secret123");
    LearningTestFixtures.saveUser(
        users,
        passwordEncoder,
        "u-admin-sul",
        "adminsul@navoxi.com",
        Role.admin_unidade,
        UnitId.sul,
        "secret123");

    Course course = LearningTestFixtures.saveCourse(courses, "c-rep", "Curso Report");
    LearningTestFixtures.saveLesson(modules, lessons, course, "m-rep-1", "l-rep-1");
    LearningTestFixtures.saveLesson(modules, lessons, course, "m-rep-2", "l-rep-2");
    LearningTestFixtures.saveLesson(modules, lessons, course, "m-rep-3", "l-rep-3");
    LearningTestFixtures.saveCourse(courses, "c-outro", "Outro Curso");

    aluno1Jwt =
        AuthTestSupport.loginAccessToken(mockMvc, objectMapper, "aluno1@navoxi.com", "secret123");
    aluno2Jwt =
        AuthTestSupport.loginAccessToken(mockMvc, objectMapper, "aluno2@navoxi.com", "secret123");
    adminJwt =
        AuthTestSupport.loginAccessToken(mockMvc, objectMapper, "admin@navoxi.com", "secret123");
    adminSulJwt =
        AuthTestSupport.loginAccessToken(mockMvc, objectMapper, "adminsul@navoxi.com", "secret123");

    MvcResult q =
        mockMvc
            .perform(
                post("/api/v1/questions")
                    .header("Authorization", "Bearer " + adminJwt)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """
                        {
                          "text": "2+2?",
                          "type": "multipla",
                          "category": "Math",
                          "unitId": "matriz",
                          "options": ["3", "4", "5"],
                          "correctKey": "4"
                        }
                        """))
            .andExpect(status().isCreated())
            .andReturn();
    questionId = objectMapper.readTree(q.getResponse().getContentAsString()).get("id").asText();

    MvcResult e =
        mockMvc
            .perform(
                post("/api/v1/evaluations")
                    .header("Authorization", "Bearer " + adminJwt)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """
                        {
                          "name": "Prova Report",
                          "courseId": "c-rep",
                          "unitId": "matriz",
                          "questionIds": ["%s"],
                          "status": "aplicada",
                          "dueDate": "2026-12-31"
                        }
                        """
                            .formatted(questionId)))
            .andExpect(status().isCreated())
            .andReturn();
    evaluationId = objectMapper.readTree(e.getResponse().getContentAsString()).get("id").asText();

    // aluno1 na turma A com 1 de 3 aulas concluídas; aluno2 sem turma, sem progresso
    enroll(aluno1Jwt, "c-rep", "t-a", "Turma A");
    enroll(aluno2Jwt, "c-rep", null, null);
    completeLesson(aluno1Jwt, "l-rep-1");
  }

  private void enroll(String jwt, String courseId, String turmaId, String turmaName)
      throws Exception {
    String turmaFields =
        turmaId == null
            ? ""
            : ",\"turmaId\":\"%s\",\"turmaName\":\"%s\"".formatted(turmaId, turmaName);
    mockMvc
        .perform(
            post("/api/v1/enrollments")
                .header("Authorization", "Bearer " + jwt)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"courseId\":\"%s\"%s}".formatted(courseId, turmaFields)))
        .andExpect(status().isCreated());
  }

  private void completeLesson(String jwt, String lessonId) throws Exception {
    mockMvc
        .perform(
            post("/api/v1/lessons/" + lessonId + "/complete")
                .header("Authorization", "Bearer " + jwt))
        .andExpect(status().isOk());
  }

  private JsonNode getJson(String url, String jwt) throws Exception {
    MvcResult result =
        mockMvc
            .perform(get(url).header("Authorization", "Bearer " + jwt))
            .andExpect(status().isOk())
            .andReturn();
    return objectMapper.readTree(result.getResponse().getContentAsString());
  }

  private static JsonNode rowByTurma(JsonNode rows, String turmaId) {
    for (JsonNode row : rows) {
      JsonNode value = row.get("turmaId");
      if (turmaId == null ? value.isNull() : turmaId.equals(value.asText())) {
        return row;
      }
    }
    throw new AssertionError("Linha da turma não encontrada: " + turmaId);
  }

  @Test
  void completionGroupsByCourseAndTurma() throws Exception {
    JsonNode rows = getJson("/api/v1/reports/completion?courseId=c-rep", adminJwt);
    assertEquals(2, rows.size());

    JsonNode turmaA = rowByTurma(rows, "t-a");
    assertEquals("Curso Report", turmaA.get("courseTitle").asText());
    assertEquals("Turma A", turmaA.get("turmaName").asText());
    assertEquals(1, turmaA.get("enrolled").asInt());
    assertEquals(0, turmaA.get("completed").asInt());
    assertEquals(1, turmaA.get("inProgress").asInt());
    assertEquals(0, turmaA.get("notStarted").asInt());
    assertEquals(33, turmaA.get("avgProgressPct").asInt());
    assertEquals(0, turmaA.get("completionRatePct").asInt());

    JsonNode semTurma = rowByTurma(rows, null);
    assertEquals(1, semTurma.get("enrolled").asInt());
    assertEquals(1, semTurma.get("notStarted").asInt());
    assertEquals(0, semTurma.get("avgProgressPct").asInt());
  }

  @Test
  void completionExcludesCancelledEnrollments() throws Exception {
    enroll(aluno1Jwt, "c-outro", null, null);
    enroll(aluno2Jwt, "c-outro", null, null);
    Enrollment cancelled =
        enrollments.findByUserId("u-aluno1").stream()
            .filter(en -> en.getCourse().getId().equals("c-outro"))
            .findFirst()
            .orElseThrow();
    cancelled.setStatus(EnrollmentStatus.cancelada);
    enrollments.save(cancelled);

    JsonNode rows = getJson("/api/v1/reports/completion?courseId=c-outro", adminJwt);
    assertEquals(1, rows.size());
    assertEquals(1, rows.get(0).get("enrolled").asInt());
  }

  @Test
  void completionCourseFilterReducesResult() throws Exception {
    enroll(aluno2Jwt, "c-outro", null, null);

    JsonNode all = getJson("/api/v1/reports/completion", adminJwt);
    assertEquals(3, all.size());

    JsonNode filtered = getJson("/api/v1/reports/completion?courseId=c-outro", adminJwt);
    assertEquals(1, filtered.size());
    assertEquals("Outro Curso", filtered.get(0).get("courseTitle").asText());
  }

  @Test
  void pendingListsLessonsAndEvaluations() throws Exception {
    JsonNode rows = getJson("/api/v1/reports/pending?courseId=c-rep&userId=u-aluno1", adminJwt);
    assertEquals(1, rows.size());

    JsonNode row = rows.get(0);
    assertEquals("u-aluno1", row.get("userId").asText());
    assertEquals("Curso Report", row.get("courseTitle").asText());
    assertEquals(33, row.get("progressPct").asInt());
    assertEquals(3, row.get("lessonsTotal").asInt());
    assertEquals(1, row.get("lessonsCompleted").asInt());
    assertEquals(2, row.get("lessonsPending").asInt());
    assertEquals(2, row.get("pendingLessonTitles").size());
    assertEquals(1, row.get("evaluationsTotal").asInt());
    assertEquals(1, row.get("evaluationsPending").asInt());
    assertEquals(1, row.get("pendingEvaluations").size());

    JsonNode pendingEval = row.get("pendingEvaluations").get(0);
    assertEquals(evaluationId, pendingEval.get("evaluationId").asText());
    assertEquals("Prova Report", pendingEval.get("name").asText());
    assertEquals("nao_iniciada", pendingEval.get("state").asText());
  }

  @Test
  void pendingRowDisappearsWhenEverythingIsDone() throws Exception {
    completeLesson(aluno1Jwt, "l-rep-2");
    completeLesson(aluno1Jwt, "l-rep-3");

    MvcResult started =
        mockMvc
            .perform(
                post("/api/v1/evaluations/" + evaluationId + "/attempts")
                    .header("Authorization", "Bearer " + aluno1Jwt))
            .andExpect(status().isCreated())
            .andReturn();
    String attemptId =
        objectMapper.readTree(started.getResponse().getContentAsString()).get("id").asText();

    // Com tentativa em andamento a avaliação ainda pende, com estado em_andamento
    JsonNode midway = getJson("/api/v1/reports/pending?courseId=c-rep&userId=u-aluno1", adminJwt);
    assertEquals(1, midway.size());
    assertEquals(0, midway.get(0).get("lessonsPending").asInt());
    assertEquals(
        "em_andamento", midway.get(0).get("pendingEvaluations").get(0).get("state").asText());

    mockMvc
        .perform(
            put("/api/v1/attempts/" + attemptId + "/answers")
                .header("Authorization", "Bearer " + aluno1Jwt)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {"answers":[{"questionId":"%s","selectedOption":"4"}]}
                    """
                        .formatted(questionId)))
        .andExpect(status().isOk());
    mockMvc
        .perform(
            post("/api/v1/attempts/" + attemptId + "/submit")
                .header("Authorization", "Bearer " + aluno1Jwt))
        .andExpect(status().isOk());

    JsonNode after = getJson("/api/v1/reports/pending?courseId=c-rep&userId=u-aluno1", adminJwt);
    assertTrue(after.isEmpty());
  }

  @Test
  void reportsForbiddenForAluno() throws Exception {
    mockMvc
        .perform(get("/api/v1/reports/completion").header("Authorization", "Bearer " + aluno1Jwt))
        .andExpect(status().isForbidden());
    mockMvc
        .perform(get("/api/v1/reports/pending").header("Authorization", "Bearer " + aluno1Jwt))
        .andExpect(status().isForbidden());
  }

  @Test
  void adminUnidadeIsScopedToOwnUnit() throws Exception {
    JsonNode rows = getJson("/api/v1/reports/completion", adminSulJwt);
    assertTrue(rows.isEmpty());

    JsonNode pending = getJson("/api/v1/reports/pending", adminSulJwt);
    assertTrue(pending.isEmpty());

    mockMvc
        .perform(
            get("/api/v1/reports/completion?unitId=matriz")
                .header("Authorization", "Bearer " + adminSulJwt))
        .andExpect(status().isForbidden());
  }
}

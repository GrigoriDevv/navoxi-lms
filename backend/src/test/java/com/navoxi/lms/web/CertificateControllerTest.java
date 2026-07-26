package com.navoxi.lms.web;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.navoxi.lms.domain.entity.Course;
import com.navoxi.lms.domain.enums.Role;
import com.navoxi.lms.repository.CertificateRepository;
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
      "spring.datasource.url=jdbc:h2:mem:lms-certs;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE",
      "lms.seed.enabled=false",
      "lms.certificate.validity-months=24"
    })
@AutoConfigureMockMvc
@ActiveProfiles("local")
@Transactional
class CertificateControllerTest {

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
  @Autowired private CertificateRepository certificates;
  @Autowired private NotificationRepository notifications;
  @Autowired private PasswordEncoder passwordEncoder;

  private String alunoJwt;
  private String aluno2Jwt;
  private String adminJwt;

  @BeforeEach
  void seed() throws Exception {
    notifications.deleteAll();
    certificates.deleteAll();
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
        users, passwordEncoder, "u-aluno", "aluno@navoxi.com", Role.aluno, "secret123");
    LearningTestFixtures.saveUser(
        users, passwordEncoder, "u-aluno2", "aluno2@navoxi.com", Role.aluno, "secret123");
    LearningTestFixtures.saveUser(
        users, passwordEncoder, "u-admin", "admin@navoxi.com", Role.admin_premium, "secret123");

    alunoJwt =
        AuthTestSupport.loginAccessToken(mockMvc, objectMapper, "aluno@navoxi.com", "secret123");
    aluno2Jwt =
        AuthTestSupport.loginAccessToken(mockMvc, objectMapper, "aluno2@navoxi.com", "secret123");
    adminJwt =
        AuthTestSupport.loginAccessToken(mockMvc, objectMapper, "admin@navoxi.com", "secret123");
  }

  @Test
  void issuesWhenAllLessonsDoneAndNoEvaluations() throws Exception {
    Course course = LearningTestFixtures.saveCourse(courses, "c-noeval", "Sem Prova");
    LearningTestFixtures.saveLesson(modules, lessons, course, "m1", "l1");
    LearningTestFixtures.saveLesson(modules, lessons, course, "m2", "l2");

    enroll(alunoJwt, "c-noeval");
    completeLesson(alunoJwt, "l1");
    assertTrue(certificates.findByUserIdAndCourseId("u-aluno", "c-noeval").isEmpty());

    completeLesson(alunoJwt, "l2");
    assertTrue(certificates.findByUserIdAndCourseId("u-aluno", "c-noeval").isPresent());

    mockMvc
        .perform(get("/api/v1/certificates/me").header("Authorization", "Bearer " + alunoJwt))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].courseId").value("c-noeval"))
        .andExpect(jsonPath("$[0].status").value("valido"))
        .andExpect(jsonPath("$[0].validationHash").isNotEmpty());
  }

  @Test
  void doesNotIssueWhenEvaluationNotPassed() throws Exception {
    Course course = LearningTestFixtures.saveCourse(courses, "c-eval", "Com Prova");
    LearningTestFixtures.saveLesson(modules, lessons, course, "m1", "l1");
    String questionId = createObjectiveQuestion();
    createEvaluation("c-eval", questionId, 70.0);

    enroll(alunoJwt, "c-eval");
    completeLesson(alunoJwt, "l1");
    assertTrue(certificates.findByUserIdAndCourseId("u-aluno", "c-eval").isEmpty());
  }

  @Test
  void issuesAfterPassingEvaluation() throws Exception {
    Course course = LearningTestFixtures.saveCourse(courses, "c-pass", "Aprovado");
    LearningTestFixtures.saveLesson(modules, lessons, course, "m1", "l1");
    String questionId = createObjectiveQuestion();
    String evalId = createEvaluation("c-pass", questionId, 70.0);

    enroll(alunoJwt, "c-pass");
    completeLesson(alunoJwt, "l1");
    assertTrue(certificates.findByUserIdAndCourseId("u-aluno", "c-pass").isEmpty());

    submitPassingAttempt(alunoJwt, evalId, questionId);
    assertTrue(certificates.findByUserIdAndCourseId("u-aluno", "c-pass").isPresent());
  }

  @Test
  void doesNotIssueWhenScoreBelowThreshold() throws Exception {
    Course course = LearningTestFixtures.saveCourse(courses, "c-fail", "Reprovado");
    LearningTestFixtures.saveLesson(modules, lessons, course, "m1", "l1");
    String questionId = createObjectiveQuestion();
    String evalId = createEvaluation("c-fail", questionId, 70.0);

    enroll(alunoJwt, "c-fail");
    completeLesson(alunoJwt, "l1");
    submitFailingAttempt(alunoJwt, evalId, questionId);
    assertTrue(certificates.findByUserIdAndCourseId("u-aluno", "c-fail").isEmpty());
  }

  @Test
  void issueIsIdempotent() throws Exception {
    Course course = LearningTestFixtures.saveCourse(courses, "c-idem", "Idem");
    LearningTestFixtures.saveLesson(modules, lessons, course, "m1", "l1");
    enroll(alunoJwt, "c-idem");
    completeLesson(alunoJwt, "l1");
    assertEquals(1, certificates.findByUserIdOrderByIssuedAtDesc("u-aluno").size());

    // re-complete is no-op; second tryIssue via another path
    completeLesson(alunoJwt, "l1");
    assertEquals(1, certificates.findByUserIdOrderByIssuedAtDesc("u-aluno").size());
  }

  @Test
  void publicVerifyAndPdf() throws Exception {
    Course course = LearningTestFixtures.saveCourse(courses, "c-pub", "Publico");
    LearningTestFixtures.saveLesson(modules, lessons, course, "m1", "l1");
    enroll(alunoJwt, "c-pub");
    completeLesson(alunoJwt, "l1");

    String hash =
        certificates.findByUserIdAndCourseId("u-aluno", "c-pub").orElseThrow().getValidationHash();

    mockMvc
        .perform(get("/api/v1/certificates/verify/" + hash))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.courseTitle").value("Publico"))
        .andExpect(jsonPath("$.validationHash").value(hash));

    mockMvc
        .perform(get("/api/v1/certificates/verify/" + hash + "/pdf"))
        .andExpect(status().isOk())
        .andExpect(
            result ->
                assertTrue(
                    result.getResponse().getContentAsByteArray().length > 100,
                    "PDF deve ter conteúdo"));
  }

  @Test
  void studentCannotDownloadOthersPdf() throws Exception {
    Course course = LearningTestFixtures.saveCourse(courses, "c-own", "Own");
    LearningTestFixtures.saveLesson(modules, lessons, course, "m1", "l1");
    enroll(alunoJwt, "c-own");
    completeLesson(alunoJwt, "l1");

    String id = certificates.findByUserIdAndCourseId("u-aluno", "c-own").orElseThrow().getId();

    mockMvc
        .perform(
            get("/api/v1/certificates/" + id + "/pdf")
                .header("Authorization", "Bearer " + aluno2Jwt))
        .andExpect(status().isForbidden());

    mockMvc
        .perform(
            get("/api/v1/certificates/" + id + "/pdf")
                .header("Authorization", "Bearer " + alunoJwt))
        .andExpect(status().isOk());
  }

  @Test
  void staffCanRevoke() throws Exception {
    Course course = LearningTestFixtures.saveCourse(courses, "c-rev", "Revogar");
    LearningTestFixtures.saveLesson(modules, lessons, course, "m1", "l1");
    enroll(alunoJwt, "c-rev");
    completeLesson(alunoJwt, "l1");

    String id = certificates.findByUserIdAndCourseId("u-aluno", "c-rev").orElseThrow().getId();
    String hash =
        certificates.findByUserIdAndCourseId("u-aluno", "c-rev").orElseThrow().getValidationHash();

    mockMvc
        .perform(
            patch("/api/v1/certificates/" + id + "/revoke")
                .header("Authorization", "Bearer " + adminJwt))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("revogado"));

    mockMvc
        .perform(get("/api/v1/certificates/verify/" + hash))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("revogado"));
  }

  @Test
  void evaluationPassingScorePctIsExposed() throws Exception {
    String questionId = createObjectiveQuestion();
    MvcResult created =
        mockMvc
            .perform(
                post("/api/v1/evaluations")
                    .header("Authorization", "Bearer " + adminJwt)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """
                        {
                          "name": "Com limiar",
                          "courseId": "c-x",
                          "unitId": "matriz",
                          "questionIds": ["%s"],
                          "status": "publicada",
                          "dueDate": "2026-12-31",
                          "passingScorePct": 85
                        }
                        """
                            .formatted(questionId)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.passingScorePct").value(85.0))
            .andReturn();
    assertFalse(created.getResponse().getContentAsString().isBlank());
  }

  private void enroll(String jwt, String courseId) throws Exception {
    mockMvc
        .perform(
            post("/api/v1/enrollments")
                .header("Authorization", "Bearer " + jwt)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"courseId\":\"%s\"}".formatted(courseId)))
        .andExpect(status().isCreated());
  }

  private void completeLesson(String jwt, String lessonId) throws Exception {
    mockMvc
        .perform(
            post("/api/v1/lessons/" + lessonId + "/complete")
                .header("Authorization", "Bearer " + jwt))
        .andExpect(status().isOk());
  }

  private String createObjectiveQuestion() throws Exception {
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
    return objectMapper.readTree(q.getResponse().getContentAsString()).get("id").asText();
  }

  private String createEvaluation(String courseId, String questionId, double passing)
      throws Exception {
    MvcResult e =
        mockMvc
            .perform(
                post("/api/v1/evaluations")
                    .header("Authorization", "Bearer " + adminJwt)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """
                        {
                          "name": "Prova",
                          "courseId": "%s",
                          "unitId": "matriz",
                          "questionIds": ["%s"],
                          "status": "aplicada",
                          "dueDate": "2026-12-31",
                          "passingScorePct": %s
                        }
                        """
                            .formatted(courseId, questionId, passing)))
            .andExpect(status().isCreated())
            .andReturn();
    return objectMapper.readTree(e.getResponse().getContentAsString()).get("id").asText();
  }

  private void submitPassingAttempt(String jwt, String evalId, String questionId) throws Exception {
    MvcResult started =
        mockMvc
            .perform(
                post("/api/v1/evaluations/" + evalId + "/attempts")
                    .header("Authorization", "Bearer " + jwt))
            .andExpect(status().isCreated())
            .andReturn();
    String attemptId =
        objectMapper.readTree(started.getResponse().getContentAsString()).get("id").asText();
    mockMvc
        .perform(
            put("/api/v1/attempts/" + attemptId + "/answers")
                .header("Authorization", "Bearer " + jwt)
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
                .header("Authorization", "Bearer " + jwt))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("corrigida"));
  }

  private void submitFailingAttempt(String jwt, String evalId, String questionId) throws Exception {
    MvcResult started =
        mockMvc
            .perform(
                post("/api/v1/evaluations/" + evalId + "/attempts")
                    .header("Authorization", "Bearer " + jwt))
            .andExpect(status().isCreated())
            .andReturn();
    String attemptId =
        objectMapper.readTree(started.getResponse().getContentAsString()).get("id").asText();
    mockMvc
        .perform(
            put("/api/v1/attempts/" + attemptId + "/answers")
                .header("Authorization", "Bearer " + jwt)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {"answers":[{"questionId":"%s","selectedOption":"3"}]}
                    """
                        .formatted(questionId)))
        .andExpect(status().isOk());
    mockMvc
        .perform(
            post("/api/v1/attempts/" + attemptId + "/submit")
                .header("Authorization", "Bearer " + jwt))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.scorePct").value(0.0));
  }
}

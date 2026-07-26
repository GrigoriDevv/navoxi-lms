package com.navoxi.lms.web;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.navoxi.lms.domain.enums.Role;
import com.navoxi.lms.repository.CourseRepository;
import com.navoxi.lms.repository.EvaluationAttemptRepository;
import com.navoxi.lms.repository.EvaluationRepository;
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
      "spring.datasource.url=jdbc:h2:mem:lms-attempts;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE",
      "lms.seed.enabled=false"
    })
@AutoConfigureMockMvc
@ActiveProfiles("local")
@Transactional
class EvaluationAttemptControllerTest {

  @Autowired private MockMvc mockMvc;
  @Autowired private ObjectMapper objectMapper;
  @Autowired private UserAccountRepository users;
  @Autowired private CourseRepository courses;
  @Autowired private QuestionRepository questions;
  @Autowired private EvaluationRepository evaluations;
  @Autowired private EvaluationAttemptRepository attempts;
  @Autowired private NotificationRepository notifications;
  @Autowired private PasswordEncoder passwordEncoder;

  private String alunoJwt;
  private String aluno2Jwt;
  private String adminJwt;
  private String evaluationId;
  private String questionId;

  @BeforeEach
  void seed() throws Exception {
    notifications.deleteAll();
    attempts.deleteAll();
    evaluations.deleteAll();
    questions.deleteAll();
    courses.deleteAll();
    users.deleteAll();

    LearningTestFixtures.saveUser(
        users, passwordEncoder, "u-aluno", "aluno@navoxi.com", Role.aluno, "secret123");
    LearningTestFixtures.saveUser(
        users, passwordEncoder, "u-aluno2", "aluno2@navoxi.com", Role.aluno, "secret123");
    LearningTestFixtures.saveUser(
        users, passwordEncoder, "u-admin", "admin@navoxi.com", Role.admin_premium, "secret123");
    String courseId =
        LearningTestFixtures.saveCourse(courses, "c-att", "Curso Tentativas").getId();

    alunoJwt =
        AuthTestSupport.loginAccessToken(mockMvc, objectMapper, "aluno@navoxi.com", "secret123");
    aluno2Jwt =
        AuthTestSupport.loginAccessToken(mockMvc, objectMapper, "aluno2@navoxi.com", "secret123");
    adminJwt =
        AuthTestSupport.loginAccessToken(mockMvc, objectMapper, "admin@navoxi.com", "secret123");

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
                          "name": "Prova 1",
                          "courseId": "%s",
                          "unitId": "matriz",
                          "questionIds": ["%s"],
                          "status": "aplicada",
                          "dueDate": "2026-12-31"
                        }
                        """
                            .formatted(courseId, questionId)))
            .andExpect(status().isCreated())
            .andReturn();
    evaluationId = objectMapper.readTree(e.getResponse().getContentAsString()).get("id").asText();
  }

  @Test
  void startSaveSubmitFlow() throws Exception {
    MvcResult started =
        mockMvc
            .perform(
                post("/api/v1/evaluations/" + evaluationId + "/attempts")
                    .header("Authorization", "Bearer " + alunoJwt))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.status").value("em_andamento"))
            .andExpect(jsonPath("$.attemptNumber").value(1))
            .andReturn();

    String attemptId =
        objectMapper.readTree(started.getResponse().getContentAsString()).get("id").asText();

    mockMvc
        .perform(
            put("/api/v1/attempts/" + attemptId + "/answers")
                .header("Authorization", "Bearer " + alunoJwt)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "answers": [
                        {
                          "questionId": "%s",
                          "responseText": "4",
                          "selectedOption": "4"
                        }
                      ]
                    }
                    """
                        .formatted(questionId)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.answers[0].questionId").value(questionId))
        .andExpect(jsonPath("$.answers[0].selectedOption").value("4"));

    mockMvc
        .perform(
            post("/api/v1/attempts/" + attemptId + "/submit")
                .header("Authorization", "Bearer " + alunoJwt))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("corrigida"))
        .andExpect(jsonPath("$.scorePct").value(100.0))
        .andExpect(jsonPath("$.answers[0].isCorrect").value(true))
        .andExpect(jsonPath("$.submittedAt").isNotEmpty());
  }

  @Test
  void submitWrongObjectiveScoresZero() throws Exception {
    MvcResult started =
        mockMvc
            .perform(
                post("/api/v1/evaluations/" + evaluationId + "/attempts")
                    .header("Authorization", "Bearer " + alunoJwt))
            .andExpect(status().isCreated())
            .andReturn();
    String attemptId =
        objectMapper.readTree(started.getResponse().getContentAsString()).get("id").asText();

    mockMvc
        .perform(
            put("/api/v1/attempts/" + attemptId + "/answers")
                .header("Authorization", "Bearer " + alunoJwt)
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
                .header("Authorization", "Bearer " + alunoJwt))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("corrigida"))
        .andExpect(jsonPath("$.scorePct").value(0.0))
        .andExpect(jsonPath("$.answers[0].isCorrect").value(false));
  }

  @Test
  void submitWithEssayWaitsForManualGrade() throws Exception {
    MvcResult vf =
        mockMvc
            .perform(
                post("/api/v1/questions")
                    .header("Authorization", "Bearer " + adminJwt)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """
                        {
                          "text": "Terra é redonda?",
                          "type": "verdadeiro",
                          "category": "Science",
                          "unitId": "matriz",
                          "correctKey": "verdadeiro"
                        }
                        """))
            .andExpect(status().isCreated())
            .andReturn();
    String vfId = objectMapper.readTree(vf.getResponse().getContentAsString()).get("id").asText();

    MvcResult essay =
        mockMvc
            .perform(
                post("/api/v1/questions")
                    .header("Authorization", "Bearer " + adminJwt)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """
                        {
                          "text": "Explique gravidade",
                          "type": "dissertativa",
                          "category": "Science",
                          "unitId": "matriz"
                        }
                        """))
            .andExpect(status().isCreated())
            .andReturn();
    String essayId =
        objectMapper.readTree(essay.getResponse().getContentAsString()).get("id").asText();

    String courseId = LearningTestFixtures.saveCourse(courses, "c-mix", "Mix").getId();
    MvcResult eval =
        mockMvc
            .perform(
                post("/api/v1/evaluations")
                    .header("Authorization", "Bearer " + adminJwt)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """
                        {
                          "name": "Mista",
                          "courseId": "%s",
                          "unitId": "matriz",
                          "questionIds": ["%s", "%s"],
                          "status": "aplicada",
                          "dueDate": "2026-12-31"
                        }
                        """
                            .formatted(courseId, vfId, essayId)))
            .andExpect(status().isCreated())
            .andReturn();
    String mixEvalId =
        objectMapper.readTree(eval.getResponse().getContentAsString()).get("id").asText();

    MvcResult started =
        mockMvc
            .perform(
                post("/api/v1/evaluations/" + mixEvalId + "/attempts")
                    .header("Authorization", "Bearer " + alunoJwt))
            .andExpect(status().isCreated())
            .andReturn();
    String attemptId =
        objectMapper.readTree(started.getResponse().getContentAsString()).get("id").asText();

    mockMvc
        .perform(
            put("/api/v1/attempts/" + attemptId + "/answers")
                .header("Authorization", "Bearer " + alunoJwt)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "answers": [
                        {"questionId":"%s","selectedOption":"Verdadeiro"},
                        {"questionId":"%s","responseText":"Atração entre massas"}
                      ]
                    }
                    """
                        .formatted(vfId, essayId)))
        .andExpect(status().isOk());

    MvcResult submitted =
        mockMvc
            .perform(
                post("/api/v1/attempts/" + attemptId + "/submit")
                    .header("Authorization", "Bearer " + alunoJwt))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("aguardando_correcao"))
            .andExpect(jsonPath("$.scorePct").value(100.0))
            .andReturn();

    JsonNode answers =
        objectMapper.readTree(submitted.getResponse().getContentAsString()).get("answers");
    Boolean vfCorrect = null;
    Boolean essayCorrect = Boolean.TRUE; // sentinel: must become null
    for (JsonNode a : answers) {
      String qid = a.get("questionId").asText();
      if (qid.equals(vfId)) {
        vfCorrect = a.get("isCorrect").asBoolean();
      } else if (qid.equals(essayId)) {
        essayCorrect = a.has("isCorrect") && !a.get("isCorrect").isNull()
            ? a.get("isCorrect").asBoolean()
            : null;
      }
    }
    org.junit.jupiter.api.Assertions.assertEquals(Boolean.TRUE, vfCorrect);
    org.junit.jupiter.api.Assertions.assertNull(essayCorrect);
  }

  @Test
  void secondOpenAttemptBlocked() throws Exception {
    mockMvc
        .perform(
            post("/api/v1/evaluations/" + evaluationId + "/attempts")
                .header("Authorization", "Bearer " + alunoJwt))
        .andExpect(status().isCreated());

    mockMvc
        .perform(
            post("/api/v1/evaluations/" + evaluationId + "/attempts")
                .header("Authorization", "Bearer " + alunoJwt))
        .andExpect(status().isBadRequest());
  }

  @Test
  void otherUserCannotSaveAnswers() throws Exception {
    MvcResult started =
        mockMvc
            .perform(
                post("/api/v1/evaluations/" + evaluationId + "/attempts")
                    .header("Authorization", "Bearer " + alunoJwt))
            .andExpect(status().isCreated())
            .andReturn();
    String attemptId =
        objectMapper.readTree(started.getResponse().getContentAsString()).get("id").asText();

    mockMvc
        .perform(
            put("/api/v1/attempts/" + attemptId + "/answers")
                .header("Authorization", "Bearer " + aluno2Jwt)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {"answers":[{"questionId":"%s","responseText":"x"}]}
                    """
                        .formatted(questionId)))
        .andExpect(status().isForbidden());
  }

  @Test
  void adminListsAttemptsForEvaluation() throws Exception {
    mockMvc
        .perform(
            post("/api/v1/evaluations/" + evaluationId + "/attempts")
                .header("Authorization", "Bearer " + alunoJwt))
        .andExpect(status().isCreated());

    mockMvc
        .perform(
            get("/api/v1/evaluations/" + evaluationId + "/attempts")
                .header("Authorization", "Bearer " + adminJwt))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].evaluationId").value(evaluationId));
  }

  @Test
  void draftEvaluationCannotStart() throws Exception {
    String courseId = LearningTestFixtures.saveCourse(courses, "c-draft", "Draft").getId();
    MvcResult draft =
        mockMvc
            .perform(
                post("/api/v1/evaluations")
                    .header("Authorization", "Bearer " + adminJwt)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """
                        {
                          "name": "Rascunho",
                          "courseId": "%s",
                          "unitId": "matriz",
                          "questionIds": ["%s"],
                          "status": "rascunho",
                          "dueDate": "2026-12-31"
                        }
                        """
                            .formatted(courseId, questionId)))
            .andExpect(status().isCreated())
            .andReturn();
    JsonNode body = objectMapper.readTree(draft.getResponse().getContentAsString());

    mockMvc
        .perform(
            post("/api/v1/evaluations/" + body.get("id").asText() + "/attempts")
                .header("Authorization", "Bearer " + alunoJwt))
        .andExpect(status().isBadRequest());
  }
}

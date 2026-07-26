package com.navoxi.lms.web;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.navoxi.lms.domain.entity.Question;
import com.navoxi.lms.domain.enums.QuestionType;
import com.navoxi.lms.domain.enums.Role;
import com.navoxi.lms.domain.enums.UnitId;
import com.navoxi.lms.repository.CourseRepository;
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
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest(
    properties = {
      "spring.datasource.url=jdbc:h2:mem:lms-questions-eval;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE",
      "lms.seed.enabled=false"
    })
@AutoConfigureMockMvc
@ActiveProfiles("local")
@Transactional
class QuestionEvaluationControllerTest {

  private static final String QUESTION_BODY =
      """
      {
        "text": "Qual o prazo de SLA?",
        "type": "multipla",
        "category": "Comercial",
        "unitId": "matriz",
        "options": ["24h", "48h", "72h"],
        "correctKey": "24h"
      }
      """;

  @Autowired private MockMvc mockMvc;
  @Autowired private ObjectMapper objectMapper;
  @Autowired private UserAccountRepository users;
  @Autowired private CourseRepository courses;
  @Autowired private QuestionRepository questions;
  @Autowired private EvaluationRepository evaluations;
  @Autowired private NotificationRepository notifications;
  @Autowired private PasswordEncoder passwordEncoder;

  private String alunoJwt;
  private String adminJwt;
  private String courseId;

  @BeforeEach
  void seed() throws Exception {
    notifications.deleteAll();
    evaluations.deleteAll();
    questions.deleteAll();
    courses.deleteAll();
    users.deleteAll();
    LearningTestFixtures.saveUser(
        users, passwordEncoder, "u-aluno", "aluno@navoxi.com", Role.aluno, "secret123");
    LearningTestFixtures.saveUser(
        users, passwordEncoder, "u-admin", "admin@navoxi.com", Role.admin_premium, "secret123");
    courseId =
        LearningTestFixtures.saveCourse(courses, "c-eval", "Curso Avaliações").getId();
    alunoJwt =
        AuthTestSupport.loginAccessToken(mockMvc, objectMapper, "aluno@navoxi.com", "secret123");
    adminJwt =
        AuthTestSupport.loginAccessToken(mockMvc, objectMapper, "admin@navoxi.com", "secret123");
  }

  @Test
  void createQuestionForbiddenForAluno() throws Exception {
    mockMvc
        .perform(
            post("/api/v1/questions")
                .header("Authorization", "Bearer " + alunoJwt)
                .contentType(MediaType.APPLICATION_JSON)
                .content(QUESTION_BODY))
        .andExpect(status().isForbidden());
  }

  @Test
  void createAndListQuestionsForAdmin() throws Exception {
    mockMvc
        .perform(
            post("/api/v1/questions")
                .header("Authorization", "Bearer " + adminJwt)
                .contentType(MediaType.APPLICATION_JSON)
                .content(QUESTION_BODY))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.text").value("Qual o prazo de SLA?"))
        .andExpect(jsonPath("$.usageCount").value(0))
        .andExpect(jsonPath("$.options.length()").value(3))
        .andExpect(jsonPath("$.correctKey").value("24h"));

    mockMvc
        .perform(get("/api/v1/questions").header("Authorization", "Bearer " + adminJwt))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(1));
  }

  @Test
  void createQuestionRejectsInvalidAnswerKey() throws Exception {
    mockMvc
        .perform(
            post("/api/v1/questions")
                .header("Authorization", "Bearer " + adminJwt)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "text": "Sem gabarito válido",
                      "type": "multipla",
                      "category": "TI",
                      "unitId": "matriz",
                      "options": ["A", "B"],
                      "correctKey": "C"
                    }
                    """))
        .andExpect(status().isBadRequest());

    mockMvc
        .perform(
            post("/api/v1/questions")
                .header("Authorization", "Bearer " + adminJwt)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "text": "VF inválido",
                      "type": "verdadeiro",
                      "category": "TI",
                      "unitId": "matriz",
                      "correctKey": "talvez"
                    }
                    """))
        .andExpect(status().isBadRequest());
  }

  @Test
  void createEvaluationAndApplyIncrementsUsageAndNotifies() throws Exception {
    Question q = new Question();
    q.setId("q-apply");
    q.setText("Pergunta apply");
    q.setType(QuestionType.verdadeiro);
    q.setCategory("Compliance");
    q.setUnitId(UnitId.matriz);
    q.setUsageCount(2);
    questions.save(q);

    String evalBody =
        """
        {
          "name": "Quiz Apply",
          "courseId": "%s",
          "turmaId": "t1",
          "unitId": "matriz",
          "questionIds": ["q-apply"],
          "status": "publicada",
          "dueDate": "2026-12-31"
        }
        """
            .formatted(courseId);

    String evalId =
        objectMapper
            .readTree(
                mockMvc
                    .perform(
                        post("/api/v1/evaluations")
                            .header("Authorization", "Bearer " + adminJwt)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(evalBody))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.questionCount").value(1))
                    .andReturn()
                    .getResponse()
                    .getContentAsString())
            .get("id")
            .asText();

    mockMvc
        .perform(
            post("/api/v1/evaluations/" + evalId + "/apply")
                .header("Authorization", "Bearer " + adminJwt))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("aplicada"))
        .andExpect(jsonPath("$.appliedAt").isNotEmpty());

    mockMvc
        .perform(get("/api/v1/questions/q-apply").header("Authorization", "Bearer " + adminJwt))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.usageCount").value(3));

    org.junit.jupiter.api.Assertions.assertEquals(
        1, notifications.findByUserIdOrderByCreatedAtDesc("u-admin").size());
  }

  @Test
  void applyForbiddenForAluno() throws Exception {
    Question q = new Question();
    q.setId("q-authz");
    q.setText("Authz");
    q.setType(QuestionType.multipla);
    q.setCategory("TI");
    q.setUnitId(UnitId.matriz);
    q.setUsageCount(0);
    questions.save(q);

    String evalBody =
        """
        {
          "name": "Bloqueada",
          "courseId": "%s",
          "unitId": "matriz",
          "questionIds": ["q-authz"],
          "status": "rascunho",
          "dueDate": "2026-12-31"
        }
        """
            .formatted(courseId);

    String evalId =
        objectMapper
            .readTree(
                mockMvc
                    .perform(
                        post("/api/v1/evaluations")
                            .header("Authorization", "Bearer " + adminJwt)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(evalBody))
                    .andExpect(status().isCreated())
                    .andReturn()
                    .getResponse()
                    .getContentAsString())
            .get("id")
            .asText();

    mockMvc
        .perform(
            post("/api/v1/evaluations/" + evalId + "/apply")
                .header("Authorization", "Bearer " + alunoJwt))
        .andExpect(status().isForbidden());
  }

  @Test
  void patchEvaluationAllowedForAdmin() throws Exception {
    String createBody =
        """
        {
          "name": "Rascunho",
          "courseId": "%s",
          "unitId": "matriz",
          "questionIds": [],
          "status": "rascunho",
          "dueDate": "2026-08-01"
        }
        """
            .formatted(courseId);

    String evalId =
        objectMapper
            .readTree(
                mockMvc
                    .perform(
                        post("/api/v1/evaluations")
                            .header("Authorization", "Bearer " + adminJwt)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(createBody))
                    .andExpect(status().isCreated())
                    .andReturn()
                    .getResponse()
                    .getContentAsString())
            .get("id")
            .asText();

    String patchBody =
        """
        {
          "name": "Publicada",
          "courseId": "%s",
          "unitId": "matriz",
          "questionIds": [],
          "status": "publicada",
          "dueDate": "2026-08-15"
        }
        """
            .formatted(courseId);

    mockMvc
        .perform(
            patch("/api/v1/evaluations/" + evalId)
                .header("Authorization", "Bearer " + adminJwt)
                .contentType(MediaType.APPLICATION_JSON)
                .content(patchBody))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.name").value("Publicada"))
        .andExpect(jsonPath("$.status").value("publicada"));
  }
}

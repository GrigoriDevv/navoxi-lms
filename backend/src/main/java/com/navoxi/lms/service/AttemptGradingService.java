package com.navoxi.lms.service;

import com.navoxi.lms.domain.entity.AttemptAnswer;
import com.navoxi.lms.domain.entity.EvaluationAttempt;
import com.navoxi.lms.domain.entity.Question;
import com.navoxi.lms.domain.enums.AttemptStatus;
import com.navoxi.lms.domain.enums.QuestionType;
import com.navoxi.lms.repository.QuestionRepository;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class AttemptGradingService {

  private final QuestionRepository questions;

  public AttemptGradingService(QuestionRepository questions) {
    this.questions = questions;
  }

  public void gradeOnSubmit(EvaluationAttempt attempt) {
    List<String> questionIds = questionIds(attempt);
    Map<String, Question> byId = loadQuestionsById(questionIds);

    boolean hasEssay = false;
    int objectiveTotal = 0;
    int objectiveCorrect = 0;

    for (String questionId : questionIds) {
      Question question = byId.get(questionId);
      if (question == null) {
        continue;
      }

      if (question.getType() == QuestionType.dissertativa) {
        hasEssay = true;
        continue;
      }

      if (question.getType() != QuestionType.multipla
          && question.getType() != QuestionType.verdadeiro) {
        continue;
      }

      objectiveTotal++;
      AttemptAnswer answer = findOrCreateAnswer(attempt, questionId);
      boolean correct = isObjectiveCorrect(question, answer);
      answer.setIsCorrect(correct);
      if (correct) {
        objectiveCorrect++;
      }
    }

    if (objectiveTotal == 0) {
      attempt.setScorePct(null);
    } else {
      double pct = (objectiveCorrect * 100.0) / objectiveTotal;
      attempt.setScorePct(Math.round(pct * 10.0) / 10.0);
    }

    attempt.setStatus(hasEssay ? AttemptStatus.aguardando_correcao : AttemptStatus.corrigida);
  }

  /**
   * Recalcula scorePct sobre todas as questões (objetivas + dissertativas) e fecha o status
   * quando não há dissertativas pendentes.
   */
  public void recomputeAfterManualGrade(EvaluationAttempt attempt) {
    List<String> questionIds = questionIds(attempt);
    Map<String, Question> byId = loadQuestionsById(questionIds);

    int total = 0;
    int correct = 0;
    int pendingEssays = 0;

    for (String questionId : questionIds) {
      Question question = byId.get(questionId);
      if (question == null) {
        continue;
      }
      if (question.getType() != QuestionType.multipla
          && question.getType() != QuestionType.verdadeiro
          && question.getType() != QuestionType.dissertativa) {
        continue;
      }

      total++;
      AttemptAnswer answer =
          attempt.getAnswers().stream()
              .filter(a -> a.getQuestionId().equals(questionId))
              .findFirst()
              .orElse(null);

      if (question.getType() == QuestionType.dissertativa
          && (answer == null || answer.getIsCorrect() == null)) {
        pendingEssays++;
      }

      if (answer != null && Boolean.TRUE.equals(answer.getIsCorrect())) {
        correct++;
      }
    }

    if (total == 0) {
      attempt.setScorePct(null);
    } else {
      double pct = (correct * 100.0) / total;
      attempt.setScorePct(Math.round(pct * 10.0) / 10.0);
    }

    attempt.setStatus(
        pendingEssays == 0 ? AttemptStatus.corrigida : AttemptStatus.aguardando_correcao);
  }

  Question requireQuestion(String questionId) {
    return questions
        .findById(questionId)
        .orElseThrow(
            () ->
                new com.navoxi.lms.web.ApiExceptionHandler.NotFoundException(
                    "Questão não encontrada"));
  }

  private Map<String, Question> loadQuestionsById(List<String> questionIds) {
    Map<String, Question> byId = new HashMap<>();
    for (Question q : questions.findAllById(questionIds)) {
      byId.put(q.getId(), q);
    }
    return byId;
  }

  private static List<String> questionIds(EvaluationAttempt attempt) {
    return attempt.getEvaluation().getQuestionIds() == null
        ? List.of()
        : attempt.getEvaluation().getQuestionIds();
  }

  private static AttemptAnswer findOrCreateAnswer(EvaluationAttempt attempt, String questionId) {
    return attempt.getAnswers().stream()
        .filter(a -> a.getQuestionId().equals(questionId))
        .findFirst()
        .orElseGet(
            () -> {
              AttemptAnswer created = new AttemptAnswer();
              created.setAttempt(attempt);
              created.setQuestionId(questionId);
              attempt.getAnswers().add(created);
              return created;
            });
  }

  static boolean isObjectiveCorrect(Question question, AttemptAnswer answer) {
    String selected = answer.getSelectedOption();
    if (selected == null || selected.isBlank()) {
      selected = answer.getResponseText();
    }
    if (selected == null || selected.isBlank()) {
      return false;
    }
    String key = question.getCorrectKey();
    if (key == null || key.isBlank()) {
      return false;
    }
    if (question.getType() == QuestionType.verdadeiro) {
      return selected.trim().equalsIgnoreCase(key.trim());
    }
    return selected.equals(key);
  }
}

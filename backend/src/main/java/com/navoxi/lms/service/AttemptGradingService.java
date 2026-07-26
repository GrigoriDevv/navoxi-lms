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
    List<String> questionIds =
        attempt.getEvaluation().getQuestionIds() == null
            ? List.of()
            : attempt.getEvaluation().getQuestionIds();

    Map<String, Question> byId = new HashMap<>();
    for (Question q : questions.findAllById(questionIds)) {
      byId.put(q.getId(), q);
    }

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

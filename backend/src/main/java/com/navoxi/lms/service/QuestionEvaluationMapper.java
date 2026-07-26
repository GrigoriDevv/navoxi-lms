package com.navoxi.lms.service;

import com.navoxi.lms.domain.entity.Evaluation;
import com.navoxi.lms.domain.entity.Question;
import com.navoxi.lms.web.dto.EvaluationDto;
import com.navoxi.lms.web.dto.QuestionDto;
import java.util.List;

public final class QuestionEvaluationMapper {

  private QuestionEvaluationMapper() {}

  public static QuestionDto toDto(Question q) {
    return new QuestionDto(
        q.getId(),
        q.getText(),
        q.getType(),
        q.getCategory(),
        q.getUnitId(),
        q.getUsageCount(),
        q.getOptions() == null ? null : List.copyOf(q.getOptions()),
        q.getCorrectKey());
  }

  public static EvaluationDto toDto(Evaluation e) {
    List<String> ids = e.getQuestionIds() == null ? List.of() : List.copyOf(e.getQuestionIds());
    return new EvaluationDto(
        e.getId(),
        e.getName(),
        e.getCourseId(),
        e.getTurmaId(),
        e.getUnitId(),
        ids,
        e.getQuestionCount(),
        e.getStatus(),
        e.getDueDate(),
        e.getAppliedAt());
  }
}

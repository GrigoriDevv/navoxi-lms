package com.navoxi.lms.service;

import com.navoxi.lms.domain.entity.Evaluation;
import com.navoxi.lms.domain.entity.UserAccount;
import com.navoxi.lms.domain.enums.EvaluationStatus;
import com.navoxi.lms.domain.enums.NotificationType;
import com.navoxi.lms.repository.EvaluationRepository;
import com.navoxi.lms.repository.QuestionRepository;
import com.navoxi.lms.security.UnitScope;
import com.navoxi.lms.web.ApiExceptionHandler.BadRequestException;
import com.navoxi.lms.web.ApiExceptionHandler.NotFoundException;
import com.navoxi.lms.web.dto.EvaluationDto;
import com.navoxi.lms.web.dto.EvaluationRequest;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EvaluationService {

  private static final DateTimeFormatter APPLIED_AT =
      DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss").withLocale(Locale.forLanguageTag("pt-BR"));

  private final EvaluationRepository evaluations;
  private final QuestionRepository questions;
  private final NotificationService notifications;

  public EvaluationService(
      EvaluationRepository evaluations,
      QuestionRepository questions,
      NotificationService notifications) {
    this.evaluations = evaluations;
    this.questions = questions;
    this.notifications = notifications;
  }

  @Transactional(readOnly = true)
  public List<EvaluationDto> list(UserAccount actor) {
    List<Evaluation> list =
        UnitScope.isGlobal(actor)
            ? evaluations.findAll()
            : evaluations.findByUnitId(actor.getUnitId());
    return list.stream().map(QuestionEvaluationMapper::toDto).toList();
  }

  @Transactional(readOnly = true)
  public EvaluationDto get(UserAccount actor, String id) {
    return QuestionEvaluationMapper.toDto(requireAccessible(actor, id));
  }

  @Transactional
  public EvaluationDto create(UserAccount actor, EvaluationRequest req) {
    UnitScope.assertCanAccessUnit(actor, req.unitId());
    Evaluation e = new Evaluation();
    apply(e, req);
    return QuestionEvaluationMapper.toDto(evaluations.save(e));
  }

  @Transactional
  public EvaluationDto update(UserAccount actor, String id, EvaluationRequest req) {
    Evaluation e = requireAccessible(actor, id);
    UnitScope.assertCanAccessUnit(actor, req.unitId());
    apply(e, req);
    return QuestionEvaluationMapper.toDto(evaluations.save(e));
  }

  @Transactional
  public EvaluationDto apply(UserAccount actor, String id) {
    Evaluation e = requireAccessible(actor, id);
    if (e.getStatus() == EvaluationStatus.aplicada) {
      throw new BadRequestException("Avaliação já aplicada");
    }
    e.setStatus(EvaluationStatus.aplicada);
    e.setAppliedAt(APPLIED_AT.format(LocalDateTime.now()));

    List<String> ids = e.getQuestionIds() == null ? List.of() : e.getQuestionIds();
    for (String questionId : ids) {
      questions
          .findById(questionId)
          .ifPresent(
              q -> {
                Integer usage = q.getUsageCount() == null ? 0 : q.getUsageCount();
                q.setUsageCount(usage + 1);
                questions.save(q);
              });
    }

    Evaluation saved = evaluations.save(e);
    notifications.notify(
        actor,
        "Avaliação aplicada: " + saved.getName(),
        "A avaliação foi disponibilizada para a turma vinculada.",
        NotificationType.curso,
        "/aprendizagem/avaliacoes",
        "Aprendizagem",
        null);
    return QuestionEvaluationMapper.toDto(saved);
  }

  Evaluation requireAccessible(UserAccount actor, String id) {
    Evaluation e =
        evaluations
            .findById(id)
            .orElseThrow(() -> new NotFoundException("Avaliação não encontrada"));
    UnitScope.assertCanAccessUnit(actor, e.getUnitId());
    return e;
  }

  private void apply(Evaluation e, EvaluationRequest req) {
    e.setName(req.name());
    e.setCourseId(req.courseId());
    e.setTurmaId(blankToNull(req.turmaId()));
    e.setUnitId(req.unitId());
    List<String> ids =
        req.questionIds() == null ? new ArrayList<>() : new ArrayList<>(req.questionIds());
    e.setQuestionIds(ids);
    e.setQuestionCount(ids.size());
    e.setStatus(req.status());
    e.setDueDate(req.dueDate());
  }

  private static String blankToNull(String value) {
    return value == null || value.isBlank() ? null : value;
  }
}

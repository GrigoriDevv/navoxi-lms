package com.navoxi.lms.service;

import com.navoxi.lms.domain.entity.AttemptAnswer;
import com.navoxi.lms.domain.entity.Evaluation;
import com.navoxi.lms.domain.entity.EvaluationAttempt;
import com.navoxi.lms.domain.entity.Question;
import com.navoxi.lms.domain.entity.UserAccount;
import com.navoxi.lms.domain.enums.AttemptStatus;
import com.navoxi.lms.domain.enums.EvaluationStatus;
import com.navoxi.lms.domain.enums.NotificationType;
import com.navoxi.lms.domain.enums.QuestionType;
import com.navoxi.lms.domain.enums.Role;
import com.navoxi.lms.repository.EvaluationAttemptRepository;
import com.navoxi.lms.repository.EvaluationRepository;
import com.navoxi.lms.security.UnitScope;
import com.navoxi.lms.web.ApiExceptionHandler.BadRequestException;
import com.navoxi.lms.web.ApiExceptionHandler.ForbiddenException;
import com.navoxi.lms.web.ApiExceptionHandler.NotFoundException;
import com.navoxi.lms.web.dto.AttemptAnswerDto;
import com.navoxi.lms.web.dto.AttemptDto;
import com.navoxi.lms.web.dto.GradeAnswerRequest;
import com.navoxi.lms.web.dto.SaveAnswersRequest;
import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EvaluationAttemptService {

  private final EvaluationAttemptRepository attempts;
  private final EvaluationRepository evaluations;
  private final AttemptGradingService grading;
  private final CertificateService certificates;
  private final NotificationService notifications;

  public EvaluationAttemptService(
      EvaluationAttemptRepository attempts,
      EvaluationRepository evaluations,
      AttemptGradingService grading,
      CertificateService certificates,
      NotificationService notifications) {
    this.attempts = attempts;
    this.evaluations = evaluations;
    this.grading = grading;
    this.certificates = certificates;
    this.notifications = notifications;
  }

  @Transactional(readOnly = true)
  public List<AttemptDto> listMine(UserAccount actor) {
    return attempts.findByUserIdOrderByStartedAtDesc(actor.getId()).stream()
        .map(this::toDto)
        .toList();
  }

  @Transactional(readOnly = true)
  public List<AttemptDto> listForEvaluation(UserAccount actor, String evaluationId) {
    Evaluation evaluation = requireEvaluation(evaluationId);
    UnitScope.assertCanAccessUnit(actor, evaluation.getUnitId());

    if (isStaff(actor)) {
      return attempts.findByEvaluationIdOrderByStartedAtDesc(evaluationId).stream()
          .map(this::toDto)
          .toList();
    }

    return attempts
        .findByEvaluationIdAndUserIdOrderByAttemptNumberAsc(evaluationId, actor.getId())
        .stream()
        .map(this::toDto)
        .toList();
  }

  @Transactional(readOnly = true)
  public AttemptDto get(UserAccount actor, String attemptId) {
    return toDto(requireReadable(actor, attemptId));
  }

  @Transactional
  public AttemptDto start(UserAccount actor, String evaluationId) {
    Evaluation evaluation = requireEvaluation(evaluationId);
    UnitScope.assertCanAccessUnit(actor, evaluation.getUnitId());

    if (evaluation.getStatus() != EvaluationStatus.publicada
        && evaluation.getStatus() != EvaluationStatus.aplicada) {
      throw new BadRequestException("Avaliação não está disponível para tentativa");
    }

    if (attempts
        .findByEvaluationIdAndUserIdAndStatus(
            evaluationId, actor.getId(), AttemptStatus.em_andamento)
        .isPresent()) {
      throw new BadRequestException("Já existe uma tentativa em andamento para esta avaliação");
    }

    Integer max = attempts.maxAttemptNumber(evaluationId, actor.getId());
    int next = (max == null ? 0 : max) + 1;
    EvaluationAttempt attempt = new EvaluationAttempt();
    attempt.setEvaluation(evaluation);
    attempt.setUser(actor);
    attempt.setAttemptNumber(next);
    attempt.setStatus(AttemptStatus.em_andamento);
    attempt.setStartedAt(Instant.now());
    return toDto(attempts.save(attempt));
  }

  @Transactional
  public AttemptDto saveAnswers(UserAccount actor, String attemptId, SaveAnswersRequest body) {
    EvaluationAttempt attempt = requireOwnedOpen(actor, attemptId);
    Set<String> allowed =
        new HashSet<>(
            attempt.getEvaluation().getQuestionIds() == null
                ? List.of()
                : attempt.getEvaluation().getQuestionIds());

    if (body == null || body.answers() == null) {
      throw new BadRequestException("Respostas obrigatórias");
    }

    for (SaveAnswersRequest.AnswerItem item : body.answers()) {
      if (item.questionId() == null || item.questionId().isBlank()) {
        throw new BadRequestException("questionId obrigatório");
      }
      if (!allowed.contains(item.questionId())) {
        throw new BadRequestException("Questão não pertence a esta avaliação");
      }
      AttemptAnswer answer =
          attempt.getAnswers().stream()
              .filter(a -> a.getQuestionId().equals(item.questionId()))
              .findFirst()
              .orElseGet(
                  () -> {
                    AttemptAnswer created = new AttemptAnswer();
                    created.setAttempt(attempt);
                    created.setQuestionId(item.questionId());
                    attempt.getAnswers().add(created);
                    return created;
                  });
      answer.setResponseText(item.responseText());
      answer.setSelectedOption(item.selectedOption());
    }

    return toDto(attempts.save(attempt));
  }

  @Transactional
  public AttemptDto submit(UserAccount actor, String attemptId) {
    EvaluationAttempt attempt = requireOwnedOpen(actor, attemptId);
    attempt.setSubmittedAt(Instant.now());
    grading.gradeOnSubmit(attempt);
    EvaluationAttempt saved = attempts.save(attempt);
    maybeIssueCertificate(saved);
    maybeNotifyGradeResult(saved);
    return toDto(saved);
  }

  @Transactional
  public AttemptDto gradeAnswer(
      UserAccount actor, String attemptId, String answerId, GradeAnswerRequest body) {
    EvaluationAttempt attempt =
        attempts
            .findById(attemptId)
            .orElseThrow(() -> new NotFoundException("Tentativa não encontrada"));
    UnitScope.assertCanAccessUnit(actor, attempt.getEvaluation().getUnitId());
    if (!isStaff(actor)) {
      throw new ForbiddenException("Sem permissão para corrigir esta tentativa");
    }
    if (attempt.getStatus() != AttemptStatus.aguardando_correcao
        && attempt.getStatus() != AttemptStatus.corrigida) {
      throw new BadRequestException("Tentativa não está em correção");
    }

    AttemptAnswer answer =
        attempt.getAnswers().stream()
            .filter(a -> a.getId().equals(answerId))
            .findFirst()
            .orElseThrow(() -> new NotFoundException("Resposta não encontrada"));

    Question question = grading.requireQuestion(answer.getQuestionId());
    if (question.getType() != QuestionType.dissertativa) {
      throw new BadRequestException("Apenas questões dissertativas são corrigidas manualmente");
    }
    if (body == null || body.isCorrect() == null) {
      throw new BadRequestException("isCorrect é obrigatório");
    }

    answer.setIsCorrect(body.isCorrect());
    answer.setFeedback(body.feedback());
    grading.recomputeAfterManualGrade(attempt);
    EvaluationAttempt saved = attempts.save(attempt);
    maybeNotifyGradeResult(saved);
    maybeIssueCertificate(saved);
    return toDto(saved);
  }

  private void maybeNotifyGradeResult(EvaluationAttempt attempt) {
    if (attempt.getStatus() != AttemptStatus.corrigida) {
      return;
    }
    String marker = "grade-result:" + attempt.getId();
    if (notifications.existsWithDetails(attempt.getUser().getId(), marker)) {
      return;
    }
    Evaluation evaluation = attempt.getEvaluation();
    String score =
        attempt.getScorePct() == null
            ? "—"
            : String.format(java.util.Locale.ROOT, "%.0f%%", attempt.getScorePct());
    notifications.notify(
        attempt.getUser(),
        "Resultado da correção",
        "Sua tentativa em \"" + evaluation.getName() + "\" foi corrigida. Nota: " + score + ".",
        NotificationType.curso,
        "/aprendizagem/cursos/" + evaluation.getCourseId(),
        "Aprendizagem",
        marker);
  }

  private void maybeIssueCertificate(EvaluationAttempt attempt) {
    if (attempt.getStatus() != AttemptStatus.corrigida) {
      return;
    }
    certificates.tryIssue(attempt.getUser().getId(), attempt.getEvaluation().getCourseId());
  }

  private EvaluationAttempt requireOwnedOpen(UserAccount actor, String attemptId) {
    EvaluationAttempt attempt =
        attempts
            .findById(attemptId)
            .orElseThrow(() -> new NotFoundException("Tentativa não encontrada"));
    if (!attempt.getUser().getId().equals(actor.getId())) {
      throw new ForbiddenException("Sem permissão para alterar esta tentativa");
    }
    if (attempt.getStatus() != AttemptStatus.em_andamento) {
      throw new BadRequestException("Tentativa já enviada");
    }
    return attempt;
  }

  private EvaluationAttempt requireReadable(UserAccount actor, String attemptId) {
    EvaluationAttempt attempt =
        attempts
            .findById(attemptId)
            .orElseThrow(() -> new NotFoundException("Tentativa não encontrada"));
    UnitScope.assertCanAccessUnit(actor, attempt.getEvaluation().getUnitId());
    if (attempt.getUser().getId().equals(actor.getId()) || isStaff(actor)) {
      return attempt;
    }
    throw new ForbiddenException("Sem permissão para ver esta tentativa");
  }

  private Evaluation requireEvaluation(String evaluationId) {
    return evaluations
        .findById(evaluationId)
        .orElseThrow(() -> new NotFoundException("Avaliação não encontrada"));
  }

  private static boolean isStaff(UserAccount actor) {
    Role role = actor.getRole();
    return role == Role.admin_premium
        || role == Role.admin_unidade
        || role == Role.instrutor
        || role == Role.gestor_conteudo;
  }

  private AttemptDto toDto(EvaluationAttempt a) {
    List<AttemptAnswerDto> answers =
        a.getAnswers().stream()
            .map(
                ans ->
                    new AttemptAnswerDto(
                        ans.getId(),
                        ans.getQuestionId(),
                        ans.getResponseText(),
                        ans.getSelectedOption(),
                        ans.getIsCorrect(),
                        ans.getFeedback()))
            .toList();
    return new AttemptDto(
        a.getId(),
        a.getEvaluation().getId(),
        a.getUser().getId(),
        a.getUser().getName(),
        a.getAttemptNumber(),
        a.getStatus(),
        DateFormats.format(a.getStartedAt()),
        DateFormats.format(a.getSubmittedAt()),
        a.getScorePct(),
        answers);
  }
}

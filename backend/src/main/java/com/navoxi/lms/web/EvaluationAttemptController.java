package com.navoxi.lms.web;

import com.navoxi.lms.service.EvaluationAttemptService;
import com.navoxi.lms.web.dto.AttemptDto;
import com.navoxi.lms.web.dto.SaveAnswersRequest;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class EvaluationAttemptController {

  private final EvaluationAttemptService attempts;
  private final CurrentUserResolver currentUser;

  public EvaluationAttemptController(
      EvaluationAttemptService attempts, CurrentUserResolver currentUser) {
    this.attempts = attempts;
    this.currentUser = currentUser;
  }

  @GetMapping("/attempts/mine")
  public List<AttemptDto> listMine() {
    return attempts.listMine(currentUser.require());
  }

  @GetMapping("/evaluations/{evaluationId}/attempts")
  public List<AttemptDto> listForEvaluation(@PathVariable String evaluationId) {
    return attempts.listForEvaluation(currentUser.require(), evaluationId);
  }

  @PostMapping("/evaluations/{evaluationId}/attempts")
  @ResponseStatus(HttpStatus.CREATED)
  public AttemptDto start(@PathVariable String evaluationId) {
    return attempts.start(currentUser.require(), evaluationId);
  }

  @GetMapping("/attempts/{id}")
  public AttemptDto get(@PathVariable String id) {
    return attempts.get(currentUser.require(), id);
  }

  @PutMapping("/attempts/{id}/answers")
  public AttemptDto saveAnswers(@PathVariable String id, @RequestBody SaveAnswersRequest body) {
    return attempts.saveAnswers(currentUser.require(), id, body);
  }

  @PostMapping("/attempts/{id}/submit")
  public AttemptDto submit(@PathVariable String id) {
    return attempts.submit(currentUser.require(), id);
  }
}

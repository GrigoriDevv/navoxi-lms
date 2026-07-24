package com.navoxi.lms.web;

import com.navoxi.lms.service.EvaluationService;
import com.navoxi.lms.web.dto.EvaluationDto;
import com.navoxi.lms.web.dto.EvaluationRequest;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/evaluations")
public class EvaluationController {

  private final EvaluationService evaluations;
  private final CurrentUserResolver currentUser;

  public EvaluationController(EvaluationService evaluations, CurrentUserResolver currentUser) {
    this.evaluations = evaluations;
    this.currentUser = currentUser;
  }

  @GetMapping
  public List<EvaluationDto> list() {
    return evaluations.list(currentUser.require());
  }

  @GetMapping("/{id}")
  public EvaluationDto get(@PathVariable String id) {
    return evaluations.get(currentUser.require(), id);
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  @PreAuthorize(
      "hasAnyRole('instrutor', 'gestor_conteudo', 'admin_premium', 'admin_unidade')")
  public EvaluationDto create(@Valid @RequestBody EvaluationRequest request) {
    return evaluations.create(currentUser.require(), request);
  }

  @PatchMapping("/{id}")
  @PreAuthorize(
      "hasAnyRole('instrutor', 'gestor_conteudo', 'admin_premium', 'admin_unidade')")
  public EvaluationDto update(
      @PathVariable String id, @Valid @RequestBody EvaluationRequest request) {
    return evaluations.update(currentUser.require(), id, request);
  }

  @PostMapping("/{id}/apply")
  @PreAuthorize(
      "hasAnyRole('instrutor', 'gestor_conteudo', 'admin_premium', 'admin_unidade')")
  public EvaluationDto apply(@PathVariable String id) {
    return evaluations.apply(currentUser.require(), id);
  }
}

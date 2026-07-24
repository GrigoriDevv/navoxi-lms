package com.navoxi.lms.web;

import com.navoxi.lms.service.QuestionService;
import com.navoxi.lms.web.dto.QuestionDto;
import com.navoxi.lms.web.dto.QuestionRequest;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/questions")
public class QuestionController {

  private final QuestionService questions;
  private final CurrentUserResolver currentUser;

  public QuestionController(QuestionService questions, CurrentUserResolver currentUser) {
    this.questions = questions;
    this.currentUser = currentUser;
  }

  @GetMapping
  public List<QuestionDto> list() {
    return questions.list(currentUser.require());
  }

  @GetMapping("/{id}")
  public QuestionDto get(@PathVariable String id) {
    return questions.get(currentUser.require(), id);
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  @PreAuthorize(
      "hasAnyRole('instrutor', 'gestor_conteudo', 'admin_premium', 'admin_unidade')")
  public QuestionDto create(@Valid @RequestBody QuestionRequest request) {
    return questions.create(currentUser.require(), request);
  }

  @PatchMapping("/{id}")
  @PreAuthorize(
      "hasAnyRole('instrutor', 'gestor_conteudo', 'admin_premium', 'admin_unidade')")
  public QuestionDto update(
      @PathVariable String id, @Valid @RequestBody QuestionRequest request) {
    return questions.update(currentUser.require(), id, request);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @PreAuthorize(
      "hasAnyRole('instrutor', 'gestor_conteudo', 'admin_premium', 'admin_unidade')")
  public void delete(@PathVariable String id) {
    questions.delete(currentUser.require(), id);
  }
}

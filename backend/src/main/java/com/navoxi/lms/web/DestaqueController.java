package com.navoxi.lms.web;

import com.navoxi.lms.service.DestaqueService;
import com.navoxi.lms.web.dto.DestaqueDto;
import com.navoxi.lms.web.dto.DestaqueRequest;
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
@RequestMapping("/api/v1/destaques")
public class DestaqueController {

  private final DestaqueService destaques;
  private final CurrentUserResolver currentUser;

  public DestaqueController(DestaqueService destaques, CurrentUserResolver currentUser) {
    this.destaques = destaques;
    this.currentUser = currentUser;
  }

  @GetMapping
  public List<DestaqueDto> list() {
    return destaques.list(currentUser.require());
  }

  @GetMapping("/{id}")
  public DestaqueDto get(@PathVariable String id) {
    return destaques.get(currentUser.require(), id);
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  @PreAuthorize("hasAnyRole('gestor_conteudo', 'admin_premium', 'admin_unidade')")
  public DestaqueDto create(@RequestBody DestaqueRequest request) {
    return destaques.create(currentUser.require(), request);
  }

  @PatchMapping("/{id}")
  @PreAuthorize("hasAnyRole('gestor_conteudo', 'admin_premium', 'admin_unidade')")
  public DestaqueDto update(@PathVariable String id, @RequestBody DestaqueRequest request) {
    return destaques.update(currentUser.require(), id, request);
  }
}

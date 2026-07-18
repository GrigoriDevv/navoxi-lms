package com.navoxi.lms.web;

import com.navoxi.lms.service.EnrollmentRequestService;
import com.navoxi.lms.web.dto.EnrollmentRequestCreate;
import com.navoxi.lms.web.dto.EnrollmentRequestDecision;
import com.navoxi.lms.web.dto.EnrollmentRequestDto;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/enrollment-requests")
public class EnrollmentRequestController {

  private final EnrollmentRequestService requests;
  private final CurrentUserResolver currentUser;

  public EnrollmentRequestController(
      EnrollmentRequestService requests, CurrentUserResolver currentUser) {
    this.requests = requests;
    this.currentUser = currentUser;
  }

  @GetMapping
  public List<EnrollmentRequestDto> list() {
    return requests.listVisible(currentUser.require());
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public EnrollmentRequestDto create(@Valid @RequestBody EnrollmentRequestCreate body) {
    return requests.create(currentUser.require(), body);
  }

  @RequestMapping(
      value = "/{id}/decision",
      method = {RequestMethod.PUT, RequestMethod.POST})
  @PreAuthorize("hasAnyRole('admin_premium', 'admin_unidade', 'gestor_conteudo')")
  public EnrollmentRequestDto decide(
      @PathVariable String id, @Valid @RequestBody EnrollmentRequestDecision body) {
    return requests.decide(currentUser.require(), id, body.status());
  }
}

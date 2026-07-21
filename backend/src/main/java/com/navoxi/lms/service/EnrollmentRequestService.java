package com.navoxi.lms.service;

import com.navoxi.lms.domain.entity.Course;
import com.navoxi.lms.domain.entity.EnrollmentRequest;
import com.navoxi.lms.domain.entity.UserAccount;
import com.navoxi.lms.domain.enums.EnrollmentRequestStatus;
import com.navoxi.lms.domain.enums.EnrollmentStatus;
import com.navoxi.lms.domain.enums.NotificationType;
import com.navoxi.lms.domain.enums.Role;
import com.navoxi.lms.repository.CourseRepository;
import com.navoxi.lms.repository.EnrollmentRepository;
import com.navoxi.lms.repository.EnrollmentRequestRepository;
import com.navoxi.lms.repository.UserAccountRepository;
import com.navoxi.lms.security.UnitScope;
import com.navoxi.lms.web.ApiExceptionHandler.BadRequestException;
import com.navoxi.lms.web.ApiExceptionHandler.ForbiddenException;
import com.navoxi.lms.web.ApiExceptionHandler.NotFoundException;
import com.navoxi.lms.web.dto.EnrollmentRequestCreate;
import com.navoxi.lms.web.dto.EnrollmentRequestDto;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EnrollmentRequestService {

  private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

  private final EnrollmentRequestRepository requests;
  private final CourseRepository courses;
  private final EnrollmentRepository enrollments;
  private final EnrollmentService enrollmentService;
  private final NotificationService notifications;
  private final UserAccountRepository users;

  public EnrollmentRequestService(
      EnrollmentRequestRepository requests,
      CourseRepository courses,
      EnrollmentRepository enrollments,
      EnrollmentService enrollmentService,
      NotificationService notifications,
      UserAccountRepository users) {
    this.requests = requests;
    this.courses = courses;
    this.enrollments = enrollments;
    this.enrollmentService = enrollmentService;
    this.notifications = notifications;
    this.users = users;
  }

  @Transactional(readOnly = true)
  public List<EnrollmentRequestDto> listVisible(UserAccount actor) {
    List<EnrollmentRequest> list =
        switch (actor.getRole()) {
          case admin_premium -> requests.findAllByOrderByRequestedAtDesc();
          case admin_unidade, gestor_conteudo ->
              requests.findByUnitIdOrderByRequestedAtDesc(actor.getUnitId());
          default -> requests.findByUserIdOrderByRequestedAtDesc(actor.getId());
        };
    return list.stream().map(CourseMapper::toDto).toList();
  }

  @Transactional
  public EnrollmentRequestDto create(UserAccount actor, EnrollmentRequestCreate body) {
    Course course =
        courses
            .findById(body.courseId())
            .orElseThrow(() -> new NotFoundException("Curso não encontrado"));
    UnitScope.assertCanAccessCourse(actor, course);

    if (enrollments.existsByUserIdAndCourseIdAndStatus(
        actor.getId(), course.getId(), EnrollmentStatus.ativa)) {
      throw new BadRequestException("Já existe matrícula ativa neste curso");
    }
    if (requests.existsByUserIdAndCourseIdAndStatus(
        actor.getId(), course.getId(), EnrollmentRequestStatus.pendente)) {
      throw new BadRequestException("Já existe solicitação pendente neste curso");
    }

    EnrollmentRequest req = new EnrollmentRequest();
    req.setUser(actor);
    req.setCourse(course);
    req.setUserName(actor.getName());
    req.setCourseTitle(course.getTitle());
    req.setTurmaId(blankToNull(body.turmaId()));
    req.setTurmaName(blankToNull(body.turmaName()));
    req.setUnitId(actor.getUnitId());
    req.setRequestedAt(LocalDateTime.now().format(FMT));
    req.setStatus(EnrollmentRequestStatus.pendente);
    EnrollmentRequest saved = requests.save(req);

    notifications.notify(
        actor,
        "Solicitação enviada",
        "Sua inscrição em \"" + course.getTitle() + "\" aguarda aprovação.",
        NotificationType.info,
        "/aprendizagem/catalogo?tab=inscricoes",
        "Aprendizagem",
        "Curso: " + course.getTitle() + "\nStatus: pendente");

    notifyApprovers(saved);
    return CourseMapper.toDto(saved);
  }

  @Transactional
  public EnrollmentRequestDto decide(
      UserAccount actor, String id, EnrollmentRequestStatus status) {
    if (status != EnrollmentRequestStatus.aprovada && status != EnrollmentRequestStatus.rejeitada) {
      throw new BadRequestException("Status de decisão inválido");
    }
    if (!canDecide(actor)) {
      throw new ForbiddenException("Sem permissão para decidir solicitações");
    }

    EnrollmentRequest req =
        requests.findById(id).orElseThrow(() -> new NotFoundException("Solicitação não encontrada"));
    if (req.getStatus() != EnrollmentRequestStatus.pendente) {
      throw new BadRequestException("Solicitação já foi decidida");
    }
    if (!canAccessRequest(actor, req)) {
      throw new ForbiddenException("Solicitação fora do escopo da unidade");
    }

    req.setStatus(status);
    req.setReviewer(actor.getName());
    req.setReviewedAt(LocalDateTime.now().format(FMT));
    requests.save(req);

    if (status == EnrollmentRequestStatus.aprovada) {
      enrollmentService.createActive(
          req.getUser(), req.getCourse(), req.getTurmaId(), req.getTurmaName());
      notifications.notify(
          req.getUser(),
          "Matrícula aprovada",
          "Sua inscrição em \"" + req.getCourseTitle() + "\" foi aprovada.",
          NotificationType.curso,
          "/aprendizagem/catalogo?tab=inscricoes",
          "Aprendizagem",
          "Revisor: " + actor.getName());
    } else {
      notifications.notify(
          req.getUser(),
          "Matrícula rejeitada",
          "Sua inscrição em \"" + req.getCourseTitle() + "\" foi rejeitada.",
          NotificationType.alerta,
          "/aprendizagem/catalogo",
          "Aprendizagem",
          "Revisor: " + actor.getName());
    }

    return CourseMapper.toDto(req);
  }

  private void notifyApprovers(EnrollmentRequest req) {
    Set<String> notified = new HashSet<>();
    for (UserAccount admin : users.findByRole(Role.admin_premium)) {
      if (notified.add(admin.getId())) {
        sendApproverNotice(admin, req);
      }
    }
    for (UserAccount local :
        users.findByRoleInAndUnitId(
            List.of(Role.admin_unidade, Role.gestor_conteudo), req.getUnitId())) {
      if (notified.add(local.getId())) {
        sendApproverNotice(local, req);
      }
    }
  }

  private void sendApproverNotice(UserAccount approver, EnrollmentRequest req) {
    notifications.notify(
        approver,
        "Nova solicitação de matrícula",
        req.getUserName() + " solicitou inscrição em \"" + req.getCourseTitle() + "\".",
        NotificationType.alerta,
        "/aprendizagem/solicitacoes?status=pendente",
        "Aprendizagem",
        "Solicitante: "
            + req.getUserName()
            + "\nCurso: "
            + req.getCourseTitle()
            + "\nUnidade: "
            + req.getUnitId());
  }

  private static boolean canDecide(UserAccount actor) {
    return actor.getRole() == Role.admin_premium
        || actor.getRole() == Role.admin_unidade
        || actor.getRole() == Role.gestor_conteudo;
  }

  private static boolean canAccessRequest(UserAccount actor, EnrollmentRequest req) {
    if (actor.getRole() == Role.admin_premium) {
      return true;
    }
    return actor.getUnitId() == req.getUnitId();
  }

  private static String blankToNull(String value) {
    return value == null || value.isBlank() ? null : value.trim();
  }
}

package com.navoxi.lms.service;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import com.navoxi.lms.domain.entity.Certificate;
import com.navoxi.lms.domain.entity.Enrollment;
import com.navoxi.lms.domain.entity.Evaluation;
import com.navoxi.lms.domain.entity.EvaluationAttempt;
import com.navoxi.lms.domain.entity.UserAccount;
import com.navoxi.lms.domain.enums.AttemptStatus;
import com.navoxi.lms.domain.enums.CertificateStatus;
import com.navoxi.lms.domain.enums.EnrollmentStatus;
import com.navoxi.lms.domain.enums.EvaluationStatus;
import com.navoxi.lms.domain.enums.Role;
import com.navoxi.lms.repository.CertificateRepository;
import com.navoxi.lms.repository.EnrollmentRepository;
import com.navoxi.lms.repository.EvaluationAttemptRepository;
import com.navoxi.lms.repository.EvaluationRepository;
import com.navoxi.lms.security.UnitScope;
import com.navoxi.lms.web.ApiExceptionHandler.ForbiddenException;
import com.navoxi.lms.web.ApiExceptionHandler.NotFoundException;
import com.navoxi.lms.web.dto.CertificateDto;
import java.io.ByteArrayOutputStream;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CertificateService {

  private static final SecureRandom RANDOM = new SecureRandom();

  private final CertificateRepository certificates;
  private final EnrollmentRepository enrollments;
  private final EvaluationRepository evaluations;
  private final EvaluationAttemptRepository attempts;
  private final int validityMonths;
  private final String publicVerifyBaseUrl;

  public CertificateService(
      CertificateRepository certificates,
      EnrollmentRepository enrollments,
      EvaluationRepository evaluations,
      EvaluationAttemptRepository attempts,
      @Value("${lms.certificate.validity-months:24}") int validityMonths,
      @Value(
              "${lms.certificate.public-verify-base-url:http://localhost:3000/certificados/verificar}")
          String publicVerifyBaseUrl) {
    this.certificates = certificates;
    this.enrollments = enrollments;
    this.evaluations = evaluations;
    this.attempts = attempts;
    this.validityMonths = Math.max(1, validityMonths);
    this.publicVerifyBaseUrl =
        publicVerifyBaseUrl.endsWith("/")
            ? publicVerifyBaseUrl.substring(0, publicVerifyBaseUrl.length() - 1)
            : publicVerifyBaseUrl;
  }

  /**
   * Emite certificado se elegível. Idempotente: se já existe (valido ou revogado), não cria outro.
   */
  @Transactional
  public Optional<CertificateDto> tryIssue(String userId, String courseId) {
    if (certificates.existsByUserIdAndCourseId(userId, courseId)) {
      return certificates.findByUserIdAndCourseId(userId, courseId).map(this::toDto);
    }

    Enrollment enrollment =
        enrollments
            .findByUserIdAndCourseIdAndStatus(userId, courseId, EnrollmentStatus.concluida)
            .orElse(null);
    if (enrollment == null) {
      return Optional.empty();
    }
    if (!evaluationsPassed(userId, courseId, enrollment.getTurmaId())) {
      return Optional.empty();
    }

    Instant now = Instant.now();
    Certificate cert = new Certificate();
    cert.setUser(enrollment.getUser());
    cert.setCourse(enrollment.getCourse());
    cert.setEnrollment(enrollment);
    cert.setUserName(enrollment.getUserName());
    cert.setCourseTitle(enrollment.getCourseTitle());
    cert.setUnitId(enrollment.getUnitId());
    cert.setIssuedAt(now);
    cert.setExpiresAt(now.plus(validityMonths * 30L, ChronoUnit.DAYS));
    cert.setValidationHash(newHash());
    cert.setStatus(CertificateStatus.valido);
    return Optional.of(toDto(certificates.save(cert)));
  }

  @Transactional(readOnly = true)
  public List<CertificateDto> listMine(UserAccount actor) {
    return certificates.findByUserIdOrderByIssuedAtDesc(actor.getId()).stream()
        .map(this::toDto)
        .toList();
  }

  @Transactional(readOnly = true)
  public CertificateDto verifyByHash(String hash) {
    return toDto(requireByHash(hash));
  }

  @Transactional(readOnly = true)
  public byte[] pdfById(UserAccount actor, String id) {
    Certificate cert =
        certificates.findById(id).orElseThrow(() -> new NotFoundException("Certificado não encontrado"));
    assertCanReadPdf(actor, cert);
    return renderPdf(cert);
  }

  @Transactional(readOnly = true)
  public byte[] pdfByHash(String hash) {
    return renderPdf(requireByHash(hash));
  }

  @Transactional
  public CertificateDto revoke(UserAccount actor, String id) {
    Certificate cert =
        certificates.findById(id).orElseThrow(() -> new NotFoundException("Certificado não encontrado"));
    UnitScope.assertCanAccessUnit(actor, cert.getUnitId());
    if (!isStaff(actor)) {
      throw new ForbiddenException("Sem permissão para revogar certificado");
    }
    cert.setStatus(CertificateStatus.revogado);
    return toDto(certificates.save(cert));
  }

  boolean evaluationsPassed(String userId, String courseId, String enrollmentTurmaId) {
    List<Evaluation> required =
        evaluations.findByCourseId(courseId).stream()
            .filter(
                e ->
                    e.getStatus() == EvaluationStatus.publicada
                        || e.getStatus() == EvaluationStatus.aplicada)
            .filter(e -> turmaMatches(e.getTurmaId(), enrollmentTurmaId))
            .toList();
    if (required.isEmpty()) {
      return true;
    }
    List<EvaluationAttempt> userAttempts = attempts.findByUserIdOrderByStartedAtDesc(userId);
    for (Evaluation eval : required) {
      double threshold =
          eval.getPassingScorePct() == null ? 70.0 : eval.getPassingScorePct();
      boolean passed =
          userAttempts.stream()
              .filter(a -> a.getEvaluation().getId().equals(eval.getId()))
              .filter(a -> a.getStatus() == AttemptStatus.corrigida)
              .anyMatch(
                  a -> a.getScorePct() != null && a.getScorePct() + 1e-9 >= threshold);
      if (!passed) {
        return false;
      }
    }
    return true;
  }

  private static boolean turmaMatches(String evaluationTurmaId, String enrollmentTurmaId) {
    if (evaluationTurmaId == null || evaluationTurmaId.isBlank()) {
      return true;
    }
    return Objects.equals(evaluationTurmaId, enrollmentTurmaId);
  }

  private Certificate requireByHash(String hash) {
    if (hash == null || hash.isBlank()) {
      throw new NotFoundException("Certificado não encontrado");
    }
    return certificates
        .findByValidationHash(hash.trim())
        .orElseThrow(() -> new NotFoundException("Certificado não encontrado"));
  }

  private void assertCanReadPdf(UserAccount actor, Certificate cert) {
    if (cert.getUser().getId().equals(actor.getId())) {
      return;
    }
    if (!isStaff(actor)) {
      throw new ForbiddenException("Sem permissão para baixar este certificado");
    }
    UnitScope.assertCanAccessUnit(actor, cert.getUnitId());
  }

  private static boolean isStaff(UserAccount actor) {
    Role role = actor.getRole();
    return role == Role.admin_premium
        || role == Role.admin_unidade
        || role == Role.instrutor
        || role == Role.gestor_conteudo;
  }

  private static String newHash() {
    byte[] bytes = new byte[16];
    RANDOM.nextBytes(bytes);
    return HexFormat.of().formatHex(bytes);
  }

  CertificateDto toDto(Certificate c) {
    String status = c.getStatus().name();
    if (c.getStatus() == CertificateStatus.valido
        && c.getExpiresAt() != null
        && c.getExpiresAt().isBefore(Instant.now())) {
      status = "expirado";
    }
    return new CertificateDto(
        c.getId(),
        c.getUser().getId(),
        c.getUserName(),
        c.getCourse().getId(),
        c.getCourseTitle(),
        c.getUnitId(),
        DateFormats.format(c.getIssuedAt()),
        DateFormats.format(c.getExpiresAt()),
        status,
        c.getValidationHash());
  }

  private byte[] renderPdf(Certificate cert) {
    try {
      Document document = new Document();
      ByteArrayOutputStream out = new ByteArrayOutputStream();
      PdfWriter.getInstance(document, out);
      document.open();

      Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20);
      Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 12);
      Font smallFont = FontFactory.getFont(FontFactory.HELVETICA, 10);

      document.add(new Paragraph("Certificado de Conclusão", titleFont));
      document.add(new Paragraph(" ", bodyFont));
      document.add(new Paragraph("Certificamos que", bodyFont));
      document.add(new Paragraph(cert.getUserName(), titleFont));
      document.add(new Paragraph("concluiu o curso", bodyFont));
      document.add(new Paragraph(cert.getCourseTitle(), titleFont));
      document.add(new Paragraph(" ", bodyFont));
      document.add(
          new Paragraph("Emitido em: " + DateFormats.format(cert.getIssuedAt()), bodyFont));
      document.add(
          new Paragraph("Válido até: " + DateFormats.format(cert.getExpiresAt()), bodyFont));
      document.add(new Paragraph("Status: " + toDto(cert).status(), bodyFont));
      document.add(new Paragraph(" ", bodyFont));
      String verifyUrl = publicVerifyBaseUrl + "/" + cert.getValidationHash();
      document.add(new Paragraph("Validação: " + verifyUrl, smallFont));
      document.add(new Paragraph("Código: " + cert.getValidationHash(), smallFont));

      document.close();
      return out.toByteArray();
    } catch (DocumentException e) {
      throw new IllegalStateException("Falha ao gerar PDF do certificado", e);
    }
  }
}

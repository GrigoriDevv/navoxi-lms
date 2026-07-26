package com.navoxi.lms.web;

import com.navoxi.lms.domain.entity.UserAccount;
import com.navoxi.lms.service.CertificateService;
import com.navoxi.lms.web.dto.CertificateDto;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/certificates")
public class CertificateController {

  private final CurrentUserResolver currentUser;
  private final CertificateService certificates;

  public CertificateController(CurrentUserResolver currentUser, CertificateService certificates) {
    this.currentUser = currentUser;
    this.certificates = certificates;
  }

  @GetMapping("/me")
  @PreAuthorize("isAuthenticated()")
  public List<CertificateDto> mine() {
    return certificates.listMine(currentUser.require());
  }

  @GetMapping("/{id}/pdf")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<byte[]> pdf(@PathVariable String id) {
    UserAccount actor = currentUser.require();
    byte[] pdf = certificates.pdfById(actor, id);
    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"certificado-" + id + ".pdf\"")
        .contentType(MediaType.APPLICATION_PDF)
        .body(pdf);
  }

  @GetMapping("/verify/{hash}")
  public CertificateDto verify(@PathVariable String hash) {
    return certificates.verifyByHash(hash);
  }

  @GetMapping("/verify/{hash}/pdf")
  public ResponseEntity<byte[]> verifyPdf(@PathVariable String hash) {
    byte[] pdf = certificates.pdfByHash(hash);
    return ResponseEntity.ok()
        .header(
            HttpHeaders.CONTENT_DISPOSITION,
            "attachment; filename=\"certificado-" + hash + ".pdf\"")
        .contentType(MediaType.APPLICATION_PDF)
        .body(pdf);
  }

  @PatchMapping("/{id}/revoke")
  @PreAuthorize("hasAnyRole('admin_premium','admin_unidade','gestor_conteudo','instrutor')")
  public CertificateDto revoke(@PathVariable String id) {
    return certificates.revoke(currentUser.require(), id);
  }
}

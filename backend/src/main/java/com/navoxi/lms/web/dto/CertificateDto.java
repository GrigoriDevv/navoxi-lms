package com.navoxi.lms.web.dto;

import com.navoxi.lms.domain.enums.UnitId;

/** Certificado emitido. {@code status} efetivo: valido | expirado | revogado. */
public record CertificateDto(
    String id,
    String userId,
    String userName,
    String courseId,
    String courseTitle,
    UnitId unitId,
    String issuedAt,
    String expiresAt,
    String status,
    String validationHash) {}

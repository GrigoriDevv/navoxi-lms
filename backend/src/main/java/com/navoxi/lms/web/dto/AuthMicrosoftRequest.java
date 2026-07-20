package com.navoxi.lms.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record AuthMicrosoftRequest(
    @NotBlank @Email String email, @NotBlank String name, String microsoftOid) {}

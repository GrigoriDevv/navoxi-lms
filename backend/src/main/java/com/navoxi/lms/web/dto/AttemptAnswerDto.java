package com.navoxi.lms.web.dto;

public record AttemptAnswerDto(
    String id, String questionId, String responseText, String selectedOption, Boolean isCorrect) {}

package com.navoxi.lms.web.dto;

/** Request body for staff grading of a dissertativa answer. */
public record GradeAnswerRequest(Boolean isCorrect, String feedback) {}

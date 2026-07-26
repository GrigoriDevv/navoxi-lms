package com.navoxi.lms.web.dto;

/**
 * Avaliação ainda sem tentativa corrigida para o aluno. {@code state} é derivado da melhor
 * tentativa existente: nao_iniciada, em_andamento ou aguardando_correcao.
 */
public record PendingEvaluationDto(String evaluationId, String name, String dueDate, String state) {}

package com.navoxi.lms.web.dto;

import java.util.List;

public record SaveAnswersRequest(List<AnswerItem> answers) {

  public record AnswerItem(String questionId, String responseText, String selectedOption) {}
}

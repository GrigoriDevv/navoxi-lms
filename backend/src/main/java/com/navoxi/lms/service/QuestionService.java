package com.navoxi.lms.service;

import com.navoxi.lms.domain.entity.Question;
import com.navoxi.lms.domain.entity.UserAccount;
import com.navoxi.lms.repository.QuestionRepository;
import com.navoxi.lms.security.UnitScope;
import com.navoxi.lms.web.ApiExceptionHandler.NotFoundException;
import com.navoxi.lms.web.dto.QuestionDto;
import com.navoxi.lms.web.dto.QuestionRequest;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class QuestionService {

  private final QuestionRepository questions;

  public QuestionService(QuestionRepository questions) {
    this.questions = questions;
  }

  @Transactional(readOnly = true)
  public List<QuestionDto> list(UserAccount actor) {
    List<Question> list =
        UnitScope.isGlobal(actor)
            ? questions.findAll()
            : questions.findByUnitId(actor.getUnitId());
    return list.stream().map(QuestionEvaluationMapper::toDto).toList();
  }

  @Transactional(readOnly = true)
  public QuestionDto get(UserAccount actor, String id) {
    return QuestionEvaluationMapper.toDto(requireAccessible(actor, id));
  }

  @Transactional
  public QuestionDto create(UserAccount actor, QuestionRequest req) {
    UnitScope.assertCanAccessUnit(actor, req.unitId());
    Question q = new Question();
    apply(q, req);
    q.setUsageCount(0);
    return QuestionEvaluationMapper.toDto(questions.save(q));
  }

  @Transactional
  public QuestionDto update(UserAccount actor, String id, QuestionRequest req) {
    Question q = requireAccessible(actor, id);
    UnitScope.assertCanAccessUnit(actor, req.unitId());
    apply(q, req);
    return QuestionEvaluationMapper.toDto(questions.save(q));
  }

  @Transactional
  public void delete(UserAccount actor, String id) {
    Question q = requireAccessible(actor, id);
    questions.delete(q);
  }

  Question requireAccessible(UserAccount actor, String id) {
    Question q =
        questions.findById(id).orElseThrow(() -> new NotFoundException("Questão não encontrada"));
    UnitScope.assertCanAccessUnit(actor, q.getUnitId());
    return q;
  }

  private void apply(Question q, QuestionRequest req) {
    q.setText(req.text());
    q.setType(req.type());
    q.setCategory(req.category());
    q.setUnitId(req.unitId());
  }
}

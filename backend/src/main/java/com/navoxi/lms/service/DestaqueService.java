package com.navoxi.lms.service;

import com.navoxi.lms.domain.entity.Destaque;
import com.navoxi.lms.domain.entity.UserAccount;
import com.navoxi.lms.repository.DestaqueRepository;
import com.navoxi.lms.security.UnitScope;
import com.navoxi.lms.web.ApiExceptionHandler.BadRequestException;
import com.navoxi.lms.web.ApiExceptionHandler.NotFoundException;
import com.navoxi.lms.web.dto.DestaqueDto;
import com.navoxi.lms.web.dto.DestaqueRequest;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DestaqueService {

  private static final DateTimeFormatter PUBLISHED_AT =
      DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm").withLocale(Locale.forLanguageTag("pt-BR"));

  private final DestaqueRepository destaques;

  public DestaqueService(DestaqueRepository destaques) {
    this.destaques = destaques;
  }

  @Transactional(readOnly = true)
  public List<DestaqueDto> list(UserAccount actor) {
    List<Destaque> list =
        UnitScope.isGlobal(actor)
            ? destaques.findAll()
            : destaques.findByUnitId(actor.getUnitId());
    return list.stream().map(PostDestaqueMapper::toDto).toList();
  }

  @Transactional(readOnly = true)
  public DestaqueDto get(UserAccount actor, String id) {
    return PostDestaqueMapper.toDto(requireAccessible(actor, id));
  }

  @Transactional
  public DestaqueDto create(UserAccount actor, DestaqueRequest req) {
    requireCreateFields(req);
    UnitScope.assertCanAccessUnit(actor, req.unitId());
    Destaque d = new Destaque();
    applyPatch(d, req);
    if (d.getVisible() == null) {
      d.setVisible(true);
    }
    if (d.getPinned() == null) {
      d.setPinned(false);
    }
    if (d.getPublishedAt() == null || d.getPublishedAt().isBlank()) {
      d.setPublishedAt(PUBLISHED_AT.format(LocalDateTime.now()));
    }
    return PostDestaqueMapper.toDto(destaques.save(d));
  }

  @Transactional
  public DestaqueDto update(UserAccount actor, String id, DestaqueRequest req) {
    Destaque d = requireAccessible(actor, id);
    if (req.unitId() != null) {
      UnitScope.assertCanAccessUnit(actor, req.unitId());
    }
    applyPatch(d, req);
    return PostDestaqueMapper.toDto(destaques.save(d));
  }

  Destaque requireAccessible(UserAccount actor, String id) {
    Destaque d =
        destaques
            .findById(id)
            .orElseThrow(() -> new NotFoundException("Destaque não encontrado"));
    UnitScope.assertCanAccessUnit(actor, d.getUnitId());
    return d;
  }

  private static void requireCreateFields(DestaqueRequest req) {
    if (req.title() == null || req.title().isBlank()) {
      throw new BadRequestException("title é obrigatório");
    }
    if (req.body() == null || req.body().isBlank()) {
      throw new BadRequestException("body é obrigatório");
    }
    if (req.unitId() == null) {
      throw new BadRequestException("unitId é obrigatório");
    }
  }

  private static void applyPatch(Destaque d, DestaqueRequest req) {
    if (req.title() != null) {
      d.setTitle(req.title());
    }
    if (req.body() != null) {
      d.setBody(req.body());
    }
    if (req.unitId() != null) {
      d.setUnitId(req.unitId());
    }
    if (req.visible() != null) {
      d.setVisible(req.visible());
    }
    if (req.pinned() != null) {
      d.setPinned(req.pinned());
    }
    if (req.publishedAt() != null) {
      d.setPublishedAt(req.publishedAt());
    }
    if (req.expiresAt() != null) {
      d.setExpiresAt(req.expiresAt().isBlank() ? null : req.expiresAt());
    }
  }
}

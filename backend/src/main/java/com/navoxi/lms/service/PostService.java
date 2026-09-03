package com.navoxi.lms.service;

import com.navoxi.lms.domain.entity.Post;
import com.navoxi.lms.domain.entity.UserAccount;
import com.navoxi.lms.domain.enums.PostStatus;
import com.navoxi.lms.repository.PostRepository;
import com.navoxi.lms.security.UnitScope;
import com.navoxi.lms.web.ApiExceptionHandler.BadRequestException;
import com.navoxi.lms.web.ApiExceptionHandler.NotFoundException;
import com.navoxi.lms.web.dto.PostDto;
import com.navoxi.lms.web.dto.PostRequest;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PostService {

  private static final DateTimeFormatter PUBLISHED_AT =
      DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm").withLocale(Locale.forLanguageTag("pt-BR"));

  private final PostRepository posts;

  public PostService(PostRepository posts) {
    this.posts = posts;
  }

  @Transactional(readOnly = true)
  public List<PostDto> list(UserAccount actor) {
    List<Post> list =
        UnitScope.isGlobal(actor)
            ? posts.findAllByOrderByCreatedAtDescIdDesc()
            : posts.findByUnitIdOrderByCreatedAtDescIdDesc(actor.getUnitId());
    return list.stream().map(PostDestaqueMapper::toDto).toList();
  }

  @Transactional(readOnly = true)
  public PostDto get(UserAccount actor, String id) {
    return PostDestaqueMapper.toDto(requireAccessible(actor, id));
  }

  @Transactional
  public PostDto create(UserAccount actor, PostRequest req) {
    requireCreateFields(req);
    UnitScope.assertCanAccessUnit(actor, req.unitId());
    Post p = new Post();
    applyPatch(p, req);
    if (p.getAuthor() == null || p.getAuthor().isBlank()) {
      p.setAuthor(actor.getName());
    }
    if (p.getStatus() == null) {
      p.setStatus(PostStatus.publicado);
    }
    if (p.getPublishedAt() == null || p.getPublishedAt().isBlank()) {
      p.setPublishedAt(PUBLISHED_AT.format(LocalDateTime.now()));
    }
    return PostDestaqueMapper.toDto(posts.save(p));
  }

  @Transactional
  public PostDto update(UserAccount actor, String id, PostRequest req) {
    Post p = requireAccessible(actor, id);
    if (req.unitId() != null) {
      UnitScope.assertCanAccessUnit(actor, req.unitId());
    }
    applyPatch(p, req);
    return PostDestaqueMapper.toDto(posts.save(p));
  }

  Post requireAccessible(UserAccount actor, String id) {
    Post p =
        posts.findById(id).orElseThrow(() -> new NotFoundException("Post não encontrado"));
    UnitScope.assertCanAccessUnit(actor, p.getUnitId());
    return p;
  }

  private static void requireCreateFields(PostRequest req) {
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

  private static void applyPatch(Post p, PostRequest req) {
    if (req.title() != null) {
      p.setTitle(req.title());
    }
    if (req.body() != null) {
      p.setBody(req.body());
    }
    if (req.author() != null) {
      p.setAuthor(req.author());
    }
    if (req.unitId() != null) {
      p.setUnitId(req.unitId());
    }
    if (req.status() != null) {
      p.setStatus(req.status());
    }
    if (req.publishedAt() != null) {
      p.setPublishedAt(req.publishedAt());
    }
  }
}

package com.navoxi.lms.service;

import com.navoxi.lms.domain.entity.Destaque;
import com.navoxi.lms.domain.entity.Post;
import com.navoxi.lms.web.dto.DestaqueDto;
import com.navoxi.lms.web.dto.PostDto;

public final class PostDestaqueMapper {

  private PostDestaqueMapper() {}

  public static PostDto toDto(Post p) {
    return new PostDto(
        p.getId(),
        p.getTitle(),
        p.getBody(),
        p.getAuthor(),
        p.getUnitId(),
        p.getStatus(),
        p.getPublishedAt());
  }

  public static DestaqueDto toDto(Destaque d) {
    return new DestaqueDto(
        d.getId(),
        d.getTitle(),
        d.getBody(),
        d.getUnitId(),
        d.getVisible(),
        d.getPinned(),
        d.getPublishedAt(),
        d.getExpiresAt());
  }
}

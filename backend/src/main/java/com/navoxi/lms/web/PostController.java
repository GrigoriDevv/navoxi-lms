package com.navoxi.lms.web;

import com.navoxi.lms.service.PostService;
import com.navoxi.lms.web.dto.PostDto;
import com.navoxi.lms.web.dto.PostRequest;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/posts")
public class PostController {

  private final PostService posts;
  private final CurrentUserResolver currentUser;

  public PostController(PostService posts, CurrentUserResolver currentUser) {
    this.posts = posts;
    this.currentUser = currentUser;
  }

  @GetMapping
  public List<PostDto> list() {
    return posts.list(currentUser.require());
  }

  @GetMapping("/{id}")
  public PostDto get(@PathVariable String id) {
    return posts.get(currentUser.require(), id);
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  @PreAuthorize("hasAnyRole('gestor_conteudo', 'admin_premium', 'admin_unidade')")
  public PostDto create(@RequestBody PostRequest request) {
    return posts.create(currentUser.require(), request);
  }

  @PatchMapping("/{id}")
  @PreAuthorize("hasAnyRole('gestor_conteudo', 'admin_premium', 'admin_unidade')")
  public PostDto update(@PathVariable String id, @RequestBody PostRequest request) {
    return posts.update(currentUser.require(), id, request);
  }
}

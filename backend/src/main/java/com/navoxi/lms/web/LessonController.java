package com.navoxi.lms.web;

import com.navoxi.lms.service.LessonService;
import com.navoxi.lms.service.ProgressService;
import com.navoxi.lms.web.dto.LessonDto;
import com.navoxi.lms.web.dto.LessonProgressDto;
import com.navoxi.lms.web.dto.LessonUpdateRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/lessons")
public class LessonController {

  private final LessonService lessons;
  private final ProgressService progress;
  private final CurrentUserResolver currentUser;

  public LessonController(
      LessonService lessons, ProgressService progress, CurrentUserResolver currentUser) {
    this.lessons = lessons;
    this.progress = progress;
    this.currentUser = currentUser;
  }

  @PutMapping("/{id}")
  public LessonDto update(@PathVariable String id, @RequestBody LessonUpdateRequest request) {
    return lessons.update(id, request);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable String id) {
    lessons.delete(id);
  }

  @PostMapping("/{id}/complete")
  public LessonProgressDto complete(
      @PathVariable String id, @RequestHeader(value = "X-User-Email", required = false) String email) {
    return progress.complete(currentUser.require(email), id);
  }
}

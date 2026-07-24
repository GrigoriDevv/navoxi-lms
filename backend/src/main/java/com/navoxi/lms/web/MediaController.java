package com.navoxi.lms.web;

import com.navoxi.lms.service.CourseService;
import com.navoxi.lms.service.MediaStorageService;
import com.navoxi.lms.web.dto.MediaUploadResponse;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/media")
public class MediaController {

  private final MediaStorageService mediaStorage;
  private final CourseService courses;
  private final CurrentUserResolver currentUser;

  public MediaController(
      MediaStorageService mediaStorage, CourseService courses, CurrentUserResolver currentUser) {
    this.mediaStorage = mediaStorage;
    this.courses = courses;
    this.currentUser = currentUser;
  }

  @PostMapping(value = "/videos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @PreAuthorize(
      "hasAnyRole('instrutor', 'gestor_conteudo', 'admin_premium', 'admin_unidade')")
  public MediaUploadResponse uploadVideo(
      @RequestParam("courseId") String courseId, @RequestParam("file") MultipartFile file) {
    courses.requireAccessible(currentUser.require(), courseId);
    String url = mediaStorage.uploadLessonVideo(courseId, file);
    return new MediaUploadResponse(url);
  }
}

package com.navoxi.lms.web;

import com.navoxi.lms.service.CourseService;
import com.navoxi.lms.service.LessonService;
import com.navoxi.lms.web.dto.CourseDto;
import com.navoxi.lms.web.dto.CourseRequest;
import com.navoxi.lms.web.dto.LessonDto;
import com.navoxi.lms.web.dto.LessonRequest;
import com.navoxi.lms.web.dto.ModuleDto;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/courses")
public class CourseController {

  private final CourseService courses;
  private final LessonService lessons;

  public CourseController(CourseService courses, LessonService lessons) {
    this.courses = courses;
    this.lessons = lessons;
  }

  @GetMapping
  public List<CourseDto> list() {
    return courses.list();
  }

  @GetMapping("/{id}")
  public CourseDto get(@PathVariable String id) {
    return courses.get(id);
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  @PreAuthorize(
      "hasAnyRole('instrutor', 'gestor_conteudo', 'admin_premium', 'admin_unidade')")
  public CourseDto create(@Valid @RequestBody CourseRequest request) {
    return courses.create(request);
  }

  @PutMapping("/{id}")
  @PreAuthorize(
      "hasAnyRole('instrutor', 'gestor_conteudo', 'admin_premium', 'admin_unidade')")
  public CourseDto update(@PathVariable String id, @Valid @RequestBody CourseRequest request) {
    return courses.update(id, request);
  }

  @GetMapping("/{id}/modules")
  public List<ModuleDto> modules(@PathVariable String id) {
    return lessons.listModules(id);
  }

  @GetMapping("/{id}/lessons")
  public List<LessonDto> courseLessons(@PathVariable String id) {
    return lessons.listLessons(id);
  }

  @PostMapping("/{id}/lessons")
  @ResponseStatus(HttpStatus.CREATED)
  @PreAuthorize(
      "hasAnyRole('instrutor', 'gestor_conteudo', 'admin_premium', 'admin_unidade')")
  public LessonDto publishLesson(
      @PathVariable String id, @Valid @RequestBody LessonRequest request) {
    return lessons.publish(id, request);
  }

  @DeleteMapping("/{id}/lessons")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @PreAuthorize(
      "hasAnyRole('instrutor', 'gestor_conteudo', 'admin_premium', 'admin_unidade')")
  public void deleteAllLessons(@PathVariable String id) {
    lessons.deleteAllForCourse(id);
  }
}

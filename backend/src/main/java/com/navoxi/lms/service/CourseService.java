package com.navoxi.lms.service;

import com.navoxi.lms.domain.entity.Course;
import com.navoxi.lms.repository.CourseRepository;
import com.navoxi.lms.web.ApiExceptionHandler.NotFoundException;
import com.navoxi.lms.web.dto.CourseDto;
import com.navoxi.lms.web.dto.CourseRequest;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CourseService {

  private final CourseRepository courses;

  public CourseService(CourseRepository courses) {
    this.courses = courses;
  }

  @Transactional(readOnly = true)
  public List<CourseDto> list() {
    return courses.findAll().stream().map(CourseMapper::toDto).toList();
  }

  @Transactional(readOnly = true)
  public CourseDto get(String id) {
    return CourseMapper.toDto(require(id));
  }

  @Transactional
  public CourseDto create(CourseRequest req) {
    Course c = new Course();
    apply(c, req);
    if (c.getCover() == null || c.getCover().isBlank()) {
      c.setCover("#2563eb");
    }
    return CourseMapper.toDto(courses.save(c));
  }

  @Transactional
  public CourseDto update(String id, CourseRequest req) {
    Course c = require(id);
    apply(c, req);
    return CourseMapper.toDto(courses.save(c));
  }

  Course require(String id) {
    return courses.findById(id).orElseThrow(() -> new NotFoundException("Curso não encontrado"));
  }

  private void apply(Course c, CourseRequest req) {
    c.setTitle(req.title());
    c.setCategory(req.category());
    c.setInstructor(req.instructor());
    c.setUnitId(req.unitId());
    c.setModality(req.modality());
    c.setAudience(req.audience());
    c.setWorkload(req.workload());
    c.setStatus(req.status());
    if (req.cover() != null && !req.cover().isBlank()) {
      c.setCover(req.cover());
    } else if (c.getCover() == null) {
      c.setCover("#2563eb");
    }
  }
}

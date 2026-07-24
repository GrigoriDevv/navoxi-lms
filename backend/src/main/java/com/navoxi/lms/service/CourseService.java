package com.navoxi.lms.service;

import com.navoxi.lms.domain.entity.Course;
import com.navoxi.lms.domain.entity.UserAccount;
import com.navoxi.lms.repository.CourseRepository;
import com.navoxi.lms.security.UnitScope;
import com.navoxi.lms.web.ApiExceptionHandler.NotFoundException;
import com.navoxi.lms.web.dto.CourseDto;
import com.navoxi.lms.web.dto.CourseRequest;
import java.util.List;
import java.util.Objects;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CourseService {

  private final CourseRepository courses;
  private final DenormalizedLabelSync labelSync;

  public CourseService(CourseRepository courses, DenormalizedLabelSync labelSync) {
    this.courses = courses;
    this.labelSync = labelSync;
  }

  @Transactional(readOnly = true)
  public List<CourseDto> list(UserAccount actor) {
    List<Course> list =
        UnitScope.isGlobal(actor) ? courses.findAll() : courses.findByUnitId(actor.getUnitId());
    return list.stream().map(CourseMapper::toDto).toList();
  }

  @Transactional(readOnly = true)
  public CourseDto get(UserAccount actor, String id) {
    return CourseMapper.toDto(requireAccessible(actor, id));
  }

  @Transactional
  public CourseDto create(UserAccount actor, CourseRequest req) {
    UnitScope.assertCanAccessUnit(actor, req.unitId());
    Course c = new Course();
    apply(c, req);
    if (c.getCover() == null || c.getCover().isBlank()) {
      c.setCover("#2563eb");
    }
    return CourseMapper.toDto(courses.save(c));
  }

  @Transactional
  public CourseDto update(UserAccount actor, String id, CourseRequest req) {
    Course c = requireAccessible(actor, id);
    UnitScope.assertCanAccessUnit(actor, req.unitId());
    String previousTitle = c.getTitle();
    apply(c, req);
    Course saved = courses.save(c);
    if (!Objects.equals(previousTitle, saved.getTitle())) {
      labelSync.syncCourseTitle(saved.getId(), saved.getTitle());
    }
    return CourseMapper.toDto(saved);
  }

  Course require(String id) {
    return courses.findById(id).orElseThrow(() -> new NotFoundException("Curso não encontrado"));
  }

  Course requireAccessible(UserAccount actor, String id) {
    Course c = require(id);
    UnitScope.assertCanAccessCourse(actor, c);
    return c;
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

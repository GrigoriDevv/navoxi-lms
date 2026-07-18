package com.navoxi.lms.service;

import com.navoxi.lms.repository.CourseLessonRepository;
import com.navoxi.lms.repository.CourseModuleRepository;
import com.navoxi.lms.web.dto.LessonDto;
import com.navoxi.lms.web.dto.ModuleDto;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CatalogService {

  private final CourseModuleRepository modules;
  private final CourseLessonRepository lessons;

  public CatalogService(CourseModuleRepository modules, CourseLessonRepository lessons) {
    this.modules = modules;
    this.lessons = lessons;
  }

  @Transactional(readOnly = true)
  public List<ModuleDto> allModules() {
    return modules.findAll().stream()
        .sorted(
            Comparator.comparing((com.navoxi.lms.domain.entity.CourseModule m) -> m.getCourse().getId())
                .thenComparing(com.navoxi.lms.domain.entity.CourseModule::getSortOrder))
        .map(CourseMapper::toDto)
        .toList();
  }

  @Transactional(readOnly = true)
  public List<LessonDto> allLessons() {
    return lessons.findAll().stream()
        .sorted(
            Comparator.comparing((com.navoxi.lms.domain.entity.CourseLesson l) -> l.getCourse().getId())
                .thenComparing(com.navoxi.lms.domain.entity.CourseLesson::getSortOrder))
        .map(CourseMapper::toDto)
        .toList();
  }
}

package com.navoxi.lms.repository;

import com.navoxi.lms.domain.entity.CourseModule;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseModuleRepository extends JpaRepository<CourseModule, String> {
  List<CourseModule> findByCourseIdOrderBySortOrderAsc(String courseId);
}

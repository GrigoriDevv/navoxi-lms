package com.navoxi.lms.repository;

import com.navoxi.lms.domain.entity.Course;
import com.navoxi.lms.domain.enums.UnitId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseRepository extends JpaRepository<Course, String> {
  List<Course> findByUnitId(UnitId unitId);
}

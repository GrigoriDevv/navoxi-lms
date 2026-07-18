package com.navoxi.lms.service;

import com.navoxi.lms.domain.entity.Course;
import com.navoxi.lms.domain.entity.CourseLesson;
import com.navoxi.lms.domain.entity.CourseModule;
import com.navoxi.lms.domain.entity.Enrollment;
import com.navoxi.lms.domain.entity.LessonProgress;
import com.navoxi.lms.domain.entity.UserAccount;
import com.navoxi.lms.web.dto.CourseDto;
import com.navoxi.lms.web.dto.EnrollmentDto;
import com.navoxi.lms.web.dto.LessonDto;
import com.navoxi.lms.web.dto.LessonProgressDto;
import com.navoxi.lms.web.dto.ModuleDto;
import com.navoxi.lms.web.dto.UserDto;

public final class CourseMapper {

  private CourseMapper() {}

  public static CourseDto toDto(Course c) {
    return new CourseDto(
        c.getId(),
        c.getTitle(),
        c.getCategory(),
        c.getInstructor(),
        c.getUnitId(),
        c.getModality(),
        c.getAudience(),
        c.getWorkload(),
        c.getStatus(),
        c.getEnrolled(),
        c.getCompletion(),
        c.getCover());
  }

  public static ModuleDto toDto(CourseModule m) {
    return new ModuleDto(m.getId(), m.getCourse().getId(), m.getTitle(), m.getSortOrder());
  }

  public static LessonDto toDto(CourseLesson l) {
    return new LessonDto(
        l.getId(),
        l.getCourse().getId(),
        l.getModule().getId(),
        l.getSortOrder(),
        l.getTitle(),
        l.getYoutubeVideoId(),
        l.getVideoUrl(),
        l.getDurationSec());
  }

  public static LessonProgressDto toDto(LessonProgress p) {
    return new LessonProgressDto(p.getUser().getId(), p.getLesson().getId(), p.getCompletedAt());
  }

  public static EnrollmentDto toDto(Enrollment e) {
    return new EnrollmentDto(
        e.getId(),
        e.getUser().getId(),
        e.getUserName(),
        e.getCourse().getId(),
        e.getCourseTitle(),
        e.getTurmaId(),
        e.getTurmaName(),
        e.getUnitId(),
        e.getEnrolledAt(),
        e.getProgress(),
        e.getStatus());
  }

  public static UserDto toDto(UserAccount u) {
    return new UserDto(
        u.getId(),
        u.getName(),
        u.getEmail(),
        u.getRole(),
        u.getUnitId(),
        u.getDepartment(),
        u.getStatus(),
        u.getLastAccess(),
        u.getAvatarColor());
  }
}

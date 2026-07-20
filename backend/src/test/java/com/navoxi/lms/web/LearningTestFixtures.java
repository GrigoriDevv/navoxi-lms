package com.navoxi.lms.web;

import com.navoxi.lms.domain.entity.Course;
import com.navoxi.lms.domain.entity.CourseLesson;
import com.navoxi.lms.domain.entity.CourseModule;
import com.navoxi.lms.domain.entity.UserAccount;
import com.navoxi.lms.domain.enums.AuthProvider;
import com.navoxi.lms.domain.enums.CourseModality;
import com.navoxi.lms.domain.enums.CourseStatus;
import com.navoxi.lms.domain.enums.Role;
import com.navoxi.lms.domain.enums.UnitId;
import com.navoxi.lms.domain.enums.UserStatus;
import com.navoxi.lms.repository.CourseLessonRepository;
import com.navoxi.lms.repository.CourseModuleRepository;
import com.navoxi.lms.repository.CourseRepository;
import com.navoxi.lms.repository.UserAccountRepository;
import org.springframework.security.crypto.password.PasswordEncoder;

final class LearningTestFixtures {

  private LearningTestFixtures() {}

  static UserAccount saveUser(
      UserAccountRepository users,
      PasswordEncoder encoder,
      String id,
      String email,
      Role role,
      String password) {
    UserAccount u = new UserAccount();
    u.setId(id);
    u.setName(email);
    u.setEmail(email);
    u.setRole(role);
    u.setUnitId(UnitId.matriz);
    u.setDepartment("QA");
    u.setStatus(UserStatus.ativo);
    u.setLastAccess("—");
    u.setAvatarColor("#2563eb");
    u.setAuthProvider(AuthProvider.both);
    u.setPasswordHash(encoder.encode(password));
    return users.save(u);
  }

  static Course saveCourse(CourseRepository courses, String id, String title) {
    Course c = new Course();
    c.setId(id);
    c.setTitle(title);
    c.setCategory("Compliance");
    c.setInstructor("Instrutor QA");
    c.setUnitId(UnitId.matriz);
    c.setModality(CourseModality.online);
    c.setAudience("Todos");
    c.setWorkload(8);
    c.setStatus(CourseStatus.publicado);
    c.setEnrolled(0);
    c.setCompletion(0);
    c.setCover("https://example.com/cover.jpg");
    return courses.save(c);
  }

  static CourseLesson saveLesson(
      CourseModuleRepository modules,
      CourseLessonRepository lessons,
      Course course,
      String moduleId,
      String lessonId) {
    CourseModule module = new CourseModule();
    module.setId(moduleId);
    module.setCourse(course);
    module.setTitle("Módulo 1");
    module.setSortOrder(1);
    modules.save(module);

    CourseLesson lesson = new CourseLesson();
    lesson.setId(lessonId);
    lesson.setCourse(course);
    lesson.setModule(module);
    lesson.setSortOrder(1);
    lesson.setTitle("Aula 1");
    lesson.setYoutubeVideoId("dQw4w9WgXcQ");
    lesson.setDurationSec(60);
    return lessons.save(lesson);
  }
}

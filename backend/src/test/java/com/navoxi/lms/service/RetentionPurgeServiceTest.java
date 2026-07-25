package com.navoxi.lms.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.navoxi.lms.domain.entity.AccessLog;
import com.navoxi.lms.domain.entity.Course;
import com.navoxi.lms.domain.entity.CourseLesson;
import com.navoxi.lms.domain.entity.CourseModule;
import com.navoxi.lms.domain.entity.LessonProgress;
import com.navoxi.lms.domain.entity.UserAccount;
import com.navoxi.lms.domain.enums.AuthProvider;
import com.navoxi.lms.domain.enums.CourseModality;
import com.navoxi.lms.domain.enums.CourseStatus;
import com.navoxi.lms.domain.enums.Role;
import com.navoxi.lms.domain.enums.UnitId;
import com.navoxi.lms.domain.enums.UserStatus;
import com.navoxi.lms.repository.AccessLogRepository;
import com.navoxi.lms.repository.CourseLessonRepository;
import com.navoxi.lms.repository.CourseModuleRepository;
import com.navoxi.lms.repository.CourseRepository;
import com.navoxi.lms.repository.LessonProgressRepository;
import com.navoxi.lms.repository.UserAccountRepository;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest(
    properties = {
      "spring.datasource.url=jdbc:h2:mem:lms-retention;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE",
      "lms.seed.enabled=false",
      "lms.retention.enabled=true",
      "lms.retention.progress-months=24",
      "lms.retention.access-log-months=12"
    })
@ActiveProfiles("local")
@Transactional
class RetentionPurgeServiceTest {

  @Autowired private RetentionPurgeService purgeService;
  @Autowired private LessonProgressRepository progressRepo;
  @Autowired private AccessLogRepository accessLogs;
  @Autowired private UserAccountRepository users;
  @Autowired private CourseRepository courses;
  @Autowired private CourseModuleRepository modules;
  @Autowired private CourseLessonRepository lessons;
  @Autowired private PasswordEncoder passwordEncoder;

  private UserAccount user;
  private CourseLesson lesson;

  @BeforeEach
  void seed() {
    progressRepo.deleteAll();
    accessLogs.deleteAll();
    lessons.deleteAll();
    modules.deleteAll();
    courses.deleteAll();
    users.deleteAll();

    user = new UserAccount();
    user.setId("u-ret");
    user.setName("Retencao QA");
    user.setEmail("retencao@navoxi.com");
    user.setRole(Role.aluno);
    user.setUnitId(UnitId.matriz);
    user.setDepartment("QA");
    user.setStatus(UserStatus.ativo);
    user.setLastAccess("—");
    user.setAvatarColor("#2563eb");
    user.setAuthProvider(AuthProvider.local);
    user.setPasswordHash(passwordEncoder.encode("secret123"));
    users.save(user);

    Course course = new Course();
    course.setId("c-ret");
    course.setTitle("Curso Retencao");
    course.setCategory("Compliance");
    course.setInstructor("QA");
    course.setUnitId(UnitId.matriz);
    course.setModality(CourseModality.online);
    course.setAudience("Todos");
    course.setWorkload(1);
    course.setStatus(CourseStatus.publicado);
    course.setEnrolled(0);
    course.setCompletion(0);
    course.setCover("#000");
    courses.save(course);

    CourseModule module = new CourseModule();
    module.setId("m-ret");
    module.setCourse(course);
    module.setTitle("Modulo");
    module.setSortOrder(1);
    modules.save(module);

    lesson = new CourseLesson();
    lesson.setId("l-ret");
    lesson.setCourse(course);
    lesson.setModule(module);
    lesson.setSortOrder(1);
    lesson.setTitle("Aula");
    lesson.setYoutubeVideoId("dQw4w9WgXcQ");
    lessons.save(lesson);
  }

  @Test
  void purgeDeletesExpiredProgressAndAccessLogsKeepsRecent() {
    Instant now = Instant.parse("2026-07-25T12:00:00Z");

    LessonProgress oldProgress = new LessonProgress();
    oldProgress.setId("p-old");
    oldProgress.setUser(user);
    oldProgress.setLesson(lesson);
    oldProgress.setCompletedAt(now.minus(800, ChronoUnit.DAYS));
    progressRepo.save(oldProgress);

    LessonProgress recentProgress = new LessonProgress();
    recentProgress.setId("p-new");
    recentProgress.setUser(user);
    recentProgress.setLesson(lesson);
    // unique (user, lesson) — use second lesson for recent
    CourseLesson lesson2 = new CourseLesson();
    lesson2.setId("l-ret-2");
    lesson2.setCourse(lesson.getCourse());
    lesson2.setModule(lesson.getModule());
    lesson2.setSortOrder(2);
    lesson2.setTitle("Aula 2");
    lesson2.setYoutubeVideoId("dQw4w9WgXcQ");
    lessons.save(lesson2);
    recentProgress.setLesson(lesson2);
    recentProgress.setCompletedAt(now.minus(30, ChronoUnit.DAYS));
    progressRepo.save(recentProgress);

    AccessLog oldLog = new AccessLog();
    oldLog.setId("al-old");
    oldLog.setUserId(user.getId());
    oldLog.setAction("auth.login");
    oldLog.setCreatedAt(now.minus(400, ChronoUnit.DAYS));
    accessLogs.save(oldLog);

    AccessLog recentLog = new AccessLog();
    recentLog.setId("al-new");
    recentLog.setUserId(user.getId());
    recentLog.setAction("users.me.read");
    recentLog.setCreatedAt(now.minus(10, ChronoUnit.DAYS));
    accessLogs.save(recentLog);

    RetentionPurgeService.PurgeResult result = purgeService.purgeExpired(now);

    assertThat(result.progressDeleted()).isEqualTo(1);
    assertThat(result.accessLogDeleted()).isEqualTo(1);
    assertThat(progressRepo.findById("p-old")).isEmpty();
    assertThat(progressRepo.findById("p-new")).isPresent();
    assertThat(accessLogs.findById("al-old")).isEmpty();
    assertThat(accessLogs.findById("al-new")).isPresent();
    assertThat(accessLogs.findAll())
        .anyMatch(l -> AccessLogService.ACTION_RETENTION_PURGE.equals(l.getAction()));
  }
}

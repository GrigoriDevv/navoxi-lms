package com.navoxi.lms.seed;

import com.navoxi.lms.domain.entity.Course;
import com.navoxi.lms.domain.entity.CourseLesson;
import com.navoxi.lms.domain.entity.CourseModule;
import com.navoxi.lms.domain.entity.Enrollment;
import com.navoxi.lms.domain.entity.LessonProgress;
import com.navoxi.lms.domain.entity.UserAccount;
import com.navoxi.lms.domain.enums.CourseModality;
import com.navoxi.lms.domain.enums.CourseStatus;
import com.navoxi.lms.domain.enums.EnrollmentStatus;
import com.navoxi.lms.domain.enums.Role;
import com.navoxi.lms.domain.enums.UnitId;
import com.navoxi.lms.domain.enums.UserStatus;
import com.navoxi.lms.repository.CourseLessonRepository;
import com.navoxi.lms.repository.CourseModuleRepository;
import com.navoxi.lms.repository.CourseRepository;
import com.navoxi.lms.repository.EnrollmentRepository;
import com.navoxi.lms.repository.LessonProgressRepository;
import com.navoxi.lms.repository.UserAccountRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile({"local", "prod"})
public class DataSeeder {

  private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

  @Bean
  CommandLineRunner seedLearningData(
      UserAccountRepository users,
      CourseRepository courses,
      CourseModuleRepository modules,
      CourseLessonRepository lessons,
      EnrollmentRepository enrollments,
      LessonProgressRepository progress) {
    return args -> {
      if (users.count() > 0) {
        log.info("Seed ignorado — banco já possui usuários");
        return;
      }
      log.info("Populando dados demo do LMS...");

      UserAccount ana = user(users, "u1", "Ana Carolina Souza", "ana.souza@navoxi.com", Role.admin_premium, UnitId.matriz, "Navoxi · Tecnologia", "#2563eb");
      UserAccount diego = user(users, "u4", "Diego Alves", "diego.alves@navoxi.com", Role.aluno, UnitId.matriz, "Navoxi · Operações", "#0ea5e9");
      user(users, "u3", "Carla Mendes", "carla.mendes@navoxi.com", Role.gestor_conteudo, UnitId.matriz, "Navoxi · RH", "#3b82f6");
      UserAccount henrique = user(users, "u8", "Henrique Castro", "henrique.castro@navoxi.com", Role.instrutor, UnitId.matriz, "Navoxi · Engenharia", "#3b82f6");
      user(users, "u2", "Bruno Ferreira", "bruno.ferreira@navoxi.com", Role.admin_unidade, UnitId.matriz, "Navoxi · Gestão Regional", "#1d4ed8");

      Course c1 = course(courses, "c1", "Segurança da Informação e Dados", "Segurança", "Carla Mendes", UnitId.matriz, CourseModality.hibrido, "Operações", 40, CourseStatus.publicado, 312, 78, "#1d4ed8");
      Course c2 = course(courses, "c2", "Compliance e Código de Ética", "Compliance", "Henrique Castro", UnitId.matriz, CourseModality.online, "Todos colaboradores", 8, CourseStatus.publicado, 1240, 92, "#2563eb");
      Course c3 = course(courses, "c3", "Excelência no Atendimento ao Cliente", "Comercial", "Carla Mendes", UnitId.nordeste, CourseModality.online, "Comercial", 12, CourseStatus.publicado, 480, 64, "#dd2277");
      course(courses, "c4", "Liderança e Gestão de Equipes", "Liderança", "Henrique Castro", UnitId.matriz, CourseModality.presencial, "Gestores", 24, CourseStatus.publicado, 96, 55, "#dd9966");
      course(courses, "c5", "Sustentabilidade e ESG Corporativo", "ESG", "Carla Mendes", UnitId.matriz, CourseModality.online, "Todos colaboradores", 6, CourseStatus.rascunho, 0, 0, "#77cc33");
      course(courses, "c6", "Gestão de Infraestrutura de TI", "Técnico", "Henrique Castro", UnitId.matriz, CourseModality.hibrido, "Operações", 60, CourseStatus.publicado, 154, 41, "#008899");
      course(courses, "c7", "LGPD na Prática", "Compliance", "Henrique Castro", UnitId.matriz, CourseModality.online, "Todos colaboradores", 4, CourseStatus.arquivado, 890, 88, "#64748b");

      CourseModule m11 = module(modules, "m-c1-1", c1, "Fundamentos de Segurança", 1);
      CourseModule m12 = module(modules, "m-c1-2", c1, "Proteção de Dados", 2);
      CourseModule m21 = module(modules, "m-c2-1", c2, "Princípios de Compliance", 1);
      CourseModule m22 = module(modules, "m-c2-2", c2, "Conduta e Integridade", 2);
      CourseModule m31 = module(modules, "m-c3-1", c3, "Atendimento de Excelência", 1);

      lesson(lessons, "l-c1-1", c1, m11, 1, "Introdução à segurança da informação", "86YLFOog4GM", 180);
      lesson(lessons, "l-c1-2", c1, m11, 2, "Ameaças digitais e vetores de ataque", "_L4F9fCEqWM", 210);
      lesson(lessons, "l-c1-3", c1, m12, 3, "Classificação e tratamento de dados", "21X5lGlwtYQ", 195);
      lesson(lessons, "l-c1-4", c1, m12, 4, "Controles de acesso e autenticação", "libKSDqviAo", 240);

      CourseLesson l21 = lesson(lessons, "l-c2-1", c2, m21, 1, "O que é compliance corporativo", "YE7VzlLtp-4", 32);
      CourseLesson l22 = lesson(lessons, "l-c2-2", c2, m21, 2, "Marco regulatório e normas aplicáveis", "kDkqc7ZcM3M", 150);
      CourseLesson l23 = lesson(lessons, "l-c2-3", c2, m21, 3, "Canal de denúncias e whistleblowing", "QWfjPoglWLQ", 120);
      CourseLesson l24 = lesson(lessons, "l-c2-4", c2, m22, 4, "Conflito de interesses", "KGksZCYuiIk", 180);
      lesson(lessons, "l-c2-5", c2, m22, 5, "Presentes, brindes e hospitalidade", "bMeKNPGrk0c", 200);
      lesson(lessons, "l-c2-6", c2, m22, 6, "Responsabilidade individual e penalidades", "mN0zPOpOAN8", 220);

      CourseLesson l31 = lesson(lessons, "l-c3-1", c3, m31, 1, "Princípios do atendimento ao cliente", "86YLFOog4GM", 180);
      CourseLesson l32 = lesson(lessons, "l-c3-2", c3, m31, 2, "Escuta ativa e empatia", "_L4F9fCEqWM", 210);
      lesson(lessons, "l-c3-3", c3, m31, 3, "Comunicação clara e objetiva", "21X5lGlwtYQ", 195);

      enroll(enrollments, "ins1", diego, c2, null, null, 67, EnrollmentStatus.ativa);
      enroll(enrollments, "ins2", diego, c3, "t4", "Atendimento · Online Contínuo", 22, EnrollmentStatus.ativa);

      progress(progress, diego, l21, "2026-05-16 10:00");
      progress(progress, diego, l22, "2026-05-18 14:30");
      progress(progress, diego, l23, "2026-05-20 09:15");
      progress(progress, diego, l24, "2026-05-22 16:00");
      progress(progress, diego, l31, "2026-06-02 11:00");
      progress(progress, diego, l32, "2026-06-05 15:30");

      log.info("Seed concluído (users={}, courses={})", users.count(), courses.count());
      log.info("Demo: {} / {}", henrique.getEmail(), diego.getEmail());
      log.info("Admin: {}", ana.getEmail());
    };
  }

  private static UserAccount user(
      UserAccountRepository repo,
      String id,
      String name,
      String email,
      Role role,
      UnitId unitId,
      String department,
      String color) {
    UserAccount u = new UserAccount();
    u.setId(id);
    u.setName(name);
    u.setEmail(email);
    u.setRole(role);
    u.setUnitId(unitId);
    u.setDepartment(department);
    u.setStatus(UserStatus.ativo);
    u.setLastAccess("2026-06-12 09:00");
    u.setAvatarColor(color);
    return repo.save(u);
  }

  private static Course course(
      CourseRepository repo,
      String id,
      String title,
      String category,
      String instructor,
      UnitId unitId,
      CourseModality modality,
      String audience,
      int workload,
      CourseStatus status,
      int enrolled,
      int completion,
      String cover) {
    Course c = new Course();
    c.setId(id);
    c.setTitle(title);
    c.setCategory(category);
    c.setInstructor(instructor);
    c.setUnitId(unitId);
    c.setModality(modality);
    c.setAudience(audience);
    c.setWorkload(workload);
    c.setStatus(status);
    c.setEnrolled(enrolled);
    c.setCompletion(completion);
    c.setCover(cover);
    return repo.save(c);
  }

  private static CourseModule module(
      CourseModuleRepository repo, String id, Course course, String title, int order) {
    CourseModule m = new CourseModule();
    m.setId(id);
    m.setCourse(course);
    m.setTitle(title);
    m.setSortOrder(order);
    return repo.save(m);
  }

  private static CourseLesson lesson(
      CourseLessonRepository repo,
      String id,
      Course course,
      CourseModule module,
      int order,
      String title,
      String youtubeId,
      int duration) {
    CourseLesson l = new CourseLesson();
    l.setId(id);
    l.setCourse(course);
    l.setModule(module);
    l.setSortOrder(order);
    l.setTitle(title);
    l.setYoutubeVideoId(youtubeId);
    l.setDurationSec(duration);
    return repo.save(l);
  }

  private static void enroll(
      EnrollmentRepository repo,
      String id,
      UserAccount user,
      Course course,
      String turmaId,
      String turmaName,
      int progress,
      EnrollmentStatus status) {
    Enrollment e = new Enrollment();
    e.setId(id);
    e.setUser(user);
    e.setCourse(course);
    e.setUserName(user.getName());
    e.setCourseTitle(course.getTitle());
    e.setTurmaId(turmaId);
    e.setTurmaName(turmaName);
    e.setUnitId(user.getUnitId());
    e.setEnrolledAt("2026-05-15 10:00");
    e.setProgress(progress);
    e.setStatus(status);
    repo.save(e);
  }

  private static void progress(
      LessonProgressRepository repo, UserAccount user, CourseLesson lesson, String at) {
    LessonProgress p = new LessonProgress();
    p.setUser(user);
    p.setLesson(lesson);
    p.setCompletedAt(at);
    repo.save(p);
  }
}

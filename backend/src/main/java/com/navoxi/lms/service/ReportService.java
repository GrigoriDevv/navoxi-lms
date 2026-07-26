package com.navoxi.lms.service;

import com.navoxi.lms.domain.entity.CourseLesson;
import com.navoxi.lms.domain.entity.Enrollment;
import com.navoxi.lms.domain.entity.Evaluation;
import com.navoxi.lms.domain.entity.EvaluationAttempt;
import com.navoxi.lms.domain.entity.LessonProgress;
import com.navoxi.lms.domain.entity.UserAccount;
import com.navoxi.lms.domain.enums.AttemptStatus;
import com.navoxi.lms.domain.enums.EnrollmentStatus;
import com.navoxi.lms.domain.enums.EvaluationStatus;
import com.navoxi.lms.domain.enums.UnitId;
import com.navoxi.lms.repository.CourseLessonRepository;
import com.navoxi.lms.repository.EnrollmentRepository;
import com.navoxi.lms.repository.EvaluationAttemptRepository;
import com.navoxi.lms.repository.EvaluationRepository;
import com.navoxi.lms.repository.LessonProgressRepository;
import com.navoxi.lms.security.UnitScope;
import com.navoxi.lms.web.dto.CourseCompletionRowDto;
import com.navoxi.lms.web.dto.PendingEvaluationDto;
import com.navoxi.lms.web.dto.StudentPendingRowDto;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Relatórios mínimos de conclusão: agregados por curso/turma e pendências por aluno. */
@Service
public class ReportService {

  private static final Set<EvaluationStatus> ACTIVE_EVALUATION_STATUSES =
      EnumSet.of(EvaluationStatus.publicada, EvaluationStatus.aplicada);

  private final EnrollmentRepository enrollments;
  private final CourseLessonRepository lessons;
  private final LessonProgressRepository lessonProgress;
  private final EvaluationRepository evaluations;
  private final EvaluationAttemptRepository attempts;

  public ReportService(
      EnrollmentRepository enrollments,
      CourseLessonRepository lessons,
      LessonProgressRepository lessonProgress,
      EvaluationRepository evaluations,
      EvaluationAttemptRepository attempts) {
    this.enrollments = enrollments;
    this.lessons = lessons;
    this.lessonProgress = lessonProgress;
    this.evaluations = evaluations;
    this.attempts = attempts;
  }

  @Transactional(readOnly = true)
  public List<CourseCompletionRowDto> completionByCourse(
      UserAccount actor, String courseId, String turmaId, UnitId unitId) {
    List<Enrollment> base = filter(scopedEnrollments(actor, unitId), courseId, turmaId, null);

    Map<String, List<Enrollment>> byBucket = new LinkedHashMap<>();
    for (Enrollment e : base) {
      String key = e.getCourse().getId() + "|" + (e.getTurmaId() == null ? "" : e.getTurmaId());
      byBucket.computeIfAbsent(key, k -> new ArrayList<>()).add(e);
    }

    List<CourseCompletionRowDto> rows = new ArrayList<>();
    for (List<Enrollment> bucket : byBucket.values()) {
      Enrollment first = bucket.get(0);
      int enrolled = bucket.size();
      int completed = 0;
      int notStarted = 0;
      long progressSum = 0;
      for (Enrollment e : bucket) {
        int progress = e.getProgress() == null ? 0 : e.getProgress();
        progressSum += progress;
        if (e.getStatus() == EnrollmentStatus.concluida) {
          completed++;
        } else if (progress == 0) {
          notStarted++;
        }
      }
      int inProgress = enrolled - completed - notStarted;
      rows.add(
          new CourseCompletionRowDto(
              first.getCourse().getId(),
              first.getCourseTitle(),
              first.getTurmaId(),
              first.getTurmaName(),
              first.getUnitId(),
              enrolled,
              completed,
              inProgress,
              notStarted,
              (int) Math.round(progressSum / (double) enrolled),
              (int) Math.round(completed * 100.0 / enrolled)));
    }
    rows.sort(
        Comparator.comparing(CourseCompletionRowDto::courseTitle, nullsFirst())
            .thenComparing(CourseCompletionRowDto::turmaName, nullsFirst()));
    return rows;
  }

  @Transactional(readOnly = true)
  public List<StudentPendingRowDto> pendingByStudent(
      UserAccount actor, String courseId, String turmaId, UnitId unitId, String userId) {
    List<Enrollment> base = filter(scopedEnrollments(actor, unitId), courseId, turmaId, userId);
    if (base.isEmpty()) {
      return List.of();
    }

    Set<String> courseIds = new HashSet<>();
    Set<String> userIds = new HashSet<>();
    for (Enrollment e : base) {
      courseIds.add(e.getCourse().getId());
      userIds.add(e.getUser().getId());
    }

    Map<String, List<CourseLesson>> lessonsByCourse = new HashMap<>();
    for (CourseLesson lesson : lessons.findByCourseIdIn(courseIds)) {
      lessonsByCourse.computeIfAbsent(lesson.getCourse().getId(), k -> new ArrayList<>()).add(lesson);
    }
    lessonsByCourse.values().forEach(l -> l.sort(Comparator.comparing(CourseLesson::getSortOrder)));

    Map<String, Set<String>> completedLessonIdsByUser = new HashMap<>();
    for (LessonProgress p : lessonProgress.findByUserIdIn(userIds)) {
      completedLessonIdsByUser
          .computeIfAbsent(p.getUser().getId(), k -> new HashSet<>())
          .add(p.getLesson().getId());
    }

    Map<String, List<Evaluation>> evaluationsByCourse = new HashMap<>();
    for (Evaluation ev : evaluations.findByCourseIdIn(courseIds)) {
      if (ACTIVE_EVALUATION_STATUSES.contains(ev.getStatus())) {
        evaluationsByCourse.computeIfAbsent(ev.getCourseId(), k -> new ArrayList<>()).add(ev);
      }
    }

    Map<String, List<AttemptStatus>> attemptStatuses = new HashMap<>();
    for (EvaluationAttempt attempt : attempts.findByUserIdIn(userIds)) {
      String key = attempt.getUser().getId() + "|" + attempt.getEvaluation().getId();
      attemptStatuses.computeIfAbsent(key, k -> new ArrayList<>()).add(attempt.getStatus());
    }

    List<StudentPendingRowDto> rows = new ArrayList<>();
    for (Enrollment e : base) {
      String cId = e.getCourse().getId();
      String uId = e.getUser().getId();
      List<CourseLesson> courseLessons = lessonsByCourse.getOrDefault(cId, List.of());
      Set<String> completedIds = completedLessonIdsByUser.getOrDefault(uId, Set.of());

      List<String> pendingLessonTitles = new ArrayList<>();
      for (CourseLesson lesson : courseLessons) {
        if (!completedIds.contains(lesson.getId())) {
          pendingLessonTitles.add(lesson.getTitle());
        }
      }
      int lessonsTotal = courseLessons.size();
      int lessonsPending = pendingLessonTitles.size();

      List<Evaluation> considered = new ArrayList<>();
      for (Evaluation ev : evaluationsByCourse.getOrDefault(cId, List.of())) {
        if (ev.getTurmaId() == null || ev.getTurmaId().equals(e.getTurmaId())) {
          considered.add(ev);
        }
      }
      List<PendingEvaluationDto> pendingEvaluations = new ArrayList<>();
      for (Evaluation ev : considered) {
        List<AttemptStatus> statuses =
            attemptStatuses.getOrDefault(uId + "|" + ev.getId(), List.of());
        if (statuses.contains(AttemptStatus.corrigida)) {
          continue;
        }
        pendingEvaluations.add(
            new PendingEvaluationDto(ev.getId(), ev.getName(), ev.getDueDate(), pendingState(statuses)));
      }

      if (lessonsPending == 0 && pendingEvaluations.isEmpty()) {
        continue;
      }
      rows.add(
          new StudentPendingRowDto(
              uId,
              e.getUserName(),
              e.getUser().getEmail(),
              cId,
              e.getCourseTitle(),
              e.getTurmaId(),
              e.getTurmaName(),
              e.getUnitId(),
              e.getProgress() == null ? 0 : e.getProgress(),
              lessonsTotal,
              lessonsTotal - lessonsPending,
              lessonsPending,
              pendingLessonTitles,
              considered.size(),
              pendingEvaluations.size(),
              pendingEvaluations));
    }
    rows.sort(
        Comparator.comparing(StudentPendingRowDto::userName, nullsFirst())
            .thenComparing(StudentPendingRowDto::courseTitle, nullsFirst()));
    return rows;
  }

  private static String pendingState(List<AttemptStatus> statuses) {
    if (statuses.contains(AttemptStatus.enviada)
        || statuses.contains(AttemptStatus.aguardando_correcao)) {
      return "aguardando_correcao";
    }
    if (statuses.contains(AttemptStatus.em_andamento)) {
      return "em_andamento";
    }
    return "nao_iniciada";
  }

  /** Base de matrículas não canceladas, já restrita à unidade que o ator pode enxergar. */
  private List<Enrollment> scopedEnrollments(UserAccount actor, UnitId unitId) {
    if (UnitScope.isGlobal(actor)) {
      return unitId != null
          ? enrollments.findByUnitIdAndStatusNot(unitId, EnrollmentStatus.cancelada)
          : enrollments.findByStatusNot(EnrollmentStatus.cancelada);
    }
    if (unitId != null) {
      UnitScope.assertCanAccessUnit(actor, unitId);
    }
    return enrollments.findByUnitIdAndStatusNot(actor.getUnitId(), EnrollmentStatus.cancelada);
  }

  private static List<Enrollment> filter(
      List<Enrollment> base, String courseId, String turmaId, String userId) {
    return base.stream()
        .filter(e -> courseId == null || e.getCourse().getId().equals(courseId))
        .filter(e -> turmaId == null || Objects.equals(e.getTurmaId(), turmaId))
        .filter(e -> userId == null || e.getUser().getId().equals(userId))
        .toList();
  }

  private static Comparator<String> nullsFirst() {
    return Comparator.nullsFirst(Comparator.naturalOrder());
  }
}

package com.navoxi.lms.service;

import com.navoxi.lms.domain.entity.Course;
import com.navoxi.lms.domain.entity.CourseLesson;
import com.navoxi.lms.domain.entity.Question;
import com.navoxi.lms.domain.entity.UserAccount;
import com.navoxi.lms.domain.enums.UnitId;
import com.navoxi.lms.repository.CourseLessonRepository;
import com.navoxi.lms.repository.CourseRepository;
import com.navoxi.lms.repository.QuestionRepository;
import com.navoxi.lms.security.UnitScope;
import com.navoxi.lms.web.ApiExceptionHandler.BadRequestException;
import com.navoxi.lms.web.dto.SearchCourseHit;
import com.navoxi.lms.web.dto.SearchLessonHit;
import com.navoxi.lms.web.dto.SearchQuestionHit;
import com.navoxi.lms.web.dto.SearchResponse;
import java.util.EnumSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SearchService {

  public enum SearchType {
    course,
    lesson,
    question
  }

  private static final int DEFAULT_LIMIT = 20;
  private static final int MAX_LIMIT = 50;

  private final CourseRepository courses;
  private final CourseLessonRepository lessons;
  private final QuestionRepository questions;

  public SearchService(
      CourseRepository courses, CourseLessonRepository lessons, QuestionRepository questions) {
    this.courses = courses;
    this.lessons = lessons;
    this.questions = questions;
  }

  @Transactional(readOnly = true)
  public SearchResponse search(UserAccount actor, String rawQuery, String typesCsv, Integer limit) {
    String query = rawQuery == null ? "" : rawQuery.trim();
    if (query.length() < 2) {
      throw new BadRequestException("q deve ter pelo menos 2 caracteres");
    }
    int pageSize = normalizeLimit(limit);
    Set<SearchType> types = parseTypes(typesCsv);
    String pattern = "%" + escapeLike(query) + "%";
    PageRequest page = PageRequest.of(0, pageSize);

    List<SearchCourseHit> courseHits =
        types.contains(SearchType.course) ? searchCourses(actor, pattern, page) : List.of();
    List<SearchLessonHit> lessonHits =
        types.contains(SearchType.lesson) ? searchLessons(actor, pattern, page) : List.of();
    List<SearchQuestionHit> questionHits =
        types.contains(SearchType.question) ? searchQuestions(actor, pattern, page) : List.of();

    return new SearchResponse(query, courseHits, lessonHits, questionHits);
  }

  private List<SearchCourseHit> searchCourses(UserAccount actor, String pattern, PageRequest page) {
    List<Course> found =
        UnitScope.isGlobal(actor)
            ? courses.searchByTitle(pattern, page)
            : courses.searchByUnitAndTitle(requireUnit(actor), pattern, page);
    return found.stream()
        .map(
            c ->
                new SearchCourseHit(
                    c.getId(),
                    c.getTitle(),
                    c.getCategory(),
                    c.getUnitId(),
                    "/aprendizagem/cursos/" + c.getId()))
        .toList();
  }

  private List<SearchLessonHit> searchLessons(UserAccount actor, String pattern, PageRequest page) {
    List<CourseLesson> found =
        UnitScope.isGlobal(actor)
            ? lessons.searchByTitle(pattern, page)
            : lessons.searchByUnitAndTitle(requireUnit(actor), pattern, page);
    return found.stream()
        .map(
            l -> {
              Course course = l.getCourse();
              return new SearchLessonHit(
                  l.getId(),
                  l.getTitle(),
                  course.getId(),
                  course.getTitle(),
                  "/aprendizagem/cursos/" + course.getId() + "?aula=" + l.getId());
            })
        .toList();
  }

  private List<SearchQuestionHit> searchQuestions(
      UserAccount actor, String pattern, PageRequest page) {
    List<Question> found =
        UnitScope.isGlobal(actor)
            ? questions.searchByText(pattern, page)
            : questions.searchByUnitAndText(requireUnit(actor), pattern, page);
    return found.stream()
        .map(
            q ->
                new SearchQuestionHit(
                    q.getId(),
                    q.getText(),
                    q.getCategory(),
                    q.getType(),
                    q.getUnitId(),
                    "/repositorio/questoes"))
        .toList();
  }

  /** Strip LIKE wildcards so user input cannot broaden the pattern. */
  static String escapeLike(String raw) {
    return raw.replace("%", "").replace("_", "");
  }

  static int normalizeLimit(Integer limit) {
    if (limit == null || limit <= 0) {
      return DEFAULT_LIMIT;
    }
    return Math.min(limit, MAX_LIMIT);
  }

  static Set<SearchType> parseTypes(String typesCsv) {
    if (typesCsv == null || typesCsv.isBlank()) {
      return EnumSet.allOf(SearchType.class);
    }
    EnumSet<SearchType> out = EnumSet.noneOf(SearchType.class);
    for (String part : typesCsv.split(",")) {
      String token = part.trim().toLowerCase(Locale.ROOT);
      if (token.isEmpty()) {
        continue;
      }
      try {
        out.add(SearchType.valueOf(token));
      } catch (IllegalArgumentException ex) {
        throw new BadRequestException("types inválido: " + token);
      }
    }
    if (out.isEmpty()) {
      throw new BadRequestException("types não pode ser vazio");
    }
    return out;
  }

  private static UnitId requireUnit(UserAccount actor) {
    UnitId unitId = actor.getUnitId();
    if (unitId == null) {
      throw new BadRequestException("Usuário sem unidade");
    }
    return unitId;
  }
}

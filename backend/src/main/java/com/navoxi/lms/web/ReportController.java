package com.navoxi.lms.web;

import com.navoxi.lms.domain.entity.UserAccount;
import com.navoxi.lms.domain.enums.UnitId;
import com.navoxi.lms.service.ReportService;
import com.navoxi.lms.web.dto.CourseCompletionRowDto;
import com.navoxi.lms.web.dto.StudentPendingRowDto;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/reports")
@PreAuthorize("hasAnyRole('admin_premium','admin_unidade')")
public class ReportController {

  private final CurrentUserResolver currentUser;
  private final ReportService reports;

  public ReportController(CurrentUserResolver currentUser, ReportService reports) {
    this.currentUser = currentUser;
    this.reports = reports;
  }

  @GetMapping("/completion")
  public List<CourseCompletionRowDto> completion(
      @RequestParam(required = false) String courseId,
      @RequestParam(required = false) String turmaId,
      @RequestParam(required = false) UnitId unitId) {
    UserAccount actor = currentUser.require();
    return reports.completionByCourse(actor, courseId, turmaId, unitId);
  }

  @GetMapping("/pending")
  public List<StudentPendingRowDto> pending(
      @RequestParam(required = false) String courseId,
      @RequestParam(required = false) String turmaId,
      @RequestParam(required = false) UnitId unitId,
      @RequestParam(required = false) String userId) {
    UserAccount actor = currentUser.require();
    return reports.pendingByStudent(actor, courseId, turmaId, unitId, userId);
  }
}

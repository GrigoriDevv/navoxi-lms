package com.navoxi.lms.web;

import com.navoxi.lms.domain.entity.UserAccount;
import com.navoxi.lms.service.CourseMapper;
import com.navoxi.lms.service.EnrollmentService;
import com.navoxi.lms.service.ProgressService;
import com.navoxi.lms.web.dto.EnrollmentDto;
import com.navoxi.lms.web.dto.LessonProgressDto;
import com.navoxi.lms.web.dto.UserDto;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users/me")
public class UserController {

  private final CurrentUserResolver currentUser;
  private final EnrollmentService enrollments;
  private final ProgressService progress;

  public UserController(
      CurrentUserResolver currentUser,
      EnrollmentService enrollments,
      ProgressService progress) {
    this.currentUser = currentUser;
    this.enrollments = enrollments;
    this.progress = progress;
  }

  @GetMapping
  public UserDto me(@RequestHeader(value = "X-User-Email", required = false) String email) {
    return CourseMapper.toDto(currentUser.require(email));
  }

  @GetMapping("/enrollments")
  public List<EnrollmentDto> enrollments(
      @RequestHeader(value = "X-User-Email", required = false) String email) {
    UserAccount user = currentUser.require(email);
    return enrollments.listForUser(user);
  }

  @GetMapping("/progress")
  public List<LessonProgressDto> progress(
      @RequestHeader(value = "X-User-Email", required = false) String email) {
    UserAccount user = currentUser.require(email);
    return progress.listForUser(user.getId());
  }
}

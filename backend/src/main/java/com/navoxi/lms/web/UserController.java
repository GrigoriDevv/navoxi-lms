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
  public UserDto me() {
    return CourseMapper.toDto(currentUser.require());
  }

  @GetMapping("/enrollments")
  public List<EnrollmentDto> enrollments() {
    UserAccount user = currentUser.require();
    return enrollments.listForUser(user);
  }

  @GetMapping("/progress")
  public List<LessonProgressDto> progress() {
    UserAccount user = currentUser.require();
    return progress.listForUser(user.getId());
  }
}

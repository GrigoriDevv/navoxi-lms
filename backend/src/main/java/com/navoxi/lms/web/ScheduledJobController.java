package com.navoxi.lms.web;

import com.navoxi.lms.service.ScheduledJobService;
import com.navoxi.lms.web.dto.ScheduledJobDto;
import com.navoxi.lms.web.dto.ScheduledJobRequest;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/scheduled-jobs")
@PreAuthorize("hasAnyRole('admin_premium', 'admin_unidade')")
public class ScheduledJobController {

  private final ScheduledJobService jobs;

  public ScheduledJobController(ScheduledJobService jobs) {
    this.jobs = jobs;
  }

  @GetMapping
  public List<ScheduledJobDto> list() {
    return jobs.list();
  }

  @GetMapping("/{id}")
  public ScheduledJobDto get(@PathVariable String id) {
    return jobs.get(id);
  }

  @PatchMapping("/{id}")
  public ScheduledJobDto update(@PathVariable String id, @RequestBody ScheduledJobRequest request) {
    return jobs.update(id, request);
  }
}

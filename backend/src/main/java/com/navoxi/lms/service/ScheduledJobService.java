package com.navoxi.lms.service;

import com.navoxi.lms.domain.entity.ScheduledJob;
import com.navoxi.lms.repository.ScheduledJobRepository;
import com.navoxi.lms.web.ApiExceptionHandler.NotFoundException;
import com.navoxi.lms.web.dto.ScheduledJobDto;
import com.navoxi.lms.web.dto.ScheduledJobRequest;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ScheduledJobService {

  private final ScheduledJobRepository jobs;

  public ScheduledJobService(ScheduledJobRepository jobs) {
    this.jobs = jobs;
  }

  @Transactional(readOnly = true)
  public List<ScheduledJobDto> list() {
    return jobs.findAll().stream().map(PermissionJobMapper::toDto).toList();
  }

  @Transactional(readOnly = true)
  public ScheduledJobDto get(String id) {
    return PermissionJobMapper.toDto(require(id));
  }

  @Transactional
  public ScheduledJobDto update(String id, ScheduledJobRequest req) {
    ScheduledJob j = require(id);
    if (req.name() != null) {
      j.setName(req.name());
    }
    if (req.schedule() != null) {
      j.setSchedule(req.schedule());
    }
    if (req.module() != null) {
      j.setModule(req.module());
    }
    if (req.action() != null) {
      j.setAction(req.action());
    }
    if (req.enabled() != null) {
      j.setEnabled(req.enabled());
    }
    if (req.lastRun() != null) {
      j.setLastRun(req.lastRun());
    }
    if (req.nextRun() != null) {
      j.setNextRun(req.nextRun());
    }
    return PermissionJobMapper.toDto(jobs.save(j));
  }

  ScheduledJob require(String id) {
    return jobs
        .findById(id)
        .orElseThrow(() -> new NotFoundException("Job agendado não encontrado"));
  }
}

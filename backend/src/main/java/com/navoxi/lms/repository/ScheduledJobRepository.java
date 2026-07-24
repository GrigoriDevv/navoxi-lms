package com.navoxi.lms.repository;

import com.navoxi.lms.domain.entity.ScheduledJob;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ScheduledJobRepository extends JpaRepository<ScheduledJob, String> {}

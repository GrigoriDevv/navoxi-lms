package com.navoxi.lms.repository;

import com.navoxi.lms.domain.entity.AccessLog;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AccessLogRepository extends JpaRepository<AccessLog, String> {
  List<AccessLog> findByUserIdOrderByCreatedAtDesc(String userId);
}

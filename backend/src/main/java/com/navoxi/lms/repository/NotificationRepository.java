package com.navoxi.lms.repository;

import com.navoxi.lms.domain.entity.Notification;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificationRepository extends JpaRepository<Notification, String> {
  List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query("update Notification n set n.readFlag = true where n.user.id = :userId and n.readFlag = false")
  int markAllReadForUser(@Param("userId") String userId);

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query("delete from Notification n where n.user.id = :userId")
  int deleteByUserId(@Param("userId") String userId);
}

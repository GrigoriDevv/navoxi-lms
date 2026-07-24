package com.navoxi.lms.repository;

import com.navoxi.lms.domain.entity.Post;
import com.navoxi.lms.domain.enums.UnitId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostRepository extends JpaRepository<Post, String> {
  List<Post> findByUnitId(UnitId unitId);
}

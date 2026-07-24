package com.navoxi.lms.repository;

import com.navoxi.lms.domain.entity.Destaque;
import com.navoxi.lms.domain.enums.UnitId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DestaqueRepository extends JpaRepository<Destaque, String> {
  List<Destaque> findByUnitId(UnitId unitId);
}

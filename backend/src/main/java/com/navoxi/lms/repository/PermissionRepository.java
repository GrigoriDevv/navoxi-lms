package com.navoxi.lms.repository;

import com.navoxi.lms.domain.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PermissionRepository extends JpaRepository<Permission, String> {}

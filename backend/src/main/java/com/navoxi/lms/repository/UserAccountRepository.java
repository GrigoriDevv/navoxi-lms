package com.navoxi.lms.repository;

import com.navoxi.lms.domain.entity.UserAccount;
import com.navoxi.lms.domain.enums.Role;
import com.navoxi.lms.domain.enums.UnitId;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserAccountRepository extends JpaRepository<UserAccount, String> {
  Optional<UserAccount> findByEmailIgnoreCase(String email);

  Optional<UserAccount> findByMicrosoftOid(String microsoftOid);

  List<UserAccount> findByRole(Role role);

  List<UserAccount> findByUnitId(UnitId unitId);

  List<UserAccount> findByRoleInAndUnitId(Collection<Role> roles, UnitId unitId);
}

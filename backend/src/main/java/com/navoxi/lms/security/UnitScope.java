package com.navoxi.lms.security;

import com.navoxi.lms.domain.entity.Course;
import com.navoxi.lms.domain.entity.UserAccount;
import com.navoxi.lms.domain.enums.Role;
import com.navoxi.lms.domain.enums.UnitId;
import com.navoxi.lms.web.ApiExceptionHandler.ForbiddenException;

/** Escopo de unidade no servidor (espelha view_all_units do front). */
public final class UnitScope {

  private UnitScope() {}

  public static boolean isGlobal(UserAccount actor) {
    return actor.getRole() == Role.admin_premium;
  }

  public static boolean canAccessUnit(UserAccount actor, UnitId unitId) {
    if (unitId == null) {
      return false;
    }
    return isGlobal(actor) || actor.getUnitId() == unitId;
  }

  public static void assertCanAccessUnit(UserAccount actor, UnitId unitId) {
    if (!canAccessUnit(actor, unitId)) {
      throw new ForbiddenException("Recurso fora do escopo da sua unidade");
    }
  }

  public static boolean canAccessCourse(UserAccount actor, Course course) {
    return course != null && canAccessUnit(actor, course.getUnitId());
  }

  public static void assertCanAccessCourse(UserAccount actor, Course course) {
    if (!canAccessCourse(actor, course)) {
      throw new ForbiddenException("Recurso fora do escopo da sua unidade");
    }
  }
}
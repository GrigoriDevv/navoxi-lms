"use client";

import { useApp } from "./store";
import {
  hasPermission,
  scopeByUnit,
  unitLabels,
  type PermissionKey,
} from "./rbac";
import type { Role, UnitId } from "./types";
import { contents } from "./mock-data";

export function useAuthScope() {
  const {
    currentUser,
    users,
    courses,
    turmas,
    trilhas,
    salas,
    certificados,
    interesses,
    solicitacoes,
  } = useApp();
  const role: Role = currentUser?.role ?? "aluno";
  const unitId = currentUser?.unitId;
  const isGlobal = hasPermission(role, "view_all_units");

  return {
    currentUser,
    role,
    unitId,
    isGlobal,
    unitLabel: unitId ? unitLabels[unitId] : undefined,
    users: scopeByUnit(users, role, unitId),
    courses: scopeByUnit(courses, role, unitId),
    turmas: scopeByUnit(turmas, role, unitId),
    trilhas,
    salas: scopeByUnit(salas, role, unitId),
    certificados: scopeByUnit(certificados, role, unitId),
    interesses: scopeByUnit(interesses, role, unitId),
    solicitacoes: scopeByUnit(solicitacoes, role, unitId),
    contents: scopeByUnit(contents, role, unitId),
    can: (permission: PermissionKey) => hasPermission(role, permission),
  };
}

export function defaultUnitForUser(unitId?: UnitId): UnitId {
  return unitId ?? "holding";
}

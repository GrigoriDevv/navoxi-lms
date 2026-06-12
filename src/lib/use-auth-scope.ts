"use client";

import { useApp } from "./store";
import {
  hasPermission,
  scopeByUnit,
  unitLabels,
  type PermissionKey,
} from "./rbac";
import type { Role, UnitId } from "./types";

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
    questions,
    evaluations,
    contents,
    destaques,
    alertRules,
    internalMails,
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
    questions: scopeByUnit(questions, role, unitId),
    evaluations: scopeByUnit(evaluations, role, unitId),
    contents: scopeByUnit(contents, role, unitId),
    destaques: scopeByUnit(destaques, role, unitId),
    alertRules: scopeByUnit(alertRules, role, unitId),
    internalMails: scopeByUnit(internalMails, role, unitId),
    can: (permission: PermissionKey) => hasPermission(role, permission),
  };
}

export function defaultUnitForUser(unitId?: UnitId): UnitId {
  return unitId ?? "holding";
}

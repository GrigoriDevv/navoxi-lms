import type { AuthProvider, SessionPayload } from "./auth-session";
import type { Role, UnitId } from "./types";

export interface AuthProfile {
  userId: string;
  email: string;
  name: string;
  role: Role;
  unitId: UnitId;
  avatarColor: string;
  provider: AuthProvider;
  accessToken?: string;
}

export function toSessionProfileFromMock(profile: {
  email: string;
  name: string;
  role: Role;
}): AuthProfile {
  return {
    userId: profile.email,
    email: profile.email,
    name: profile.name,
    role: profile.role,
    unitId: "matriz",
    avatarColor: "#2563eb",
    provider: "password",
  };
}

export function toSessionPayload(
  profile: AuthProfile,
  exp: number
): SessionPayload {
  return {
    userId: profile.userId,
    email: profile.email,
    name: profile.name,
    role: profile.role,
    unitId: profile.unitId,
    avatarColor: profile.avatarColor,
    provider: profile.provider,
    accessToken: profile.accessToken,
    exp,
  };
}

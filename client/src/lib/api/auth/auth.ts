import "server-only";
import { User } from "@/types/user";
import { apiFetch } from "../fetcher";

export type RegisterPayload = {
  username: string;
  password: string;
};

export type LoginPayload = {
  username: string;
  password: string;
};

export type UpdateProfilePayload = Partial<{
  username: string;
  email: string;
  fullName: string;
  avatarUrl: string;
}>;

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export function registerRequest(payload: RegisterPayload) {
  return apiFetch<User>("/auth/register", { method: "POST", body: payload });
}

export function loginRequest(payload: LoginPayload) {
  return apiFetch<User>("/auth/login", { method: "POST", body: payload });
}

export function getMeRequest(cookie: string) {
  return apiFetch<User>("/auth/me", { cookie });
}

export function refreshRequest(cookie: string) {
  return apiFetch<null>("/auth/refresh", { method: "POST", cookie });
}

export function logoutRequest(cookie: string) {
  return apiFetch<null>("/auth/logout", { method: "POST", cookie });
}

export function updateProfileRequest(payload: UpdateProfilePayload, cookie: string) {
  return apiFetch<User>("/auth/me", { method: "PATCH", body: payload, cookie });
}

export function changePasswordRequest(payload: ChangePasswordPayload, cookie: string) {
  return apiFetch<null>("/auth/me/change-password", { method: "PATCH", body: payload, cookie });
}

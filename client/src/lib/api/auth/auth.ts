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

export function registerRequest(payload: RegisterPayload) {
  return apiFetch<User>("/auth/register", { method: "POST", body: payload });
}

export function loginRequest(payload: LoginPayload) {
  return apiFetch<User>("/auth/login", { method: "POST", body: payload });
}

export function getMeRequest(cookie: string) {
  return apiFetch<User>("/auth/me", { cookie });
}

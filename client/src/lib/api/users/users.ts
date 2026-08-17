import "server-only";
import { UserSearchResult } from "@/types/team";
import { apiFetch } from "../fetcher";

type SearchUsersParams = {
  username: string;
  excludeProjectId?: number;
};

function searchUsersPath({ username, excludeProjectId }: SearchUsersParams) {
  const params = new URLSearchParams({ username });
  if (excludeProjectId != null) {
    params.set("excludeProjectId", String(excludeProjectId));
  }
  return `/users/search?${params.toString()}`;
}

export function searchUsersRequest(params: SearchUsersParams, cookie: string) {
  return apiFetch<UserSearchResult[]>(searchUsersPath(params), { cookie });
}
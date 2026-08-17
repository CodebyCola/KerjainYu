"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ApiRequestError } from "@/lib/api/apiRequestError";
import { searchUsersRequest } from "@/lib/api/users/users";
import { inviteMemberRequest } from "@/lib/api/members/members";
import { UserSearchResult } from "@/types/team";
import { projectRoutes } from "@/lib/routes";

export type SearchUsersState = {
  results: UserSearchResult[];
  error: string | null;
};

export async function searchUsersAction(
  projectId: string,
  query: string,
): Promise<SearchUsersState> {
  const username = query.trim();
  if (username.length < 2) {
    return { results: [], error: null };
  }

  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    const { data } = await searchUsersRequest(
      { username, excludeProjectId: Number(projectId) },
      cookieHeader,
    );
    return { results: data, error: null };
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return { results: [], error: err.message };
    }
    return {
      results: [],
      error: "Terjadi kesalahan tak terduga. Coba lagi.",
    };
  }
}

export type InviteMemberState = {
  success: boolean;
  error: string | null;
};

export async function inviteMemberAction(
  projectId: string,
  userId: number,
): Promise<InviteMemberState> {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    await inviteMemberRequest(projectId, userId, cookieHeader);
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return { success: false, error: err.message };
    }
    return {
      success: false,
      error: "Terjadi kesalahan tak terduga. Coba lagi.",
    };
  }

  revalidatePath(projectRoutes(projectId).TEAM);
  return { success: true, error: null };
}

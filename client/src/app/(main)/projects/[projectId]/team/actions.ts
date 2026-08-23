"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ApiRequestError } from "@/lib/api/apiRequestError";
import { searchUsersRequest } from "@/lib/api/users/users";
import {
  inviteMemberRequest,
  promoteToLeaderRequest,
  leaveProjectRequest,
} from "@/lib/api/members/members";
import { UserSearchResult } from "@/types/team";
import { ROUTES, projectRoutes } from "@/lib/routes";

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

export type PromoteLeaderState = {
  success: boolean;
  error: string | null;
};

export async function promoteToLeaderAction(
  projectId: string,
  userId: number,
): Promise<PromoteLeaderState> {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    await promoteToLeaderRequest(projectId, userId, cookieHeader);
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

export type LeaveProjectState = {
  success: boolean;
  error: string | null;
};

export async function leaveProjectAction(
  projectId: string,
): Promise<LeaveProjectState> {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    await leaveProjectRequest(projectId, cookieHeader);
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return { success: false, error: err.message };
    }
    return {
      success: false,
      error: "Terjadi kesalahan tak terduga. Coba lagi.",
    };
  }

  // Halaman proyek ini tidak bisa diakses lagi setelah keluar,
  // jadi langsung redirect ke daftar proyek alih-alih revalidate saja.
  redirect(ROUTES.PROJECTS);
}

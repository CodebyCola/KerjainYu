"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ApiRequestError } from "@/lib/api/apiRequestError";
import {
  getMyInvitations,
  respondToInvitationRequest,
} from "@/lib/api/invitations/invitations";
import { Invitation } from "@/types/team";
import { ROUTES } from "@/lib/routes";

export async function getMyInvitationsAction(): Promise<Invitation[]> {
  return getMyInvitations();
}

export type RespondInvitationState = {
  success: boolean;
  error: string | null;
};

export async function respondToInvitationAction(
  invitationId: number,
  status: "accept" | "reject",
): Promise<RespondInvitationState> {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    await respondToInvitationRequest(invitationId, status, cookieHeader);
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return { success: false, error: err.message };
    }
    return {
      success: false,
      error: "Terjadi kesalahan tak terduga. Coba lagi.",
    };
  }

  // Undangan yang diterima menambah proyek baru ke daftar proyek user.
  revalidatePath(ROUTES.PROJECTS);
  return { success: true, error: null };
}

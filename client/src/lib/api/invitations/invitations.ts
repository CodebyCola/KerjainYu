import "server-only";
import { cookies } from "next/headers";
import { Invitation } from "@/types/team";
import { apiFetch } from "../fetcher";

const INVITATIONS_PATH = "/invitations";

export function getMyInvitationsRequest(cookie: string) {
  return apiFetch<Invitation[]>(INVITATIONS_PATH, { cookie });
}

export async function getMyInvitations(): Promise<Invitation[]> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  try {
    const { data } = await getMyInvitationsRequest(cookieHeader);
    return data;
  } catch {
    return [];
  }
}

export function respondToInvitationRequest(
  invitationId: number,
  status: "accept" | "reject",
  cookie: string,
) {
  return apiFetch<null>(`${INVITATIONS_PATH}/${invitationId}`, {
    method: "PATCH",
    body: { status },
    cookie,
  });
}

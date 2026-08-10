"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createProjectRequest } from "@/lib/api/projects/projects";
import { ApiRequestError } from "@/lib/api/apiRequestError";
import { validateCreateProjectFields } from "@/lib/validation/projectSchema";
import { ProjectFormState } from "@/lib/api/projects/projectFormState";
import { ROUTES } from "@/lib/routes";

export async function createProjectAction(
  _prevState: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  const title = String(formData.get("title") ?? "");
  const deadline = String(formData.get("deadline") ?? "");
  const allowFreeSwap = formData.get("allowFreeSwap") === "on";

  const fieldErrors = validateCreateProjectFields(title);
  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, error: null, fieldErrors };
  }

  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    await createProjectRequest(
      {
        project: {
          title: title.trim(),
          allowFreeSwap,
          deadline: deadline || undefined,
        },
      },
      cookieHeader,
    );
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return { success: false, error: err.message };
    }
    return {
      success: false,
      error: "Terjadi kesalahan tak terduga. Coba lagi.",
    };
  }

  revalidatePath(ROUTES.PROJECTS);
  return { success: true, error: null };
}

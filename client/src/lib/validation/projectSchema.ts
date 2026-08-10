export type FieldErrors = Record<string, string>;

export function validateProjectTitle(title: string): string | null {
  const trimmed = title.trim();
  if (!trimmed) return "Judul proyek wajib diisi";
  if (trimmed.length < 3) return "Judul proyek minimal 3 karakter";
  if (trimmed.length > 150) return "Judul proyek maksimal 150 karakter";
  return null;
}

export function validateProjectDeadline(deadline: string): string | null {
  const trimmed = deadline.trim();
  if (!trimmed) return "Deadline wajib diisi";

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return "Format deadline tidak valid";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (parsed < today) return "Deadline tidak boleh di masa lalu";

  return null;
}

export function validateCreateProjectFields(title: string, deadline: string): FieldErrors {
  const errors: FieldErrors = {};

  const titleError = validateProjectTitle(title);
  if (titleError) errors.title = titleError;

  const deadlineError = validateProjectDeadline(deadline);
  if (deadlineError) errors.deadline = deadlineError;

  return errors;
}
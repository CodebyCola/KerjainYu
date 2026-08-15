export type FieldErrors = Record<string, string>;

export function validateTaskTitle(title: string): string | null {
  const trimmed = title.trim();
  if (!trimmed) return "Judul tugas wajib diisi";
  if (trimmed.length < 3) return "Judul tugas minimal 3 karakter";
  if (trimmed.length > 150) return "Judul tugas maksimal 150 karakter";
  return null;
}

export function validateTaskDeadline(deadline: string): string | null {
  if (!deadline.trim()) return null;

  const parsed = new Date(deadline);
  if (Number.isNaN(parsed.getTime())) return "Format deadline tidak valid";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (parsed < today) return "Deadline tidak boleh di masa lalu";

  return null;
}

export function validateTaskPriority(priority: string): string | null {
  if (!priority.trim()) return null;

  const parsed = Number(priority);
  if (!Number.isInteger(parsed) || parsed < 1) return "Prioritas harus angka bulat positif";
  return null;
}

export function validateCreateTaskFields(
  title: string,
  deadline: string,
  priority: string,
): FieldErrors {
  const errors: FieldErrors = {};

  const titleError = validateTaskTitle(title);
  if (titleError) errors.title = titleError;

  const deadlineError = validateTaskDeadline(deadline);
  if (deadlineError) errors.deadline = deadlineError;

  const priorityError = validateTaskPriority(priority);
  if (priorityError) errors.priority = priorityError;

  return errors;
}

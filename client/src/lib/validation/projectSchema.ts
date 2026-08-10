export type FieldErrors = Record<string, string>;

export function validateProjectTitle(title: string): string | null {
  const trimmed = title.trim();
  if (!trimmed) return "Judul proyek wajib diisi";
  if (trimmed.length < 3) return "Judul proyek minimal 3 karakter";
  if (trimmed.length > 150) return "Judul proyek maksimal 150 karakter";
  return null;
}

export function validateCreateProjectFields(title: string): FieldErrors {
  const errors: FieldErrors = {};

  const titleError = validateProjectTitle(title);
  if (titleError) errors.title = titleError;

  return errors;
}

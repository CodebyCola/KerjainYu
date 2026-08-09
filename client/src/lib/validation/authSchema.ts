export type FieldErrors = Record<string, string>;

export function validateUsername(username: string): string | null {
  const trimmed = username.trim();
  if (!trimmed) return "Username wajib diisi";
  if (trimmed.length < 3) return "Username minimal 3 karakter";
  if (trimmed.length > 100) return "Username maksimal 100 karakter";
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return "Password wajib diisi";
  if (password.length < 8) return "Password minimal 8 karakter";
  if (password.length > 100) return "Password maksimal 100 karakter";
  if (!/[A-Z]/.test(password))
    return "Password harus mengandung minimal 1 huruf besar";
  if (!/[0-9]/.test(password))
    return "Password harus mengandung minimal 1 angka";
  return null;
}

export function validateLoginFields(
  username: string,
  password: string,
): FieldErrors {
  const errors: FieldErrors = {};
  if (!username.trim()) errors.username = "Username wajib diisi";
  if (!password) errors.password = "Password wajib diisi";
  return errors;
}

export function validateRegisterFields(
  username: string,
  password: string,
  confirmPassword: string,
): FieldErrors {
  const errors: FieldErrors = {};

  const usernameError = validateUsername(username);
  if (usernameError) errors.username = usernameError;

  const passwordError = validatePassword(password);
  if (passwordError) errors.password = passwordError;

  if (!confirmPassword) {
    errors.confirmPassword = "Konfirmasi password wajib diisi";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Konfirmasi password tidak cocok";
  }

  return errors;
}

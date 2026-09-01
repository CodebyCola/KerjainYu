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

export function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) return null; // email opsional
  // Regex sederhana yang cukup untuk validasi format di client;
  // validasi otoritatif tetap dilakukan di server (zod .email()).
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!EMAIL_PATTERN.test(trimmed)) return "Format email tidak valid";
  if (trimmed.length > 255) return "Email maksimal 255 karakter";
  return null;
}

export function validateFullName(fullName: string): string | null {
  const trimmed = fullName.trim();
  if (trimmed.length > 100) return "Nama lengkap maksimal 100 karakter";
  return null;
}

export function validateAvatarUrl(avatarUrl: string): string | null {
  const trimmed = avatarUrl.trim();
  if (!trimmed) return null; // avatar opsional

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return "Tautan avatar harus dimulai dengan http:// atau https://";
    }
  } catch {
    return "Tautan avatar tidak valid";
  }

  return null;
}

export function validateProfileFields(
  username: string,
  email: string,
  fullName: string,
  avatarUrl: string,
): FieldErrors {
  const errors: FieldErrors = {};

  const usernameError = validateUsername(username);
  if (usernameError) errors.username = usernameError;

  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;

  const fullNameError = validateFullName(fullName);
  if (fullNameError) errors.fullName = fullNameError;

  const avatarUrlError = validateAvatarUrl(avatarUrl);
  if (avatarUrlError) errors.avatarUrl = avatarUrlError;

  return errors;
}

export function validateChangePasswordFields(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
): FieldErrors {
  const errors: FieldErrors = {};

  if (!currentPassword) errors.currentPassword = "Password lama wajib diisi";

  const newPasswordError = validatePassword(newPassword);
  if (newPasswordError) errors.newPassword = newPasswordError;

  if (!confirmPassword) {
    errors.confirmPassword = "Konfirmasi password wajib diisi";
  } else if (newPassword !== confirmPassword) {
    errors.confirmPassword = "Konfirmasi password tidak cocok";
  }

  if (!newPasswordError && newPassword && currentPassword && newPassword === currentPassword) {
    errors.newPassword = "Password baru tidak boleh sama dengan password lama";
  }

  return errors;
}

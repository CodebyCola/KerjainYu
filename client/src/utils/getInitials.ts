export function getInitials(name?: string | null, maxLength = 2): string {
  if (!name || !name.trim()) {
    return "?";
  }

  const initials = name
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return initials.slice(0, maxLength);
}

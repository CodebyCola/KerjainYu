import "server-only";
import { cookies } from "next/headers";

export async function forwardSetCookies(setCookies: string[]) {
  if (setCookies.length === 0) return;

  const cookieStore = await cookies();

  for (const rawSetCookie of setCookies) {
    const [nameValue, ...attributePairs] = rawSetCookie
      .split(";")
      .map((part) => part.trim());
    const [name, ...valueParts] = nameValue.split("=");
    const value = valueParts.join("=");

    const attributes: Record<string, string | boolean> = {};
    for (const attr of attributePairs) {
      const [key, val] = attr.split("=");
      attributes[key.toLowerCase()] = val ?? true;
    }

    cookieStore.set(name, decodeURIComponent(value), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: typeof attributes.path === "string" ? attributes.path : "/",
      maxAge: attributes["max-age"] ? Number(attributes["max-age"]) : undefined,
    });
  }
}

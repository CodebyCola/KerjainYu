import { CookieOptions } from "express";

export const baseCookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export const authCookieOptions: CookieOptions = {
    ...baseCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 Days
}

export const accessCookieToken: CookieOptions = {
    ...baseCookieOptions,
    maxAge: 15 * 60 * 24 * 1000 // 15 min
}

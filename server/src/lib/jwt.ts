import jwt from "jsonwebtoken";
import { AppError } from "../errors/AppError";
import crypto from 'crypto';
import { findByHash } from "../database/repositories/refresh.token.repository"

export function generateRandomString() {
  return crypto.randomBytes(40).toString('hex')
}

export function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export const generateAccessToken = (payload: { id: number, username: string }) => {
  const secret = process.env.ACCESS_TOKEN_SECRET

  if (!secret) {
    throw new AppError("ACCESS_TOKEN_SECRET_NOT_DEFINE", "ACCESS TOKEN SECRET is not defined", 500)
  }
  return jwt.sign(payload, secret, { expiresIn: "15min" })
}

export const generateRefreshToken = (tokenPlain: string) => {
  const tokenHashed = hashToken(tokenPlain)
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)
  return { tokenHashed, expiresAt }
}

export const verifyAccessToken = (token: string) => { // Verifiy Access TOken
  const secret = process.env.ACCESS_TOKEN_SECRET;

  if (!secret) {
    throw new AppError(
      "ACCESS_SECRET_NOT_DEFINE",
      "ACCESS SECRET IS NOT DEFINED ON ENV",
      500,
    );
  }
  return jwt.verify(token, secret);
};

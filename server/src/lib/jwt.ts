import jwt from "jsonwebtoken";
import { AppError } from "../errors/AppError";

export const generateToken = (payload: { id: number; username: string }) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new AppError(
      "JWT_NOT_DEFINE",
      "JWT SECRET IS NOT DEFINED ON ENV",
      500,
    );
  }
  return jwt.sign(payload, secret, { expiresIn: "7d" });
};

export const verifyToken = (token: string) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new AppError(
      "JWT_NOT_DEFINE",
      "JWT SECRET IS NOT DEFINED ON ENV",
      500,
    );
  }
  return jwt.verify(token, secret);
};

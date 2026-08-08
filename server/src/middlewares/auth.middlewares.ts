import { JwtPayload, TokenExpiredError } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt";
import { UnauthorizedError } from "../errors/AppError";

export interface AuthRequest extends Request {
  user?: { id: number; username: string };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    //Get token from http cookie
    const token = req.cookies?.token;
    if (!token) {
      throw new UnauthorizedError("Please Login First");
      return;
    }

    // verify token

    const decoded = verifyToken(token) as JwtPayload & {
      id: number;
      username: string;
    };
    req.user = { id: decoded.id, username: decoded.username };
    next(); // Continue to controller if token is valid
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      return next(new UnauthorizedError("Token is expired, please re-login"));
    }
    if (err instanceof UnauthorizedError) {
      return next(err);
    }
    next(new UnauthorizedError("Invalid or expired token"));
  }
};

import { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt";

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
      res.status(401).json({ success: false, message: "Please Login First" });
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
    res
      .status(401)
      .json({ success: false, message: "Invalid or Expired Token" });
  }
};

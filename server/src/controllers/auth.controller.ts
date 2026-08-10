import { Request, Response, NextFunction } from "express";
import * as userService from "../services/user.service";
import { AuthRequest } from "../middlewares/auth.middlewares";
import { baseCookieOptions, authCookieOptions } from "../lib/cookies";

//POST /api/v1/auth/register
export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = await userService.registerUser(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

//POST /api/v1/auth/login
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { user, token } = await userService.loginUser(req.body);
    res.cookie("token", token, authCookieOptions);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  res.clearCookie("token", baseCookieOptions);
  res.status(200).json({ success: true, message: "Logged Out" });
}

//GET /api/v1/auth/me
export async function getProfile(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = await userService.getUserProfile(req.user!.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

//PATCH /api/v1/auth/change-password
export async function changePassword(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    await userService.changeUserPassword(req.user!.id, req.body);
    res
      .status(201)
      .json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    next(error);
  }
}

//PATCH /api/v1/auth/me
export async function updateProfile(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const updated = await userService.updateUserProfile(req.user!.id, req.body);
    res.status(201).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

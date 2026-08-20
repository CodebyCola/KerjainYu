import { Request, Response, NextFunction } from "express";
import * as userService from "../services/user.service";
import { AuthRequest } from "../middlewares/auth.middlewares";
import { baseCookieOptions, authCookieOptions } from "../lib/cookies";
import { UnauthorizedError } from "../errors/AppError";
import { ACCESS_TOKEN_TTL_SECONDS } from "../lib/token";

const ACCESS_TOKEN_MAX_AGE_MS = ACCESS_TOKEN_TTL_SECONDS * 1000;
const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

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
    const userAgent = req.headers['user-agent'] || "Unknown Device"
    const ipAddress = String(req.ip || req.socket.remoteAddress);
    const { user, accessToken, refreshTokenPlain } = await userService.loginUser(req.body, ipAddress, userAgent);
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: ACCESS_TOKEN_MAX_AGE_MS,
    });
    res.cookie("refreshToken", refreshTokenPlain, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: REFRESH_TOKEN_MAX_AGE_MS
    })
    // res.cookie("token", token, authCookieOptions);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

//POST /api/v1/auth/refresh
export async function refresh(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const refreshTokenPlain = req.cookies.refreshToken
    if (!refreshTokenPlain) {
      throw new UnauthorizedError("No refresh token provided, please login again")
    }
    const { accessToken, refreshTokenPlain: newRefreshTokenPlain } = await userService.refreshAccessToken(refreshTokenPlain)
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: ACCESS_TOKEN_MAX_AGE_MS,
    });
    res.cookie("refreshToken", newRefreshTokenPlain, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: REFRESH_TOKEN_MAX_AGE_MS
    })
    res.status(200).json({ success: true })
  } catch (error) {
    next(error)
  }
}


//POST /api/v1/auth/logout
export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const refreshTokenPlain = req.cookies?.refreshToken
    if (refreshTokenPlain) {
      await userService.logout(refreshTokenPlain)
    }
    res.clearCookie("accessToken", baseCookieOptions);
    res.clearCookie("refreshToken", baseCookieOptions);
    res.status(200).json({ success: true, message: "Logged Out" });

  } catch (error) {
    next(error)
  }
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
      .status(204)
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
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}
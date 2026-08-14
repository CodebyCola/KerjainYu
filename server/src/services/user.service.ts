// src/services/userService.ts
import * as userRepo from "../database/repositories/user.repository"; // sesuaikan path repo kamu
import {
  RegisterInput,
  LoginInput,
  UpdateUserInput,
  ChangePasswordInput,
} from "../schemas/userSchema";
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../errors/AppError";
import bcrypt from "bcrypt";
import { generateToken } from "../lib/jwt";

//POST /api/v1/auth/register
export async function registerUser(input: RegisterInput) {
  const existingUser = await userRepo.findByUsername(input.username)
  if (existingUser) {
    throw new ConflictError("Username is already used")
  }
  const hashedPassword = await bcrypt.hash(input.password, 10);

  const [user] = await userRepo.create({ username: input.username, password: hashedPassword });

  const { password, ...safeUser } = user;
  return safeUser;
}

//POST /api/v1/auth/login
export async function loginUser(input: LoginInput) {
  const user = await userRepo.findByUsername(input.username)
  if (!user) {
    throw new UnauthorizedError("Invalid username or password!")
  }

  const isMatch = await bcrypt.compare(input.password, user.password)

  if (!isMatch) {
    throw new UnauthorizedError("Invalid username or password")
  }

  const token = generateToken({ id: user.id, username: user.username })
  const { password, ...safeUser } = user
  return { user: safeUser, token }
}

//GET /api/v1/auth/me
export async function getUserProfile(id: number) {
  const user = await userRepo.findById(id);
  if (!user) {
    throw new NotFoundError("User not found");
  }
  const { password, ...safeUser } = user;
  return safeUser;
}


//PATCH /api/v1/auth/me
export async function updateUserProfile(id: number, input: UpdateUserInput) {
  const existing = await userRepo.findById(id)
  if (!existing) {
    throw new NotFoundError("User not found")
  }

  if (input.username) {
    const taken = await userRepo.findByUsername(input.username);
    if (taken && taken.id !== id) {
      throw new ConflictError("Username already taken")
    }
  }
  if (input.email) {
    const taken = await userRepo.findByEmail(input.email)
    if (taken && taken.id !== id) {
      throw new ConflictError("Email already taken")
    }
  }
  const [updated] = await userRepo.updateUser(id, input);
  const { password, ...safeUser } = updated;
  return safeUser;
}


//PATCH /api/v1/auth/me/change-password
export async function changeUserPassword(
  id: number,
  input: ChangePasswordInput,
) {
  const user = await userRepo.findById(id);
  if (!user) {
    throw new NotFoundError("User not found");
  }
  const isMatch = await bcrypt.compare(input.currentPassword, user.password)
  if (!isMatch) {
    throw new UnauthorizedError("Current passowrd is incorrect")
  }
  const hashedPassword = await bcrypt.hash(input.newPassword, 10)
  await userRepo.changePassword(id, hashedPassword)
}

//GET /api/v1/users/search?username=?&excludeProjectId=
export async function searchUserByUsername(username: string, excludeProjectId?: number) {
  if (username.length) {
    return []
  }
  return await userRepo.searchByUsername(username, excludeProjectId)
}
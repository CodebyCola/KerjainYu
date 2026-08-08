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
import { signToken } from "../lib/jwt"; // sesuaikan nama fungsi generate JWT kamu

export async function registerUser(input: RegisterInput) {
  // 1. Cek username udah dipakai atau belum
  const existing = await userRepo.findByUsername(input.username);
  if (existing) {
    throw new ConflictError("Username already taken");
  }

  // 2. Hash password DI SINI (service), bukan di repo — repo cuma urusan query,
  //    hashing itu logic bisnis/security
  // const hashedPassword = await bcrypt.hash(input.password, 10);

  // 3. Simpan ke DB
  // const [user] = await userRepo.create({ username: input.username, password: hashedPassword });

  // 4. Jangan lupa strip password sebelum dikembalikan/dikirim ke client
  // const { password, ...safeUser } = user;
  // return safeUser;
}

export async function loginUser(input: LoginInput) {
  // 1. Cari user by username
  const user = await userRepo.findByUsername(input.username);
  if (!user) {
    // sengaja pesan generic, JANGAN bilang "username not found" —
    // biar orang jahat nggak bisa nebak username mana yang valid (user enumeration)
    throw new UnauthorizedError("Invalid username or password");
  }

  // 2. Compare password
  // const isMatch = await bcrypt.compare(input.password, user.password);
  // if (!isMatch) {
  //   throw new UnauthorizedError("Invalid username or password"); // pesan sama kayak di atas
  // }

  // 3. Generate token
  // const token = signToken({ id: user.id, username: user.username });

  // const { password, ...safeUser } = user;
  // return { user: safeUser, token };
}

export async function getUserProfile(id: number) {
  const user = await userRepo.findById(id); // ingat: fix typo findBytId -> findById dulu di repo
  if (!user) {
    throw new NotFoundError("User not found");
  }
  // const { password, ...safeUser } = user;
  // return safeUser;
}

export async function updateUserProfile(id: number, input: UpdateUserInput) {
  // Pastiin user-nya ada dulu sebelum update (opsional, tapi lebih jelas error-nya
  // daripada nunggu update() gagal karena row nggak ketemu)
  const existing = await userRepo.findById(id);
  if (!existing) {
    throw new NotFoundError("User not found");
  }

  // Kalau username ikut diupdate, cek dulu nggak bentrok sama user lain
  // if (input.username) {
  //   const taken = await userRepo.findByUsername(input.username);
  //   if (taken && taken.id !== id) {
  //     throw new ConflictError("Username already taken");
  //   }
  // }

  // const [updated] = await userRepo.updateUser(id, input);
  // const { password, ...safeUser } = updated;
  // return safeUser;
}

export async function changeUserPassword(
  id: number,
  input: ChangePasswordInput,
) {
  const user = await userRepo.findById(id);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  // const isMatch = await bcrypt.compare(input.currentPassword, user.password);
  // if (!isMatch) {
  //   throw new UnauthorizedError("Current password is incorrect");
  // }

  // const hashedNewPassword = await bcrypt.hash(input.newPassword, 10);
  // await userRepo.changePassword(id, hashedNewPassword);
}

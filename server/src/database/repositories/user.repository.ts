import { db } from "../db";

export async function findByUsername(username: string) {
  return db("users").where({ username }).first();
}

export async function findByEmail(email: string) {
  return db("users").where({ email }).first()
}

export async function create(data: { username: string; password: string }) {
  return db("users").insert(data).returning("*");
}
export async function findById(id: number) {
  return db("users").where({ id }).first();
}

export async function searchByUsername(username: string, excludeProjectId?: number) {
  return db("users").where("username", "ilike", `%${username}%`).modify((qb) => {
    if (excludeProjectId) {
      qb.whereNotIn("id", function () {
        this.select("user_id").from("project_members").where("project_id", excludeProjectId)
      })
    }
  }).select("id", "username", "fullName", "avatarUrl").limit(10)
}

export async function updateUser(
  id: number,
  data: Partial<{
    username?: string;
    email?: string;
    avatar_url?: string;
    full_name?: string;
  }>,
) {
  return db("users").where({ id }).update(data).returning("*");
}
export async function changePassword(id: number, new_password: string) {
  return db("users")
    .where({ id })
    .update({ password: new_password })
    .returning("*");
}

import { db } from "../db";

export async function findByUsername(username: string) {
  return db("users").where({ username }).first();
}

export async function create(data: { username: string; password: string }) {
  return db("users").insert(data).returning("*");
}

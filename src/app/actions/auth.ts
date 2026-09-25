"use server";

import { redirect } from "next/navigation";
import {
  createSession,
  destroySession,
  getUserByEmail,
  getUserCount,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import db, { newId } from "@/lib/db";

export type AuthState = { error?: string } | undefined;

export async function setupAccount(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  if (getUserCount() > 0) {
    return { error: "An account already exists." };
  }

  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");

  if (!email || !email.includes("@")) return { error: "Enter a valid email." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (password !== confirm) return { error: "Passwords do not match." };

  const passwordHash = await hashPassword(password);
  const id = newId();
  db.prepare(
    `INSERT INTO users (id, email, passwordHash, createdAt) VALUES (?, ?, ?, ?)`
  ).run(id, email, passwordHash, new Date().toISOString());

  await createSession(id);
  redirect("/");
}

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  const user = getUserByEmail(email);
  if (!user) return { error: "Invalid email or password." };

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return { error: "Invalid email or password." };

  await createSession(user.id);
  redirect("/");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}

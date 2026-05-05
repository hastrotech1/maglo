// src/actions/auth.actions.ts
"use server";

import { createAdminClient } from "@/lib/appwrite-server";
import { ID } from "node-appwrite";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  const { account } = createAdminClient();

  // Basic validation
  if (!email || typeof email !== "string") {
    throw new Error("Invalid email");
  }
  if (
    !password ||
    typeof password !== "string" ||
    password.length < 8 ||
    password.length > 256
  ) {
    throw new Error(
      "Invalid `password` param: Password must be between 8 and 256 characters long.",
    );
  }
  if (!name || typeof name !== "string") {
    throw new Error("Invalid name");
  }

  // Create user account
  await account.create(ID.unique(), email, password, name);

  // Immediately create a session so they're logged in after signup
  const session = await account.createEmailPasswordSession(email, password);

  // Store session in httpOnly cookie — not accessible by JS
  const cookieStore = await cookies();
  cookieStore.set("appwrite-session", session.secret, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    expires: new Date(session.expire),
  });

  redirect("/dashboard");
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { account } = createAdminClient();
  // Basic validation
  if (!email || typeof email !== "string") {
    throw new Error("Invalid email");
  }
  if (
    !password ||
    typeof password !== "string" ||
    password.length < 8 ||
    password.length > 256
  ) {
    throw new Error(
      "Invalid `password` param: Password must be between 8 and 256 characters long.",
    );
  }

  const session = await account.createEmailPasswordSession(email, password);

  const cookieStore = await cookies();
  cookieStore.set("appwrite-session", session.secret, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    expires: new Date(session.expire),
  });

  redirect("/dashboard");
}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete("appwrite-session");
  redirect("/login");
}

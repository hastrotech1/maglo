"use server";

import { createAdminClient } from "@/lib/appwrite-server";
import { parseAppwriteError } from "@/lib/appwrite-error";
import { ID } from "node-appwrite";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type AuthResult = { success: true } | { success: false; error: string };

export async function signUp(formData: FormData): Promise<AuthResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  if (!name?.trim()) return { success: false, error: "Full name is required." };
  if (!email?.trim()) return { success: false, error: "Email is required." };
  if (!password || password.length < 8)
    return { success: false, error: "Password must be at least 8 characters." };

  try {
    const { account } = createAdminClient();
    await account.create(ID.unique(), email, password, name);
    const session = await account.createEmailPasswordSession(email, password);

    const cookieStore = await cookies();
    cookieStore.set("appwrite-session", session.secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(session.expire),
    });
  } catch (error) {
    return { success: false, error: parseAppwriteError(error) };
  }

  redirect("/dashboard"); // outside try/catch — Next.js redirect must propagate
}

export async function signIn(formData: FormData): Promise<AuthResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email?.trim()) return { success: false, error: "Email is required." };
  if (!password) return { success: false, error: "Password is required." };

  try {
    const { account } = createAdminClient();
    const session = await account.createEmailPasswordSession(email, password);

    const cookieStore = await cookies();
    cookieStore.set("appwrite-session", session.secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(session.expire),
    });
  } catch (error) {
    return { success: false, error: parseAppwriteError(error) };
  }

  redirect("/dashboard");
}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete("appwrite-session");
  redirect("/login");
}

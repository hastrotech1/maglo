// src/lib/appwrite-server.ts
import { Client, Databases, Account } from "node-appwrite";
import { cookies } from "next/headers";

// ─── Admin client ────────────────────────────────────────────────
// Uses the secret API key. Has full DB access.
// Use this for creating/reading/deleting documents.
export function createAdminClient() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!); // ← server only

  return {
    databases: new Databases(client),
    account: new Account(client),
  };
}

// ─── Session client ─────
// Scoped to the logged-in user's session cookie.
// Use this when you need to identify WHO is making the request.
export async function createSessionClient() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

  // Appwrite stores the session in a cookie called "appwrite-session"
  const cookieStore = await cookies();
  const session = cookieStore.get("appwrite-session");

  if (!session?.value) {
    throw new Error("No active session"); // middleware will catch this
  }

  client.setSession(session.value);

  return {
    account: new Account(client),
  };
}

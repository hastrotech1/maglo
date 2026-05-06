// src/lib/appwrite-server.ts
import { Client, Databases, Account } from "node-appwrite";
import { cookies } from "next/headers";

// Get and validate environment variables with comprehensive checks
function getValidatedEndpoint(): string {
  const raw = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;

  if (!raw) {
    const msg = `NEXT_PUBLIC_APPWRITE_ENDPOINT is not set. Make sure your .env.local file has:
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1`;
    console.error(msg);
    throw new Error(msg);
  }

  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error(
      "NEXT_PUBLIC_APPWRITE_ENDPOINT is empty or whitespace-only. Check your .env.local file.",
    );
  }

  // Validate it looks like a URL
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    throw new Error(
      `NEXT_PUBLIC_APPWRITE_ENDPOINT must be a valid URL starting with http:// or https://. Got: "${trimmed}"`,
    );
  }

  return trimmed;
}

function getValidatedProjectId(): string {
  const raw = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

  if (!raw) {
    const msg = `NEXT_PUBLIC_APPWRITE_PROJECT_ID is not set. Make sure your .env.local file has:
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id`;
    console.error(msg);
    throw new Error(msg);
  }

  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error(
      "NEXT_PUBLIC_APPWRITE_PROJECT_ID is empty or whitespace-only. Check your .env.local file.",
    );
  }

  return trimmed;
}

function getValidatedApiKey(): string {
  const raw = process.env.APPWRITE_API_KEY;

  if (!raw) {
    const msg = `APPWRITE_API_KEY is not set. Make sure your .env.local file has:
APPWRITE_API_KEY=your_api_key`;
    console.error(msg);
    throw new Error(msg);
  }

  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error(
      "APPWRITE_API_KEY is empty or whitespace-only. Check your .env.local file.",
    );
  }

  return trimmed;
}

// Validate environment variables at module load time
const endpoint = getValidatedEndpoint();
const projectId = getValidatedProjectId();
const apiKey = getValidatedApiKey();

// ─── Admin client ────────────────────────────────────────────────
// Uses the secret API key. Has full DB access.
// Use this for creating/reading/deleting documents.
export function createAdminClient() {
  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);

  return {
    databases: new Databases(client),
    account: new Account(client),
  };
}

// ─── Session client ─────
// Scoped to the logged-in user's session cookie.
// Use this when you need to identify WHO is making the request.
export async function createSessionClient() {
  const client = new Client().setEndpoint(endpoint).setProject(projectId);

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

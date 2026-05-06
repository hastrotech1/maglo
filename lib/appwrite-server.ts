// src/lib/appwrite-server.ts
import { Client, Databases, Account } from "node-appwrite";
import { cookies } from "next/headers";

// Get and validate environment variables (lazy-loaded when functions are called)
function getValidatedEndpoint(): string {
  const raw = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;

  if (!raw || !raw.trim()) {
    const msg = `❌ NEXT_PUBLIC_APPWRITE_ENDPOINT is not set or empty.
    
Please add this to your .env.local file:
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1`;
    console.error(msg);
    throw new Error("Invalid Appwrite endpoint");
  }

  const trimmed = raw.trim();

  // Validate it looks like a URL
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    const msg = `❌ NEXT_PUBLIC_APPWRITE_ENDPOINT must be a valid URL.
    
Got: "${trimmed}"
Expected format: https://cloud.appwrite.io/v1`;
    console.error(msg);
    throw new Error("Invalid Appwrite endpoint format");
  }

  return trimmed;
}

function getValidatedProjectId(): string {
  const raw = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

  if (!raw || !raw.trim()) {
    const msg = `❌ NEXT_PUBLIC_APPWRITE_PROJECT_ID is not set or empty.
    
Please add this to your .env.local file:
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id`;
    console.error(msg);
    throw new Error("Invalid Appwrite project ID");
  }

  return raw.trim();
}

function getValidatedApiKey(): string {
  const raw = process.env.APPWRITE_API_KEY;

  if (!raw || !raw.trim()) {
    const msg = `❌ APPWRITE_API_KEY is not set or empty.
    
Please add this to your .env.local file:
APPWRITE_API_KEY=your_api_key`;
    console.error(msg);
    throw new Error("Invalid Appwrite API key");
  }

  return raw.trim();
}

// Validate environment variables only when functions are called (lazy validation)
// This prevents build-time errors when env vars aren't yet loaded

// ─── Admin client ────────────────────────────────────────────────
// Uses the secret API key. Has full DB access.
// Use this for creating/reading/deleting documents.
export function createAdminClient() {
  try {
    const endpoint = getValidatedEndpoint();
    const projectId = getValidatedProjectId();
    const apiKey = getValidatedApiKey();

    const client = new Client()
      .setEndpoint(endpoint)
      .setProject(projectId)
      .setKey(apiKey);

    return {
      databases: new Databases(client),
      account: new Account(client),
    };
  } catch (error) {
    console.error("Failed to create admin client:", error);
    throw error;
  }
}

// ─── Session client ─────
// Scoped to the logged-in user's session cookie.
// Use this when you need to identify WHO is making the request.
export async function createSessionClient() {
  try {
    const endpoint = getValidatedEndpoint();
    const projectId = getValidatedProjectId();

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
  } catch (error) {
    console.error("Failed to create session client:", error);
    throw error;
  }
}

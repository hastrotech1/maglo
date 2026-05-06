import { Client, Account } from "appwrite";

// Validate and get environment variables
const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT?.trim();
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID?.trim();

if (!endpoint) {
  throw new Error(
    "NEXT_PUBLIC_APPWRITE_ENDPOINT is not set. Check your .env.local file.",
  );
}
if (!projectId) {
  throw new Error(
    "NEXT_PUBLIC_APPWRITE_PROJECT_ID is not set. Check your .env.local file.",
  );
}

// One shared client instance (singleton pattern)
const client = new Client().setEndpoint(endpoint).setProject(projectId);

// Account handles login, signup, sessions
export const account = new Account(client);
export { client };

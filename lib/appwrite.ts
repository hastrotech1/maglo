import { Client, Account } from "appwrite";

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

// Validate environment variables at module load time
const endpoint = getValidatedEndpoint();
const projectId = getValidatedProjectId();

// One shared client instance (singleton pattern)
const client = new Client().setEndpoint(endpoint).setProject(projectId);

// Account handles login, signup, sessions
export const account = new Account(client);
export { client };

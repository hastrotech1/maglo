import { Client, Account } from "appwrite";

// Get and validate environment variables with comprehensive checks
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

// Lazy initialization: only validate when actually needed
let cachedEndpoint: string | null = null;
let cachedProjectId: string | null = null;
let client: Client | null = null;
let account: Account | null = null;

function initializeClient() {
  if (client && account) {
    return { client, account };
  }

  try {
    cachedEndpoint = getValidatedEndpoint();
    cachedProjectId = getValidatedProjectId();
    client = new Client()
      .setEndpoint(cachedEndpoint)
      .setProject(cachedProjectId);
    account = new Account(client);
    return { client, account };
  } catch (error) {
    console.error("Failed to initialize Appwrite client:", error);
    throw error;
  }
}

// Export lazy-loaded instances
export function getAccount(): Account {
  const { account } = initializeClient();
  return account;
}

export function getClient(): Client {
  const { client } = initializeClient();
  return client;
}

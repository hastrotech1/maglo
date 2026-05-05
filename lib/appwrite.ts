import { Client, Account } from "appwrite";

// One shared client instance (singleton pattern)
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

// Account handles login, signup, sessions
export const account = new Account(client);
export { client };
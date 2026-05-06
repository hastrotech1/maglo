import { AppwriteException } from "node-appwrite";

export function parseAppwriteError(error: unknown): string {
  // Appwrite SDK throws AppwriteException with a code + message
  if (error instanceof AppwriteException) {
    switch (error.code) {
      // Auth errors
      case 401:
        return "Invalid email or password. Please check your credentials.";
      case 409:
        return "An account with this email already exists.";
      case 429:
        return "Too many attempts. Please wait a moment and try again.";
      case 400:
        // Appwrite surfaces validation messages in error.message
        if (error.message.includes("password")) {
          return "Password must be between 8 and 256 characters.";
        }
        if (error.message.includes("email")) {
          return "Please enter a valid email address.";
        }
        return error.message;
      // DB / document errors
      case 404:
        return "Invoice not found. It may have been deleted.";
      case 403:
        return "You don't have permission to perform this action.";
      case 500:
        return "Appwrite server error. Please try again shortly.";
      default:
        // Surface the raw message but strip internal stack references
        return error.message?.split("\n")[0] ?? "Something went wrong.";
    }
  }

  if (error instanceof Error) {
    // Next.js redirect throws a special error — re-throw it
    if (error.message === "NEXT_REDIRECT") throw error;
    return error.message;
  }

  return "An unexpected error occurred.";
}

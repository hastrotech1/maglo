// src/actions/invoice.actions.ts
"use server"; // ← marks every export as a Server Action

import { revalidatePath } from "next/cache";
import { ID, Query } from "node-appwrite";
import { createAdminClient, createSessionClient } from "@/lib/appwrite-server";
import { invoiceSchema } from "@/lib/validations";
import type { Invoice } from "@/types/invoice";

// Constants
const DB = process.env.APPWRITE_DATABASE_ID!;
const COLL = process.env.APPWRITE_COLLECTION_ID!;

// Helper: get current user's ID
// Called at the start of every action to identify the caller.
// If the session is expired, this throws and the action fails safely.
async function getCurrentUserId(): Promise<string> {
  const { account } = await createSessionClient();
  const user = await account.get();
  return user.$id;
}

// READ
export async function getInvoices(): Promise<Invoice[]> {
  const userId = await getCurrentUserId();
  const { databases } = createAdminClient();

  const response = await databases.listDocuments(DB, COLL, [
    Query.equal("userId", userId), // only this user's invoices
    Query.orderDesc("$createdAt"), // newest first
    Query.limit(100),
  ]);

  return response.documents as unknown as Invoice[];
}

// CREATE
export async function createInvoice(formData: FormData) {
  // 1. Parse + validate with Zod
  const raw = Object.fromEntries(formData.entries());
  const parsed = invoiceSchema.safeParse(raw);

  if (!parsed.success) {
    // Return errors — the client will display them next to each field
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  // 2. Compute derived fields server-side
  //    Never trust the client to compute these
  const { amount, vat } = parsed.data;
  const vatAmount = parseFloat((amount * (vat / 100)).toFixed(2));
  const total = parseFloat((amount + vatAmount).toFixed(2));

  // 3. Write to Appwrite
  const userId = await getCurrentUserId();
  const { databases } = createAdminClient();

  await databases.createDocument(DB, COLL, ID.unique(), {
    ...parsed.data,
    vatAmount,
    total,
    userId,
  });

  // 4. Tell Next.js to re-fetch data for these routes
  revalidatePath("/dashboard");
  revalidatePath("/invoices");

  return { success: true };
}

// UPDATE
export async function updateInvoice(invoiceId: string, formData: FormData) {
  const userId = await getCurrentUserId();

  const raw = Object.fromEntries(formData.entries());
  const parsed = invoiceSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { amount, vat } = parsed.data;
  const vatAmount = parseFloat((amount * (vat / 100)).toFixed(2));
  const total = parseFloat((amount + vatAmount).toFixed(2));

  const { databases } = createAdminClient();

  // Verify ownership before updating — prevents one user editing another's invoice
  const existing = await databases.getDocument(DB, COLL, invoiceId);
  if (existing.userId !== userId) {
    return { success: false, errors: { root: ["Unauthorized"] } };
  }

  await databases.updateDocument(DB, COLL, invoiceId, {
    ...parsed.data,
    vatAmount,
    total,
  });

  revalidatePath("/dashboard");
  revalidatePath("/invoices");

  return { success: true };
}

// MARK PAID
// Separate action from updateInvoice — single responsibility.
// The dashboard metrics recalculate automatically after revalidation.
export async function markInvoicePaid(invoiceId: string) {
  const userId = await getCurrentUserId();
  const { databases } = createAdminClient();

  const existing = await databases.getDocument(DB, COLL, invoiceId);
  if (existing.userId !== userId) {
    return { success: false, error: "Unauthorized" };
  }

  await databases.updateDocument(DB, COLL, invoiceId, {
    status: "paid",
  });

  revalidatePath("/dashboard");
  revalidatePath("/invoices");

  return { success: true };
}

// DELETE
export async function deleteInvoice(invoiceId: string) {
  const userId = await getCurrentUserId();
  const { databases } = createAdminClient();

  const existing = await databases.getDocument(DB, COLL, invoiceId);
  if (existing.userId !== userId) {
    return { success: false, error: "Unauthorized" };
  }

  await databases.deleteDocument(DB, COLL, invoiceId);

  revalidatePath("/dashboard");
  revalidatePath("/invoices");

  return { success: true };
}

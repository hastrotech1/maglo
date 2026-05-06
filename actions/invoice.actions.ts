"use server";

import { revalidatePath } from "next/cache";
import { ID, Query } from "node-appwrite";
import { createAdminClient, createSessionClient } from "@/lib/appwrite-server";
import { invoiceSchema } from "@/lib/validations";
import { parseAppwriteError } from "@/lib/appwrite-error";
import type { Invoice } from "@/types/invoice";

const DB = process.env.APPWRITE_DATABASE_ID!;
const COLL = process.env.APPWRITE_COLLECTION_ID!;

async function getCurrentUserId(): Promise<string> {
  const { account } = await createSessionClient();
  const user = await account.get();
  return user.$id;
}

export async function getInvoices(): Promise<Invoice[]> {
  try {
    const userId = await getCurrentUserId();
    const { databases } = createAdminClient();
    const response = await databases.listDocuments(DB, COLL, [
      Query.equal("userId", userId),
      Query.orderDesc("$createdAt"),
      Query.limit(100),
    ]);
    return JSON.parse(JSON.stringify(response.documents)) as Invoice[];
  } catch (error) {
    console.error("[getInvoices]", error);
    throw new Error(parseAppwriteError(error));
  }
}

export async function createInvoice(formData: FormData): Promise<{
  success: boolean;
  error?: string;
  errors?: Record<string, string[]>;
}> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = invoiceSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  try {
    const { amount, vat } = parsed.data;
    const vatAmount = parseFloat((amount * (vat / 100)).toFixed(2));
    const total = parseFloat((amount + vatAmount).toFixed(2));

    const userId = await getCurrentUserId();
    const { databases } = createAdminClient();

    await databases.createDocument(DB, COLL, ID.unique(), {
      ...parsed.data,
      vatAmount,
      total,
      userId,
    });

    revalidatePath("/dashboard");
    revalidatePath("/invoices");
    return { success: true };
  } catch (error) {
    return { success: false, error: parseAppwriteError(error) };
  }
}

export async function updateInvoice(
  invoiceId: string,
  formData: FormData,
): Promise<{
  success: boolean;
  error?: string;
  errors?: Record<string, string[]>;
}> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = invoiceSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  try {
    const userId = await getCurrentUserId();
    const { databases } = createAdminClient();

    const existing = await databases.getDocument(DB, COLL, invoiceId);
    if (existing.userId !== userId) {
      return {
        success: false,
        error: "You don't have permission to edit this invoice.",
      };
    }

    const { amount, vat } = parsed.data;
    const vatAmount = parseFloat((amount * (vat / 100)).toFixed(2));
    const total = parseFloat((amount + vatAmount).toFixed(2));

    await databases.updateDocument(DB, COLL, invoiceId, {
      ...parsed.data,
      vatAmount,
      total,
    });

    revalidatePath("/dashboard");
    revalidatePath("/invoices");
    return { success: true };
  } catch (error) {
    return { success: false, error: parseAppwriteError(error) };
  }
}

export async function markInvoicePaid(
  invoiceId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getCurrentUserId();
    const { databases } = createAdminClient();

    const existing = await databases.getDocument(DB, COLL, invoiceId);
    if (existing.userId !== userId) {
      return {
        success: false,
        error: "You don't have permission to update this invoice.",
      };
    }

    await databases.updateDocument(DB, COLL, invoiceId, { status: "paid" });
    revalidatePath("/dashboard");
    revalidatePath("/invoices");
    return { success: true };
  } catch (error) {
    return { success: false, error: parseAppwriteError(error) };
  }
}

export async function deleteInvoice(
  invoiceId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getCurrentUserId();
    const { databases } = createAdminClient();

    const existing = await databases.getDocument(DB, COLL, invoiceId);
    if (existing.userId !== userId) {
      return {
        success: false,
        error: "You don't have permission to delete this invoice.",
      };
    }

    await databases.deleteDocument(DB, COLL, invoiceId);
    revalidatePath("/dashboard");
    revalidatePath("/invoices");
    return { success: true };
  } catch (error) {
    return { success: false, error: parseAppwriteError(error) };
  }
}

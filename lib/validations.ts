// src/lib/validations.ts
import { z } from "zod";

export const invoiceSchema = z.object({
  client: z.string().min(2, "Client name must be at least 2 characters"),

  email: z.string().email("Please enter a valid email address"),

  amount: z.coerce // coerce converts the string from FormData to number
    .number()
    .positive("Amount must be greater than 0"),

  vat: z.coerce
    .number()
    .min(0, "VAT cannot be negative")
    .max(100, "VAT cannot exceed 100%"),

  dueDate: z.string().min(1, "Due date is required"),

  status: z.enum(["paid", "unpaid"]),
});

// Infer the TypeScript type directly from the schema
// No duplication — schema IS the source of truth
export type InvoiceSchema = z.infer<typeof invoiceSchema>;

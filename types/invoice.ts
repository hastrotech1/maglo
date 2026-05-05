// src/types/invoice.ts

export type InvoiceStatus = "paid" | "unpaid";

// Matches exactly what Appwrite stores
export interface Invoice {
  $id: string;           // Appwrite auto-generates this
  $createdAt: string;    // ISO string, Appwrite auto-sets
  userId: string;        // links invoice to its owner
  client: string;
  email: string;
  amount: number;        // raw amount before VAT
  vat: number;           // percentage e.g. 7.5
  vatAmount: number;     // computed: amount * (vat / 100)
  total: number;         // computed: amount + vatAmount
  dueDate: string;       // "YYYY-MM-DD"
  status: InvoiceStatus;
}

// What the form submits (before we add computed fields)
export type InvoiceFormData = {
  client: string;
  email: string;
  amount: number;
  vat: number;
  dueDate: string;
  status: InvoiceStatus;
};
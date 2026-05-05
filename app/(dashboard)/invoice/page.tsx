// src/app/(dashboard)/invoices/page.tsx
import { getInvoices } from "@/actions/invoice.actions";
import InvoiceTable from "@/components/invoices/InvoiceTable";
import VatSummary from "@/components/invoices/VatSummary";

export default async function InvoicesPage() {
  // Server fetch — no useEffect, no loading spinner for initial data
  const invoices = await getInvoices();

  return (
    <div className="space-y-5">
      <h1 className="text-[20px] font-bold text-gray-900 tracking-tight">
        Invoices
      </h1>

      {/* VAT Summary — computed from invoice data */}
      <VatSummary invoices={invoices} />

      {/* Full invoice table with CRUD — Client Component */}
      <InvoiceTable invoices={invoices} />
    </div>
  );
}
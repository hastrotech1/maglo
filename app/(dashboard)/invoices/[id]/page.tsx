import { getInvoiceById } from "@/actions/invoice.actions";
import { ArrowLeft, Download, Eye } from "lucide-react";
import Link from "next/link";

const fmt = (n: number) =>
  "₦" + n.toLocaleString("en-NG", { minimumFractionDigits: 2 });

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let invoice;
  let error;

  try {
    invoice = await getInvoiceById(id);
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load invoice";
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Link
          href="/invoices"
          className="inline-flex items-center gap-2 text-[13px] font-semibold text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={14} />
          Back to Invoices
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-[13px] font-semibold text-red-800">Error</p>
          <p className="text-[12px] text-red-700 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="space-y-4">
        <Link
          href="/invoices"
          className="inline-flex items-center gap-2 text-[13px] font-semibold text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={14} />
          Back to Invoices
        </Link>
        <p className="text-[13px] text-gray-500">Invoice not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/invoices"
          className="inline-flex items-center gap-2 text-[13px] font-semibold text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={14} />
          Back to Invoices
        </Link>
        <div className="flex flex-wrap gap-2">
          <button className="px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-[12px] font-semibold hover:bg-gray-50 transition-colors flex items-center gap-1.5">
            <Eye size={14} />
            Preview
          </button>
          <button className="px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-[12px] font-semibold hover:bg-gray-50 transition-colors flex items-center gap-1.5">
            <Download size={14} />
            Download
          </button>
        </div>
      </div>

      {/* Main invoice container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Invoice details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company info */}
          <div className="bg-[#1a1a1a] text-white rounded-2xl p-6 space-y-4 shadow-md shadow-black/10">
            <div>
              <h2 className="text-[18px] font-bold">Maglo.</h2>
              <p className="text-[12px] text-gray-400 mt-1">
                Finance Management Solution
              </p>
            </div>
            <div className="text-[12px] text-gray-300 space-y-1">
              <p>1333 Grey Fox Farm Road</p>
              <p>Houston, TX 77060</p>
              <p>Bloomfield Hills, Michigan(MI). 48301</p>
            </div>
          </div>

          {/* Invoice header info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-[11px] font-semibold text-gray-500 mb-2">
                Invoice Number
              </p>
              <p className="text-[14px] font-bold text-gray-900">
                {invoice.$id}
              </p>
              <div className="text-[11px] text-gray-500 mt-3 space-y-1">
                <p>
                  Issued Date:{" "}
                  {new Date(invoice.$createdAt).toLocaleDateString("en-NG", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                <p>
                  Due Date:{" "}
                  {new Date(invoice.dueDate).toLocaleDateString("en-NG", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500 mb-2">
                Billed to
              </p>
              <p className="text-[14px] font-bold text-gray-900">
                {invoice.client}
              </p>
              <div className="text-[11px] text-gray-500 mt-3 space-y-1">
                <p>{invoice.email}</p>
              </div>
            </div>
          </div>

          {/* Items table */}
          <div className="hidden md:block">
            <h3 className="text-[13px] font-semibold text-gray-900 mb-3">
              Invoice Details
            </h3>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-[11px] font-semibold text-gray-500 pb-2">
                    Description
                  </th>
                  <th className="text-right text-[11px] font-semibold text-gray-500 pb-2">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-3 text-[12px] text-gray-700">
                    Base Amount
                  </td>
                  <td className="text-right text-[12px] text-gray-700">
                    {fmt(invoice.amount)}
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 text-[12px] text-gray-700">
                    VAT ({invoice.vat.toFixed(2)}%)
                  </td>
                  <td className="text-right text-[12px] text-gray-700">
                    {fmt(invoice.vatAmount)}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 text-[13px] font-semibold text-gray-900">
                    Total
                  </td>
                  <td className="text-right text-[13px] font-bold text-gray-900">
                    {fmt(invoice.total)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Mobile items list */}
          <div className="md:hidden">
            <h3 className="text-[13px] font-semibold text-gray-900 mb-3">
              Invoice Details
            </h3>
            <div className="divide-y divide-gray-100 rounded-lg border border-gray-100 overflow-hidden bg-white shadow-sm shadow-gray-200/60">
              <div className="p-3 flex items-center justify-between text-[12px]">
                <span className="text-gray-500">Base Amount</span>
                <span className="font-semibold text-gray-900">
                  {fmt(invoice.amount)}
                </span>
              </div>
              <div className="p-3 flex items-center justify-between text-[12px]">
                <span className="text-gray-500">
                  VAT ({invoice.vat.toFixed(2)}%)
                </span>
                <span className="font-semibold text-gray-900">
                  {fmt(invoice.vatAmount)}
                </span>
              </div>
              <div className="p-3 flex items-center justify-between text-[13px] bg-gray-50">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-gray-900">
                  {fmt(invoice.total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column - Summary */}
        <div className="space-y-4">
          {/* Status badge */}
          <div
            className={`rounded-lg p-4 shadow-sm shadow-gray-200/60 ${
              invoice.status === "paid" ? "bg-emerald-50" : "bg-amber-50"
            }`}
          >
            <p
              className={`text-[11px] font-semibold uppercase ${
                invoice.status === "paid"
                  ? "text-emerald-600"
                  : "text-amber-600"
              }`}
            >
              Status: {invoice.status === "paid" ? "Paid" : "Unpaid"}
            </p>
          </div>

          {/* Summary box */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3 shadow-sm shadow-gray-200/60">
            <div>
              <p className="text-[11px] text-gray-500">Subtotal</p>
              <p className="text-[14px] font-bold text-gray-900">
                {fmt(invoice.amount)}
              </p>
            </div>
            <div className="border-t border-gray-200 pt-3">
              <p className="text-[11px] text-gray-500">VAT</p>
              <p className="text-[14px] font-bold text-gray-900">
                {fmt(invoice.vatAmount)}
              </p>
            </div>
            <div className="border-t border-gray-200 pt-3 bg-white rounded p-3 shadow-sm shadow-gray-200/60">
              <p className="text-[11px] text-gray-500">Total Amount Due</p>
              <p className="text-[18px] font-bold text-gray-900">
                {fmt(invoice.total)}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <button className="w-full py-3 rounded-lg bg-[#c5e44e] text-[#1a1a1a] text-[13px] font-bold shadow-sm shadow-lime-200/70 hover:-translate-y-px hover:shadow-md hover:shadow-lime-200 transition-all">
            Send Invoice
          </button>
        </div>
      </div>
    </div>
  );
}

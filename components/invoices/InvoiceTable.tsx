// src/components/invoices/InvoiceTable.tsx
"use client";

import { useEffect, useState, useTransition } from "react";
import toast from "react-hot-toast";
import { Pencil, Trash2, CheckCheck, Plus } from "lucide-react";
import Link from "next/link";
import { markInvoicePaid, deleteInvoice } from "@/actions/invoice.actions";
import type { Invoice } from "@/types/invoice";
import InvoiceForm from "./InvoiceForm";

type Filter = "all" | "paid" | "unpaid";

const fmt = (n: number) =>
  "₦" + n.toLocaleString("en-NG", { minimumFractionDigits: 2 });

const dateFormatter = new Intl.DateTimeFormat("en-NG", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function formatDate(dateStr: string) {
  return dateFormatter.format(new Date(dateStr));
}

function daysUntil(dateStr: string, now: number) {
  return Math.ceil((new Date(dateStr).getTime() - now) / (1000 * 60 * 60 * 24));
}

function DueCountdown({
  dueDate,
  status,
  now,
}: {
  dueDate: string;
  status: string;
  now: number | null;
}) {
  if (status === "paid") return null;
  if (!now) return null;
  const days = daysUntil(dueDate, now);
  if (days < 0)
    return (
      <span className="text-[10.5px] font-medium text-red-500">
        {Math.abs(days)}d overdue
      </span>
    );
  if (days <= 3)
    return (
      <span className="text-[10.5px] font-medium text-amber-500">
        Due in {days}d
      </span>
    );
  return <span className="text-[10.5px] text-gray-400">Due in {days}d</span>;
}

export default function InvoiceTable({ invoices }: { invoices: Invoice[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [isPending, startTransition] = useTransition();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
  }, []);

  const filtered = invoices.filter((i) =>
    filter === "all" ? true : i.status === filter,
  );

  const counts = {
    all: invoices.length,
    paid: invoices.filter((i) => i.status === "paid").length,
    unpaid: invoices.filter((i) => i.status === "unpaid").length,
  };

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(inv: Invoice) {
    setEditing(inv);
    setModalOpen(true);
  }

  function handleMarkPaid(id: string) {
    startTransition(async () => {
      const res = await markInvoicePaid(id);
      if (res.success) {
        toast.success("Invoice marked as paid ✓");
      } else {
        toast.error(res.error ?? "Failed to update invoice");
      }
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this invoice? This cannot be undone.")) return;
    startTransition(async () => {
      const res = await deleteInvoice(id);
      if (res.success) {
        toast.success("Invoice deleted");
      } else {
        toast.error(res.error ?? "Failed to delete invoice");
      }
    });
  }

  return (
    <>
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-2 p-4 border-b border-gray-100">
          {(["all", "paid", "unpaid"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-full text-[11px] font-semibold border transition-all duration-150
                ${
                  filter === f
                    ? "bg-[#c5e44e] text-[#1a1a1a] border-[#c5e44e]"
                    : "border-gray-200 text-gray-400 hover:border-gray-300"
                }
              `}
            >
              {f[0].toUpperCase() + f.slice(1)} ({counts[f]})
            </button>
          ))}

          <button
            onClick={openCreate}
            className="ml-auto flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#c5e44e] text-[#1a1a1a] text-[12px] font-semibold hover:-translate-y-px hover:shadow-md hover:shadow-lime-200 transition-all duration-150"
          >
            <Plus size={13} />
            Invoice
          </button>
        </div>

        {/* Mobile list */}
        <div className="md:hidden">
          {filtered.length === 0 && (
            <div className="text-center py-10 text-[13px] text-gray-400">
              No invoices found.
            </div>
          )}
          <div className="divide-y divide-gray-100">
            {filtered.map((inv) => {
              const isOverdue =
                now !== null &&
                daysUntil(inv.dueDate, now) < 0 &&
                inv.status === "unpaid";

              return (
                <div key={inv.$id} className="p-4 space-y-3">
                  <Link href={`/invoices/${inv.$id}`} className="block">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-[14px] text-gray-900">
                          {inv.client}
                        </div>
                        <div className="text-[11px] text-gray-400">
                          {inv.email}
                        </div>
                      </div>
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-semibold
                          ${
                            isOverdue
                              ? "bg-red-50 text-red-600"
                              : inv.status === "paid"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                          }
                        `}
                      >
                        {isOverdue
                          ? "Overdue"
                          : inv.status === "paid"
                            ? "Paid"
                            : "Pending"}
                      </span>
                    </div>
                    <div className="mt-2 text-[12px] text-gray-700">
                      {formatDate(inv.$createdAt)}
                    </div>
                    <DueCountdown
                      dueDate={inv.dueDate}
                      status={inv.status}
                      now={now}
                    />
                  </Link>

                  <div className="grid grid-cols-2 gap-2 text-[12px]">
                    <div className="rounded-lg bg-gray-50 p-2">
                      <p className="text-[10px] text-gray-400">Amount</p>
                      <p className="font-semibold text-gray-800">
                        {fmt(inv.amount)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-2">
                      <p className="text-[10px] text-gray-400">VAT</p>
                      <p className="font-semibold text-gray-800">
                        {fmt(inv.vatAmount)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-2 col-span-2">
                      <p className="text-[10px] text-gray-400">Total</p>
                      <p className="font-semibold text-gray-900">
                        {fmt(inv.total)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    {inv.status === "unpaid" && (
                      <button
                        onClick={() => handleMarkPaid(inv.$id)}
                        disabled={isPending}
                        title="Mark as paid"
                        className="px-2.5 py-1.5 rounded-md bg-[#c5e44e] text-[#1a1a1a] text-[11px] font-semibold hover:shadow-sm transition-all disabled:opacity-50"
                      >
                        <CheckCheck size={12} />
                      </button>
                    )}
                    <button
                      onClick={() => openEdit(inv)}
                      title="Edit invoice"
                      className="px-2.5 py-1.5 rounded-md border border-gray-200 text-gray-500 hover:text-gray-800 hover:border-gray-300 text-[11px] transition-all"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={() => handleDelete(inv.$id)}
                      disabled={isPending}
                      title="Delete invoice"
                      className="px-2.5 py-1.5 rounded-md border border-red-100 text-red-400 hover:bg-red-50 text-[11px] transition-all disabled:opacity-50"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {[
                  "Name / Client",
                  "Date",
                  "Amount",
                  "VAT",
                  "Total",
                  "Status",
                  "Action",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-4 py-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-10 text-[13px] text-gray-400"
                  >
                    No invoices found.
                  </td>
                </tr>
              )}
              {filtered.map((inv) => {
                const isOverdue =
                  now !== null &&
                  daysUntil(inv.dueDate, now) < 0 &&
                  inv.status === "unpaid";

                return (
                  <tr
                    key={inv.$id}
                    className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors duration-150 cursor-pointer"
                  >
                    <td className="px-4 py-3.5">
                      <Link
                        href={`/invoices/${inv.$id}`}
                        className="block group"
                      >
                        <div className="font-semibold text-[13px] text-gray-800 group-hover:text-[#c5e44e]">
                          {inv.client}
                        </div>
                        <div className="text-[11px] text-gray-400">
                          {inv.email}
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3.5">
                      <Link href={`/invoices/${inv.$id}`}>
                        <div className="text-[12px] text-gray-700">
                          {formatDate(inv.$createdAt)}
                        </div>
                        <DueCountdown
                          dueDate={inv.dueDate}
                          status={inv.status}
                          now={now}
                        />
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 text-[13px] text-gray-700">
                      <Link href={`/invoices/${inv.$id}`}>
                        {fmt(inv.amount)}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5">
                      <Link href={`/invoices/${inv.$id}`}>
                        <span className="text-[11px] text-gray-500">
                          {inv.vat}%
                        </span>
                        <br />
                        <span className="text-[11px] text-gray-400">
                          {fmt(inv.vatAmount)}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 text-[13px] font-semibold text-gray-800">
                      <Link href={`/invoices/${inv.$id}`}>
                        {fmt(inv.total)}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold
                          ${
                            isOverdue
                              ? "bg-red-50 text-red-600"
                              : inv.status === "paid"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                          }
                        `}
                      >
                        {isOverdue
                          ? "Overdue"
                          : inv.status === "paid"
                            ? "Paid"
                            : "Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        {inv.status === "unpaid" && (
                          <button
                            onClick={() => handleMarkPaid(inv.$id)}
                            disabled={isPending}
                            title="Mark as paid"
                            className="px-2.5 py-1.5 rounded-md bg-[#c5e44e] text-[#1a1a1a] text-[11px] font-semibold hover:shadow-sm transition-all disabled:opacity-50"
                          >
                            <CheckCheck size={12} />
                          </button>
                        )}
                        <button
                          onClick={() => openEdit(inv)}
                          title="Edit invoice"
                          className="px-2.5 py-1.5 rounded-md border border-gray-200 text-gray-500 hover:text-gray-800 hover:border-gray-300 text-[11px] transition-all"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => handleDelete(inv.$id)}
                          disabled={isPending}
                          title="Delete invoice"
                          className="px-2.5 py-1.5 rounded-md border border-red-100 text-red-400 hover:bg-red-50 text-[11px] transition-all disabled:opacity-50"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <InvoiceForm
          initial={editing}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
        />
      )}
    </>
  );
}

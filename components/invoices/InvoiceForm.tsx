"use client";

import { useEffect, useRef, useTransition } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import { createInvoice, updateInvoice } from "@/actions/invoice.actions";
import { invoiceSchema, type InvoiceSchema } from "@/lib/validations";
import type { Invoice } from "@/types/invoice";

// react-hook-form handles field state; zod handles validation

const fmt = (n: number) =>
  "₦" + n.toLocaleString("en-NG", { minimumFractionDigits: 2 });

interface Props {
  initial: Invoice | null;
  onClose: () => void;
}

export default function InvoiceForm({ initial, onClose }: Props) {
  const [isPending, startTransition] = useTransition();
  const backdropRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<InvoiceSchema>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      client: initial?.client ?? "",
      email: initial?.email ?? "",
      amount: initial?.amount ?? 0,
      vat: initial?.vat ?? 7.5,
      dueDate: initial?.dueDate ?? "",
      status: initial?.status ?? "unpaid",
    },
  });

  // Live preview of VAT calculation
  const amount = watch("amount") ?? 0;
  const vat = watch("vat") ?? 0;
  const vatAmount = parseFloat(
    (Number(amount) * (Number(vat) / 100)).toFixed(2),
  );
  const total = Number(amount) + vatAmount;

  // Close on backdrop click
  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === backdropRef.current) onClose();
  }

  // Close on Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const onSubmit: SubmitHandler<InvoiceSchema> = (data) => {
    // Convert validated data to FormData for Server Action
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => fd.append(k, String(v)));

    startTransition(async () => {
      const res = initial
        ? await updateInvoice(initial.$id, fd)
        : await createInvoice(fd);

      if (res.success) {
        toast.success(initial ? "Invoice updated ✓" : "Invoice created ✓");
        onClose();
      } else {
        // Show the specific Appwrite error OR field errors
        const msg = res.error ?? "Please fix the errors and try again";
        toast.error(msg);
      }
    });
  };

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-[fadeIn_0.2s_ease]"
    >
      <div className="bg-white rounded-2xl border border-gray-100 p-6 w-[420px] max-h-[90vh] overflow-y-auto animate-[scaleIn_0.25s_cubic-bezier(0.34,1.56,0.64,1)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[16px] font-bold text-gray-900">
            {initial ? "Edit Invoice" : "Invoice"}
          </h2>
          <button
            onClick={onClose}
            aria-label="cancel"
            className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Client Name */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
              Client Name *
            </label>
            <input
              {...register("client")}
              placeholder="e.g. Gadget Gallery LTD"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-[13px] text-gray-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
            {errors.client && (
              <p className="text-[11px] text-red-500 mt-1">
                {errors.client.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
              Client Email *
            </label>
            <input
              {...register("email")}
              type="email"
              placeholder="client@example.com"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-[13px] text-gray-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
            {errors.email && (
              <p className="text-[11px] text-red-500 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Amount + VAT */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
                Amount (₦) *
              </label>
              <input
                {...register("amount", { valueAsNumber: true })}
                type="number"
                step="0.01"
                placeholder="0.00"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-[13px] outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
              {errors.amount && (
                <p className="text-[11px] text-red-500 mt-1">
                  {errors.amount.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
                VAT (%)
              </label>
              <input
                {...register("vat", { valueAsNumber: true })}
                type="number"
                step="0.1"
                placeholder="7.5"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-[13px] outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
              {errors.vat && (
                <p className="text-[11px] text-red-500 mt-1">
                  {errors.vat.message}
                </p>
              )}
            </div>
          </div>

          {/* Due Date + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
                Due Date *
              </label>
              <input
                {...register("dueDate")}
                type="date"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-[13px] outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
              {errors.dueDate && (
                <p className="text-[11px] text-red-500 mt-1">
                  {errors.dueDate.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
                Status
              </label>
              <select
                {...register("status")}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-[13px] outline-none focus:border-indigo-400 transition-all"
              >
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>

          {/* Live VAT Preview */}
          {Number(amount) > 0 && (
            <div className="bg-gray-50 rounded-lg p-3.5 space-y-1.5">
              <div className="flex justify-between text-[12px] text-gray-500">
                <span>Subtotal</span>
                <span>{fmt(Number(amount))}</span>
              </div>
              <div className="flex justify-between text-[12px] text-gray-500">
                <span>VAT ({vat}%)</span>
                <span>{fmt(vatAmount)}</span>
              </div>
              <div className="flex justify-between text-[14px] font-bold text-gray-900 pt-1.5 border-t border-gray-200">
                <span>Total</span>
                <span>{fmt(total)}</span>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-gray-200 text-[13px] font-medium text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-[2] py-2.5 rounded-lg bg-[#c5e44e] text-[#1a1a1a] text-[13px] font-bold hover:-translate-y-px hover:shadow-md hover:shadow-lime-200 transition-all disabled:opacity-60"
            >
              {isPending
                ? "Saving..."
                : initial
                  ? "Update Invoice"
                  : "Create Invoice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

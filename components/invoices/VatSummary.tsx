// src/components/invoices/VatSummary.tsx
import type { Invoice } from "@/types/invoice";

const fmt = (n: number) =>
  "₦" + n.toLocaleString("en-NG", { minimumFractionDigits: 2 });

// Group invoices by month and compute VAT per month
function getMonthlyVat(invoices: Invoice[]) {
  const map = new Map<string, number>();

  invoices
    .filter((i) => i.status === "paid")
    .forEach((inv) => {
      const month = inv.$createdAt.slice(0, 7); // "YYYY-MM"
      map.set(month, (map.get(month) ?? 0) + inv.vatAmount);
    });

  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a)) // newest first
    .slice(0, 3)
    .map(([month, vat]) => ({
      label: new Date(month + "-01").toLocaleDateString("en-NG", {
        month: "long",
        year: "numeric",
      }),
      vat,
    }));
}

export default function VatSummary({ invoices }: { invoices: Invoice[] }) {
  const paid = invoices.filter((i) => i.status === "paid");
  const unpaid = invoices.filter((i) => i.status === "unpaid");

  const outputVat = paid.reduce((s, i) => s + i.vatAmount, 0);
  const pendingVat = unpaid.reduce((s, i) => s + i.vatAmount, 0);
  const monthlyVat = getMonthlyVat(invoices);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-white border border-gray-100 rounded-xl p-4">
        <p className="text-[10.5px] font-semibold uppercase tracking-wide text-gray-400 mb-1">
          Output VAT (Collected)
        </p>
        <p className="text-[17px] font-bold text-emerald-700">
          {fmt(outputVat)}
        </p>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-4">
        <p className="text-[10.5px] font-semibold uppercase tracking-wide text-gray-400 mb-1">
          Pending VAT
        </p>
        <p className="text-[17px] font-bold text-amber-600">
          {fmt(pendingVat)}
        </p>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-4">
        <p className="text-[10.5px] font-semibold uppercase tracking-wide text-gray-400 mb-2">
          Monthly Breakdown
        </p>
        <div className="space-y-1">
          {monthlyVat.length === 0 && (
            <p className="text-[12px] text-gray-400">No data yet</p>
          )}
          {monthlyVat.map(({ label, vat }) => (
            <div key={label} className="flex justify-between text-[12px]">
              <span className="text-gray-500">{label}</span>
              <span className="font-semibold text-gray-800">{fmt(vat)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
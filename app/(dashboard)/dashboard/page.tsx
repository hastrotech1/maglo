// src/app/(dashboard)/dashboard/page.tsx
import { getInvoices } from "@/actions/invoice.actions";
import MetricCard from "@/components/dashboard/MetricsCard";
import WorkingCapitalChart from "@/components/dashboard/WorkingCapitalChart";
import InvoiceTable from "@/components/invoices/InvoiceTable";
import { FileText, CheckCircle, Clock, Receipt } from "lucide-react";

// All metric computation happens here, server-side
// Client components only receive the final numbers
function computeMetrics(invoices: Awaited<ReturnType<typeof getInvoices>>) {
  const paid = invoices.filter((i) => i.status === "paid");
  const unpaid = invoices.filter((i) => i.status === "unpaid");

  return {
    totalInvoices: invoices.length,
    totalPaid: paid.reduce((sum, i) => sum + i.total, 0),
    totalPending: unpaid.reduce((sum, i) => sum + i.total, 0),
    totalVat: invoices.reduce((sum, i) => sum + i.vatAmount, 0),
  };
}

export default async function DashboardPage() {
  let invoices = [];
  let error: string | null = null;

  try {
    invoices = await getInvoices();
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load invoices";
    error = message;
    console.error("Dashboard error:", message);
  }

  const metrics = computeMetrics(invoices);

  return (
    <div className="space-y-6">
      <h1 className="text-[20px] font-bold text-gray-900 tracking-tight">
        Dashboard
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-[13px] font-semibold text-red-800">
            Error loading data
          </p>
          <p className="text-[12px] text-red-700 mt-1">{error}</p>
          {error.includes("missing scopes") && (
            <p className="text-[11px] text-red-600 mt-2">
              Please update your Appwrite API key with the required scopes:
              documents.read, documents.write, documents.delete
            </p>
          )}
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          label="Total Invoice"
          value={metrics.totalInvoices.toString()}
          icon={FileText}
          variant="dark"
        />
        <MetricCard
          label="Amount Paid"
          value={metrics.totalPaid}
          icon={CheckCircle}
          variant="light"
          isCurrency
        />
        <MetricCard
          label="Pending Payment"
          value={metrics.totalPending}
          icon={Clock}
          variant="light"
          isCurrency
          highlight="warning"
        />
      </div>

      {/* VAT Summary Banner */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-lime-50 flex items-center justify-center">
            <Receipt size={16} className="text-lime-600" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              Total VAT Collected
            </p>
            <p className="text-[18px] font-bold text-gray-900">
              {formatCurrency(metrics.totalVat)}
            </p>
          </div>
        </div>
        <span className="text-[12px] text-gray-400">All time</span>
      </div>

      {/* Chart */}
      {/* invoices passed as JSON — chart is a Client Component */}
      <WorkingCapitalChart invoices={invoices} />

      {/* Recent Invoices */}
      <InvoiceTable invoices={invoices.slice(0, 5)} />
    </div>
  );
}

function formatCurrency(n: number) {
  return (
    "₦" +
    n.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

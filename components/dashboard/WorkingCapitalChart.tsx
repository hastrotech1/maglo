// src/components/dashboard/WorkingCapitalChart.tsx
"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { Invoice } from "@/types/invoice";

// Group invoices by day to build chart data points
function buildChartData(invoices: Invoice[]) {
  const map = new Map<string, { income: number; expenses: number }>();

  invoices.forEach((inv) => {
    // Use first 10 chars of $createdAt → "YYYY-MM-DD"
    const day = inv.$createdAt.slice(0, 10);
    const existing = map.get(day) ?? { income: 0, expenses: 0 };

    if (inv.status === "paid") {
      existing.income += inv.total;
    } else {
      existing.expenses += inv.total;
    }
    map.set(day, existing);
  });

  // Sort by date and format label
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7) // last 7 days with data
    .map(([date, values]) => ({
      date: new Date(date).toLocaleDateString("en-NG", {
        month: "short",
        day: "numeric",
      }),
      ...values,
    }));
}

const fmt = (v: number) => "₦" + (v / 1000).toFixed(0) + "K";

interface Props {
  invoices: Invoice[];
}

export default function WorkingCapitalChart({ invoices }: Props) {
  const data = buildChartData(invoices);

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[14px] font-semibold text-gray-900">
          Working Capital
        </h2>
        <div className="flex items-center gap-4 text-[11px] text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-700 block" />
            Income
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#c5e44e] block" />
            Expenses
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart
          data={data}
          margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={fmt}
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value: number) => "₦" + value.toLocaleString("en-NG")}
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              fontSize: "12px",
            }}
          />
          <Line
            type="monotone"
            dataKey="income"
            stroke="#1a6b45"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="expenses"
            stroke="#c5e44e"
            strokeWidth={2.5}
            strokeDasharray="5 3"
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

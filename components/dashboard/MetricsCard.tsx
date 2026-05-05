// src/components/dashboard/MetricCard.tsx
import { LucideIcon } from "lucide-react";

const fmt = (n: number) =>
  "₦" + n.toLocaleString("en-NG", { minimumFractionDigits: 2 });

interface MetricCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  variant: "dark" | "light";
  isCurrency?: boolean;
  highlight?: "warning" | "success";
}

export default function MetricCard({
  label,
  value,
  icon: Icon,
  variant,
  isCurrency,
  highlight,
}: MetricCardProps) {
  const isDark = variant === "dark";

  const displayValue = isCurrency && typeof value === "number"
    ? fmt(value)
    : value;

  const valueColor = highlight === "warning"
    ? "text-amber-600"
    : isDark
    ? "text-white"
    : "text-gray-900";

  return (
    <div
      className={`
        rounded-xl p-5 border transition-transform duration-200 hover:-translate-y-0.5
        ${isDark
          ? "bg-[#1f2937] border-[#374151]"
          : "bg-white border-gray-100"
        }
      `}
    >
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3
          ${isDark ? "bg-white/10" : "bg-lime-50"}
        `}
      >
        <Icon
          size={17}
          className={isDark ? "text-lime-400" : "text-lime-600"}
        />
      </div>

      <p
        className={`text-[11px] font-semibold uppercase tracking-wide mb-1
          ${isDark ? "text-gray-400" : "text-gray-400"}
        `}
      >
        {label}
      </p>

      <p className={`text-[22px] font-bold tracking-tight ${valueColor}`}>
        {displayValue}
      </p>
    </div>
  );
}
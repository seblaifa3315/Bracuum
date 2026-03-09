"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { OrdersByStatus } from "./types";

const STATUS_LABELS: Record<string, string> = {
  PAID: "Paid",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  RETURN_REQUESTED: "Return Requested",
  RETURN_RECEIVED: "Return Received",
  REFUNDED: "Refunded",
  CANCELLED: "Cancelled",
};

const STATUS_HEX: Record<string, string> = {
  PAID: "#ef4444",
  SHIPPED: "#f59e0b",
  DELIVERED: "#10b981",
  RETURN_REQUESTED: "#f97316",
  RETURN_RECEIVED: "#3b82f6",
  REFUNDED: "#6b7280",
  CANCELLED: "#dc2626",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  const total = entry.payload.total as number;
  const pct = total > 0 ? ((entry.value / total) * 100).toFixed(1) : "0";
  const color = STATUS_HEX[entry.name] || "#6b7280";
  return (
    <div className="bg-card border border-border rounded-ui p-3 shadow-lg">
      <div className="flex items-center gap-2 mb-1">
        <span
          className="w-3 h-3 rounded-full inline-block"
          style={{ backgroundColor: color }}
        />
        <p className="text-sm font-semibold text-foreground">
          {STATUS_LABELS[entry.name] || entry.name}
        </p>
      </div>
      <p className="text-sm text-muted-foreground">
        {entry.value} order{entry.value !== 1 ? "s" : ""} &middot; {pct}%
      </p>
    </div>
  );
}

interface OrderStatusChartProps {
  data: OrdersByStatus[];
}

export default function OrderStatusChart({ data }: OrderStatusChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-card border border-border rounded-ui p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Orders by Status
        </h3>
        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
          No data for this period
        </div>
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.count, 0);
  const chartData = data
    .map((d) => ({
      name: d.status,
      value: d.count,
      total,
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="bg-card border border-border rounded-ui p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Orders by Status
        </h3>
        <span className="text-sm text-muted-foreground">{total} total</span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Donut chart */}
        <div className="w-[220px] h-[220px] flex-shrink-0 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={STATUS_HEX[entry.name] || "#6b7280"}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-foreground">{total}</span>
            <span className="text-xs text-muted-foreground">orders</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 grid grid-cols-1 gap-2 w-full">
          {chartData.map((entry) => {
            const pct = total > 0 ? ((entry.value / total) * 100).toFixed(1) : "0";
            const color = STATUS_HEX[entry.name] || "#6b7280";
            return (
              <div
                key={entry.name}
                className="flex items-center justify-between gap-3 px-3 py-2 rounded-ui hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm text-foreground truncate">
                    {STATUS_LABELS[entry.name] || entry.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm font-semibold text-foreground">
                    {entry.value}
                  </span>
                  <span className="text-xs text-muted-foreground w-12 text-right">
                    {pct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

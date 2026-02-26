"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ReturnsAndWarranty } from "./types";

const REASON_LABELS: Record<string, string> = {
  DEFECT: "Defect",
  SHIPPING_DAMAGE: "Shipping Damage",
  MALFUNCTION: "Malfunction",
  OTHER: "Other",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-ui p-3 shadow-lg">
      <p className="text-sm font-medium text-foreground">{payload[0]?.payload?.label}</p>
      <p className="text-sm text-muted-foreground">
        {payload[0]?.value} claim{payload[0]?.value !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

interface ReturnsWarrantySectionProps {
  data: ReturnsAndWarranty;
}

export default function ReturnsWarrantySection({
  data,
}: ReturnsWarrantySectionProps) {
  const chartData = data.warrantyByReason.map((r) => ({
    label: REASON_LABELS[r.reason] || r.reason,
    count: r.count,
  }));

  return (
    <div className="bg-card border border-border rounded-ui p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Returns & Warranty
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-muted/30 rounded-ui p-4 text-center">
          <p className="text-sm text-muted-foreground mb-1">Return Rate</p>
          <p className="text-2xl font-bold text-foreground">
            {data.totalDelivered > 0
              ? `${(data.returnRate * 100).toFixed(1)}%`
              : "N/A"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {data.returnRequests} / {data.totalDelivered} delivered
          </p>
        </div>
        <div className="bg-muted/30 rounded-ui p-4 text-center">
          <p className="text-sm text-muted-foreground mb-1">Warranty Claim Rate</p>
          <p className="text-2xl font-bold text-foreground">
            {data.totalDelivered > 0
              ? `${(data.warrantyClaimRate * 100).toFixed(1)}%`
              : "N/A"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {data.warrantyClaims} claim{data.warrantyClaims !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="bg-muted/30 rounded-ui p-4 text-center">
          <p className="text-sm text-muted-foreground mb-1">
            Avg Days to Return
          </p>
          <p className="text-2xl font-bold text-foreground">
            {data.avgDaysToReturnRequest !== null
              ? `${data.avgDaysToReturnRequest}d`
              : "N/A"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">from delivery</p>
        </div>
      </div>

      {chartData.length > 0 ? (
        <>
          <p className="text-sm font-medium text-muted-foreground mb-3">
            Warranty Claims by Reason
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                horizontal={false}
              />
              <XAxis
                type="number"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="label"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                width={120}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="count"
                fill="hsl(var(--primary))"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">
          No warranty claims in this period
        </p>
      )}
    </div>
  );
}

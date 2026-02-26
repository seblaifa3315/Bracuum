"use client";

import { useMemo, useState } from "react";
import {
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart,
} from "recharts";
import { Button } from "@/components/ui/button";
import type { RevenueDataPoint, Granularity } from "./types";

function formatCents(cents: number): string {
  if (cents >= 100_00) {
    return `$${(cents / 100).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  }
  return `$${(cents / 100).toFixed(2)}`;
}

function formatAxisDate(dateStr: string, granularity: Granularity): string {
  const d = new Date(dateStr + "T00:00:00");
  if (granularity === "day") {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  if (granularity === "week") {
    return `W ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  }
  if (granularity === "month") {
    return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  }
  return d.getFullYear().toString();
}

function bucketData(
  data: RevenueDataPoint[],
  granularity: Granularity
): RevenueDataPoint[] {
  if (granularity === "day") return data;

  const buckets = new Map<string, RevenueDataPoint>();

  for (const point of data) {
    const d = new Date(point.date + "T00:00:00");
    let key: string;

    if (granularity === "week") {
      // Week starts on Monday
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d);
      monday.setDate(diff);
      key = monday.toISOString().split("T")[0];
    } else if (granularity === "month") {
      key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
    } else {
      // Year
      key = `${d.getFullYear()}-01-01`;
    }

    const existing = buckets.get(key) || { date: key, revenue: 0, orderCount: 0, quantitySold: 0 };
    existing.revenue += point.revenue;
    existing.orderCount += point.orderCount;
    existing.quantitySold += point.quantitySold;
    buckets.set(key, existing);
  }

  return Array.from(buckets.values()).sort((a, b) => a.date.localeCompare(b.date));
}

interface RevenueChartProps {
  data: RevenueDataPoint[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const d = new Date(label + "T00:00:00");
  const dateStr = d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  return (
    <div className="bg-card border border-border rounded-ui p-3 shadow-lg">
      <p className="text-sm font-medium text-foreground mb-1">{dateStr}</p>
      <p className="text-sm text-muted-foreground">
        Revenue:{" "}
        <span className="text-foreground font-medium">
          {formatCents(payload[0]?.value ?? 0)}
        </span>
      </p>
      <p className="text-sm text-muted-foreground">
        Orders:{" "}
        <span className="text-foreground font-medium">
          {payload[1]?.value ?? 0}
        </span>
      </p>
    </div>
  );
}

export default function RevenueChart({ data }: RevenueChartProps) {
  const [granularity, setGranularity] = useState<Granularity>("day");

  const chartData = useMemo(
    () => bucketData(data, granularity),
    [data, granularity]
  );

  if (data.length === 0) {
    return (
      <div className="bg-card border border-border rounded-ui p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Revenue Over Time
        </h3>
        <div className="flex items-center justify-center h-[350px] text-muted-foreground">
          No data for this period
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-ui p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Revenue Over Time
        </h3>
        <div className="flex gap-1">
          {(["day", "week", "month", "year"] as Granularity[]).map((g) => (
            <Button
              key={g}
              variant={granularity === g ? "default" : "outline"}
              size="sm"
              onClick={() => setGranularity(g)}
              className="capitalize"
            >
              {g}
            </Button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart data={chartData}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="date"
            tickFormatter={(d) => formatAxisDate(d, granularity)}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
          />
          <YAxis
            yAxisId="revenue"
            tickFormatter={(v) => formatCents(v)}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            yAxisId="orders"
            orientation="right"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            yAxisId="revenue"
            type="monotone"
            dataKey="revenue"
            stroke="hsl(var(--primary))"
            fill="url(#revenueGradient)"
            strokeWidth={2}
          />
          <Line
            yAxisId="orders"
            type="monotone"
            dataKey="orderCount"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

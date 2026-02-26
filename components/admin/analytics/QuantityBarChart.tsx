"use client";

import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import type { RevenueDataPoint, Granularity } from "./types";

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
): { date: string; quantity: number }[] {
  if (granularity === "day") {
    return data.map((d) => ({ date: d.date, quantity: d.quantitySold }));
  }

  const buckets = new Map<string, number>();

  for (const point of data) {
    const d = new Date(point.date + "T00:00:00");
    let key: string;

    if (granularity === "week") {
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d);
      monday.setDate(diff);
      key = monday.toISOString().split("T")[0];
    } else if (granularity === "month") {
      key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
    } else {
      key = `${d.getFullYear()}-01-01`;
    }

    buckets.set(key, (buckets.get(key) || 0) + point.quantitySold);
  }

  return Array.from(buckets.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, quantity]) => ({ date, quantity }));
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
        Units sold:{" "}
        <span className="text-foreground font-medium">
          {payload[0]?.value ?? 0}
        </span>
      </p>
    </div>
  );
}

interface QuantityBarChartProps {
  data: RevenueDataPoint[];
}

export default function QuantityBarChart({ data }: QuantityBarChartProps) {
  const [granularity, setGranularity] = useState<Granularity>("month");

  const chartData = useMemo(
    () => bucketData(data, granularity),
    [data, granularity]
  );

  if (data.length === 0) {
    return (
      <div className="bg-card border border-border rounded-ui p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Units Sold Breakdown
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
          Units Sold Breakdown
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
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="date"
            tickFormatter={(d) => formatAxisDate(d, granularity)}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="quantity"
            fill="hsl(var(--primary))"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

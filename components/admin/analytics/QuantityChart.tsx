"use client";

import { useMemo, useState } from "react";
import {
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
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
): { date: string; cumulative: number }[] {
  // First bucket by granularity
  const buckets = new Map<string, number>();

  for (const point of data) {
    const d = new Date(point.date + "T00:00:00");
    let key: string;

    if (granularity === "day") {
      key = point.date;
    } else if (granularity === "week") {
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

  // Sort and accumulate
  const sorted = Array.from(buckets.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  let cumulative = 0;
  return sorted.map(([date, qty]) => {
    cumulative += qty;
    return { date, cumulative };
  });
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
        Total units sold:{" "}
        <span className="text-foreground font-medium">
          {payload[0]?.value ?? 0}
        </span>
      </p>
    </div>
  );
}

interface QuantityChartProps {
  data: RevenueDataPoint[];
}

export default function QuantityChart({ data }: QuantityChartProps) {
  const [granularity, setGranularity] = useState<Granularity>("day");

  const chartData = useMemo(
    () => bucketData(data, granularity),
    [data, granularity]
  );

  if (data.length === 0) {
    return (
      <div className="bg-card border border-border rounded-ui p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Cumulative Units Sold
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
          Cumulative Units Sold
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
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="quantityGradient" x1="0" y1="0" x2="0" y2="1">
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
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="cumulative"
            stroke="hsl(var(--primary))"
            fill="url(#quantityGradient)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import { Button } from "@/components/ui/button";
import type { RevenueDataPoint, Granularity } from "./types";

type Tab = "revenue" | "units";

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

interface BucketedPoint {
  date: string;
  revenue: number;
  orderCount: number;
  quantitySold: number;
  cumulativeRevenue: number;
  cumulativeQuantity: number;
}

function bucketData(
  data: RevenueDataPoint[],
  granularity: Granularity
): BucketedPoint[] {
  const buckets = new Map<string, RevenueDataPoint>();

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

    const existing = buckets.get(key) || {
      date: key,
      revenue: 0,
      orderCount: 0,
      quantitySold: 0,
    };
    existing.revenue += point.revenue;
    existing.orderCount += point.orderCount;
    existing.quantitySold += point.quantitySold;
    buckets.set(key, existing);
  }

  const sorted = Array.from(buckets.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  let cumulativeRevenue = 0;
  let cumulativeQuantity = 0;

  return sorted.map((point) => {
    cumulativeRevenue += point.revenue;
    cumulativeQuantity += point.quantitySold;
    return {
      ...point,
      cumulativeRevenue,
      cumulativeQuantity,
    };
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function RevenueTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const d = new Date(label + "T00:00:00");
  const dateStr = d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const point = payload[0]?.payload as BucketedPoint | undefined;
  return (
    <div className="bg-card border border-border rounded-ui p-3 shadow-lg">
      <p className="text-sm font-medium text-foreground mb-1">{dateStr}</p>
      <p className="text-sm text-muted-foreground">
        Revenue:{" "}
        <span className="text-foreground font-medium">
          {formatCents(point?.revenue ?? 0)}
        </span>
      </p>
      <p className="text-sm text-muted-foreground">
        Cumulative:{" "}
        <span className="text-foreground font-medium">
          {formatCents(point?.cumulativeRevenue ?? 0)}
        </span>
      </p>
      <p className="text-sm text-muted-foreground">
        Orders:{" "}
        <span className="text-foreground font-medium">
          {point?.orderCount ?? 0}
        </span>
      </p>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function UnitsTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const d = new Date(label + "T00:00:00");
  const dateStr = d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const point = payload[0]?.payload as BucketedPoint | undefined;
  return (
    <div className="bg-card border border-border rounded-ui p-3 shadow-lg">
      <p className="text-sm font-medium text-foreground mb-1">{dateStr}</p>
      <p className="text-sm text-muted-foreground">
        Units sold:{" "}
        <span className="text-foreground font-medium">
          {point?.quantitySold ?? 0}
        </span>
      </p>
      <p className="text-sm text-muted-foreground">
        Cumulative:{" "}
        <span className="text-foreground font-medium">
          {point?.cumulativeQuantity ?? 0}
        </span>
      </p>
    </div>
  );
}

interface SalesChartProps {
  data: RevenueDataPoint[];
}

export default function SalesChart({ data }: SalesChartProps) {
  const [tab, setTab] = useState<Tab>("revenue");
  const [granularity, setGranularity] = useState<Granularity>("month");

  const chartData = useMemo(
    () => bucketData(data, granularity),
    [data, granularity]
  );

  if (data.length === 0) {
    return (
      <div className="bg-card border border-border rounded-ui p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Sales Overview
        </h3>
        <div className="flex items-center justify-center h-[350px] text-muted-foreground">
          No data for this period
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-ui p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h3 className="text-lg font-semibold text-foreground">
          Sales Overview
        </h3>

        <div className="flex gap-1">
          <Button
            variant={tab === "revenue" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("revenue")}
          >
            Revenue
          </Button>
          <Button
            variant={tab === "units" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("units")}
          >
            Units Sold
          </Button>
        </div>

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

      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={chartData}>
          <defs>
            <linearGradient id="salesCumulativeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
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

          {tab === "revenue" ? (
            <>
              <YAxis
                yAxisId="bar"
                tickFormatter={(v) => formatCents(v)}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="cumulative"
                orientation="right"
                tickFormatter={(v) => formatCents(v)}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<RevenueTooltip />} />
              <Bar
                yAxisId="bar"
                dataKey="revenue"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
              <Area
                yAxisId="cumulative"
                type="monotone"
                dataKey="cumulativeRevenue"
                stroke="#f59e0b"
                fill="url(#salesCumulativeGradient)"
                strokeWidth={2}
              />
            </>
          ) : (
            <>
              <YAxis
                yAxisId="bar"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <YAxis
                yAxisId="cumulative"
                orientation="right"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<UnitsTooltip />} />
              <Bar
                yAxisId="bar"
                dataKey="quantitySold"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
              <Area
                yAxisId="cumulative"
                type="monotone"
                dataKey="cumulativeQuantity"
                stroke="#f59e0b"
                fill="url(#salesCumulativeGradient)"
                strokeWidth={2}
              />
            </>
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

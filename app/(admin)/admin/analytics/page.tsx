"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import TimeRangeFilter from "@/components/admin/analytics/TimeRangeFilter";
import KpiCards from "@/components/admin/analytics/KpiCards";
import RevenueChart from "@/components/admin/analytics/RevenueChart";
import RevenueBarChart from "@/components/admin/analytics/RevenueBarChart";
import QuantityChart from "@/components/admin/analytics/QuantityChart";
import QuantityBarChart from "@/components/admin/analytics/QuantityBarChart";
import OrderStatusChart from "@/components/admin/analytics/OrderStatusChart";
import ReturnsWarrantySection from "@/components/admin/analytics/ReturnsWarrantySection";
import ShippingFulfillmentSection from "@/components/admin/analytics/ShippingFulfillmentSection";
import type { AnalyticsData, TimeRange } from "@/components/admin/analytics/types";

function getDefaultDates(): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return {
    from: from.toISOString().split("T")[0],
    to: to.toISOString().split("T")[0],
  };
}

export default function AnalyticsPageWrapper() {
  return (
    <Suspense>
      <AnalyticsPage />
    </Suspense>
  );
}

function AnalyticsPage() {
  const defaults = getDefaultDates();
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [fromDate, setFromDate] = useState(defaults.from);
  const [toDate, setToDate] = useState(defaults.to);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = useCallback(async (from: string, to: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/admin/analytics?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch analytics");
      setData(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics(fromDate, toDate);
  }, [fromDate, toDate, fetchAnalytics]);

  const handleTimeRangeChange = (range: TimeRange, from: string, to: string) => {
    setTimeRange(range);
    setFromDate(from);
    setToDate(to);
  };

  // ─── Loading State ───
  if (loading) {
    return (
      <div className="w-full bg-background p-8 overflow-y-auto">
        <div className="mb-8">
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-72" />
        </div>
        <Skeleton className="h-10 w-full mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-[400px] w-full mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Skeleton className="h-[350px]" />
          <Skeleton className="h-[350px]" />
        </div>
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  // ─── Error State ───
  if (error) {
    return (
      <div className="w-full bg-background p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Analytics</h1>
          <p className="text-muted-foreground">
            Track revenue, orders, and key business metrics
          </p>
        </div>
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-ui">
          {error}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="w-full bg-background p-8 overflow-y-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Analytics</h1>
        <p className="text-muted-foreground">
          Track revenue, orders, and key business metrics
        </p>
      </div>

      {/* Time Range Filter */}
      <div className="mb-6">
        <TimeRangeFilter
          value={timeRange}
          customFrom={fromDate}
          customTo={toDate}
          onChange={handleTimeRangeChange}
        />
      </div>

      {/* KPI Cards */}
      <div className="mb-6">
        <KpiCards data={data.kpi} timeRange={timeRange} />
      </div>

      {/* Revenue Breakdown Bar Chart */}
      <div className="mb-6">
        <RevenueBarChart data={data.revenueOverTime} />
      </div>

      {/* Revenue Chart */}
      <div className="mb-6">
        <RevenueChart data={data.revenueOverTime} />
      </div>

      {/* Units Sold Breakdown Bar Chart */}
      <div className="mb-6">
        <QuantityBarChart data={data.revenueOverTime} />
      </div>

      {/* Cumulative Units Sold */}
      <div className="mb-6">
        <QuantityChart data={data.revenueOverTime} />
      </div>

      {/* Order Status + Returns & Warranty */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <OrderStatusChart data={data.ordersByStatus} />
        <ReturnsWarrantySection data={data.returnsAndWarranty} />
      </div>

      {/* Shipping & Fulfillment */}
      <ShippingFulfillmentSection data={data.shippingAndFulfillment} />
    </div>
  );
}

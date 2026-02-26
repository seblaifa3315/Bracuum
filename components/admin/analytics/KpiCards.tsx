"use client";

import { DollarSign, Receipt, CreditCard, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { KpiData, TimeRange } from "./types";

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function percentChange(current: number, previous: number): string | null {
  if (previous === 0) {
    return current > 0 ? "+100%" : null;
  }
  const pct = ((current - previous) / Math.abs(previous)) * 100;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

interface KpiCardsProps {
  data: KpiData;
  timeRange: TimeRange;
}

export default function KpiCards({ data, timeRange }: KpiCardsProps) {
  const isAllTime = timeRange === "all";

  const cards = [
    {
      label: "Gross Revenue",
      value: formatCents(data.grossRevenue),
      prev: data.prevGrossRevenue,
      current: data.grossRevenue,
      icon: DollarSign,
      iconColor: "text-primary",
    },
    {
      label: "Tax Collected",
      value: formatCents(data.taxCollected),
      prev: data.prevTaxCollected,
      current: data.taxCollected,
      icon: Receipt,
      iconColor: "text-yellow-600",
    },
    {
      label: "Stripe Fees",
      value: formatCents(data.stripeFees),
      prev: data.prevStripeFees,
      current: data.stripeFees,
      icon: CreditCard,
      iconColor: "text-red-500",
    },
    {
      label: "Net Revenue",
      value: formatCents(data.netRevenue),
      prev: data.prevNetRevenue,
      current: data.netRevenue,
      icon: TrendingUp,
      iconColor: "text-emerald-600",
      note: "Before shipping costs",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const change = isAllTime ? null : percentChange(card.current, card.prev);
        const isPositive = change ? change.startsWith("+") : false;
        // For Stripe Fees, positive change is bad (more fees)
        const isFeesCard = card.label === "Stripe Fees";
        const badgeColor = isFeesCard
          ? isPositive
            ? "bg-red-100 text-red-700"
            : "bg-emerald-100 text-emerald-700"
          : isPositive
            ? "bg-emerald-100 text-emerald-700"
            : "bg-red-100 text-red-700";

        return (
          <div
            key={card.label}
            className="bg-card border border-border rounded-ui p-6"
          >
            <div className="flex items-center gap-3">
              <Icon className={`w-5 h-5 ${card.iconColor}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-foreground truncate">
                    {card.value}
                  </p>
                  {change ? (
                    <Badge className={`${badgeColor} border-none text-xs`}>
                      {change}
                    </Badge>
                  ) : isAllTime ? (
                    <span className="text-xs text-muted-foreground">N/A</span>
                  ) : null}
                </div>
              </div>
            </div>
            {"note" in card && card.note && (
              <p className="text-xs text-muted-foreground mt-2">{card.note}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

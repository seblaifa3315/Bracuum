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
import type { ShippingAndFulfillment } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-ui p-3 shadow-lg">
      <p className="text-sm font-medium text-foreground">{payload[0]?.payload?.carrier}</p>
      <p className="text-sm text-muted-foreground">
        {payload[0]?.value} order{payload[0]?.value !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

interface ShippingFulfillmentSectionProps {
  data: ShippingAndFulfillment;
}

export default function ShippingFulfillmentSection({
  data,
}: ShippingFulfillmentSectionProps) {
  return (
    <div className="bg-card border border-border rounded-ui p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Shipping & Fulfillment
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-muted/30 rounded-ui p-4 text-center">
          <p className="text-sm text-muted-foreground mb-1">
            Avg Fulfillment Time
          </p>
          <p className="text-2xl font-bold text-foreground">
            {data.avgFulfillmentDays !== null
              ? `${data.avgFulfillmentDays}d`
              : "N/A"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            order placed to shipped
          </p>
        </div>
        <div className="bg-muted/30 rounded-ui p-4 text-center">
          <p className="text-sm text-muted-foreground mb-1">
            Avg Delivery Time
          </p>
          <p className="text-2xl font-bold text-foreground">
            {data.avgDeliveryDays !== null
              ? `${data.avgDeliveryDays}d`
              : "N/A"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            shipped to delivered
          </p>
        </div>
      </div>

    </div>
  );
}

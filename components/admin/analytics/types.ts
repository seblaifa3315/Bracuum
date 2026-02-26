export type TimeRange = "7d" | "30d" | "90d" | "1y" | "all" | "custom";
export type Granularity = "day" | "week" | "month" | "year";

export interface KpiData {
  grossRevenue: number;
  taxCollected: number;
  stripeFees: number;
  netRevenue: number;
  prevGrossRevenue: number;
  prevTaxCollected: number;
  prevStripeFees: number;
  prevNetRevenue: number;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  orderCount: number;
  quantitySold: number;
}

export interface OrdersByStatus {
  status: string;
  count: number;
}

export interface ReturnsAndWarranty {
  totalDelivered: number;
  returnRequests: number;
  returnRate: number;
  warrantyClaims: number;
  warrantyClaimRate: number;
  avgDaysToReturnRequest: number | null;
  warrantyByReason: { reason: string; count: number }[];
}

export interface ShippingAndFulfillment {
  avgFulfillmentDays: number | null;
  avgDeliveryDays: number | null;
  ordersByCarrier: { carrier: string; count: number }[];
}

export interface AnalyticsData {
  kpi: KpiData;
  revenueOverTime: RevenueDataPoint[];
  ordersByStatus: OrdersByStatus[];
  returnsAndWarranty: ReturnsAndWarranty;
  shippingAndFulfillment: ShippingAndFulfillment;
}

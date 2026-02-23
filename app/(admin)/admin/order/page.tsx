"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShoppingCart,
  Search,
  ChevronDown,
  ChevronUp,
  Package,
  Truck,
  Clock,
  DollarSign,
  Mail,
  MapPin,
  User,
  Filter,
  AlertCircle,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────
type OrderStatus =
  | "NEW"
  | "PREORDER_PLACED"
  | "PREORDER_WAITING"
  | "PAID"
  | "SHIPPED"
  | "DELIVERED"
  | "RETURN_REQUESTED"
  | "RETURN_RECEIVED"
  | "REFUNDED"
  | "CANCELLED";

interface WarrantyClaim {
  id: string;
  description: string;
  status: string;
  reason: string | null;
}

interface Order {
  id: string;
  orderNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  quantity: number;
  productPrice: number;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  totalAmount: number;
  stripeFee: number | null;
  currency: string;
  status: OrderStatus;
  isPreOrder: boolean;
  depositAmount: number | null;
  remainingAmount: number | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
  trackingNumber: string | null;
  shippedAt: string | null;
  carrier: string | null;
  shippingMethod: string | null;
  shippingNotes: string | null;
  deliveredAt: string | null;
  warrantyExpiresAt: string | null;
  returnRequestedAt: string | null;
  returnReceivedAt: string | null;
  refundedAt: string | null;
  customerNotes: string | null;
  customerEmailSentAt: string | null;
  customerEmailError: string | null;
  sellerEmailSentAt: string | null;
  sellerEmailError: string | null;
  warrantyClaims: WarrantyClaim[];
  createdAt: string;
  updatedAt: string;
}

type SortOption = "newest" | "oldest" | "highest" | "lowest";

// ─── Helpers ─────────────────────────────────────────────────────────
const STATUS_LABELS: Record<OrderStatus, string> = {
  NEW: "New",
  PREORDER_PLACED: "Pre-order Placed",
  PREORDER_WAITING: "Pre-order Waiting",
  PAID: "Paid",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  RETURN_REQUESTED: "Return Requested",
  RETURN_RECEIVED: "Return Received",
  REFUNDED: "Refunded",
  CANCELLED: "Cancelled",
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  NEW: "bg-blue-100 text-blue-700",
  PREORDER_PLACED: "bg-purple-100 text-purple-700",
  PREORDER_WAITING: "bg-purple-100 text-purple-700",
  PAID: "bg-red-100 text-red-700",
  SHIPPED: "bg-yellow-100 text-yellow-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  RETURN_REQUESTED: "bg-orange-100 text-orange-700",
  RETURN_RECEIVED: "bg-orange-100 text-orange-700",
  REFUNDED: "bg-gray-100 text-gray-600",
  CANCELLED: "bg-red-100 text-red-700",
};

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(dateStr: string | null, utc = false): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...(utc ? { timeZone: "UTC" } : {}),
  });
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// ─── Component ───────────────────────────────────────────────────────
export default function OrdersAdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortOption, setSortOption] = useState<SortOption>("newest");

  // Ship action
  const [shippingOrderId, setShippingOrderId] = useState<string | null>(null);
  const [shipForm, setShipForm] = useState({
    carrier: "",
    shippingMethod: "",
    trackingNumber: "",
    shippedAt: new Date().toISOString().split("T")[0],
    shippingNotes: "",
  });
  const [shipLoading, setShipLoading] = useState(false);
  const [shipError, setShipError] = useState("");
  const [shipSuccess, setShipSuccess] = useState("");

  // Deliver action
  const [deliverDate, setDeliverDate] = useState(new Date().toISOString().split("T")[0]);
  const [deliverLoading, setDeliverLoading] = useState(false);
  const [deliverError, setDeliverError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch orders");
      setOrders(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  // ─── Filtering & Sorting ────────────────────────────────────────────
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // Status filter
    if (statusFilter !== "ALL") {
      const now = Date.now();
      switch (statusFilter) {
        case "RETURNABLE":
          result = result.filter((o) => o.deliveredAt && new Date(o.deliveredAt).getTime() + 30 * 24 * 60 * 60 * 1000 > now);
          break;
        case "RETURN_EXPIRED":
          result = result.filter((o) => o.deliveredAt && new Date(o.deliveredAt).getTime() + 30 * 24 * 60 * 60 * 1000 <= now);
          break;
        case "WARRANTY_ACTIVE":
          result = result.filter((o) => o.warrantyExpiresAt && new Date(o.warrantyExpiresAt).getTime() > now);
          break;
        case "WARRANTY_EXPIRED":
          result = result.filter((o) => o.warrantyExpiresAt && new Date(o.warrantyExpiresAt).getTime() <= now);
          break;
        default:
          result = result.filter((o) => o.status === statusFilter);
      }
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.firstName.toLowerCase().includes(q) ||
          o.lastName.toLowerCase().includes(q) ||
          o.email.toLowerCase().includes(q) ||
          `${o.firstName} ${o.lastName}`.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (sortOption) {
      case "newest":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "highest":
        result.sort((a, b) => b.totalAmount - a.totalAmount);
        break;
      case "lowest":
        result.sort((a, b) => a.totalAmount - b.totalAmount);
        break;
    }

    return result;
  }, [orders, statusFilter, searchQuery, sortOption]);

  // ─── Summary Stats ──────────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const pendingShipment = orders.filter((o) => o.status === "PAID").length;
    const shipped = orders.filter((o) => o.status === "SHIPPED" || o.status === "DELIVERED").length;
    const revenue = orders
      .filter((o) => o.status === "PAID" || o.status === "SHIPPED" || o.status === "DELIVERED")
      .reduce((sum, o) => sum + o.totalAmount, 0);
    return { totalOrders, pendingShipment, shipped, revenue };
  }, [orders]);

  // ─── Ship Handler ───────────────────────────────────────────────────
  const handleMarkAsShipped = async (orderId: string) => {
    setShipLoading(true);
    setShipError("");
    setShipSuccess("");
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "SHIPPED",
          trackingNumber: shipForm.trackingNumber.trim() || undefined,
          carrier: shipForm.carrier || undefined,
          shippingMethod: shipForm.shippingMethod || undefined,
          shippingNotes: shipForm.shippingNotes.trim() || undefined,
          shippedAt: shipForm.shippedAt || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update order");

      // Update local state
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? data.data : o))
      );
      setShipSuccess("Order marked as shipped!");
      setShipForm({
        carrier: "",
        shippingMethod: "",
        trackingNumber: "",
        shippedAt: new Date().toISOString().split("T")[0],
        shippingNotes: "",
      });
      setShippingOrderId(null);
      setTimeout(() => setShipSuccess(""), 3000);
    } catch (err) {
      setShipError(err instanceof Error ? err.message : "Failed to ship order");
    } finally {
      setShipLoading(false);
    }
  };

  // ─── Deliver Handler ────────────────────────────────────────────────
  const handleMarkAsDelivered = async (orderId: string) => {
    setDeliverLoading(true);
    setDeliverError("");
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveredAt: deliverDate }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update order");

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? data.data : o))
      );
      setDeliverDate(new Date().toISOString().split("T")[0]);
    } catch (err) {
      setDeliverError(err instanceof Error ? err.message : "Failed to mark as delivered");
    } finally {
      setDeliverLoading(false);
    }
  };

  // ─── Toggle Expand ──────────────────────────────────────────────────
  const toggleExpand = (orderId: string) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
    setShippingOrderId(null);
    setShipError("");
    setShipSuccess("");
    setDeliverError("");
    setDeliverDate(new Date().toISOString().split("T")[0]);
    setShipForm({
      carrier: "",
      shippingMethod: "",
      trackingNumber: "",
      shippedAt: new Date().toISOString().split("T")[0],
      shippingNotes: "",
    });
  };

  // ─── Loading State ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="w-full bg-background p-8 overflow-y-auto">
        <div className="mb-8">
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-72" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-10 w-full mb-4" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-14 w-full mb-2" />
        ))}
      </div>
    );
  }

  // ─── Error State ────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="w-full bg-background p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Orders</h1>
          <p className="text-muted-foreground">Manage and track all customer orders</p>
        </div>
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-ui">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-background p-8 overflow-y-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Orders</h1>
        <p className="text-muted-foreground">Manage and track all customer orders</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border border-border rounded-ui p-6">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalOrders}</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-ui p-6">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-sm text-muted-foreground">Pending Shipment</p>
              <p className="text-2xl font-bold text-foreground">{stats.pendingShipment}</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-ui p-6">
          <div className="flex items-center gap-3">
            <Truck className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Shipped</p>
              <p className="text-2xl font-bold text-foreground">{stats.shipped}</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-ui p-6">
          <div className="flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Revenue</p>
              <p className="text-2xl font-bold text-foreground">{formatCents(stats.revenue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by order #, name, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-ui focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-8 py-2 bg-background border border-input rounded-ui focus:outline-none focus:ring-2 focus:ring-ring text-foreground appearance-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
            <option disabled>──────────</option>
            <option value="RETURNABLE">Returnable</option>
            <option value="RETURN_EXPIRED">Return Expired</option>
            <option value="WARRANTY_ACTIVE">Warranty Active</option>
            <option value="WARRANTY_EXPIRED">Warranty Expired</option>
          </select>
        </div>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value as SortOption)}
          className="px-4 py-2 bg-background border border-input rounded-ui focus:outline-none focus:ring-2 focus:ring-ring text-foreground appearance-none cursor-pointer"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="highest">Highest Amount</option>
          <option value="lowest">Lowest Amount</option>
        </select>
      </div>

      {/* Ship success message */}
      {shipSuccess && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-600 px-4 py-3 rounded-ui mb-4">
          {shipSuccess}
        </div>
      )}

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="bg-card border border-border rounded-ui p-12 text-center">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-foreground mb-1">No orders found</p>
          <p className="text-sm text-muted-foreground">
            {searchQuery || statusFilter !== "ALL"
              ? "Try adjusting your filters or search query."
              : "Orders will appear here once customers place them."}
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-ui overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid md:grid-cols-[1fr_2fr_1fr_1fr_0.5fr_1fr_0.8fr_0.8fr_auto] gap-4 px-6 py-3 bg-muted/50 border-b border-border text-sm font-medium text-muted-foreground">
            <span>Order #</span>
            <span>Customer</span>
            <span>Date</span>
            <span>Status</span>
            <span>Qty</span>
            <span>Total</span>
            <span>Return</span>
            <span>Warranty</span>
            <span className="w-9" />
          </div>

          {/* Table Rows */}
          {filteredOrders.map((order) => (
            <div key={order.id} className="border-b border-border last:border-b-0">
              {/* Row */}
              <div
                className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr_1fr_0.5fr_1fr_0.8fr_0.8fr_auto] gap-4 px-6 py-4 items-center cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => toggleExpand(order.id)}
              >
                <span className="font-medium text-foreground">{order.orderNumber}</span>
                <div className="min-w-0">
                  <p className="text-foreground truncate">
                    {order.firstName} {order.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">{order.email}</p>
                </div>
                <span className="text-foreground">{formatDate(order.createdAt)}</span>
                <div>
                  <Badge className={`${STATUS_COLORS[order.status]} border-none`}>
                    {STATUS_LABELS[order.status]}
                  </Badge>
                </div>
                <span className="text-foreground">{order.quantity}</span>
                <span className="font-medium text-foreground">
                  {formatCents(order.totalAmount)}
                </span>
                <span>
                  {order.deliveredAt ? (
                    new Date(order.deliveredAt).getTime() + 30 * 24 * 60 * 60 * 1000 > Date.now() ? (
                      <Badge className="bg-green-100 text-green-700 border-none">Active</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700 border-none">Expired</Badge>
                    )
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </span>
                <span>
                  {order.warrantyExpiresAt ? (
                    new Date(order.warrantyExpiresAt).getTime() > Date.now() ? (
                      <Badge className="bg-green-100 text-green-700 border-none">Active</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700 border-none">Expired</Badge>
                    )
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </span>
                <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); toggleExpand(order.id); }}>
                  {expandedOrderId === order.id ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {/* Expanded Detail Panel */}
              {expandedOrderId === order.id && (
                <div className="px-6 pb-6 pt-2 bg-muted/20 border-t border-border">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Customer Info */}
                    <div className="bg-card border border-border rounded-ui p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <User className="w-4 h-4 text-primary" />
                        <h3 className="font-semibold text-foreground">Customer Info</h3>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p className="text-foreground">
                          {order.firstName} {order.lastName}
                        </p>
                        <p className="text-muted-foreground">{order.email}</p>
                        {order.phoneNumber && (
                          <p className="text-muted-foreground">{order.phoneNumber}</p>
                        )}
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-card border border-border rounded-ui p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="w-4 h-4 text-primary" />
                        <h3 className="font-semibold text-foreground">Shipping Address</h3>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        {order.addressLine1 ? (
                          <>
                            <p>{order.addressLine1}</p>
                            {order.addressLine2 && <p>{order.addressLine2}</p>}
                            <p>
                              {order.city}, {order.state} {order.zip}
                            </p>
                            <p>{order.country}</p>
                          </>
                        ) : (
                          <p>No structured address available</p>
                        )}
                      </div>
                    </div>

                    {/* Pricing Breakdown */}
                    <div className="bg-card border border-border rounded-ui p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <DollarSign className="w-4 h-4 text-primary" />
                        <h3 className="font-semibold text-foreground">Pricing Breakdown</h3>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Product price × {order.quantity}
                          </span>
                          <span className="text-foreground">
                            {formatCents(order.productPrice)} × {order.quantity}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span className="text-foreground">{formatCents(order.subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tax</span>
                          <span className="text-foreground">{formatCents(order.taxAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Shipping</span>
                          <span className="text-foreground">
                            {formatCents(order.shippingAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Stripe fee</span>
                          <span className="text-foreground">
                            {order.stripeFee != null ? formatCents(order.stripeFee) : "Pending"}
                          </span>
                        </div>
                        <div className="border-t border-border pt-2 flex justify-between font-bold">
                          <span className="text-foreground">Total</span>
                          <span className="text-foreground">{formatCents(order.totalAmount)}</span>
                        </div>
                        {order.stripeFee != null && (
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Net revenue</span>
                            <span className="text-foreground">
                              {formatCents(
                                order.totalAmount - order.stripeFee - order.taxAmount
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Timeline / Key Dates */}
                    <div className="bg-card border border-border rounded-ui p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Clock className="w-4 h-4 text-primary" />
                        <h3 className="font-semibold text-foreground">Timeline</h3>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Order placed</span>
                          <span className="text-foreground">{formatDateTime(order.createdAt)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Shipped</span>
                          <span className="text-foreground">
                            {order.shippedAt ? formatDate(order.shippedAt, true) : "Not yet shipped"}
                          </span>
                        </div>
                        {order.carrier && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Carrier</span>
                            <span className="text-foreground">{order.carrier}</span>
                          </div>
                        )}
                        {order.shippingMethod && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Method</span>
                            <span className="text-foreground">{order.shippingMethod}</span>
                          </div>
                        )}
                        {order.trackingNumber && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Tracking #</span>
                            <span className="text-foreground font-mono">{order.trackingNumber}</span>
                          </div>
                        )}
                        {order.deliveredAt ? (
                          <>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Delivered</span>
                              <span className="text-foreground">{formatDate(order.deliveredAt, true)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Warranty expires</span>
                              <Badge className={`${order.warrantyExpiresAt && new Date(order.warrantyExpiresAt).getTime() > Date.now() ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"} border-none`}>
                                {formatDate(order.warrantyExpiresAt, true)}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Return expires</span>
                              <Badge className={`${new Date(order.deliveredAt).getTime() + 30 * 24 * 60 * 60 * 1000 > Date.now() ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"} border-none`}>
                                {formatDate(new Date(new Date(order.deliveredAt).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(), true)}
                              </Badge>
                            </div>
                          </>
                        ) : order.status === "SHIPPED" ? (
                          <div className="border-t border-border pt-3 mt-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <label htmlFor={`deliver-date-${order.id}`} className="text-muted-foreground whitespace-nowrap">
                                Delivery date
                              </label>
                              <input
                                id={`deliver-date-${order.id}`}
                                type="date"
                                value={deliverDate}
                                onChange={(e) => setDeliverDate(e.target.value)}
                                className="flex-1 px-3 py-1.5 bg-background border border-input rounded-ui focus:outline-none focus:ring-2 focus:ring-ring text-foreground text-sm"
                              />
                            </div>
                            {deliverError && (
                              <p className="text-destructive text-xs">{deliverError}</p>
                            )}
                            <Button
                              onClick={() => handleMarkAsDelivered(order.id)}
                              disabled={deliverLoading}
                              variant="outline"
                              className="w-full"
                              size="sm"
                            >
                              {deliverLoading ? "Updating..." : "Mark as Delivered"}
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Delivered</span>
                            <span className="text-foreground">—</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Shipping Action (PAID orders only) */}
                    {order.status === "PAID" && (
                      <div className="lg:col-span-2 bg-card border border-border rounded-ui p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Truck className="w-4 h-4 text-primary" />
                          <h3 className="font-semibold text-foreground">Ship Order</h3>
                        </div>
                        <div className="space-y-3">
                          {/* Row 1: Carrier + Method */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label
                                htmlFor={`carrier-${order.id}`}
                                className="block text-sm font-medium text-foreground mb-1"
                              >
                                Carrier
                              </label>
                              <select
                                id={`carrier-${order.id}`}
                                value={shippingOrderId === order.id ? shipForm.carrier : ""}
                                onFocus={() => setShippingOrderId(order.id)}
                                onChange={(e) => {
                                  setShippingOrderId(order.id);
                                  setShipForm((f) => ({ ...f, carrier: e.target.value }));
                                }}
                                className="w-full px-4 py-2 bg-background border border-input rounded-ui focus:outline-none focus:ring-2 focus:ring-ring text-foreground appearance-none cursor-pointer"
                              >
                                <option value="">Select carrier...</option>
                                <option value="USPS">USPS</option>
                                <option value="UPS">UPS</option>
                                <option value="FedEx">FedEx</option>
                                <option value="DHL">DHL</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                            <div>
                              <label
                                htmlFor={`method-${order.id}`}
                                className="block text-sm font-medium text-foreground mb-1"
                              >
                                Shipping Method
                              </label>
                              <select
                                id={`method-${order.id}`}
                                value={shippingOrderId === order.id ? shipForm.shippingMethod : ""}
                                onFocus={() => setShippingOrderId(order.id)}
                                onChange={(e) => {
                                  setShippingOrderId(order.id);
                                  setShipForm((f) => ({ ...f, shippingMethod: e.target.value }));
                                }}
                                className="w-full px-4 py-2 bg-background border border-input rounded-ui focus:outline-none focus:ring-2 focus:ring-ring text-foreground appearance-none cursor-pointer"
                              >
                                <option value="">Select method...</option>
                                <option value="Ground">Ground</option>
                                <option value="Express">Express</option>
                                <option value="Priority">Priority</option>
                                <option value="Overnight">Overnight</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                          </div>

                          {/* Row 2: Tracking Number + Ship Date */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label
                                htmlFor={`tracking-${order.id}`}
                                className="block text-sm font-medium text-foreground mb-1"
                              >
                                Tracking Number
                              </label>
                              <input
                                id={`tracking-${order.id}`}
                                type="text"
                                value={shippingOrderId === order.id ? shipForm.trackingNumber : ""}
                                onFocus={() => setShippingOrderId(order.id)}
                                onChange={(e) => {
                                  setShippingOrderId(order.id);
                                  setShipForm((f) => ({ ...f, trackingNumber: e.target.value }));
                                }}
                                placeholder="Enter tracking number (optional)"
                                className="w-full px-4 py-2 bg-background border border-input rounded-ui focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                              />
                            </div>
                            <div>
                              <label
                                htmlFor={`shipdate-${order.id}`}
                                className="block text-sm font-medium text-foreground mb-1"
                              >
                                Ship Date
                              </label>
                              <input
                                id={`shipdate-${order.id}`}
                                type="date"
                                value={shippingOrderId === order.id ? shipForm.shippedAt : new Date().toISOString().split("T")[0]}
                                onFocus={() => setShippingOrderId(order.id)}
                                onChange={(e) => {
                                  setShippingOrderId(order.id);
                                  setShipForm((f) => ({ ...f, shippedAt: e.target.value }));
                                }}
                                className="w-full px-4 py-2 bg-background border border-input rounded-ui focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                              />
                            </div>
                          </div>

                          {/* Row 3: Shipping Notes */}
                          <div>
                            <label
                              htmlFor={`notes-${order.id}`}
                              className="block text-sm font-medium text-foreground mb-1"
                            >
                              Shipping Notes <span className="text-muted-foreground font-normal">(optional)</span>
                            </label>
                            <textarea
                              id={`notes-${order.id}`}
                              rows={2}
                              value={shippingOrderId === order.id ? shipForm.shippingNotes : ""}
                              onFocus={() => setShippingOrderId(order.id)}
                              onChange={(e) => {
                                setShippingOrderId(order.id);
                                setShipForm((f) => ({ ...f, shippingNotes: e.target.value }));
                              }}
                              placeholder="Internal notes about this shipment..."
                              className="w-full px-4 py-2 bg-background border border-input rounded-ui focus:outline-none focus:ring-2 focus:ring-ring text-foreground resize-none"
                            />
                          </div>

                          {shipError && shippingOrderId === order.id && (
                            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-3 py-2 rounded-ui text-sm">
                              {shipError}
                            </div>
                          )}
                          <Button
                            onClick={() => handleMarkAsShipped(order.id)}
                            disabled={shipLoading}
                            className="w-full"
                          >
                            {shipLoading && shippingOrderId === order.id
                              ? "Updating..."
                              : "Mark as Shipped"}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Email Status */}
                    <div className="bg-card border border-border rounded-ui p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Mail className="w-4 h-4 text-primary" />
                        <h3 className="font-semibold text-foreground">Email Status</h3>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Customer email</span>
                          <span className="text-foreground">
                            {order.customerEmailError ? (
                              <span className="text-destructive flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> Error
                              </span>
                            ) : order.customerEmailSentAt ? (
                              `Sent ${formatDateTime(order.customerEmailSentAt)}`
                            ) : (
                              "Not sent"
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Seller email</span>
                          <span className="text-foreground">
                            {order.sellerEmailError ? (
                              <span className="text-destructive flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> Error
                              </span>
                            ) : order.sellerEmailSentAt ? (
                              `Sent ${formatDateTime(order.sellerEmailSentAt)}`
                            ) : (
                              "Not sent"
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

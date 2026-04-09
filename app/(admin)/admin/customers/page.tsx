"use client";

import { useState, useEffect, useMemo, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  UserPlus,
  Crown,
  TrendingUp,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  User,
  MapPin,
  ShoppingCart,
  Package,
  ExternalLink,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// ─── Types ───────────────────────────────────────────────────────────
type OrderStatus =
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
  status: OrderStatus;
  warrantyClaims: WarrantyClaim[];
  returnRequestedAt: string | null;
  deliveredAt: string | null;
  warrantyExpiresAt: string | null;
  createdAt: string;
}

interface Customer {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
  totalOrders: number;
  totalSpent: number;
  firstOrderDate: string;
  lastOrderDate: string;
  orders: Order[];
}

type SortField = "name" | "email" | "orders" | "spent" | "lastOrder";
type SortDir = "asc" | "desc";

type FulfillmentStatus = "needs_shipping" | "in_transit" | "all_delivered" | "none";

const ITEMS_PER_PAGE = 20;

// ─── Helpers ─────────────────────────────────────────────────────────
const STATUS_LABELS: Record<OrderStatus, string> = {
  PAID: "Paid",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  RETURN_REQUESTED: "Return Requested",
  RETURN_RECEIVED: "Return Received",
  REFUNDED: "Refunded",
  CANCELLED: "Cancelled",
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  PAID: "bg-red-100 text-red-700",
  SHIPPED: "bg-yellow-100 text-yellow-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  RETURN_REQUESTED: "bg-orange-100 text-orange-700",
  RETURN_RECEIVED: "bg-blue-100 text-blue-700",
  REFUNDED: "bg-gray-100 text-gray-600",
  CANCELLED: "bg-red-100 text-red-700",
};

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getFulfillmentStatus(orders: Order[]): FulfillmentStatus {
  const hasPaid = orders.some((o) => o.status === "PAID");
  if (hasPaid) return "needs_shipping";

  const hasShipped = orders.some((o) => o.status === "SHIPPED");
  if (hasShipped) return "in_transit";

  const activeOrders = orders.filter(
    (o) => !["CANCELLED", "REFUNDED"].includes(o.status)
  );
  if (activeOrders.length > 0 && activeOrders.every((o) => o.status === "DELIVERED")) {
    return "all_delivered";
  }

  return "none";
}

const FULFILLMENT_BADGE: Record<FulfillmentStatus, { label: string; className: string }> = {
  needs_shipping: { label: "Needs Shipping", className: "bg-red-100 text-red-700" },
  in_transit: { label: "In Transit", className: "bg-yellow-100 text-yellow-700" },
  all_delivered: { label: "All Delivered", className: "bg-emerald-100 text-emerald-700" },
  none: { label: "—", className: "" },
};

// ─── Sort Icon ───────────────────────────────────────────────────────
function SortIcon({ field, activeField, dir }: { field: SortField; activeField: SortField; dir: SortDir }) {
  if (field !== activeField) return <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground/50" />;
  return dir === "asc"
    ? <ChevronUp className="w-3.5 h-3.5 text-foreground" />
    : <ChevronDown className="w-3.5 h-3.5 text-foreground" />;
}

// ─── Component ───────────────────────────────────────────────────────
export default function CustomersAdminPageWrapper() {
  return (
    <Suspense>
      <CustomersAdminPage />
    </Suspense>
  );
}

function CustomersAdminPage() {
  const searchParams = useSearchParams();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);

  // Filters & sort
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("lastOrder");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Filters
  const [returnFilter, setReturnFilter] = useState<"all" | "active">("all");
  const [warrantyFilter, setWarrantyFilter] = useState<"all" | "active">("all");
  const [fulfillmentFilter, setFulfillmentFilter] = useState<"all" | FulfillmentStatus>("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Tooltip
  const [hoveredEmail, setHoveredEmail] = useState<string | null>(null);

  const fetchCustomers = useCallback(async (search?: string) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search?.trim()) params.set("search", search.trim());
      const res = await fetch(`/api/admin/customers?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch customers");
      setCustomers(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Auto-expand customer from query param (e.g. ?email=john@example.com)
  useEffect(() => {
    const email = searchParams.get("email");
    if (email && customers.length > 0 && !loading) {
      const match = customers.find((c) => c.email.toLowerCase() === email.toLowerCase());
      if (match) setExpandedEmail(match.email);
    }
  }, [searchParams, customers, loading]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchCustomers(value);
    }, 300);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir(field === "name" || field === "email" ? "asc" : "desc");
    }
    setCurrentPage(1);
  };

  // ─── Sorting ────────────────────────────────────────────────────────
  const sortedCustomers = useMemo(() => {
    const result = [...customers];
    const dir = sortDir === "asc" ? 1 : -1;

    result.sort((a, b) => {
      switch (sortField) {
        case "name":
          return dir * `${a.firstName} ${a.lastName}`.toLowerCase().localeCompare(`${b.firstName} ${b.lastName}`.toLowerCase());
        case "email":
          return dir * a.email.toLowerCase().localeCompare(b.email.toLowerCase());
        case "orders":
          return dir * (a.totalOrders - b.totalOrders);
        case "spent":
          return dir * (a.totalSpent - b.totalSpent);
        case "lastOrder":
          return dir * (new Date(a.lastOrderDate).getTime() - new Date(b.lastOrderDate).getTime());
        default:
          return 0;
      }
    });

    return result;
  }, [customers, sortField, sortDir]);

  // ─── Filtering (Return / Warranty) ─────────────────────────────────
  const filteredCustomers = useMemo(() => {
    let result = sortedCustomers;
    const now = Date.now();

    if (returnFilter === "active") {
      result = result.filter((c) =>
        c.orders.some(
          (o) =>
            o.deliveredAt &&
            new Date(o.deliveredAt).getTime() + 30 * 24 * 60 * 60 * 1000 > now
        )
      );
    }

    if (warrantyFilter === "active") {
      result = result.filter((c) =>
        c.orders.some(
          (o) =>
            o.warrantyExpiresAt &&
            new Date(o.warrantyExpiresAt).getTime() > now
        )
      );
    }

    if (fulfillmentFilter !== "all") {
      result = result.filter((c) => getFulfillmentStatus(c.orders) === fulfillmentFilter);
    }

    return result;
  }, [sortedCustomers, returnFilter, warrantyFilter, fulfillmentFilter]);

  // ─── Pagination ─────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE));
  const paginatedCustomers = useMemo(
    () => filteredCustomers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [filteredCustomers, currentPage]
  );

  // ─── Summary Stats ──────────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalCustomers = customers.length;

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const newCustomers = customers.filter(
      (c) => new Date(c.firstOrderDate).getTime() > thirtyDaysAgo
    ).length;

    const topSpender = customers.reduce<Customer | null>(
      (top, c) => (!top || c.totalSpent > top.totalSpent ? c : top),
      null
    );

    const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
    const totalOrders = customers.reduce((sum, c) => sum + c.totalOrders, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return { totalCustomers, newCustomers, topSpender, avgOrderValue };
  }, [customers]);

  // ─── Toggle Expand ──────────────────────────────────────────────────
  const toggleExpand = (email: string) => {
    setExpandedEmail((prev) => (prev === email ? null : email));
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Customers</h1>
          <p className="text-muted-foreground">
            View and manage your customer base
          </p>
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
        <h1 className="text-3xl font-bold text-foreground mb-2">Customers</h1>
        <p className="text-muted-foreground">
          View and manage your customer base
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border border-border rounded-ui p-6">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Customers</p>
              <p className="text-2xl font-bold text-foreground">
                {stats.totalCustomers}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-ui p-6">
          <div className="flex items-center gap-3">
            <UserPlus className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">
                New Customers (30d)
              </p>
              <p className="text-2xl font-bold text-foreground">
                {stats.newCustomers}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-ui p-6">
          <div className="flex items-center gap-3">
            <Crown className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-sm text-muted-foreground">Top Spender</p>
              <p className="text-2xl font-bold text-foreground truncate">
                {stats.topSpender
                  ? `${stats.topSpender.firstName} ${stats.topSpender.lastName}`
                  : "—"}
              </p>
              {stats.topSpender && (
                <p className="text-xs text-muted-foreground">
                  {formatCents(stats.topSpender.totalSpent)}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-ui p-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Avg Order Value</p>
              <p className="text-2xl font-bold text-foreground">
                {formatCents(Math.round(stats.avgOrderValue))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-ui focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <select
            value={fulfillmentFilter}
            onChange={(e) => { setFulfillmentFilter(e.target.value as "all" | FulfillmentStatus); setCurrentPage(1); }}
            className="pl-10 pr-8 py-2 bg-background border border-input rounded-ui focus:outline-none focus:ring-2 focus:ring-ring text-foreground appearance-none cursor-pointer"
          >
            <option value="all">All Fulfillment</option>
            <option value="needs_shipping">Needs Shipping</option>
            <option value="in_transit">In Transit</option>
            <option value="all_delivered">All Delivered</option>
          </select>
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <select
            value={returnFilter}
            onChange={(e) => { setReturnFilter(e.target.value as "all" | "active"); setCurrentPage(1); }}
            className="pl-10 pr-8 py-2 bg-background border border-input rounded-ui focus:outline-none focus:ring-2 focus:ring-ring text-foreground appearance-none cursor-pointer"
          >
            <option value="all">All Returns</option>
            <option value="active">Returnable Only</option>
          </select>
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <select
            value={warrantyFilter}
            onChange={(e) => { setWarrantyFilter(e.target.value as "all" | "active"); setCurrentPage(1); }}
            className="pl-10 pr-8 py-2 bg-background border border-input rounded-ui focus:outline-none focus:ring-2 focus:ring-ring text-foreground appearance-none cursor-pointer"
          >
            <option value="all">All Warranties</option>
            <option value="active">Warranty Active Only</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-card border border-border rounded-ui p-12 text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-foreground mb-1">
            No customers found
          </p>
          <p className="text-sm text-muted-foreground">
            {searchQuery || returnFilter !== "all" || warrantyFilter !== "all" || fulfillmentFilter !== "all"
              ? "Try adjusting your search or filters."
              : "Customers will appear here once orders are placed."}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-card border border-border rounded-ui overflow-hidden">
            {/* Table Header — Clickable for sorting */}
            <div className="hidden md:grid md:grid-cols-[2fr_2fr_0.8fr_1fr_1fr_1fr_0.8fr_0.8fr_auto] gap-4 px-6 py-3 bg-muted/50 border-b border-border text-sm font-medium text-muted-foreground">
              <button onClick={() => handleSort("name")} className="flex items-center gap-1 hover:text-foreground transition-colors text-left cursor-pointer">
                Customer <SortIcon field="name" activeField={sortField} dir={sortDir} />
              </button>
              <button onClick={() => handleSort("email")} className="flex items-center gap-1 hover:text-foreground transition-colors text-left cursor-pointer">
                Email <SortIcon field="email" activeField={sortField} dir={sortDir} />
              </button>
              <button onClick={() => handleSort("orders")} className="flex items-center gap-1 hover:text-foreground transition-colors text-left cursor-pointer">
                Orders <SortIcon field="orders" activeField={sortField} dir={sortDir} />
              </button>
              <button onClick={() => handleSort("spent")} className="flex items-center gap-1 hover:text-foreground transition-colors text-left cursor-pointer">
                Total Spent <SortIcon field="spent" activeField={sortField} dir={sortDir} />
              </button>
              <button onClick={() => handleSort("lastOrder")} className="flex items-center gap-1 hover:text-foreground transition-colors text-left cursor-pointer">
                Last Order <SortIcon field="lastOrder" activeField={sortField} dir={sortDir} />
              </button>
              <span>Fulfillment</span>
              <span>Return</span>
              <span>Warranty</span>
              <span className="w-9" />
            </div>

            {/* Table Rows */}
            {paginatedCustomers.map((customer) => {
              const now = Date.now();
              const hasReturnable = customer.orders.some(
                (o) =>
                  o.deliveredAt &&
                  new Date(o.deliveredAt).getTime() + 30 * 24 * 60 * 60 * 1000 > now
              );
              const hasWarranty = customer.orders.some(
                (o) =>
                  o.warrantyExpiresAt &&
                  new Date(o.warrantyExpiresAt).getTime() > now
              );
              const fulfillment = getFulfillmentStatus(customer.orders);

              // Tooltip stats
              const statusCounts: Partial<Record<OrderStatus, number>> = {};
              for (const o of customer.orders) {
                statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
              }

              const isExpanded = expandedEmail === customer.email;

              return (
                <div
                  key={customer.email}
                  className={`border-b border-border last:border-b-0 ${isExpanded ? "bg-muted/10" : ""}`}
                >
                  {/* Row */}
                  <div
                    className={`grid grid-cols-1 md:grid-cols-[2fr_2fr_0.8fr_1fr_1fr_1fr_0.8fr_0.8fr_auto] gap-4 px-6 py-4 items-center cursor-pointer transition-colors ${isExpanded ? "bg-primary/5 border-l-3 border-l-primary" : "hover:bg-muted/30"}`}
                    onClick={() => toggleExpand(customer.email)}
                  >
                    {/* Customer name with tooltip */}
                    <div
                      className="relative"
                      onMouseEnter={() => setHoveredEmail(customer.email)}
                      onMouseLeave={() => setHoveredEmail(null)}
                    >
                      <span className="font-medium text-foreground">
                        {customer.firstName} {customer.lastName}
                      </span>
                      {hoveredEmail === customer.email && (
                        <div className="absolute left-0 top-full mt-2 z-50 w-64 bg-popover border border-border rounded-ui shadow-lg p-3 text-sm pointer-events-none">
                          <p className="font-semibold text-foreground mb-2">Quick Stats</p>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Orders</span>
                              <span className="text-foreground">{customer.totalOrders}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Total Spent</span>
                              <span className="text-foreground font-medium">{formatCents(customer.totalSpent)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Avg Order</span>
                              <span className="text-foreground">{formatCents(Math.round(customer.totalSpent / customer.totalOrders))}</span>
                            </div>
                            <div className="border-t border-border pt-1 mt-1">
                              <p className="text-muted-foreground mb-1">Order Breakdown</p>
                              {(Object.entries(statusCounts) as [OrderStatus, number][]).map(([status, count]) => (
                                <div key={status} className="flex justify-between">
                                  <span className="text-muted-foreground">{STATUS_LABELS[status]}</span>
                                  <span className="text-foreground">{count}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <span className="text-muted-foreground truncate">
                      {customer.email}
                    </span>
                    <span className="text-foreground">
                      {customer.totalOrders}
                    </span>
                    <span className="font-medium text-foreground">
                      {formatCents(customer.totalSpent)}
                    </span>
                    <span className="text-foreground">
                      {formatDate(customer.lastOrderDate)}
                    </span>
                    <span>
                      {fulfillment !== "none" ? (
                        <Badge className={`${FULFILLMENT_BADGE[fulfillment].className} border-none`}>
                          {FULFILLMENT_BADGE[fulfillment].label}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </span>
                    <span>
                      {hasReturnable ? (
                        <Badge className="bg-green-100 text-green-700 border-none">Active</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </span>
                    <span>
                      {hasWarranty ? (
                        <Badge className="bg-green-100 text-green-700 border-none">Active</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(customer.email);
                      }}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  {/* Expanded Detail Panel */}
                  {isExpanded && (
                    <div className="px-6 pb-6 pt-4 bg-muted/40 border-t border-border border-l-3 border-l-primary">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Contact Details */}
                        <div className="bg-card border border-border rounded-ui p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <User className="w-4 h-4 text-primary" />
                            <h3 className="font-semibold text-foreground">
                              Contact Details
                            </h3>
                          </div>
                          <div className="space-y-1 text-sm">
                            <p className="text-foreground">
                              {customer.firstName} {customer.lastName}
                            </p>
                            <p className="text-muted-foreground">
                              {customer.email}
                            </p>
                            {customer.phoneNumber && (
                              <p className="text-muted-foreground">
                                {customer.phoneNumber}
                              </p>
                            )}
                          </div>
                          <a
                            href={`mailto:${customer.email}`}
                            className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-ui transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Mail className="w-3.5 h-3.5" />
                            Send Email
                          </a>
                        </div>

                        {/* Address */}
                        <div className="bg-card border border-border rounded-ui p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <MapPin className="w-4 h-4 text-primary" />
                            <h3 className="font-semibold text-foreground">
                              Address
                            </h3>
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            {customer.addressLine1 ? (
                              <>
                                <p>{customer.addressLine1}</p>
                                {customer.addressLine2 && (
                                  <p>{customer.addressLine2}</p>
                                )}
                                <p>
                                  {customer.city}, {customer.state}{" "}
                                  {customer.zip}
                                </p>
                                <p>{customer.country}</p>
                              </>
                            ) : (
                              <p>No address available</p>
                            )}
                          </div>
                        </div>

                        {/* Customer Summary */}
                        <div className="bg-card border border-border rounded-ui p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <ShoppingCart className="w-4 h-4 text-primary" />
                            <h3 className="font-semibold text-foreground">
                              Customer Summary
                            </h3>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Total Orders
                              </span>
                              <span className="text-foreground">
                                {customer.totalOrders}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Total Spent
                              </span>
                              <span className="text-foreground font-medium">
                                {formatCents(customer.totalSpent)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Avg Order Value
                              </span>
                              <span className="text-foreground">
                                {formatCents(
                                  Math.round(
                                    customer.totalSpent / customer.totalOrders
                                  )
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                First Order
                              </span>
                              <span className="text-foreground">
                                {formatDate(customer.firstOrderDate)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Last Order
                              </span>
                              <span className="text-foreground">
                                {formatDate(customer.lastOrderDate)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Order History */}
                        <div className="lg:col-span-2 bg-card border border-border rounded-ui p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Package className="w-4 h-4 text-primary" />
                            <h3 className="font-semibold text-foreground">
                              Order History
                            </h3>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-border text-muted-foreground">
                                  <th className="text-left py-2 pr-4 font-medium">
                                    Order #
                                  </th>
                                  <th className="text-left py-2 pr-4 font-medium">
                                    Date
                                  </th>
                                  <th className="text-left py-2 pr-4 font-medium">
                                    Status
                                  </th>
                                  <th className="text-right py-2 pr-4 font-medium">
                                    Amount
                                  </th>
                                  <th className="text-left py-2 pr-4 font-medium">
                                    Flags
                                  </th>
                                  <th className="text-left py-2 font-medium">
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {customer.orders.map((order) => (
                                  <tr
                                    key={order.id}
                                    className="border-b border-border last:border-b-0"
                                  >
                                    <td className="py-2 pr-4 font-medium">
                                      <Link
                                        href={`/admin/order?orderId=${order.id}`}
                                        className="text-primary hover:underline"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        {order.orderNumber}
                                      </Link>
                                    </td>
                                    <td className="py-2 pr-4 text-foreground">
                                      {formatDate(order.createdAt)}
                                    </td>
                                    <td className="py-2 pr-4">
                                      <Badge
                                        className={`${
                                          STATUS_COLORS[order.status]
                                        } border-none`}
                                      >
                                        {STATUS_LABELS[order.status]}
                                      </Badge>
                                    </td>
                                    <td className="py-2 pr-4 text-right font-medium text-foreground">
                                      {formatCents(order.totalAmount)}
                                    </td>
                                    <td className="py-2">
                                      <div className="flex gap-1">
                                        {order.warrantyClaims.length > 0 && (
                                          <Badge className="bg-orange-100 text-orange-700 border-none text-xs">
                                            Warranty
                                          </Badge>
                                        )}
                                        {order.returnRequestedAt && (
                                          <Badge className="bg-red-100 text-red-700 border-none text-xs">
                                            Return
                                          </Badge>
                                        )}
                                      </div>
                                    </td>
                                    <td className="py-2">
                                      <Link
                                        href={`/admin/order?orderId=${order.id}`}
                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                      </Link>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredCustomers.length)} of {filteredCustomers.length} customers
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon-sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    if (totalPages <= 7) return true;
                    if (page === 1 || page === totalPages) return true;
                    if (Math.abs(page - currentPage) <= 1) return true;
                    return false;
                  })
                  .reduce<(number | "ellipsis")[]>((acc, page, idx, arr) => {
                    if (idx > 0 && page - (arr[idx - 1] as number) > 1) {
                      acc.push("ellipsis");
                    }
                    acc.push(page);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === "ellipsis" ? (
                      <span key={`e-${idx}`} className="px-2 text-muted-foreground text-sm">...</span>
                    ) : (
                      <Button
                        key={item}
                        variant={currentPage === item ? "default" : "outline"}
                        size="icon-sm"
                        onClick={() => setCurrentPage(item)}
                      >
                        {item}
                      </Button>
                    )
                  )}
                <Button
                  variant="outline"
                  size="icon-sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

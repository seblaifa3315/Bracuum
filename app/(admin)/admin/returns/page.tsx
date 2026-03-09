"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Package,
  Clock,
  DollarSign,
  User,
  Mail,
  CheckCircle,
  AlertCircle,
  Filter,
} from "lucide-react";
import Link from "next/link";

// ─── Types ───────────────────────────────────────────────────────────
type OrderStatus =
  | "RETURN_REQUESTED"
  | "RETURN_RECEIVED"
  | "REFUNDED";

interface ReturnOrder {
  id: string;
  orderNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  quantity: number;
  totalAmount: number;
  status: OrderStatus;
  returnRequestedAt: string | null;
  returnReceivedAt: string | null;
  refundedAt: string | null;
  returnReason: string | null;
  returnCustomerNote: string | null;
  deliveredAt: string | null;
  stripePaymentIntentId: string | null;
  createdAt: string;
}

type TabFilter = "ALL" | "RETURN_REQUESTED" | "RETURN_RECEIVED" | "REFUNDED";

// ─── Helpers ─────────────────────────────────────────────────────────
const STATUS_LABELS: Record<OrderStatus, string> = {
  RETURN_REQUESTED: "Pending Return",
  RETURN_RECEIVED: "Received",
  REFUNDED: "Refunded",
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  RETURN_REQUESTED: "bg-orange-100 text-orange-700",
  RETURN_RECEIVED: "bg-blue-100 text-blue-700",
  REFUNDED: "bg-gray-100 text-gray-600",
};

const REASON_LABELS: Record<string, string> = {
  CHANGED_MIND: "Changed mind",
  DEFECTIVE: "Defective",
  NOT_AS_DESCRIBED: "Not as described",
  OTHER: "Other",
};

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "\u2014";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return "\u2014";
  return new Date(dateStr).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// ─── Component ───────────────────────────────────────────────────────
export default function ReturnsAdminPage() {
  const [returns, setReturns] = useState<ReturnOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [tabFilter, setTabFilter] = useState<TabFilter>("ALL");

  // Action states
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [confirmAction, setConfirmAction] = useState<{
    orderId: string;
    action: string;
    label: string;
  } | null>(null);

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/returns");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch returns");
      setReturns(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch returns");
    } finally {
      setLoading(false);
    }
  };

  // ─── Filtering ─────────────────────────────────────────────────────
  const filteredReturns = useMemo(() => {
    if (tabFilter === "ALL") return returns;
    return returns.filter((r) => r.status === tabFilter);
  }, [returns, tabFilter]);

  // ─── Stats ─────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const pending = returns.filter((r) => r.status === "RETURN_REQUESTED").length;
    const received = returns.filter((r) => r.status === "RETURN_RECEIVED").length;
    const refunded = returns.filter((r) => r.status === "REFUNDED").length;
    return { pending, received, refunded };
  }, [returns]);

  // ─── Action Handler ────────────────────────────────────────────────
  const handleAction = async (orderId: string, action: string) => {
    setActionLoading(orderId);
    setActionError("");
    setActionSuccess("");
    setConfirmAction(null);

    try {
      const res = await fetch(`/api/admin/returns/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");

      // Update local state
      setReturns((prev) =>
        prev.map((r) => (r.id === orderId ? data.data : r))
      );

      const successMessages: Record<string, string> = {
        mark_received: "Marked as received",
        issue_refund: "Refund initiated",
      };
      setActionSuccess(successMessages[action] || "Action completed");
      setTimeout(() => setActionSuccess(""), 3000);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Action failed"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
    setConfirmAction(null);
    setActionError("");
  };

  // ─── Loading State ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="w-full bg-background p-8 overflow-y-auto">
        <div className="mb-8">
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-72" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-14 w-full mb-2" />
        ))}
      </div>
    );
  }

  // ─── Error State ───────────────────────────────────────────────────
  if (error) {
    return (
      <div className="w-full bg-background p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Returns</h1>
          <p className="text-muted-foreground">Manage customer returns and refunds</p>
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
        <h1 className="text-3xl font-bold text-foreground mb-2">Returns</h1>
        <p className="text-muted-foreground">Manage customer returns and refunds</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-card border border-border rounded-ui p-6">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-orange-600" />
            <div>
              <p className="text-sm text-muted-foreground">Pending Review</p>
              <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-ui p-6">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground">Received (Awaiting Refund)</p>
              <p className="text-2xl font-bold text-foreground">{stats.received}</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-ui p-6">
          <div className="flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-sm text-muted-foreground">Refunded</p>
              <p className="text-2xl font-bold text-foreground">{stats.refunded}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-4 h-4 text-muted-foreground" />
        {(
          [
            { key: "ALL", label: "All" },
            { key: "RETURN_REQUESTED", label: "Pending" },
            { key: "RETURN_RECEIVED", label: "Received" },
            { key: "REFUNDED", label: "Refunded" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setTabFilter(tab.key)}
            className={`px-3 py-1.5 text-sm rounded-ui transition-colors cursor-pointer ${
              tabFilter === tab.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {tab.label}
            {tab.key !== "ALL" && (
              <span className="ml-1.5 opacity-75">
                {tab.key === "RETURN_REQUESTED"
                  ? stats.pending
                  : tab.key === "RETURN_RECEIVED"
                  ? stats.received
                  : stats.refunded}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Success / Error messages */}
      {actionSuccess && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-600 px-4 py-3 rounded-ui mb-4">
          {actionSuccess}
        </div>
      )}
      {actionError && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-ui mb-4">
          {actionError}
        </div>
      )}

      {/* Returns Table */}
      {filteredReturns.length === 0 ? (
        <div className="bg-card border border-border rounded-ui p-12 text-center">
          <RotateCcw className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-foreground mb-1">No returns found</p>
          <p className="text-sm text-muted-foreground">
            {tabFilter !== "ALL"
              ? "Try selecting a different filter."
              : "Return requests will appear here when customers submit them."}
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-ui overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid md:grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 bg-muted/50 border-b border-border text-sm font-medium text-muted-foreground">
            <span>Order #</span>
            <span>Customer</span>
            <span>Reason</span>
            <span>Requested</span>
            <span>Status</span>
            <span>Amount</span>
            <span className="w-9" />
          </div>

          {/* Table Rows */}
          {filteredReturns.map((order) => {
            const isExpanded = expandedId === order.id;
            return (
              <div
                key={order.id}
                className={`border-b border-border last:border-b-0 ${
                  isExpanded ? "bg-muted/10" : ""
                }`}
              >
                {/* Row */}
                <div
                  className={`grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 items-center cursor-pointer transition-colors ${
                    isExpanded
                      ? "bg-primary/5 border-l-3 border-l-primary"
                      : "hover:bg-muted/30"
                  }`}
                  onClick={() => toggleExpand(order.id)}
                >
                  <Link
                    href={`/admin/order?orderId=${order.id}`}
                    className="font-medium text-foreground hover:text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {order.orderNumber}
                  </Link>
                  <div className="min-w-0">
                    <Link
                      href={`/admin/customers?email=${encodeURIComponent(order.email)}`}
                      className="text-foreground hover:text-primary hover:underline truncate block"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {order.firstName} {order.lastName}
                    </Link>
                    <p className="text-sm text-muted-foreground truncate">
                      {order.email}
                    </p>
                  </div>
                  <span className="text-foreground text-sm">
                    {order.returnReason
                      ? REASON_LABELS[order.returnReason] || order.returnReason
                      : "\u2014"}
                  </span>
                  <span className="text-foreground text-sm">
                    {formatDate(order.returnRequestedAt)}
                  </span>
                  <div>
                    <Badge
                      className={`${
                        STATUS_COLORS[order.status as OrderStatus]
                      } border-none`}
                    >
                      {STATUS_LABELS[order.status as OrderStatus]}
                    </Badge>
                  </div>
                  <span className="font-medium text-foreground">
                    {formatCents(order.totalAmount)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(order.id);
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
                      {/* Customer Info */}
                      <div className="bg-card border border-border rounded-ui p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-primary" />
                            <h3 className="font-semibold text-foreground">
                              Customer Info
                            </h3>
                          </div>
                          <Link
                            href={`/admin/order?orderId=${order.id}`}
                            className="text-xs text-muted-foreground hover:text-primary transition-colors"
                          >
                            View Order
                          </Link>
                        </div>
                        <div className="space-y-1 text-sm">
                          <p className="text-foreground">
                            {order.firstName} {order.lastName}
                          </p>
                          <p className="text-muted-foreground">{order.email}</p>
                          {order.phoneNumber && (
                            <p className="text-muted-foreground">
                              {order.phoneNumber}
                            </p>
                          )}
                        </div>
                        <a
                          href={`mailto:${order.email}`}
                          className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-ui transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          Send Email
                        </a>
                      </div>

                      {/* Return Details */}
                      <div className="bg-card border border-border rounded-ui p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <RotateCcw className="w-4 h-4 text-primary" />
                          <h3 className="font-semibold text-foreground">
                            Return Details
                          </h3>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Reason</span>
                            <span className="text-foreground">
                              {order.returnReason
                                ? REASON_LABELS[order.returnReason] ||
                                  order.returnReason
                                : "\u2014"}
                            </span>
                          </div>
                          {order.returnCustomerNote && (
                            <div>
                              <span className="text-muted-foreground block mb-1">
                                Customer Note
                              </span>
                              <p className="text-foreground bg-muted/50 rounded-ui p-2 text-sm">
                                {order.returnCustomerNote}
                              </p>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Order Total
                            </span>
                            <span className="text-foreground font-medium">
                              {formatCents(order.totalAmount)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="bg-card border border-border rounded-ui p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Clock className="w-4 h-4 text-primary" />
                          <h3 className="font-semibold text-foreground">
                            Timeline
                          </h3>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Order placed
                            </span>
                            <span className="text-foreground">
                              {formatDateTime(order.createdAt)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Delivered
                            </span>
                            <span className="text-foreground">
                              {formatDate(order.deliveredAt)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Return requested
                            </span>
                            <span className="text-foreground">
                              {formatDateTime(order.returnRequestedAt)}
                            </span>
                          </div>
                          {order.returnReceivedAt && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Return received
                              </span>
                              <span className="text-foreground">
                                {formatDateTime(order.returnReceivedAt)}
                              </span>
                            </div>
                          )}
                          {order.refundedAt && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Refunded
                              </span>
                              <span className="text-foreground">
                                {formatDateTime(order.refundedAt)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="bg-card border border-border rounded-ui p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <AlertCircle className="w-4 h-4 text-primary" />
                          <h3 className="font-semibold text-foreground">
                            Actions
                          </h3>
                        </div>

                        {order.status === "RETURN_REQUESTED" && (
                          <div className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                              Waiting for the customer to ship the product back.
                            </p>
                            {confirmAction?.orderId === order.id &&
                            confirmAction.action === "mark_received" ? (
                              <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">
                                  Confirm you&apos;ve received this return?
                                </p>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() =>
                                      handleAction(order.id, "mark_received")
                                    }
                                    disabled={actionLoading === order.id}
                                    size="sm"
                                    className="flex-1"
                                  >
                                    {actionLoading === order.id ? (
                                      "Processing..."
                                    ) : (
                                      <>
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                        Confirm
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    onClick={() => setConfirmAction(null)}
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <Button
                                onClick={() =>
                                  setConfirmAction({
                                    orderId: order.id,
                                    action: "mark_received",
                                    label: "Mark Received",
                                  })
                                }
                                className="w-full"
                                size="sm"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Mark as Received
                              </Button>
                            )}
                          </div>
                        )}

                        {order.status === "RETURN_RECEIVED" && (
                          <div className="space-y-3">
                            {confirmAction?.orderId === order.id &&
                            confirmAction.action === "issue_refund" ? (
                              <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">
                                  Issue a full refund of{" "}
                                  <strong>
                                    {formatCents(order.totalAmount)}
                                  </strong>{" "}
                                  via Stripe?
                                </p>
                                {!order.stripePaymentIntentId && (
                                  <p className="text-sm text-destructive">
                                    No payment intent found. Refund cannot be processed automatically.
                                  </p>
                                )}
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() =>
                                      handleAction(order.id, "issue_refund")
                                    }
                                    disabled={
                                      actionLoading === order.id ||
                                      !order.stripePaymentIntentId
                                    }
                                    size="sm"
                                    className="flex-1"
                                  >
                                    {actionLoading === order.id ? (
                                      "Processing..."
                                    ) : (
                                      <>
                                        <DollarSign className="w-4 h-4 mr-1" />
                                        Confirm Refund
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    onClick={() => setConfirmAction(null)}
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <Button
                                onClick={() =>
                                  setConfirmAction({
                                    orderId: order.id,
                                    action: "issue_refund",
                                    label: "Issue Refund",
                                  })
                                }
                                className="w-full"
                                size="sm"
                              >
                                <DollarSign className="w-4 h-4 mr-1" />
                                Issue Refund
                              </Button>
                            )}
                          </div>
                        )}

                        {order.status === "REFUNDED" && (
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            Refund completed
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

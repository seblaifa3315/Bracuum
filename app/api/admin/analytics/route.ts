import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma/prisma';

const REVENUE_STATUSES = ['PAID', 'SHIPPED', 'DELIVERED'] as const;

function daysBetween(a: Date, b: Date): number {
  return Math.abs(b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24);
}

function toDateKey(d: Date): string {
  return d.toISOString().split('T')[0];
}

export async function GET(req: NextRequest) {
  try {
    // Auth check
    const supabase = await createClient();
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = session.user?.user_metadata?.role === 'admin';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse query params
    const { searchParams } = new URL(req.url);
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');

    if (!fromParam || !toParam) {
      return NextResponse.json({ error: 'Missing from/to parameters' }, { status: 400 });
    }

    const from = new Date(fromParam);
    const to = new Date(toParam);
    // Set 'to' to end of day
    to.setHours(23, 59, 59, 999);

    const durationMs = to.getTime() - from.getTime();
    const prevFrom = new Date(from.getTime() - durationMs);
    const prevTo = new Date(from.getTime() - 1);

    // Fetch current period orders
    const currentOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: from, lte: to },
      },
      include: { warrantyClaims: true },
    });

    // Fetch previous period orders
    const prevOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: prevFrom, lte: prevTo },
      },
    });

    // Fetch warranty claims in period (by claimedAt, not order createdAt)
    const warrantyClaims = await prisma.warrantyClaim.findMany({
      where: {
        claimedAt: { gte: from, lte: to },
      },
    });

    // ─── KPIs (only revenue-qualifying orders) ───
    const revenueOrders = currentOrders.filter(o =>
      REVENUE_STATUSES.includes(o.status as typeof REVENUE_STATUSES[number])
    );
    const prevRevenueOrders = prevOrders.filter(o =>
      REVENUE_STATUSES.includes(o.status as typeof REVENUE_STATUSES[number])
    );

    const grossRevenue = revenueOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const taxCollected = revenueOrders.reduce((sum, o) => sum + o.taxAmount, 0);
    const stripeFees = revenueOrders.reduce((sum, o) => sum + (o.stripeFee ?? 0), 0);
    const netRevenue = grossRevenue - taxCollected - stripeFees;

    const prevGrossRevenue = prevRevenueOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const prevTaxCollected = prevRevenueOrders.reduce((sum, o) => sum + o.taxAmount, 0);
    const prevStripeFees = prevRevenueOrders.reduce((sum, o) => sum + (o.stripeFee ?? 0), 0);
    const prevNetRevenue = prevGrossRevenue - prevTaxCollected - prevStripeFees;

    // ─── Revenue over time (daily) ───
    const revenueMap = new Map<string, { revenue: number; orderCount: number; quantitySold: number }>();
    for (const o of revenueOrders) {
      const key = toDateKey(o.createdAt);
      const existing = revenueMap.get(key) || { revenue: 0, orderCount: 0, quantitySold: 0 };
      existing.revenue += o.totalAmount;
      existing.orderCount += 1;
      existing.quantitySold += o.quantity;
      revenueMap.set(key, existing);
    }

    // Fill in missing days
    const revenueOverTime: { date: string; revenue: number; orderCount: number; quantitySold: number }[] = [];
    const cursor = new Date(from);
    while (cursor <= to) {
      const key = toDateKey(cursor);
      const data = revenueMap.get(key) || { revenue: 0, orderCount: 0, quantitySold: 0 };
      revenueOverTime.push({ date: key, ...data });
      cursor.setDate(cursor.getDate() + 1);
    }

    // ─── Orders by status ───
    const statusMap = new Map<string, number>();
    for (const o of currentOrders) {
      statusMap.set(o.status, (statusMap.get(o.status) || 0) + 1);
    }
    const ordersByStatus = Array.from(statusMap.entries()).map(([status, count]) => ({
      status,
      count,
    }));

    // ─── Returns & warranty ───
    const deliveredOrders = currentOrders.filter(o => o.deliveredAt);
    const returnOrders = currentOrders.filter(o => o.returnRequestedAt);

    const totalDelivered = deliveredOrders.length;
    const returnRequests = returnOrders.length;
    const returnRate = totalDelivered > 0 ? returnRequests / totalDelivered : 0;

    const warrantyClaimCount = warrantyClaims.length;
    const warrantyClaimRate = totalDelivered > 0 ? warrantyClaimCount / totalDelivered : 0;

    // Avg days to return request (from delivery)
    const returnDays: number[] = [];
    for (const o of returnOrders) {
      if (o.deliveredAt && o.returnRequestedAt) {
        returnDays.push(daysBetween(o.deliveredAt, o.returnRequestedAt));
      }
    }
    const avgDaysToReturnRequest = returnDays.length > 0
      ? Math.round((returnDays.reduce((a, b) => a + b, 0) / returnDays.length) * 10) / 10
      : null;

    // Warranty by reason
    const reasonMap = new Map<string, number>();
    for (const c of warrantyClaims) {
      const reason = c.reason || 'OTHER';
      reasonMap.set(reason, (reasonMap.get(reason) || 0) + 1);
    }
    const warrantyByReason = Array.from(reasonMap.entries()).map(([reason, count]) => ({
      reason,
      count,
    }));

    // ─── Shipping & fulfillment ───
    const shippedOrders = currentOrders.filter(o => o.shippedAt);
    const deliveredWithShip = currentOrders.filter(o => o.shippedAt && o.deliveredAt);

    const fulfillmentDays: number[] = [];
    for (const o of shippedOrders) {
      if (o.shippedAt) {
        fulfillmentDays.push(daysBetween(o.createdAt, o.shippedAt));
      }
    }
    const avgFulfillmentDays = fulfillmentDays.length > 0
      ? Math.round((fulfillmentDays.reduce((a, b) => a + b, 0) / fulfillmentDays.length) * 10) / 10
      : null;

    const deliveryDays: number[] = [];
    for (const o of deliveredWithShip) {
      if (o.shippedAt && o.deliveredAt) {
        deliveryDays.push(daysBetween(o.shippedAt, o.deliveredAt));
      }
    }
    const avgDeliveryDays = deliveryDays.length > 0
      ? Math.round((deliveryDays.reduce((a, b) => a + b, 0) / deliveryDays.length) * 10) / 10
      : null;

    const carrierMap = new Map<string, number>();
    for (const o of shippedOrders) {
      const carrier = o.carrier || 'Unknown';
      carrierMap.set(carrier, (carrierMap.get(carrier) || 0) + 1);
    }
    const ordersByCarrier = Array.from(carrierMap.entries()).map(([carrier, count]) => ({
      carrier,
      count,
    }));

    return NextResponse.json({
      success: true,
      data: {
        kpi: {
          grossRevenue,
          taxCollected,
          stripeFees,
          netRevenue,
          prevGrossRevenue,
          prevTaxCollected,
          prevStripeFees,
          prevNetRevenue,
        },
        revenueOverTime,
        ordersByStatus,
        returnsAndWarranty: {
          totalDelivered,
          returnRequests,
          returnRate,
          warrantyClaims: warrantyClaimCount,
          warrantyClaimRate,
          avgDaysToReturnRequest,
          warrantyByReason,
        },
        shippingAndFulfillment: {
          avgFulfillmentDays,
          avgDeliveryDays,
          ordersByCarrier,
        },
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

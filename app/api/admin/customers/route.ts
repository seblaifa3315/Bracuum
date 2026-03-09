import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma/prisma';

interface CustomerAggregate {
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
  orders: unknown[];
}

export async function GET(req: NextRequest) {
  try {
    // Auth check
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = user.user_metadata?.role === 'admin';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse query params
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');

    // Build where clause
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        warrantyClaims: true,
      },
    });

    // Group by email
    const customerMap = new Map<string, CustomerAggregate>();

    for (const order of orders) {
      const key = order.email.toLowerCase();
      const existing = customerMap.get(key);

      if (existing) {
        existing.totalOrders += 1;
        existing.totalSpent += order.totalAmount;
        // First order date is the oldest (last in desc-sorted list)
        existing.firstOrderDate = order.createdAt.toISOString();
        existing.orders.push(order);
      } else {
        // Most recent order (first encountered since sorted desc) provides contact info
        customerMap.set(key, {
          email: order.email,
          firstName: order.firstName,
          lastName: order.lastName,
          phoneNumber: order.phoneNumber,
          addressLine1: order.addressLine1,
          addressLine2: order.addressLine2,
          city: order.city,
          state: order.state,
          zip: order.zip,
          country: order.country,
          totalOrders: 1,
          totalSpent: order.totalAmount,
          firstOrderDate: order.createdAt.toISOString(),
          lastOrderDate: order.createdAt.toISOString(),
          orders: [order],
        });
      }
    }

    const customers = Array.from(customerMap.values());

    return NextResponse.json({ success: true, data: customers });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

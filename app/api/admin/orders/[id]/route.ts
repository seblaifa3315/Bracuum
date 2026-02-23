import { NextRequest, NextResponse } from 'next/server';
import { after } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma/prisma';
import { sendShippingConfirmation, sendDeliveryConfirmation } from '@/lib/email';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Parse body
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    // Fetch current order
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const { status, trackingNumber, carrier, shippingMethod, shippingNotes, shippedAt, deliveredAt } = body as {
      status?: string;
      trackingNumber?: string;
      carrier?: string;
      shippingMethod?: string;
      shippingNotes?: string;
      shippedAt?: string;
      deliveredAt?: string;
    };

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (status === 'SHIPPED') {
      // Can only ship a PAID order
      if (order.status !== 'PAID') {
        return NextResponse.json(
          { error: 'Can only mark PAID orders as shipped' },
          { status: 400 }
        );
      }
      updateData.status = 'SHIPPED';
      updateData.shippedAt = shippedAt
        ? new Date(shippedAt + 'T12:00:00Z')
        : new Date();

      if (trackingNumber && typeof trackingNumber === 'string') {
        updateData.trackingNumber = trackingNumber.trim();
      }
      if (carrier && typeof carrier === 'string') {
        updateData.carrier = carrier.trim();
      }
      if (shippingMethod && typeof shippingMethod === 'string') {
        updateData.shippingMethod = shippingMethod.trim();
      }
      if (shippingNotes && typeof shippingNotes === 'string') {
        updateData.shippingNotes = shippingNotes.trim();
      }
    } else if (status) {
      // Generic status update — validate the status value
      const validStatuses = [
        'NEW', 'PREORDER_PLACED', 'PREORDER_WAITING', 'PAID',
        'SHIPPED', 'DELIVERED', 'RETURN_REQUESTED', 'RETURN_RECEIVED', 'REFUNDED', 'CANCELLED',
      ];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      updateData.status = status;
    }

    // Mark as delivered
    if (deliveredAt && typeof deliveredAt === 'string') {
      if (order.status !== 'SHIPPED') {
        return NextResponse.json(
          { error: 'Can only mark SHIPPED orders as delivered' },
          { status: 400 }
        );
      }
      const deliveredDate = new Date(deliveredAt + 'T12:00:00Z');
      const warrantyExpires = new Date(deliveredDate);
      warrantyExpires.setFullYear(warrantyExpires.getFullYear() + 1);

      updateData.status = 'DELIVERED';
      updateData.deliveredAt = deliveredDate;
      updateData.warrantyExpiresAt = warrantyExpires;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        warrantyClaims: true,
      },
    });

    // Send emails in background
    if (updateData.status === 'SHIPPED') {
      after(async () => {
        try {
          await sendShippingConfirmation({
            orderNumber: updatedOrder.orderNumber,
            firstName: updatedOrder.firstName,
            email: updatedOrder.email,
            carrier: updatedOrder.carrier,
            shippingMethod: updatedOrder.shippingMethod,
            trackingNumber: updatedOrder.trackingNumber,
          });
        } catch (err) {
          console.error('Failed to send shipping email:', err);
        }
      });
    }

    if (updateData.status === 'DELIVERED') {
      after(async () => {
        try {
          await sendDeliveryConfirmation({
            orderNumber: updatedOrder.orderNumber,
            firstName: updatedOrder.firstName,
            email: updatedOrder.email,
          });
        } catch (err) {
          console.error('Failed to send delivery email:', err);
        }
      });
    }

    return NextResponse.json({ success: true, data: updatedOrder });
  } catch (error) {
    console.error('PATCH /api/admin/orders/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

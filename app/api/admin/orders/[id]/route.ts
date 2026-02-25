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
    } else if (status === 'REVERT_TO_PAID') {
      // Revert SHIPPED → PAID: clear all shipping fields
      if (order.status !== 'SHIPPED') {
        return NextResponse.json(
          { error: 'Can only revert SHIPPED orders back to PAID' },
          { status: 400 }
        );
      }
      updateData.status = 'PAID';
      updateData.shippedAt = null;
      updateData.trackingNumber = null;
      updateData.carrier = null;
      updateData.shippingMethod = null;
      updateData.shippingNotes = null;
    } else if (status === 'REVERT_TO_SHIPPED') {
      // Revert DELIVERED → SHIPPED: clear delivery/warranty fields
      if (order.status !== 'DELIVERED') {
        return NextResponse.json(
          { error: 'Can only revert DELIVERED orders back to SHIPPED' },
          { status: 400 }
        );
      }
      updateData.status = 'SHIPPED';
      updateData.deliveredAt = null;
      updateData.warrantyExpiresAt = null;
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

    // Mark as delivered (from SHIPPED) or update delivery date (on DELIVERED)
    if (deliveredAt && typeof deliveredAt === 'string') {
      if (order.status !== 'SHIPPED' && order.status !== 'DELIVERED') {
        return NextResponse.json(
          { error: 'Can only set delivery date on SHIPPED or DELIVERED orders' },
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

    // Edit shipping fields on already shipped/delivered orders (no status change)
    if (!status && !deliveredAt) {
      const isShippedOrDelivered = order.status === 'SHIPPED' || order.status === 'DELIVERED';
      if (isShippedOrDelivered) {
        if (trackingNumber !== undefined) updateData.trackingNumber = typeof trackingNumber === 'string' ? trackingNumber.trim() : null;
        if (carrier !== undefined) updateData.carrier = typeof carrier === 'string' ? carrier.trim() : null;
        if (shippingMethod !== undefined) updateData.shippingMethod = typeof shippingMethod === 'string' ? shippingMethod.trim() : null;
        if (shippingNotes !== undefined) updateData.shippingNotes = typeof shippingNotes === 'string' ? shippingNotes.trim() : null;
        if (shippedAt !== undefined) updateData.shippedAt = shippedAt ? new Date(shippedAt + 'T12:00:00Z') : null;
      }
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

    // Send emails in background (skip for revert actions)
    const isRevert = status === 'REVERT_TO_PAID' || status === 'REVERT_TO_SHIPPED';
    if (updateData.status === 'SHIPPED' && !isRevert) {
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

    if (updateData.status === 'DELIVERED' && !isRevert) {
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

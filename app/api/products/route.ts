import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma/prisma';



export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  // 1️⃣ Supabase session
  const supabase = await createClient();
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error || !session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2️⃣ Admin check
  const user = session.user;
  const isAdmin = user?.user_metadata?.role === 'admin';
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 3️⃣ Parse request body
  let body: Record<string, any>;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // 4️⃣ Validate required fields
  const { name, description, price, sku, isActive, preorderEnabled, preorderDepositAmount } = body;

  // Validate name
  if (typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ error: 'Name is required and must be a non-empty string' }, { status: 400 });
  }
  if (name.length > 255) {
    return NextResponse.json({ error: 'Name must be 255 characters or less' }, { status: 400 });
  }

  // Validate description
  if (typeof description !== 'string' || description.trim().length === 0) {
    return NextResponse.json({ error: 'Description is required and must be a non-empty string' }, { status: 400 });
  }
  if (description.length > 5000) {
    return NextResponse.json({ error: 'Description must be 5000 characters or less' }, { status: 400 });
  }

  // Validate price
  if (typeof price !== 'number' || !Number.isInteger(price) || price < 0) {
    return NextResponse.json({ error: 'Price must be a non-negative integer' }, { status: 400 });
  }
  if (price > 999999999) {
    return NextResponse.json({ error: 'Price exceeds maximum allowed value' }, { status: 400 });
  }

  // Validate optional fields
  if (sku !== undefined && (typeof sku !== 'string' || sku.length > 100)) {
    return NextResponse.json({ error: 'SKU must be a string of 100 characters or less' }, { status: 400 });
  }
  if (isActive !== undefined && typeof isActive !== 'boolean') {
    return NextResponse.json({ error: 'isActive must be a boolean' }, { status: 400 });
  }
  if (preorderEnabled !== undefined && typeof preorderEnabled !== 'boolean') {
    return NextResponse.json({ error: 'preorderEnabled must be a boolean' }, { status: 400 });
  }
  if (preorderDepositAmount !== undefined && preorderDepositAmount !== null) {
    if (typeof preorderDepositAmount !== 'number' || !Number.isInteger(preorderDepositAmount) || preorderDepositAmount < 0) {
      return NextResponse.json({ error: 'preorderDepositAmount must be a non-negative integer or null' }, { status: 400 });
    }
  }

  // 5️⃣ Create product in database
  try {
    const newProduct = await prisma.product.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        price,
        sku: sku?.trim() || null,
        isActive: isActive ?? true,
        preorderEnabled: preorderEnabled ?? false,
        preorderDepositAmount: preorderDepositAmount ?? null,
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

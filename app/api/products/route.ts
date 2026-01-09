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
    console.error('GET /api/products error:', error);
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
  const { name, description, price } = body;
  if (!name || !description || price === undefined) {
    return NextResponse.json(
      { error: 'Missing required fields: name, description, price' },
      { status: 400 }
    );
  }

  // 5️⃣ Create product in database
  try {
    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price,
        sku: body.sku || null,
        isActive: body.isActive !== undefined ? body.isActive : true,
        preorderEnabled: body.preorderEnabled || false,
        preorderDepositAmount: body.preorderDepositAmount || null,
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (err) {
    console.error('Prisma create error:', err);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

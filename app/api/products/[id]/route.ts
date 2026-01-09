import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma/prisma';

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  // ✅ Unwrap params in case it's a Promise
  const resolvedParams = await context.params;
  const productId = resolvedParams.id;

  // 1️⃣ Supabase session
  const supabase = await createClient();
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error || !session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2️⃣ Admin check
  const user = session.user;
  console.log('Supabase user:', user);

  const isAdmin = user?.user_metadata?.role === 'admin';
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 3️⃣ Parse PATCH fields from request body
  let body: Record<string, any>;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // 4️⃣ Update product in database
  try {
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: body, // body can contain one or multiple fields
    });

    return NextResponse.json(updatedProduct);
  } catch (err) {
    console.error('Prisma update error:', err);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

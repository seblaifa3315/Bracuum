import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma/prisma'

export async function GET(req: NextRequest) {
  try {
    // Auth check
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = user.user_metadata?.role === 'admin'
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse query params
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    // Build where clause — only return-related statuses
    const returnStatuses = ['RETURN_REQUESTED', 'RETURN_RECEIVED', 'REFUNDED', 'RETURN_DENIED'] as const
    const where: Record<string, unknown> = {
      status: status && returnStatuses.includes(status as typeof returnStatuses[number])
        ? status
        : { in: returnStatuses },
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { returnRequestedAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: orders })
  } catch (error) {
    console.error('Failed to fetch returns:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch returns' },
      { status: 500 }
    )
  }
}

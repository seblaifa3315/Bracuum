# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

E-commerce site for a 2-in-1 vacuum & cleaning product (Bracuum).

## Tech Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4
- Prisma 7 + PostgreSQL (via Supabase)
- Supabase Auth
- Stripe (payments)
- shadcn/ui (Radix primitives)
- Framer Motion (animations)

## Commands

```bash
npm run dev           # Start dev server (localhost:3000)
npm run build         # Production build
npm run lint          # ESLint
npx prisma generate   # Generate Prisma client (outputs to generated/prisma)
npx prisma db push    # Push schema to database
npx prisma migrate dev --name <name>  # Create migration
```

## Project Structure

```
app/
  (admin)/       # Admin dashboard (protected)
  (public)/      # Public landing page
  api/           # API routes (route.ts handlers)
  auth/          # Auth pages (login, forgot-password)
components/
  admin/         # Admin-specific components
  auth/          # Auth forms and components
  public/        # Landing page sections (Hero, Features, Footer)
  ui/            # shadcn/ui components
lib/
  prisma/prisma.ts   # Prisma singleton client
  supabase/          # Supabase clients (client.ts, server.ts)
  utils.ts           # cn() helper for classNames
prisma/
  schema.prisma      # Database schema
```

## Key Patterns

### Database Access
Import Prisma from the singleton: `import { prisma } from '@/lib/prisma/prisma'`

### Auth
- Server components: `import { createClient } from '@/lib/supabase/server'` (always create new instance per request)
- Client components: `import { createClient } from '@/lib/supabase/client'`

### Styling
- Use `cn()` from `lib/utils.ts` for conditional classNames
- Fonts: Poppins (body), Orbitron (branding via `--font-orbitron`)
- Light mode only (no dark mode)

## Conventions

- Prices stored in cents (e.g., $100 = 10000)
- API routes: `app/api/<resource>/route.ts` with GET/POST handlers
- UI components follow shadcn pattern in `components/ui/`

## Database Models

- **Product**: Catalog items with pre-order support (`preorderEnabled`, `preorderDepositAmount`)
- **Order**: Full order lifecycle with Stripe integration, shipping, returns, warranty tracking
- **OrderStatus**: NEW, PREORDER_PLACED, PREORDER_WAITING, PAID, SHIPPED, RETURN_REQUESTED, RETURN_RECEIVED, REFUNDED, CANCELLED
- **WarrantyClaim**: Post-purchase warranty handling (one claim per order)

## Environment Variables

Required in `.env`:
- `DATABASE_URL` - Supabase pooled connection (port 6543)
- `DIRECT_URL` - Supabase direct connection for migrations (port 5432)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` - Supabase anon key
- `STRIPE_*` - Stripe keys for checkout/webhooks

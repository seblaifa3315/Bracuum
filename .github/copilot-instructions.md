## Purpose

This file gives concise, repo-specific instructions to help AI coding agents be productive when modifying or extending the codebase. Focus areas: app architecture, developer workflows, conventions, integration points, and exact file references.

## Quick summary (big picture)

-   Framework: Next.js (App Router) using the `app/` directory layout. Public storefront lives under `app/(public)` and admin pages under `app/(admin)`.
-   DB: Prisma with the schema in `prisma/schema.prisma` and a singleton client at `lib/prisma.ts`.
-   Integrations: Supabase (Postgres) credentials live in `.env` (see `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`), and Stripe is referenced by the schema (expected env keys like `STRIPE_*`).
-   UI: Tailwind CSS with a theme provider (`context/ThemeContext.tsx`, `hooks/useTheme.tsx`, `components/ThemeToggleButton.tsx`).

## Dev / build / common commands

-   Install: `npm install` (repo uses npm; `pnpm`/`yarn` also possible).
-   Dev server: `npm run dev` → starts Next dev on localhost:3000.
-   Build: `npm run build` then `npm run start` for production.
-   Lint: `npm run lint` runs `eslint` as configured.
-   Prisma:
    -   Generate client: `npx prisma generate` (run after editing `prisma/schema.prisma`).
    -   Local migrations: `npx prisma migrate dev --name <name>` (requires a valid `DATABASE_URL` in `.env`).
    -   CI / deploy migrations: `npx prisma migrate deploy`.

## Key files to reference (examples)

-   Next app router entry: `app/(public)/layout.tsx` — wraps the app with `ThemeProvider`.
-   Storefront pages: `app/(public)/page.tsx`, and the product subroutes under `app/(public)/art/[id]/page.tsx` (follow README structure).
-   Admin area: `app/(admin)/...` (login, dashboard, products, orders).
-   API (route handlers): `app/api/*/route.ts` — server-only route handlers for products, cart, checkout, webhooks (stripe).
-   Prisma schema: `prisma/schema.prisma` — models: Product, Cart, CartItem, Order, OrderItem and `OrderStatus` enum.
-   Prisma client: `lib/prisma.ts` — single exported `prisma` instance; import with `import { prisma } from '@/lib/prisma'` (or relative path).

## Project-specific conventions and patterns

-   App Router + nested segments: Public vs admin are organized as parallel segments using `app/(public)` and `app/(admin)`. Keep server-only logic in `app/api/*` route handlers and `lib/` for shared server utilities.
-   Theme handling: Theme state is client-only. The `ThemeProvider` is imported in the root layout (`app/(public)/layout.tsx`) and uses `hooks/useTheme.tsx` to sync with localStorage. Use the exported `useTheme()` hook from `context/ThemeContext.tsx` in client components.
-   Prisma usage: Always import the shared `prisma` instance from `lib/prisma.ts`. If you change models, run `prisma generate` and a migration (dev or deploy). The schema uses arrays (e.g., `images String[]`) and relations (cascading deletes on some relations) — preserve relation fields when editing.
-   Env vars: Secrets are in `.env`. Patterns observed:
    -   `DATABASE_URL` — required for Prisma
    -   `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` — used by Supabase client in frontend
    -   `STRIPE_*` — expected by checkout/webhook code (search `stripe` references before changing webhooks).

## Integration notes

-   Supabase: The `.env` includes a Supabase URL + publishable key. Frontend uses `NEXT_PUBLIC_SUPABASE_*` env keys — these are safe as public env variables.
-   Stripe: The schema stores `stripePaymentIntentId` on Order. Look for `app/api/webhooks/stripe/route.ts` to find webhook handling; ensure `STRIPE_SECRET_KEY` and signing secret are available in runtime env for local testing.

## Editing guidelines for common tasks (concrete examples)

-   Add a new API route: create `app/api/<resource>/route.ts` exporting handlers (GET/POST) per Next App Router route handler conventions.
-   Read/write DB: import `prisma` from `lib/prisma.ts`. Example: `const products = await prisma.product.findMany()`.
-   Update Prisma model: edit `prisma/schema.prisma`, then run `npx prisma migrate dev --name update-xyz` and `npx prisma generate`.
-   Theme/UX tweaks: modify `styles/globals.css`, `hooks/useTheme.tsx` or `components/ThemeToggleButton.tsx`. Theme toggle is client-only and stored in localStorage.

## Safety and secret handling

-   Do NOT commit `.env` or secret values. This repository currently has `.env` in the workspace for local convenience; treat those values as secrets when sharing.
-   When testing webhooks locally, use Stripe CLI or a tunnel and set the correct signing secret in env.

## Where to look when things break

-   Server errors: check `app/api/*/route.ts` handlers and `lib/prisma.ts` usage.
-   DB errors: confirm `DATABASE_URL` and run `npx prisma migrate status`.
-   Build issues: inspect `next.config.ts` and `package.json` scripts; ensure Node version matches Next 16 minimum.

## Small checklist for PRs changes touching backend

1. If Prisma schema changed: add a migration and `prisma generate` (include migration files in repo).
2. Add/adjust API route tests or a small manual test plan in the PR description.
3. Ensure no secret values are committed.

---

If any of these sections are incomplete or you'd like more examples (e.g., typical API handler patterns or a short migration example), tell me which area to expand and I'll iterate.

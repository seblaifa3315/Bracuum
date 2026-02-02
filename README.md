This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Starter Features
- Starter: `create-next-app` + Tailwind + Typescript
- set up for global variables for light/dark mode: `styles/globals.css`
- set up for theme mode switch: `hooks/useTheme.tsx` + `context/ThemeContext.tsx` + `component/ThemeToggleButton.tsx`


# Integrate PRISMA v7 with Supabase (Cheat Sheet)

Goal:
- Connect Prisma v7 to a Supabase PostgreSQL database using correct pooling

-----------------------------------------------------------------------

## 1. Install Prisma v7

cli:
npm install -D prisma@7
npm install @prisma/client@7

-----------------------------------------------------------------------

## 2. Initialize Prisma

cli:
npx prisma init

-----------------------------------------------------------------------

## 3. Supabase Database URLs

Supabase:
New Project
-> Settings
-> Database
-> Connect

.env:
DATABASE_URL="postgresql://postgres:[YOUR_PASSWORD]@HOST:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[YOUR_PASSWORD]@HOST:5432/postgres"

Notes:
- DATABASE_URL = Session Pooler (runtime)
- DIRECT_URL   = Transaction Pooler (migrations / db push)

-----------------------------------------------------------------------

## 4. Prisma v7 Datasource Config

File: prisma.config.ts

import { defineConfig } from "prisma/config";

export default defineConfig({
  datasource: {
    provider: "postgresql",
    url: process.env.DATABASE_URL,
    shadowDatabaseUrl: process.env.DIRECT_URL,
  },
});

-----------------------------------------------------------------------

## 5. Prisma Schema

File: prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

model Example {
  id String @id @default(uuid())
}

-----------------------------------------------------------------------

## 6. Generate Prisma Client

cli:
npx prisma generate

-----------------------------------------------------------------------

## 7. Push Schema to Supabase

cli:
npx prisma db push

-----------------------------------------------------------------------

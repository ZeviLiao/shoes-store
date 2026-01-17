# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a modern e-commerce shoes store built with Next.js 15, featuring user authentication, shopping cart, order management, and PayPal payment integration. The application uses the Next.js App Router with TypeScript, Prisma ORM with Neon PostgreSQL, and NextAuth v5 for authentication.

## Development Commands

### Running the Application
```bash
npm run dev          # Start development server at http://localhost:3000
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

### Database Management
```bash
npx prisma generate                    # Generate Prisma Client after schema changes
npx prisma migrate dev --name <name>   # Create and apply migration
npx tsx ./db/seed                      # Seed database with sample data
npx prisma studio                      # Open Prisma Studio GUI
```

### Installing shadcn/ui Components
```bash
npx shadcn@latest add <component-name>
```

## Environment Configuration

Copy `.env.sample` to `.env` and configure:
- `DATABASE_URL`: Neon PostgreSQL connection string
- `NEXTAUTH_SECRET`: NextAuth secret (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL`: Application URL (e.g., `http://localhost:3000/`)
- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`: Google OAuth credentials (optional)
- `PAYPAL_CLIENT_ID` / `PAYPAL_APP_SECRET` / `PAYPAL_API_URL`: PayPal integration
- `PAYMENT_METHODS`: Comma-separated payment methods (e.g., "PayPal, Stripe, CashOnDelivery")

## Architecture

### Directory Structure

```
app/
├── (auth)/               # Authentication routes (sign-in, sign-up)
├── (root)/               # Main application routes
│   ├── cart/            # Shopping cart
│   ├── shipping-address/
│   ├── payment-method/
│   ├── place-order/
│   ├── order/[id]/      # Order details
│   └── product/[slug]/  # Product details
├── api/auth/[...nextauth]/ # NextAuth API routes
└── layout.tsx           # Root layout

components/
├── shared/              # Reusable components (header, products, checkout-steps)
└── ui/                  # shadcn/ui components

lib/
├── actions/             # Server actions for data mutations
│   ├── cart.action.ts
│   ├── order.action.ts
│   ├── product.actions.ts
│   └── user.actions.ts
├── constants/           # Application constants
├── utils.ts             # Utility functions
├── validator.ts         # Zod schemas
└── paypal.ts            # PayPal integration

db/
├── prisma.ts            # Prisma client setup with Neon adapter
├── sample-data.ts       # Sample data for seeding
└── seed.ts              # Database seeding script
```

### Authentication Architecture

The app uses **NextAuth v5** (beta) with a hybrid approach:
- **Credentials provider**: Email/password authentication with bcrypt
- **OAuth providers**: Google and Facebook
- **Session management**: JWT-based sessions (30-day max age, 24-hour update cycle)
- **Database adapter**: Prisma adapter for user/account storage

**Key files:**
- [auth.ts](auth.ts): NextAuth configuration with providers and callbacks
- [auth.config.ts](auth.config.ts): Middleware authorization logic and session cart cookie management
- [middleware.ts](middleware.ts): Routes NextAuth middleware

**Session cart migration**: When users sign in/up, any anonymous cart (tracked by `sessionCartId` cookie) is automatically assigned to the authenticated user via the JWT callback.

### Database Schema

The app uses **Neon PostgreSQL** with **Prisma ORM** and the Neon serverless driver adapter.

**Key models:**
- `Product`: Product catalog with sizes, colors, images, stock, and ratings
- `User`: User accounts with address and payment method preferences
- `Account` / `Session`: NextAuth-managed authentication tables
- `Cart`: Shopping cart with JSON items array, linked by `userId` or `sessionCartId`
- `Order` / `OrderItem`: Order history with shipping, payment, and delivery tracking

**Database setup:**
1. The Prisma client is initialized in [db/prisma.ts](db/prisma.ts) with Neon adapter and custom type extensions (converting Decimal fields to strings)
2. After schema changes, always run `npx prisma generate` (this is also run automatically via `postinstall` script)
3. Use `npx tsx ./db/seed` to populate sample data

### Server Actions Pattern

All data mutations use **Next.js Server Actions** (functions marked with `'use server'`):
- [lib/actions/cart.action.ts](lib/actions/cart.action.ts): `addItemToCart`, `removeItemFromCart`
- [lib/actions/order.action.ts](lib/actions/order.action.ts): `createOrder`, `getOrderById`, `createPayPalOrder`, `approvePayPalOrder`
- [lib/actions/user.actions.ts](lib/actions/user.actions.ts): `signUp`, `signInWithCredentials`, `updateProfile`

Server actions return structured objects: `{ success: boolean, message: string, data?: T }`

### Form Validation

All forms use **react-hook-form** with **Zod** schemas defined in [lib/validator.ts](lib/validator.ts):
- `signInFormSchema` / `signUpFormSchema`
- `cartItemSchema` / `insertCartSchema`
- `shippingAddressSchema`
- `paymentMethodSchema`
- `insertOrderSchema` / `insertOrderItemSchema`

### PayPal Integration

PayPal integration uses:
- Server-side order creation and capture via [lib/paypal.ts](lib/paypal.ts)
- Client-side PayPal buttons via `@paypal/react-paypal-js`
- Two-step flow: create order → approve/capture order

Environment variables required:
- `PAYPAL_CLIENT_ID`
- `PAYPAL_APP_SECRET`
- `PAYPAL_API_URL` (defaults to sandbox: `https://api-m.sandbox.paypal.com`)

### Utility Functions

[lib/utils.ts](lib/utils.ts) provides:
- `cn()`: Tailwind CSS class merging
- `formatCurrency()`: Format numbers as USD currency
- `formatError()` / `handleError()`: Centralized error handling for Zod, Prisma, Axios errors
- `round2()`: Round to 2 decimal places
- `formatId()`: Shorten UUIDs for display
- `formatDateTime()`: Date/time formatting

### Styling

- **Tailwind CSS 4.0** with `@tailwindcss/postcss`
- **shadcn/ui** components configured in [components.json](components.json)
- **Dark mode** support via `next-themes`
- Custom animations via `tailwindcss-animate`

### Monitoring

**Sentry** is configured (currently disabled in code) for error tracking:
- [instrumentation.ts](instrumentation.ts): Registers Sentry instrumentation
- [next.config.ts](next.config.ts): Sentry webpack plugin configuration
- Sentry config files: `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`

## Common Patterns

### Reading Cart Data
The cart is stored in the database and linked by either `userId` (authenticated) or `sessionCartId` (anonymous). Always retrieve via server actions.

### Creating Orders
1. Shipping address is saved to user profile (JSON field)
2. Payment method preference is saved to user
3. Order is created with cart items
4. Cart is cleared after successful order creation

### Error Handling
All server actions use the `handleError()` utility which:
- Formats Zod validation errors
- Handles Prisma errors (unique constraints, not found, connection issues)
- Logs errors in production (Sentry integration ready)
- Returns user-friendly error messages

### Type Safety
Types are generated from Zod schemas using `z.infer<typeof schema>`. See [types/index.ts](types/index.ts) for all type exports.

## Important Notes

- **Prisma Client Extensions**: The Prisma client converts `price` and `rating` Decimal fields to strings via custom result extensions in [db/prisma.ts](db/prisma.ts)
- **Session Cart Cookie**: The `sessionCartId` cookie is set in [auth.config.ts](auth.config.ts) via the `authorized` callback and is used for anonymous cart tracking
- **Image Hosting**: Remote image patterns are configured in [next.config.ts](next.config.ts) for UploadThing, Google, and Facebook
- **Payment Methods**: Configured via environment variable `PAYMENT_METHODS` (comma-separated list)

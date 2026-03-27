# TITAN X — GymFlow SaaS Platform

## Project Prompt

Build a **production-grade, multi-tenant SaaS Gym Management System** called **TITAN X / GymFlow**. This is a hyper-luxury, commercially viable fitness ecosystem built with a premium "Nike meets Apple" aesthetic.

---

## Vision

A full-stack SaaS platform where:
- **Super Admins** manage the entire platform — users, branches, products, revenue
- **Gym Admins (Branch Owners)** manage their gym location — members, classes, store inventory, orders
- **Members** sign up, browse the store, checkout, track orders, and manage their subscription

Everything must feel **premium** — dark glassmorphism UI, gold accents (`#C9A84C`), smooth animations, and a futuristic brand identity.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15+ (App Router, Turbopack) |
| Language | TypeScript (strict) |
| Database | SQLite (dev) via Prisma ORM |
| Auth | NextAuth.js v4 with CredentialsProvider + PrismaAdapter |
| Passwords | bcrypt |
| Payments | Stripe Checkout (with mock fallback for development) |
| State | Zustand (cart store with localStorage persistence) |
| 3D Graphics | @react-three/fiber + native three.js (no @react-three/drei — Turbopack incompatible) |
| Animations | GSAP, Framer Motion |
| Fonts | Bebas Neue (display), Inter (body), Geist Mono (mono) |
| Styling | Vanilla CSS + Tailwind utility classes |
| Icons | Lucide React |
| Image Upload | Native Next.js API route → saved to `/public/products/` |

---

## Role System

```
SUPERADMIN
  └── Full platform control: all users, all branches, all orders, all products

GYMADMIN  (Branch Owner)
  └── Manages one branch: members, classes, branch store, branch orders only

MEMBER
  └── Public store browsing, cart, checkout, order tracking, subscription management
```

---

## Core Features

### 🌐 Public Landing Page (`/`)
- Full-screen 3D dumbbell hero section (three.js, no SSR)
- Scroll-driven animations with GSAP
- Sections: Hero, Store preview, Pricing, Features, Footer
- **Begin Ascent** → `/login`
- **View All Arsenal** → `/store`
- **Quick Add** (product hover) → `/store`
- **Select Your Protocol** pricing buttons → `/login?plan=<PlanName>`

### 🔐 Authentication (`/login`, `/register`)
- Email + password login via NextAuth CredentialsProvider
- After login → redirects to `callbackUrl` (preserves guest checkout cart)
- Roles assigned at seeding / user creation

### 🛒 Public Store (`/store`)
- Server-rendered product grid fetched from Prisma
- Category filters and search
- **Add to Cart** → Zustand store (persisted in localStorage)
- Cart drawer slides in from the right
- Guest → cart saved → redirected to login → returns to `/checkout`
- Logged in → redirected to `/checkout`

### 💳 Checkout (`/checkout`)
- Full payment form: cardholder name, card number (auto-formatted), expiry (MM/YY), CVV, billing address
- Client-side validation: all fields required, expiry not in past, 16-digit card
- `VISA`/`MC` detected from card number prefix
- On submit → calls `POST /api/checkout`
  - If real `STRIPE_SECRET_KEY` set → redirects to Stripe Checkout
  - If no key / placeholder → mock checkout (creates COMPLETED order in DB)
- Processing spinner → success animation → redirect to `/dashboard/orders?success=true`

### 📦 Member Dashboard (`/dashboard`)
- Overview: membership plan, active status, quick links
- **Arsenal Access card**: links to `/store`, `/dashboard/orders`, `/dashboard/billing`
- **Order History** (`/dashboard/orders`):
  - 4-step tracking stepper: Order Placed → Processing → Shipped → Delivered
  - Auto-refreshes every **15 seconds** via `router.refresh()`
  - Manual "↻ Refresh Status" button
  - Success banner on first visit after checkout

### 🏢 GymAdmin Dashboard (`/dashboard/branch`)
- Branch analytics (members, revenue, classes)
- **Members** → member list for this branch
- **Orders** → all orders from branch members (with inline status update dropdown)
- **Branch Store** → manage branch products (add with photo upload, view inventory)
- **Class Schedule** → manage sessions

### 👑 SuperAdmin Dashboard (`/dashboard/admin`)
- Global analytics (MRR, active users, recent orders)
- **Orders** → ALL orders across every branch (inline status update)
- **User Management** → all users
- **Arsenal Control** → global product inventory
- **Revenue** → billing analytics

### 📸 Product Management
- Add Product modal with **photo file upload** (PNG/JPG/WEBP, max 5MB)
- Image saved to `/public/products/`, returned URL stored in DB
- Fields: Name, SKU, Category, Price, Inventory, Description, Image
- Accessible by both GYMADMIN and SUPERADMIN

### 🚚 Order Status Management
- Admin changes status via dropdown in orders table: `PENDING → PROCESSING → SHIPPED → DELIVERED → CANCELLED`
- Instant optimistic UI update (no page reload)
- `PATCH /api/orders/:id` — GymAdmin scoped to their branch only
- Member's tracking stepper auto-reflects within 15 seconds

---

## API Routes

| Method | Route | Description | Auth |
|---|---|---|---|
| `GET` | `/api/products` | List active products | Public |
| `POST` | `/api/products` | Create new product | GYMADMIN / SUPERADMIN |
| `POST` | `/api/upload` | Upload product image | GYMADMIN / SUPERADMIN |
| `POST` | `/api/checkout` | Create order (Stripe or mock) | MEMBER (authenticated) |
| `PATCH` | `/api/orders/:id` | Update order status | GYMADMIN / SUPERADMIN |
| `GET/POST` | `/api/auth/[...nextauth]` | NextAuth handlers | — |

---

## Database Models (Prisma)

```
User          — id, name, email, password (hashed), role, gymBranchId, stripeCustomerId, subscriptionStatus, membershipPlan
GymBranch     — id, name, address, users[]
Product       — id, name, sku, category, price, inventory, imageUrl, isActive
Order         — id, userId, totalAmount, status, paymentIntentId, items[]
OrderItem     — id, orderId, productId, quantity, priceAt
```

---

## Checkout Flow (Full)

```
Guest adds items to cart
    → Zustand persists to localStorage
    → Clicks "Login to Checkout"
    → Redirected to /login?callbackUrl=/checkout
    → Logs in → returns to /checkout (cart still in localStorage)
    → Fills in card details + billing address
    → Clicks "Pay $X.XX Now"
    → POST /api/checkout called (Stripe or mock)
    → Order saved to DB (status: PENDING/COMPLETED)
    → Redirected to /dashboard/orders?success=true
    → Member sees 4-step tracker
    → Admin changes status on /dashboard/admin/orders or /dashboard/branch/orders
    → Member tracker auto-refreshes within 15 seconds
```

---

## Environment Variables

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
STRIPE_SECRET_KEY="sk_live_..."   # Optional — mock checkout used if absent
```

---

## Folder Structure

```
src/
├── app/
│   ├── page.tsx                        # Landing page
│   ├── layout.tsx                      # Root layout
│   ├── login/page.tsx                  # Login (reads callbackUrl)
│   ├── register/page.tsx               # Registration
│   ├── store/page.tsx                  # Public product store
│   ├── checkout/page.tsx               # Payment form
│   ├── dashboard/
│   │   ├── layout.tsx                  # Dashboard shell + sidebar (role-aware)
│   │   ├── page.tsx                    # Member overview
│   │   ├── orders/page.tsx             # Member order tracking
│   │   ├── billing/page.tsx            # Subscription management
│   │   ├── settings/page.tsx           # Profile settings
│   │   ├── admin/
│   │   │   ├── page.tsx                # SuperAdmin analytics
│   │   │   ├── orders/page.tsx         # Global order management
│   │   │   ├── users/page.tsx          # User management
│   │   │   ├── products/page.tsx       # Global product management
│   │   │   └── billing/page.tsx        # Revenue
│   │   └── branch/
│   │       ├── page.tsx                # GymAdmin analytics
│   │       ├── orders/page.tsx         # Branch order management
│   │       ├── members/page.tsx        # Branch members
│   │       ├── schedule/page.tsx       # Class schedule
│   │       └── store/page.tsx          # Branch product store
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── products/route.ts
│       ├── upload/route.ts
│       ├── checkout/route.ts
│       └── orders/[id]/route.ts
├── components/
│   ├── titan/                          # Landing page sections
│   │   ├── TitanHero.tsx
│   │   ├── TitanStore.tsx
│   │   ├── TitanPricing.tsx
│   │   ├── HeroCanvas.tsx              # Dynamic canvas (ssr:false)
│   │   └── DumbbellScene.tsx           # Three.js 3D scene
│   ├── store/
│   │   ├── CartDrawer.tsx              # Slide-in cart
│   │   ├── StoreProductCard.tsx        # Product card with add-to-cart
│   │   ├── AddProductForm.tsx          # Admin product creation modal
│   │   ├── OrderStatusPoller.tsx       # Auto-refresh for member orders
│   │   └── CheckoutAutoTrigger.tsx     # Post-login cart auto-open
│   └── admin/
│       └── AdminOrdersTable.tsx        # Interactive status update table
├── lib/
│   ├── prisma.ts                       # Prisma client singleton
│   └── cartStore.ts                    # Zustand cart store
prisma/
├── schema.prisma
└── seed.ts                             # Seeds SuperAdmin + GymAdmin + Members
```

---

## Design System

```css
--background: #0A0A0A       /* near-black */
--surface:    #111111       /* card backgrounds */
--accent-gold:#C9A84C       /* primary accent */
--font-display: 'Bebas Neue', sans-serif
--font-body:    'Inter', sans-serif
--font-mono:    'Geist Mono', monospace
```

- **Glassmorphism** cards: `backdrop-blur + bg-white/5 + border border-white/[0.08]`
- **Gold accents** on interactive elements, status badges, icons
- **Smooth spring animations** via Framer Motion on all drawers/overlays
- **3D floating dumbbell** on hero (RoomEnvironment IBL, metalness/roughness materials)

---

## Known Turbopack Constraints

`@react-three/drei` is **incompatible with Turbopack** due to ESM resolution. This project resolves it by:
1. Extracting the Canvas into `HeroCanvas.tsx` → `dynamic(() => ..., { ssr: false })`
2. Replacing all drei utilities with native three.js equivalents:
   - `Float` → `useFrame` sin-wave animation
   - `Environment` → `PMREMGenerator` + `RoomEnvironment`
   - `OrbitControls` / `Stage` → `useFrame` auto-rotation + native lights
3. Adding `bcrypt`, `next-auth`, `@next-auth/prisma-adapter` to `serverExternalPackages` in `next.config.ts`

---

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Run database migrations
npx prisma migrate dev

# Seed test accounts
npx prisma db seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Seeded Accounts

| Role | Email | Password |
|---|---|---|
| SuperAdmin | admin@titanx.com | (see prisma/password.txt) |
| GymAdmin | branch@titanx.com | (see prisma/password.txt) |
| Member | member@titanx.com | (see prisma/password.txt) |
#   g y m f l o w  
 #   g y m f l o w  
 
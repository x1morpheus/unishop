# UniShop — Universal White-Label Ecommerce Template

A full-stack MERN ecommerce platform where **every store is differentiated by editing a single file**: `client/src/config/theme.config.js`.

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, TanStack Query v5, Framer Motion, React Hook Form + Zod, Recharts, Tailwind CSS |
| Backend | Node.js, Express, Mongoose (MongoDB), JWT (httpOnly cookies + in-memory access token) |
| Payments | Stripe, PayPal, Cash on Delivery |
| Email | Nodemailer (Mailtrap for dev, any SMTP for prod) |
| File uploads | Multer → local `server/uploads/` (swap for S3 in production) |

---

## Project Structure

```
unishop/
├── client/                  # Vite + React
│   └── src/
│       ├── config/
│       │   └── theme.config.js   ← ONLY FILE YOU EDIT PER STORE
│       ├── components/
│       │   ├── ui/          # 12 primitives: Button, Input, Modal, Drawer…
│       │   ├── layout/      # Navbar, Footer, CartDrawer, AdminSidebar…
│       │   ├── store/       # ProductCard, StarRating
│       │   └── admin/       # StatCard, DataTable
│       ├── pages/
│       │   ├── store/       # 11 customer-facing pages
│       │   └── admin/       # 6 admin pages
│       ├── context/         # AuthContext, CartContext, WishlistContext, ThemeContext
│       ├── hooks/           # useAuth, useCart, useWishlist, useDebounce, useMediaQuery
│       └── services/        # api.js (axios + silent refresh), *.service.js
├── server/                  # Express API
│   ├── controllers/         # 9 controllers (product, order, user, admin, analytics, payment, vendor, upload)
│   ├── routes/              # 8 route files
│   ├── models/              # 6 Mongoose models
│   ├── middleware/          # auth, admin, vendor, error, upload, rateLimiter
│   ├── utils/               # asyncHandler, apiResponse, paginate, generateTokens, sendEmail
│   ├── config/              # db.js, stripe.js, paypal.js
│   ├── seed.js              # Database seed script
│   └── .env.example         # All required environment variables
└── shared/
    └── constants.js         # Single source of truth for all enums
```

---

## Quick Start

### 1. Prerequisites

- Node.js ≥ 18
- MongoDB (local or [Atlas](https://cloud.mongodb.com))
- npm ≥ 9

### 2. Clone and install

```bash
git clone <your-repo>
cd unishop
npm install              # installs root workspace
cd client && npm install
cd ../server && npm install
```

### 3. Configure environment

```bash
cp server/.env.example server/.env
```

Edit `server/.env` — the minimum required fields:

```env
MONGO_URI=mongodb://localhost:27017/unishop
ACCESS_TOKEN_SECRET=change_me_to_a_random_32_char_string
REFRESH_TOKEN_SECRET=change_me_to_another_random_string
CLIENT_URL=http://localhost:5173
```

### 4. Seed the database

```bash
cd server
node seed.js
```

This creates:

| Role | Email | Password |
|---|---|---|
| Admin | admin@unishop.com | Admin1234! |
| Vendor | vendor@unishop.com | Vendor1234! |
| Customer | customer@unishop.com | Customer1234! |

Plus 3 categories, 20 products, 3 sample orders, and 6 reviews.

**Seed flags:**
```bash
node seed.js           # skip if data exists
node seed.js --fresh   # wipe + reseed
node seed.js --wipe    # wipe only, no reseed
```

### 5. Start development servers

```bash
cd ..           # back to root
npm run dev     # starts both client (:5173) and server (:5000) concurrently
```

Or independently:
```bash
npm run dev:client   # Vite on :5173
npm run dev:server   # nodemon on :5000
```

---

## White-Label Configuration

**Edit one file to create a new store:**

```js
// client/src/config/theme.config.js
export const THEME = {
  brand: {
    name:         "My Store",
    tagline:      "Great products, great prices.",
    logo:         "/my-logo.svg",
    supportEmail: "help@mystore.com",
  },

  storeMode: "single",   // "single" | "multi" — also set STORE_MODE in .env

  colors: {
    primary:     "#E63946",   // your brand colour
    primaryDark: "#c1121f",
    primaryLight:"#fff0f1",
    // ... remaining colours
  },

  currency: {
    symbol: "£",
    code:   "GBP",
    locale: "en-GB",
  },

  hero: {
    headline:    "Shop the Latest.",
    subheadline: "Free shipping on orders over £40.",
    ctaText:     "Explore Now",
    bgColor:     "#E63946",
  },

  payments: {
    stripe: true,
    paypal: false,
    cod:    true,
  },
};
```

The theme cascades automatically:
1. **Tailwind config** — reads `THEME.colors` at build time for utility classes
2. **ThemeContext** — injects all values as CSS custom properties on `:root` at runtime
3. **Components** — consume `var(--color-primary)` etc — zero hardcoded colours anywhere

---

## API Reference

All responses follow the shape:

```json
{
  "success": true,
  "message": "Products fetched",
  "data": [...],
  "pagination": { "page": 1, "limit": 20, "total": 80, "pages": 4 }
}
```

### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create account, returns tokens |
| POST | `/api/auth/login` | — | Sign in, returns tokens |
| POST | `/api/auth/refresh` | cookie | Silent token refresh |
| POST | `/api/auth/logout` | token | Clears refresh cookie |
| GET  | `/api/auth/me` | token | Current user |
| PATCH | `/api/auth/change-password` | token | Change password |

### Products

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/products` | optional | List with filters: `?category=&minPrice=&maxPrice=&sort=&search=&inStock=&featured=` |
| GET | `/api/products/categories` | — | All active categories |
| GET | `/api/products/:slug` | — | Single product by slug |
| GET | `/api/products/:id/reviews` | — | Paginated reviews |
| POST | `/api/products/:id/reviews` | token | Submit a review |
| POST | `/api/products` | admin | Create product |
| PUT | `/api/products/:id` | admin | Update product |
| DELETE | `/api/products/:id` | admin | Soft delete |

### Orders

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/orders` | token | Place order |
| GET | `/api/orders` | token | My orders (admin sees all) |
| GET | `/api/orders/:id` | token | Order detail |
| DELETE | `/api/orders/:id/cancel` | token | Self-cancel (pending only) |
| PATCH | `/api/orders/:id/status` | admin | Update status |
| PATCH | `/api/orders/:id/pay` | admin | Mark paid |

### Payments

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/payment/stripe/intent` | token | Create PaymentIntent |
| POST | `/api/payment/stripe/webhook` | raw | Stripe event handler |
| POST | `/api/payment/paypal/create` | token | Create PayPal order |
| POST | `/api/payment/paypal/capture` | token | Capture PayPal payment |
| POST | `/api/payment/cod/confirm` | token | Confirm COD order |

### Admin

| Method | Path | Description |
|---|---|---|
| GET | `/api/admin/users` | All users (search, role filter) |
| PATCH | `/api/admin/users/:id` | Toggle active, change role |
| GET/POST/PUT/DELETE | `/api/admin/categories` | Category management |
| GET | `/api/admin/analytics/overview` | Dashboard stats |
| GET | `/api/admin/analytics/revenue?period=30` | Revenue time series |
| GET | `/api/admin/analytics/top-products?limit=5` | Best sellers |
| GET | `/api/admin/analytics/orders-by-status` | Status breakdown |
| GET | `/api/admin/analytics/revenue-by-category` | Category revenue |

---

## Authentication Flow

```
Login → { user, accessToken } returned in body
                            + refreshToken set as httpOnly cookie

Every API request:
  Authorization: Bearer <accessToken>   (in-memory only, never localStorage)

On 401:
  api.js interceptor calls POST /auth/refresh (sends cookie automatically)
  → new accessToken stored in memory
  → original request retried
  → if refresh also fails: dispatch("auth:logout") → AuthContext clears state
```

---

## Order Status Flow

```
pending → confirmed → processing → shipped → delivered → refunded
   └─────────────────────────────────────────────────────────────┘
                           cancelled (from any step up to shipped)
```

Transitions are enforced on both client (`ORDER_STATUS_TRANSITIONS` from `shared/constants.js`) and server (`order.controller.js`).

---

## Payments Setup

### Stripe

1. Create a [Stripe account](https://stripe.com)
2. Copy keys to `.env`:
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
3. Set up webhook endpoint at `https://yourdomain.com/api/payment/stripe/webhook`
4. Listen for: `payment_intent.succeeded`, `payment_intent.payment_failed`

### PayPal

1. Create a [PayPal developer app](https://developer.paypal.com)
2. Copy credentials:
   ```env
   PAYPAL_CLIENT_ID=...
   PAYPAL_CLIENT_SECRET=...
   PAYPAL_MODE=sandbox   # change to "live" for production
   ```

### Disable a payment method

In `theme.config.js`:
```js
payments: { stripe: true, paypal: false, cod: true }
```
The Checkout page reads this and only renders enabled options.

---

## Multi-Vendor Mode

1. Set `storeMode: "multi"` in `theme.config.js`
2. Set `STORE_MODE=multi` in `server/.env`
3. Vendors register at `POST /api/vendors/register`
4. Admin approves at `PATCH /api/vendors/:id/approve`
5. `/admin/vendors` page appears in the admin sidebar

In single mode all vendor routes return 403 and the admin sidebar hides the Vendors link.

---

## Deployment

### Client (Vite)

```bash
cd client
npm run build          # outputs to client/dist/
```

Deploy `client/dist/` to any static host (Vercel, Netlify, Cloudflare Pages).

Set the environment variable for the API base URL:
```env
VITE_API_URL=https://api.yourdomain.com/api
```

### Server (Node.js)

```bash
cd server
NODE_ENV=production node server.js
```

Or with PM2:
```bash
pm2 start server.js --name unishop-api
```

Set all production `.env` values, in particular:
- `NODE_ENV=production`
- `MONGO_URI` → Atlas connection string
- Strong random values for `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET`
- `CLIENT_URL` → your deployed frontend domain

### File Uploads in Production

The default setup stores uploads locally in `server/uploads/`. For production, replace `upload.middleware.js` with an S3/Cloudinary storage engine:

```bash
npm install multer-s3 @aws-sdk/client-s3
```

Update `upload.middleware.js` to use `multerS3` storage — the controllers and service files require no changes.

---

## Scripts

### Root

```bash
npm run dev          # concurrently: client + server
npm run dev:client   # Vite only
npm run dev:server   # nodemon only
```

### Server

```bash
node seed.js            # seed database
node seed.js --fresh    # wipe and reseed
node seed.js --wipe     # wipe only
```

### Client

```bash
npm run dev      # Vite dev server :5173
npm run build    # production build → dist/
npm run preview  # preview the production build locally
```

---

## Customisation Cheatsheet

| Goal | Where to change |
|---|---|
| New brand colours | `theme.config.js` → `colors` |
| New currency | `theme.config.js` → `currency` |
| Hero text | `theme.config.js` → `hero` |
| Enable/disable payment methods | `theme.config.js` → `payments` |
| Add a new page | `pages/store/` + route in `App.jsx` |
| Add an admin panel section | `pages/admin/` + route in `App.jsx` + nav in `AdminSidebar.jsx` |
| Change free shipping threshold | `order.controller.js` line `const shipping = subtotal >= 50` |
| Change tax rate | `order.controller.js` line `const tax = +(subtotal * 0.1)` |
| Add a new email template | `server/utils/sendEmail.js` |
| Custom order number format | `Order.model.js` pre-save hook |

---

## License

MIT — free for personal and commercial use.

---

## New Features (latest update)

### 🔥 Flash Sales / Urgent Sales
- Admin can activate flash sales on any product with a discounted price + optional countdown timer
- Products show a live countdown bar directly on the card
- Dedicated `/sale` page with hero countdown banner
- Pulsing "Sale" link appears in navbar when any flash sale is active
- Flash Sales filter in Product Listing page
- `/api/products/flash-sales` endpoint for fetching active deals

### 🏷️ Product Badges
- Admin can tag products with: `New`, `Best Seller`, `Limited`, `🔥 Hot`
- Badges appear on product cards and product detail page

### 📂 Admin Categories
- Full CRUD for categories at `/admin/categories`
- Category management (name, image URL, description, sort order, active toggle)

### ⚙️ Admin Settings
- Settings panel at `/admin/settings` with Store, Payments, Email, Theme tabs
- Toggle payment gateways, configure store info, email preferences

### 🛒 Order Cancellation (customer)
- Customers can cancel `pending` or `confirmed` orders from their Profile page
- Stock is automatically restored on cancellation

### 💳 Proper Stripe Elements
- Card details now collected via Stripe Elements modal (never exposed in URL)
- Full PCI-compliant card collection flow

### ❤️ Wishlist Sync
- Wishlist now syncs to server when user is authenticated
- Local wishlist merges with server wishlist on login

### 🗂️ Admin Flash Sales Manager
- Dedicated `/admin/flash-sales` page to manage sales on all products
- Set sale price, label, expiry, badge, featured status in one place

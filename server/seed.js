/**
 * seed.js — UniShop database seed script
 *
 * Creates a complete, demo-ready dataset:
 *   • 3 categories  (Electronics, Clothing, Home & Garden)
 *   • 1 admin       admin@unishop.com / Admin1234!
 *   • 1 vendor      vendor@unishop.com / Vendor1234!   (auto-approved)
 *   • 1 customer    customer@unishop.com / Customer1234!
 *   • 20 products   spread across categories, some featured, some on sale
 *   • 3 orders      in different statuses with payment snapshots
 *   • 6 reviews     distributed across products
 *
 * Usage:
 *   node seed.js            → seed (skips if data already exists)
 *   node seed.js --fresh    → wipe everything first, then seed
 *   node seed.js --wipe     → wipe only, no re-seed
 */

import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User     from "./models/User.model.js";
import Category from "./models/Category.model.js";
import Product  from "./models/Product.model.js";
import Vendor   from "./models/Vendor.model.js";
import Order    from "./models/Order.model.js";
import Review   from "./models/Review.model.js";
import { connectDB } from "./config/db.js";
import { ORDER_STATUS, PAYMENT_STATUS, PAYMENT_METHODS, ROLES } from "../shared/constants.js";

/* ── CLI flags ─────────────────────────────────────────────────────────────── */
const args   = process.argv.slice(2);
const FRESH  = args.includes("--fresh");
const WIPE   = args.includes("--wipe");

/* ── Placeholder image helper ──────────────────────────────────────────────── */
// Using picsum photos which return deterministic JPEGs by seed ID
const pic = (id, w = 600, h = 600) => `https://picsum.photos/seed/${id}/${w}/${h}`;

/* ── Category data ──────────────────────────────────────────────────────────── */
const CATEGORIES = [
  { name: "Electronics",    description: "Gadgets, devices, and accessories.",            image: pic("electronics", 400, 300),  sortOrder: 1 },
  { name: "Clothing",       description: "Apparel for every occasion and season.",        image: pic("fashion", 400, 300),      sortOrder: 2 },
  { name: "Home & Garden",  description: "Everything for your home and outdoor spaces.",  image: pic("home", 400, 300),         sortOrder: 3 },
];

/* ── User data ──────────────────────────────────────────────────────────────── */
const USERS = [
  {
    name:     "Admin User",
    email:    "admin@unishop.com",
    password: "Admin1234!",
    role:     ROLES.ADMIN,
  },
  {
    name:     "Vendor User",
    email:    "vendor@unishop.com",
    password: "Vendor1234!",
    role:     ROLES.VENDOR,
  },
  {
    name:     "Customer User",
    email:    "customer@unishop.com",
    password: "Customer1234!",
    role:     ROLES.CUSTOMER,
    phone:    "+1 555 0100",
    addresses: [
      {
        name:    "Customer User",
        address: "123 Main Street",
        city:    "New York",
        zip:     "10001",
        country: "United States",
        phone:   "+1 555 0100",
        isDefault: true,
      },
    ],
  },
];

/* ── Product factory ────────────────────────────────────────────────────────── */
const makeProducts = (cats) => {
  const [elec, cloth, home] = cats;

  return [
    // ── Electronics (8 products) ─────────────────────────────────────────────
    {
      name: "Wireless Noise-Cancelling Headphones",
      description: "Premium over-ear headphones with 30h battery life, adaptive ANC, and Hi-Res Audio certification. Foldable design with carrying case included.",
      price: 249.99, comparePrice: 329.99, stock: 42, category: elec._id,
      images: [pic("headphones1"), pic("headphones2"), pic("headphones3")],
      tags: ["audio","wireless","premium"], isFeatured: true, ratings: { avg: 4.7, count: 128 },
    },
    {
      name: "Smart Watch Pro 5",
      description: "AMOLED display, GPS, heart rate & SpO2 monitoring, 5-day battery. Water-resistant to 50m. Compatible with iOS & Android.",
      price: 199.99, comparePrice: 249.99, stock: 67, category: elec._id,
      images: [pic("watch1"), pic("watch2")],
      tags: ["wearable","fitness","smart"], isFeatured: true, ratings: { avg: 4.5, count: 93 },
    },
    {
      name: "USB-C 100W GaN Charger",
      description: "4-port GaN charger (2×USB-C, 2×USB-A). Charge a MacBook Pro + iPhone + two accessories simultaneously. Compact travel design.",
      price: 59.99, stock: 210, category: elec._id,
      images: [pic("charger")],
      tags: ["charger","usb-c","accessories"], ratings: { avg: 4.8, count: 302 },
    },
    {
      name: "Mechanical Keyboard TKL",
      description: "Tenkeyless layout with Cherry MX Red switches. PBT double-shot keycaps, per-key RGB, USB-C detachable cable.",
      price: 129.99, comparePrice: 159.99, stock: 38, category: elec._id,
      images: [pic("keyboard1"), pic("keyboard2")],
      tags: ["keyboard","gaming","mechanical"], isFeatured: true, ratings: { avg: 4.6, count: 77 },
    },
    {
      name: "4K Webcam with Ring Light",
      description: "Sony sensor, autofocus, built-in stereo microphone with noise reduction. Works with Zoom, Teams, OBS. Plug-and-play.",
      price: 89.99, stock: 54, category: elec._id,
      images: [pic("webcam")],
      tags: ["webcam","streaming","remote-work"], ratings: { avg: 4.3, count: 41 },
    },
    {
      name: "Portable Bluetooth Speaker",
      description: "360° sound, 20h battery, IP67 waterproof. Dual-driver with passive radiator for deep bass. Wireless charging compatible.",
      price: 79.99, comparePrice: 99.99, stock: 88, category: elec._id,
      images: [pic("speaker1"), pic("speaker2")],
      tags: ["audio","bluetooth","outdoor"], ratings: { avg: 4.4, count: 156 },
    },
    {
      name: "Ultra-Slim Laptop Stand",
      description: "Aluminium alloy, 6 height settings, non-slip pads. Folds flat to 5mm. Holds up to 20kg. Compatible with all laptops 10–17\".",
      price: 34.99, stock: 175, category: elec._id,
      images: [pic("stand")],
      tags: ["laptop","ergonomic","desk"], ratings: { avg: 4.6, count: 88 },
    },
    {
      name: "Wireless Charging Pad Trio",
      description: "Simultaneously charge phone (15W), earbuds (5W), and watch (5W). Fabric surface, LED indicator, cable included.",
      price: 49.99, stock: 0, category: elec._id,
      images: [pic("chargepad")],
      tags: ["charging","wireless","accessories"], ratings: { avg: 4.2, count: 34 },
    },

    // ── Clothing (6 products) ─────────────────────────────────────────────────
    {
      name: "Premium Cotton Crew-Neck Tee",
      description: "180gsm organic cotton, pre-shrunk, ribbed neckline. Available S–3XL. Machine washable. 10 colourways.",
      price: 29.99, stock: 320, category: cloth._id,
      images: [pic("tshirt1"), pic("tshirt2")],
      tags: ["basics","cotton","casual"], isFeatured: true, ratings: { avg: 4.8, count: 412 },
      variants: [
        { name: "Size", value: "S", stock: 80, priceModifier: 0 },
        { name: "Size", value: "M", stock: 90, priceModifier: 0 },
        { name: "Size", value: "L", stock: 80, priceModifier: 0 },
        { name: "Size", value: "XL", stock: 50, priceModifier: 0 },
        { name: "Size", value: "2XL", stock: 20, priceModifier: 2 },
      ],
    },
    {
      name: "Slim-Fit Chino Trousers",
      description: "Stretch cotton blend (97% cotton, 3% elastane). Mid-rise, tapered leg. Available in 30–40W × 28–34L. Wrinkle-resistant.",
      price: 59.99, comparePrice: 79.99, stock: 145, category: cloth._id,
      images: [pic("chinos")],
      tags: ["trousers","smart-casual","stretch"], ratings: { avg: 4.5, count: 67 },
    },
    {
      name: "Merino Wool Crewneck Sweater",
      description: "100% New Zealand merino wool, 12-gauge knit. Temperature-regulating, itch-free. Hand wash or wool cycle.",
      price: 119.99, comparePrice: 149.99, stock: 55, category: cloth._id,
      images: [pic("sweater1"), pic("sweater2")],
      tags: ["knitwear","wool","premium"], isFeatured: true, ratings: { avg: 4.9, count: 38 },
    },
    {
      name: "Water-Resistant Puffer Jacket",
      description: "DWR coating, 550-fill recycled down, YKK zips, internal stash pocket. Packable into chest pocket. Sizes XS–3XL.",
      price: 149.99, comparePrice: 199.99, stock: 72, category: cloth._id,
      images: [pic("jacket")],
      tags: ["outerwear","winter","packable"], ratings: { avg: 4.6, count: 52 },
    },
    {
      name: "Classic White Oxford Shirt",
      description: "Egyptian cotton, non-iron finish, mother-of-pearl buttons. Regular and slim fit available. Easy-care collar stays included.",
      price: 69.99, stock: 98, category: cloth._id,
      images: [pic("shirt")],
      tags: ["formal","cotton","oxford"], ratings: { avg: 4.4, count: 89 },
    },
    {
      name: "Lightweight Running Shorts",
      description: "4-way stretch mesh, built-in liner, reflective details. 7\" inseam, zip back pocket. Sweat-wicking and fast-dry.",
      price: 34.99, stock: 160, category: cloth._id,
      images: [pic("shorts")],
      tags: ["sport","running","activewear"], ratings: { avg: 4.7, count: 114 },
    },

    // ── Home & Garden (6 products) ────────────────────────────────────────────
    {
      name: "Cast Iron Dutch Oven 5.5qt",
      description: "Enamelled cast iron, oven-safe to 500°F. Self-basting lid, wide loop handles. Dishwasher safe. 25-year guarantee.",
      price: 89.99, comparePrice: 129.99, stock: 34, category: home._id,
      images: [pic("dutchoven1"), pic("dutchoven2")],
      tags: ["cookware","cast-iron","oven"], isFeatured: true, ratings: { avg: 4.9, count: 201 },
    },
    {
      name: "Bamboo Cutting Board Set (3pc)",
      description: "FSC-certified bamboo, juice grooves, non-slip feet. Small/medium/large. Antimicrobial surface. End-grain construction.",
      price: 39.99, stock: 220, category: home._id,
      images: [pic("cuttingboard")],
      tags: ["kitchen","bamboo","eco"], ratings: { avg: 4.7, count: 178 },
    },
    {
      name: "Adjustable Dumbbell Set 5–52.5lb",
      description: "15 weight settings in one compact unit. Click-adjust mechanism, 3-second change. Replaces 15 dumbbells. Includes storage tray.",
      price: 299.99, comparePrice: 399.99, stock: 18, category: home._id,
      images: [pic("dumbbell1"), pic("dumbbell2")],
      tags: ["fitness","weights","home-gym"], isFeatured: true, ratings: { avg: 4.8, count: 95 },
    },
    {
      name: "Air Purifier HEPA 13",
      description: "True HEPA 13 + activated carbon filter. 360° air intake, 500 sq ft coverage, auto-mode with air quality sensor. 22dB sleep mode.",
      price: 119.99, stock: 47, category: home._id,
      images: [pic("purifier")],
      tags: ["air-quality","home","health"], ratings: { avg: 4.5, count: 63 },
    },
    {
      name: "Ceramic Plant Pot Set (5pc)",
      description: "Handcrafted ceramic, drainage holes with saucers. Matte glaze in terracotta, sage, sand, cream, charcoal. 3\", 4\", 5\", 6\", 8\".",
      price: 44.99, stock: 135, category: home._id,
      images: [pic("pots")],
      tags: ["plants","decor","ceramic"], ratings: { avg: 4.6, count: 87 },
    },
    {
      name: "LED Desk Lamp with Wireless Charging",
      description: "5 colour temperatures × 5 brightness levels, USB-A port, 10W Qi pad base, memory function. Architect-style arm, touch dimmer.",
      price: 64.99, comparePrice: 79.99, stock: 76, category: home._id,
      images: [pic("lamp")],
      tags: ["lighting","desk","wireless"], ratings: { avg: 4.5, count: 122 },
    },
  ];
};

/* ── Review data ────────────────────────────────────────────────────────────── */
const makeReviews = (products, customer) => [
  { product: products[0]._id, user: customer._id, userName: customer.name, rating: 5, comment: "Absolutely incredible ANC. Blocks out everything on my commute. Battery easily lasts a week for me.", isVerifiedPurchase: true },
  { product: products[0]._id, user: customer._id, userName: customer.name, rating: 4, comment: "Great sound quality. Slightly tight on bigger heads after long sessions but otherwise perfect.", isVerifiedPurchase: false },
  { product: products[1]._id, user: customer._id, userName: customer.name, rating: 5, comment: "Sleep tracking is spot-on and the GPS is accurate to within 2m. Best smartwatch I've owned.", isVerifiedPurchase: true },
  { product: products[8]._id, user: customer._id, userName: customer.name, rating: 5, comment: "Softest tee I've ever worn. Bought 4 more colours after the first wash — held up perfectly.", isVerifiedPurchase: true },
  { product: products[15]._id, user: customer._id, userName: customer.name, rating: 5, comment: "Made the most incredible sourdough in this. Even heat distribution is phenomenal. Worth every cent.", isVerifiedPurchase: true },
  { product: products[3]._id, user: customer._id, userName: customer.name, rating: 4, comment: "Solid mechanical keyboard. Switches are smooth, RGB is vibrant. Wish the software was a bit simpler.", isVerifiedPurchase: false },
];

/* ── Main seed function ──────────────────────────────────────────────────────── */
async function seed() {
  console.log("\n🌱  UniShop Seed Script\n" + "─".repeat(40));

  await connectDB();

  /* ── Wipe ──────────────────────────────────────────────────────────────────── */
  if (FRESH || WIPE) {
    console.log("🗑   Wiping existing data…");
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Vendor.deleteMany({}),
      Order.deleteMany({}),
      Review.deleteMany({}),
    ]);
    console.log("    Collections cleared.\n");
    if (WIPE) { console.log("✅  Wipe complete. Exiting.\n"); process.exit(0); }
  }

  /* ── Guard: skip if data exists ─────────────────────────────────────────── */
  const existing = await User.countDocuments();
  if (existing > 0 && !FRESH) {
    console.log("⚠️   Data already exists. Run with --fresh to reseed.\n");
    process.exit(0);
  }

  /* ── Categories ─────────────────────────────────────────────────────────── */
  console.log("📂  Seeding categories…");
  const cats = await Category.insertMany(CATEGORIES);
  console.log(`    Created ${cats.length} categories: ${cats.map(c => c.name).join(", ")}\n`);

  /* ── Users ───────────────────────────────────────────────────────────────── */
  console.log("👥  Seeding users…");
  const createdUsers = [];
  for (const u of USERS) {
    const hash = await bcrypt.hash(u.password, 12);
    const user = await User.create({ ...u, password: hash });
    createdUsers.push(user);
    console.log(`    ✓ ${user.role.padEnd(8)} ${user.email}  (password: ${u.password})`);
  }
  const [admin, vendorUser, customer] = createdUsers;
  console.log();

  /* ── Vendor profile ──────────────────────────────────────────────────────── */
  console.log("🏪  Creating vendor profile…");
  const vendor = await Vendor.create({
    user:         vendorUser._id,
    storeName:    "Tech Haven",
    description:  "Premium electronics and accessories curated for the modern professional.",
    logo:         pic("vendor-logo", 200, 200),
    banner:       pic("vendor-banner", 1200, 400),
    isApproved:   true,
    isActive:     true,
    contactEmail: vendorUser.email,
    totalRevenue: 0,
    totalOrders:  0,
  });
  await User.findByIdAndUpdate(vendorUser._id, { vendor: vendor._id });
  console.log(`    ✓ "${vendor.storeName}" — approved\n`);

  /* ── Products ────────────────────────────────────────────────────────────── */
  console.log("📦  Seeding products…");
  const productDefs = makeProducts(cats);
  const products = await Product.insertMany(productDefs);
  console.log(`    Created ${products.length} products across ${cats.length} categories\n`);

  /* ── Reviews ──────────────────────────────────────────────────────────────── */
  console.log("⭐  Seeding reviews…");
  const reviewDefs = makeReviews(products, customer);
  // Each review must be unique per (product, user) — deduplicate
  const seen = new Set();
  const uniqueReviews = reviewDefs.filter(r => {
    const key = `${r.product}-${r.user}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  await Review.insertMany(uniqueReviews);
  console.log(`    Created ${uniqueReviews.length} reviews\n`);

  /* ── Orders ───────────────────────────────────────────────────────────────── */
  console.log("🛒  Seeding orders…");

  const shippingAddress = {
    name:    customer.name,
    address: "123 Main Street",
    city:    "New York",
    zip:     "10001",
    country: "United States",
    phone:   "+1 555 0100",
  };

  const sampleOrders = [
    {
      user:            customer._id,
      items: [
        { product: products[0]._id, name: products[0].name, image: products[0].images[0], price: 249.99, qty: 1, variant: "" },
        { product: products[2]._id, name: products[2].name, image: products[2].images[0], price: 59.99,  qty: 1, variant: "" },
      ],
      shippingAddress,
      payment: { method: PAYMENT_METHODS.STRIPE, status: PAYMENT_STATUS.PAID, stripeId: "pi_seed_0001", paidAt: new Date(Date.now() - 3 * 86400000) },
      orderStatus: ORDER_STATUS.DELIVERED,
      subtotal: 309.98, shipping: 0, tax: 31.00, total: 340.98,
      deliveredAt: new Date(Date.now() - 1 * 86400000),
    },
    {
      user:            customer._id,
      items: [
        { product: products[8]._id,  name: products[8].name,  image: products[8].images[0], price: 29.99, qty: 3, variant: "Size: M" },
        { product: products[10]._id, name: products[10].name, image: products[10].images[0], price: 119.99, qty: 1, variant: "" },
      ],
      shippingAddress,
      payment: { method: PAYMENT_METHODS.PAYPAL, status: PAYMENT_STATUS.PAID, paypalId: "PAY-SEED-0002", paidAt: new Date(Date.now() - 1 * 86400000) },
      orderStatus: ORDER_STATUS.PROCESSING,
      subtotal: 209.96, shipping: 0, tax: 21.00, total: 230.96,
    },
    {
      user:            customer._id,
      items: [
        { product: products[15]._id, name: products[15].name, image: products[15].images[0], price: 89.99, qty: 1, variant: "" },
      ],
      shippingAddress,
      payment: { method: PAYMENT_METHODS.COD, status: PAYMENT_STATUS.PENDING },
      orderStatus: ORDER_STATUS.PENDING,
      subtotal: 89.99, shipping: 9.99, tax: 9.00, total: 108.98,
    },
  ];

  const orders = await Order.insertMany(sampleOrders);
  orders.forEach(o => console.log(`    ✓ ${o.orderNumber}  ${o.orderStatus.padEnd(12)} $${o.total.toFixed(2)}`));
  console.log();

  /* ── Summary ──────────────────────────────────────────────────────────────── */
  console.log("─".repeat(40));
  console.log("✅  Seed complete!\n");
  console.log("   Test credentials:");
  console.log("   Admin    →  admin@unishop.com     / Admin1234!");
  console.log("   Vendor   →  vendor@unishop.com    / Vendor1234!");
  console.log("   Customer →  customer@unishop.com  / Customer1234!");
  console.log("\n   Run `npm run dev` to start the server.\n");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error("\n❌  Seed failed:", err.message);
  process.exit(1);
});

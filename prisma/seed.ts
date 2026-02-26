import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// eslint-disable-next-line @typescript-eslint/no-require-imports
require("dotenv").config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ─── Helpers ─────────────────────────────────────────────────────────

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(randomInt(8, 20), randomInt(0, 59), randomInt(0, 59), 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// ─── Data pools ──────────────────────────────────────────────────────

const FIRST_NAMES = [
  "James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael",
  "Linda", "David", "Elizabeth", "William", "Barbara", "Richard", "Susan",
  "Joseph", "Jessica", "Thomas", "Sarah", "Christopher", "Karen", "Daniel",
  "Lisa", "Matthew", "Nancy", "Anthony", "Betty", "Mark", "Margaret",
  "Steven", "Sandra", "Andrew", "Ashley", "Joshua", "Dorothy", "Kevin",
  "Kimberly", "Brian", "Emily", "George", "Donna", "Edward", "Michelle",
  "Ronald", "Carol", "Timothy", "Amanda", "Jason", "Melissa", "Jeffrey", "Deborah",
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
  "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez",
  "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
  "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark",
  "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King",
  "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
];

const CITIES = [
  { city: "New York", state: "NY", zip: "10001" },
  { city: "Los Angeles", state: "CA", zip: "90001" },
  { city: "Chicago", state: "IL", zip: "60601" },
  { city: "Houston", state: "TX", zip: "77001" },
  { city: "Phoenix", state: "AZ", zip: "85001" },
  { city: "Philadelphia", state: "PA", zip: "19101" },
  { city: "San Antonio", state: "TX", zip: "78201" },
  { city: "San Diego", state: "CA", zip: "92101" },
  { city: "Dallas", state: "TX", zip: "75201" },
  { city: "Austin", state: "TX", zip: "78701" },
  { city: "Denver", state: "CO", zip: "80201" },
  { city: "Seattle", state: "WA", zip: "98101" },
  { city: "Portland", state: "OR", zip: "97201" },
  { city: "Miami", state: "FL", zip: "33101" },
  { city: "Atlanta", state: "GA", zip: "30301" },
];

const STREETS = [
  "Main St", "Oak Ave", "Elm St", "Park Blvd", "Cedar Ln",
  "Maple Dr", "Pine St", "Washington Ave", "Lake Rd", "Hill St",
  "Sunset Blvd", "Broadway", "Market St", "Highland Ave", "River Rd",
];

const CARRIERS = ["USPS", "UPS", "FedEx", "DHL"];
const SHIPPING_METHODS = ["Ground", "Express", "Priority", "Overnight"];

const WARRANTY_REASONS = ["DEFECT", "SHIPPING_DAMAGE", "MALFUNCTION", "OTHER"] as const;

// ─── Order generation ────────────────────────────────────────────────

type OrderStatus =
  | "NEW" | "PREORDER_PLACED" | "PREORDER_WAITING"
  | "PAID" | "SHIPPED" | "DELIVERED"
  | "RETURN_REQUESTED" | "RETURN_RECEIVED" | "REFUNDED" | "CANCELLED";

const PRODUCT_PRICE = 14999; // $149.99
const SHIPPING_FEE = 999;    // $9.99

async function main() {
  console.log("Seeding orders...");

  // Ensure order counter exists
  await prisma.orderCounter.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default", lastNumber: 0 },
  });

  const ORDER_COUNT = 120;
  const orders = [];

  for (let i = 0; i < ORDER_COUNT; i++) {
    const firstName = randomPick(FIRST_NAMES);
    const lastName = randomPick(LAST_NAMES);
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomInt(1, 999)}@example.com`;
    const phone = `+1${randomInt(200, 999)}${randomInt(100, 999)}${randomInt(1000, 9999)}`;
    const location = randomPick(CITIES);
    const street = `${randomInt(100, 9999)} ${randomPick(STREETS)}`;

    const quantity = randomPick([1, 1, 1, 1, 1, 2, 2, 3]); // mostly 1
    const subtotal = PRODUCT_PRICE * quantity;
    const taxAmount = Math.round(subtotal * 0.08); // ~8% tax
    const totalAmount = subtotal + taxAmount + SHIPPING_FEE;
    const stripeFee = Math.round(totalAmount * 0.029 + 30); // Stripe 2.9% + $0.30

    // Distribute orders over last ~365 days, weighted toward recent
    const ageDays = Math.round(Math.pow(Math.random(), 1.5) * 365);
    const createdAt = daysAgo(ageDays);

    // Determine status based on age (older orders more likely to be further along)
    let status: OrderStatus;
    const rand = Math.random();

    if (ageDays < 3) {
      // Very recent: mostly NEW or PAID
      status = rand < 0.4 ? "NEW" : "PAID";
    } else if (ageDays < 14) {
      // Recent: mix of PAID and SHIPPED
      if (rand < 0.1) status = "NEW";
      else if (rand < 0.5) status = "PAID";
      else if (rand < 0.85) status = "SHIPPED";
      else status = "DELIVERED";
    } else if (ageDays < 60) {
      // Medium: mostly DELIVERED
      if (rand < 0.05) status = "PAID";
      else if (rand < 0.15) status = "SHIPPED";
      else if (rand < 0.8) status = "DELIVERED";
      else if (rand < 0.9) status = "RETURN_REQUESTED";
      else if (rand < 0.95) status = "REFUNDED";
      else status = "CANCELLED";
    } else {
      // Old: almost all DELIVERED, some returns/refunds
      if (rand < 0.7) status = "DELIVERED";
      else if (rand < 0.8) status = "RETURN_REQUESTED";
      else if (rand < 0.85) status = "RETURN_RECEIVED";
      else if (rand < 0.92) status = "REFUNDED";
      else status = "CANCELLED";
    }

    // Build timeline dates based on status
    let shippedAt: Date | null = null;
    let deliveredAt: Date | null = null;
    let warrantyExpiresAt: Date | null = null;
    let returnRequestedAt: Date | null = null;
    let returnReceivedAt: Date | null = null;
    let refundedAt: Date | null = null;
    let carrier: string | null = null;
    let shippingMethod: string | null = null;
    let trackingNumber: string | null = null;

    const needsShipping = ["SHIPPED", "DELIVERED", "RETURN_REQUESTED", "RETURN_RECEIVED", "REFUNDED"].includes(status);
    const needsDelivery = ["DELIVERED", "RETURN_REQUESTED", "RETURN_RECEIVED", "REFUNDED"].includes(status);

    if (needsShipping) {
      shippedAt = addDays(createdAt, randomInt(1, 4));
      carrier = randomPick(CARRIERS);
      shippingMethod = randomPick(SHIPPING_METHODS);
      trackingNumber = `${carrier?.substring(0, 2).toUpperCase()}${randomInt(100000000, 999999999)}`;
    }

    if (needsDelivery) {
      deliveredAt = addDays(shippedAt!, randomInt(2, 7));
      warrantyExpiresAt = addDays(deliveredAt, 365);
    }

    if (["RETURN_REQUESTED", "RETURN_RECEIVED", "REFUNDED"].includes(status)) {
      returnRequestedAt = addDays(deliveredAt!, randomInt(3, 25));
    }
    if (["RETURN_RECEIVED", "REFUNDED"].includes(status)) {
      returnReceivedAt = addDays(returnRequestedAt!, randomInt(3, 10));
    }
    if (status === "REFUNDED") {
      refundedAt = addDays(returnReceivedAt!, randomInt(1, 5));
    }

    // Increment order counter atomically
    const counter = await prisma.orderCounter.update({
      where: { id: "default" },
      data: { lastNumber: { increment: 1 } },
    });
    const orderNumber = `BRC-${String(counter.lastNumber).padStart(4, "0")}`;

    const shippingAddress = {
      name: `${firstName} ${lastName}`,
      address: {
        line1: street,
        line2: null,
        city: location.city,
        state: location.state,
        postal_code: location.zip,
        country: "US",
      },
    };

    orders.push({
      orderNumber,
      firstName,
      lastName,
      email,
      phoneNumber: rand > 0.3 ? phone : null,
      quantity,
      productPrice: PRODUCT_PRICE,
      subtotal,
      taxAmount,
      shippingAmount: SHIPPING_FEE,
      totalAmount,
      stripeFee: status === "NEW" || status === "CANCELLED" ? null : stripeFee,
      currency: "usd",
      status,
      isPreOrder: false,
      stripeCheckoutSessionId: `cs_seed_${orderNumber}_${Date.now()}_${randomInt(1000, 9999)}`,
      shippingAddress,
      addressLine1: street,
      city: location.city,
      state: location.state,
      zip: location.zip,
      country: "US",
      carrier,
      shippingMethod,
      trackingNumber,
      shippedAt,
      deliveredAt,
      warrantyExpiresAt,
      returnRequestedAt,
      returnReceivedAt,
      refundedAt,
      customerEmailSentAt: status !== "NEW" ? addDays(createdAt, 0) : null,
      sellerEmailSentAt: status !== "NEW" ? addDays(createdAt, 0) : null,
      createdAt,
    });
  }

  // Insert all orders
  for (const order of orders) {
    await prisma.order.create({ data: order });
  }

  console.log(`Created ${orders.length} orders.`);

  // Add warranty claims to some delivered/returned orders
  const claimableOrders = await prisma.order.findMany({
    where: {
      status: { in: ["DELIVERED", "RETURN_REQUESTED", "RETURN_RECEIVED"] },
      deliveredAt: { not: null },
    },
  });

  let claimCount = 0;
  for (const order of claimableOrders) {
    // ~15% chance of a warranty claim
    if (Math.random() > 0.15) continue;

    await prisma.warrantyClaim.create({
      data: {
        orderId: order.id,
        description: randomPick([
          "Product stopped working after 2 weeks of use.",
          "Motor makes a strange noise during operation.",
          "Received with a cracked housing from shipping.",
          "Suction power significantly reduced after a month.",
          "Battery no longer holds a charge.",
          "Power button intermittently fails to respond.",
          "Arrived with missing attachments.",
        ]),
        reason: randomPick([...WARRANTY_REASONS]),
        status: randomPick(["PENDING", "PENDING", "APPROVED", "RESOLVED"]),
        claimedAt: addDays(order.deliveredAt!, randomInt(10, 90)),
      },
    });
    claimCount++;
  }

  console.log(`Created ${claimCount} warranty claims.`);
  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

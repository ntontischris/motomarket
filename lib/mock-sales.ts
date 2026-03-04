// ============================================================
// MOCK SALES DATA — Motomarket Business Intelligence
// Period: Mar 2024 – Feb 2026 (24 months)
// ~1800 sale records, 18 customers
// ============================================================

export interface SaleRecord {
  id: string;
  date: string; // ISO date string
  productCode: string;
  quantity: number;
  soldPrice: number;
  discountPct: number;
  customerCode: string;
  channel: "walk-in" | "phone" | "web";
}

export interface MockCustomer {
  code: string;
  name: string;
  type: "retail" | "wholesale";
  city: string;
}

export const MOCK_CUSTOMERS: MockCustomer[] = [
  { code: "C001", name: "Νικόλαος Παπαδόπουλος", type: "retail", city: "Αθήνα" },
  { code: "C002", name: "Κώστας Γεωργίου", type: "retail", city: "Θεσσαλονίκη" },
  { code: "C003", name: "Μαρία Αντωνίου", type: "retail", city: "Πάτρα" },
  { code: "C004", name: "Δημήτρης Καραγιάννης", type: "retail", city: "Αθήνα" },
  { code: "C005", name: "Ελένη Σταματίου", type: "retail", city: "Λάρισα" },
  { code: "C006", name: "Γιώργος Μαρκάκης", type: "retail", city: "Ηράκλειο" },
  { code: "C007", name: "Σταύρος Νικολάου", type: "retail", city: "Αθήνα" },
  { code: "C008", name: "Χρήστος Κωνσταντίνου", type: "retail", city: "Βόλος" },
  { code: "C009", name: "Αντώνης Ψαρράς", type: "retail", city: "Αθήνα" },
  { code: "C010", name: "Βασίλης Οικονόμου", type: "retail", city: "Ιωάννινα" },
  { code: "W001", name: "Μοτο Κέντρο Αθηνών", type: "wholesale", city: "Αθήνα" },
  { code: "W002", name: "Speedway Parts ΕΠΕ", type: "wholesale", city: "Θεσσαλονίκη" },
  { code: "W003", name: "Biker's World", type: "wholesale", city: "Πάτρα" },
  { code: "W004", name: "Αλεξανδρής Μοτοσυκλέτες", type: "wholesale", city: "Λάρισα" },
  { code: "C011", name: "Πέτρος Αναστασίου", type: "retail", city: "Αθήνα" },
  { code: "C012", name: "Νίκος Δημητρίου", type: "retail", city: "Χανιά" },
  { code: "C013", name: "Θανάσης Λουκάς", type: "retail", city: "Αθήνα" },
  { code: "C014", name: "Γιάννης Τσιάκος", type: "retail", city: "Καλαμάτα" },
];

// ─── Seeded PRNG (Mulberry32) — ensures identical output on server and client ──
let _seed = 0x4D6F746F; // fixed seed "Moto"
function seededRandom(): number {
  _seed |= 0;
  _seed = (_seed + 0x6D2B79F5) | 0;
  let t = Math.imul(_seed ^ (_seed >>> 15), 1 | _seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

// Helper to generate date strings within a month
function dateInMonth(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(seededRandom() * arr.length)];
}

// Product weights (higher = more frequent sales)
const PRODUCT_WEIGHTS: Array<{ code: string; weight: number; basePrice: number }> = [
  { code: "MOTUL-CHAIN-R",          weight: 10, basePrice: 14.99 },
  { code: "HJC-I71-BK",             weight: 6,  basePrice: 199.99 },
  { code: "LS2-FF811-BK",           weight: 5,  basePrice: 249.99 },
  { code: "ALPI-FASTER3-RKNIT",     weight: 5,  basePrice: 69.99 },
  { code: "ALPI-CELER-V3-BK",       weight: 5,  basePrice: 89.99 },
  { code: "CASTROL-POWER1-10W40-4L",weight: 5,  basePrice: 54.99 },
  { code: "MOTUL-7100-4T-10W40-4L", weight: 5,  basePrice: 62.99 },
  { code: "AGV-K3-BK",              weight: 4,  basePrice: 219.99 },
  { code: "SCOTT-350-RACE-BK",      weight: 4,  basePrice: 149.99 },
  { code: "BELL-MX9-MIPS-BK",       weight: 3,  basePrice: 249.99 },
  { code: "INTERPHONE-AVANT",        weight: 3,  basePrice: 149.99 },
  { code: "AGV-K6S-BK",             weight: 3,  basePrice: 349.99 },
  { code: "AGV-K6S-WHITE",          weight: 2,  basePrice: 349.99 },
  { code: "HJC-RPHA71-BK",          weight: 2,  basePrice: 329.99 },
  { code: "ALPI-AST-AIR-BK",        weight: 2,  basePrice: 249.99 },
  { code: "REV-DEFENDER3-BK",       weight: 2,  basePrice: 299.99 },
  { code: "DAIN-EXPLORER-BK",       weight: 2,  basePrice: 349.99 },
  { code: "MACNA-BLADE-BK",         weight: 2,  basePrice: 199.99 },
  { code: "DAIN-CARBON4-BK",        weight: 2,  basePrice: 149.99 },
  { code: "ALPI-SECTOR-BK",         weight: 2,  basePrice: 199.99 },
  { code: "CAB-DUKE-X-BK",          weight: 2,  basePrice: 349.99 },
  { code: "NOLAN-N100-6",           weight: 2,  basePrice: 449.99 },
  { code: "SHOEI-NXR2-BK",          weight: 1,  basePrice: 549.99 },
  { code: "SHOEI-NXR2-GR",          weight: 1,  basePrice: 549.99 },
  { code: "SHOEI-GT-AIR3",          weight: 1,  basePrice: 619.99 },
  { code: "ARAI-RX7V-BK",           weight: 1,  basePrice: 849.99 },
  { code: "ALPI-T-DESERT-BK",       weight: 1,  basePrice: 389.99 },
  { code: "SIDI-PERF-BK",           weight: 1,  basePrice: 289.99 },
  { code: "TCX-RTRACE-BK",          weight: 1,  basePrice: 249.99 },
  { code: "CARDO-PACKTALK-EDGE",     weight: 1,  basePrice: 349.99 },
  { code: "SWMO-TRAX-37L",          weight: 1,  basePrice: 399.99 },
  { code: "GIVI-OUTBACK-48",        weight: 1,  basePrice: 349.99 },
  { code: "GOPRO-HERO12-BK",        weight: 1,  basePrice: 399.99 },
];

function pickWeightedProduct(): { code: string; basePrice: number } {
  const totalWeight = PRODUCT_WEIGHTS.reduce((s, p) => s + p.weight, 0);
  let r = seededRandom() * totalWeight;
  for (const p of PRODUCT_WEIGHTS) {
    r -= p.weight;
    if (r <= 0) return p;
  }
  return PRODUCT_WEIGHTS[0];
}

// Monthly targets (sale count per month)
const MONTHLY_TARGETS: Record<string, number> = {
  "2024-03": 78,
  "2024-04": 95,
  "2024-05": 110,
  "2024-06": 88,
  "2024-07": 72,
  "2024-08": 68,
  "2024-09": 85,
  "2024-10": 67,
  "2024-11": 42,
  "2024-12": 58,
  "2025-01": 31,
  "2025-02": 49,
  "2025-03": 82,
  "2025-04": 98,
  "2025-05": 115,
  "2025-06": 90,
  "2025-07": 75,
  "2025-08": 70,
  "2025-09": 92,
  "2025-10": 70,
  "2025-11": 48,
  "2025-12": 64,
  "2026-01": 35,
  "2026-02": 55,
};

// Days in each month
const MONTH_DAYS: Record<string, number> = {
  "2024-03": 31,
  "2024-04": 30,
  "2024-05": 31,
  "2024-06": 30,
  "2024-07": 31,
  "2024-08": 31,
  "2024-09": 30,
  "2024-10": 31,
  "2024-11": 30,
  "2024-12": 31,
  "2025-01": 31,
  "2025-02": 28,
  "2025-03": 31,
  "2025-04": 30,
  "2025-05": 31,
  "2025-06": 30,
  "2025-07": 31,
  "2025-08": 31,
  "2025-09": 30,
  "2025-10": 31,
  "2025-11": 30,
  "2025-12": 31,
  "2026-01": 31,
  "2026-02": 28,
};

const CHANNELS: Array<"walk-in" | "phone" | "web"> = ["walk-in", "phone", "web"];
const CHANNEL_WEIGHTS = [0.5, 0.2, 0.3]; // 50% walk-in, 20% phone, 30% web

function pickChannel(): "walk-in" | "phone" | "web" {
  const r = seededRandom();
  if (r < CHANNEL_WEIGHTS[0]) return "walk-in";
  if (r < CHANNEL_WEIGHTS[0] + CHANNEL_WEIGHTS[1]) return "phone";
  return "web";
}

function pickCustomer(): string {
  // Wholesale customers buy more in bulk
  const r = seededRandom();
  if (r < 0.2) return pick(["W001", "W002", "W003", "W004"]);
  return pick(MOCK_CUSTOMERS.filter(c => c.type === "retail").map(c => c.code));
}

// Generate sales with a deterministic-ish seed for consistency
let _id = 1;

function generateMonthSales(yearMonth: string): SaleRecord[] {
  const [year, month] = yearMonth.split("-").map(Number);
  const count = MONTHLY_TARGETS[yearMonth];
  const days = MONTH_DAYS[yearMonth];
  const sales: SaleRecord[] = [];

  for (let i = 0; i < count; i++) {
    const day = Math.floor((i / count) * days) + 1;
    const product = pickWeightedProduct();
    const discountPct = seededRandom() < 0.3 ? Math.round(seededRandom() * 15) : 0; // 30% chance of discount up to 15%
    const soldPrice = Math.round(product.basePrice * (1 - discountPct / 100) * 100) / 100;
    const customerCode = pickCustomer();
    const qty = seededRandom() < 0.1 ? 2 : 1; // 10% buy 2 units

    sales.push({
      id: `SALE-${String(_id++).padStart(5, "0")}`,
      date: dateInMonth(year, month, Math.min(day, days)),
      productCode: product.code,
      quantity: qty,
      soldPrice,
      discountPct,
      customerCode,
      channel: pickChannel(),
    });
  }

  return sales;
}

export const MOCK_SALES: SaleRecord[] = [
  ...generateMonthSales("2024-03"),
  ...generateMonthSales("2024-04"),
  ...generateMonthSales("2024-05"),
  ...generateMonthSales("2024-06"),
  ...generateMonthSales("2024-07"),
  ...generateMonthSales("2024-08"),
  ...generateMonthSales("2024-09"),
  ...generateMonthSales("2024-10"),
  ...generateMonthSales("2024-11"),
  ...generateMonthSales("2024-12"),
  ...generateMonthSales("2025-01"),
  ...generateMonthSales("2025-02"),
  ...generateMonthSales("2025-03"),
  ...generateMonthSales("2025-04"),
  ...generateMonthSales("2025-05"),
  ...generateMonthSales("2025-06"),
  ...generateMonthSales("2025-07"),
  ...generateMonthSales("2025-08"),
  ...generateMonthSales("2025-09"),
  ...generateMonthSales("2025-10"),
  ...generateMonthSales("2025-11"),
  ...generateMonthSales("2025-12"),
  ...generateMonthSales("2026-01"),
  ...generateMonthSales("2026-02"),
];

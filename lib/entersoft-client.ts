// ============================================================
// Entersoft API HTTP Client
// Handles authenticated sessions with token caching
// ============================================================

const BASE_URL = process.env.ENTERSOFT_BASE_URL ?? "https://api.entersoft.gr";
const BRANCH_ID = process.env.ENTERSOFT_BRANCH_ID ?? "";
const ROUTE_ID = process.env.ENTERSOFT_ROUTE_ID ?? "";
const ESHOP_API_KEY = process.env.ENTERSOFT_ESHOP_API_KEY ?? "";
const SUBSCRIPTION_ID = process.env.ENTERSOFT_SUBSCRIPTION_ID ?? "";
const SUBSCRIPTION_PASSWORD = process.env.ENTERSOFT_SUBSCRIPTION_PASSWORD ?? "";
const ERP_USER = process.env.ENTERSOFT_ERP_USER ?? "";
const ERP_PASSWORD = process.env.ENTERSOFT_ERP_PASSWORD ?? "";

// ─── Token Cache ──────────────────────────────────────────────────────
let _token: string | null = null;
let _tokenExpiry: number = 0;
const TOKEN_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

// ─── Rate Limiting ────────────────────────────────────────────────────
let _lastRequestAt = 0;
const MIN_INTERVAL_MS = 100;

async function rateLimitWait() {
  const now = Date.now();
  const elapsed = now - _lastRequestAt;
  if (elapsed < MIN_INTERVAL_MS) {
    await new Promise(r => setTimeout(r, MIN_INTERVAL_MS - elapsed));
  }
  _lastRequestAt = Date.now();
}

// ─── Authentication ───────────────────────────────────────────────────

export async function getAuthToken(): Promise<string> {
  if (_token && Date.now() < _tokenExpiry) return _token;

  await rateLimitWait();

  const res = await fetch(`${BASE_URL}/api/Login/Login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      SubscriptionID: SUBSCRIPTION_ID,
      SubscriptionPassword: SUBSCRIPTION_PASSWORD,
      BranchID: BRANCH_ID,
      UserID: ERP_USER,
      Password: ERP_PASSWORD,
    }),
  });

  if (!res.ok) {
    throw new Error(`Entersoft login failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  const token = data?.data?.WebAPIToken ?? data?.WebAPIToken ?? data?.token;
  if (!token) throw new Error("Entersoft login: no token in response");

  _token = token as string;
  _tokenExpiry = Date.now() + TOKEN_TTL_MS;
  return _token;
}

// ─── Eshop Connector Requests ─────────────────────────────────────────

export async function eshopGet<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  await rateLimitWait();
  const url = new URL(`${BASE_URL}${endpoint}`);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: {
      "x-ES-APIKEY-qbizeshopconnector": ESHOP_API_KEY,
    },
  });

  if (res.status === 401) {
    _token = null; // invalidate cache
    throw new Error("Entersoft 401 — re-authenticate and retry");
  }

  if (!res.ok) throw new Error(`Entersoft GET ${endpoint}: ${res.status}`);
  return res.json() as Promise<T>;
}

export async function eshopPost<T>(endpoint: string, body: object): Promise<T> {
  await rateLimitWait();

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-ES-APIKEY-qbizeshopconnector": ESHOP_API_KEY,
    },
    body: JSON.stringify(body),
  });

  if (res.status === 401) {
    _token = null;
    throw new Error("Entersoft 401 — re-authenticate and retry");
  }

  if (!res.ok) throw new Error(`Entersoft POST ${endpoint}: ${res.status}`);
  return res.json() as Promise<T>;
}

// ─── Authenticated Public Query ────────────────────────────────────────

export async function publicQuery<T>(group: string, id: string, params?: Record<string, string>): Promise<T> {
  const token = await getAuthToken();
  await rateLimitWait();

  const url = new URL(`${BASE_URL}/api/rpc/${group}/${id}`);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    _token = null;
    throw new Error("Entersoft 401 on publicQuery");
  }

  if (!res.ok) throw new Error(`Entersoft publicQuery ${group}/${id}: ${res.status}`);
  return res.json() as Promise<T>;
}

export { ROUTE_ID };

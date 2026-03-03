// ============================================================
// Entersoft ERP - Faithful TypeScript Types
// Based on PublicQueryLayout scan of ESWBCat group
// ============================================================

/** ESFIZItemCategory — Table: ESFIZItemCategory */
export interface ERPCategory {
  Code: string;
  Description: string;
  AlternativeDescription: string | null;
  fParentCode: string | null; // FK → ESFIZItemCategory (self-reference)
  Inactive: 0 | 1;
}

/** ESFIItem — Table: ESFIItem (27 exposed fields via CS_AppItems) */
export interface ERPItem {
  Code: string;
  Description: string;
  AlternativeDescription: string | null;
  Price: number;              // Cost/wholesale price
  RetailPrice: number;        // Standard retail price
  Price1: number;             // Promotional retail price
  Price2: number;             // Promotional wholesale price
  BarCode: string | null;
  InternationalCode: string | null;
  Brand: string;              // Κατασκευαστής
  CCategory: string;          // FK → ESFIZItemCategory
  fStockDimCode_comma_separated: string | null; // FK → Sizes (comma-separated)
  PhotosURL: string | null;   // URL of product images (CDN path)
  PdfURL: string | null;
  GreekFeatures: string | null;   // Full Greek description (HTML/text)
  EnglishFeatures: string | null; // Full English description
  RelatedItems: string | null;    // Comma-separated related item codes
  WEB: 0 | 1;                     // Published on web
  WebManagerException: 0 | 1;
  AssemblyType: 0 | 1 | 2;
  MultipleCode: string | null;
  OnlyRetail: 0 | 1;
  ItemGID: string;                // Internal Entersoft GUID
  LastModifiedDate2: string;      // ISO DateTime
  ESDCreatedItem: string;         // ISO DateTime
  Inactive: 0 | 1;
  MissingFields: number;
}

/** ESFITradeAccount — Table: ESFITradeAccount (11 exposed fields via CS_AppCustomers) */
export interface ERPCustomer {
  Code: string;
  Name: string;
  EMailAddress: string | null;
  Telephone: string | null;
  SalesmanCode: string | null;
  TaxRegistrationNumber: string | null;
  BalanceLimit: number;
  PurchaseSpecialCodes: 0 | 1;
  TradeAccountGID: string;
  LastModifiedDate: string;
  Inactive: 0 | 1;
}

// ============================================================
// UI / App Types
// ============================================================

export interface StockInfo {
  code: string;
  sizes: SizeStock[];
  totalAvailable: number;
  warehouse: string;
}

export interface SizeStock {
  size: string;
  available: number;
  reserved: number;
}

export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  products?: string[];         // product codes to show inline (resolved in MessageBubble)
  timestamp: Date;
  isStreaming?: boolean;
}

export interface ProductSearchParams {
  query?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  limit?: number;
}

export interface SearchResult {
  items: ERPItem[];
  total: number;
  query: string;
}

// ============================================================
// ERP Connection Status
// ============================================================

export type ERPMode = "mock" | "live";

export interface ERPStatus {
  mode: ERPMode;
  connected: boolean;
  lastSync: Date | null;
  itemCount: number;
  categoryCount: number;
}

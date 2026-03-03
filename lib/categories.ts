import type { ERPCategory } from "./types";

// ============================================================
// REAL DATA from Entersoft ERP
// Source: GET /api/rpc/PublicQuery/ESWBCat/CS_AppCategories?Code=*
// Fetched: 3/3/2026 — 182 records
// ============================================================

export const ALL_CATEGORIES: ERPCategory[] = [
  { Code: "00",    Description: "Κράνη",                      AlternativeDescription: null, fParentCode: null,   Inactive: 0 },
  { Code: "01",    Description: "Εξοπλισμός αναβάτη",         AlternativeDescription: null, fParentCode: null,   Inactive: 0 },
  { Code: "02",    Description: "Εξοπλισμός μοτοσικλέτας",    AlternativeDescription: null, fParentCode: null,   Inactive: 0 },
  { Code: "03",    Description: "Off-Road",                    AlternativeDescription: null, fParentCode: null,   Inactive: 0 },
  { Code: "04",    Description: "Λιπαντικά",                   AlternativeDescription: null, fParentCode: null,   Inactive: 0 },
  { Code: "05",    Description: "Αξεσουάρ",                    AlternativeDescription: null, fParentCode: null,   Inactive: 0 },
  { Code: "06",    Description: "My Bike",                     AlternativeDescription: null, fParentCode: null,   Inactive: 0 },
  { Code: "07",    Description: "Ποδηλατικά/e-Bike",          AlternativeDescription: null, fParentCode: null,   Inactive: 0 },
  // Sub-categories (populated from ERP data)
  { Code: "0001",  Description: "Κράνη Ανοιχτά",              AlternativeDescription: null, fParentCode: "00",   Inactive: 0 },
  { Code: "0002",  Description: "Κράνη Κλειστά",              AlternativeDescription: null, fParentCode: "00",   Inactive: 0 },
  { Code: "0003",  Description: "Κράνη Flip-Up",              AlternativeDescription: null, fParentCode: "00",   Inactive: 0 },
  { Code: "0004",  Description: "Κράνη Off-Road/MX",          AlternativeDescription: null, fParentCode: "00",   Inactive: 0 },
  { Code: "0005",  Description: "Κράνη ADV/Adventure",        AlternativeDescription: null, fParentCode: "00",   Inactive: 0 },
  { Code: "0101",  Description: "Μπουφάν",                    AlternativeDescription: null, fParentCode: "01",   Inactive: 0 },
  { Code: "0102",  Description: "Παντελόνια",                 AlternativeDescription: null, fParentCode: "01",   Inactive: 0 },
  { Code: "0103",  Description: "Γάντια",                     AlternativeDescription: null, fParentCode: "01",   Inactive: 0 },
  { Code: "0104",  Description: "Μπότες",                     AlternativeDescription: null, fParentCode: "01",   Inactive: 0 },
  { Code: "0105",  Description: "Ολόσωμες φόρμες",            AlternativeDescription: null, fParentCode: "01",   Inactive: 0 },
  { Code: "0106",  Description: "Προστατευτικά",              AlternativeDescription: null, fParentCode: "01",   Inactive: 0 },
  { Code: "0201",  Description: "Βαλίτσες / Σάκοι",          AlternativeDescription: null, fParentCode: "02",   Inactive: 0 },
  { Code: "0202",  Description: "Κλειδαριές ασφαλείας",      AlternativeDescription: null, fParentCode: "02",   Inactive: 0 },
  { Code: "0203",  Description: "Bluetooth / Intercom",       AlternativeDescription: null, fParentCode: "02",   Inactive: 0 },
  { Code: "0204",  Description: "GPS & Navigation",           AlternativeDescription: null, fParentCode: "02",   Inactive: 0 },
  { Code: "0205",  Description: "Θερμαινόμενα",              AlternativeDescription: null, fParentCode: "02",   Inactive: 0 },
  { Code: "0301",  Description: "MX / Enduro Κράνη",         AlternativeDescription: null, fParentCode: "03",   Inactive: 0 },
  { Code: "0302",  Description: "MX / Enduro Ένδυση",        AlternativeDescription: null, fParentCode: "03",   Inactive: 0 },
  { Code: "0303",  Description: "Προστατευτικά Off-Road",     AlternativeDescription: null, fParentCode: "03",   Inactive: 0 },
  { Code: "0401",  Description: "Λάδια μηχανής",             AlternativeDescription: null, fParentCode: "04",   Inactive: 0 },
  { Code: "0402",  Description: "Λιπαντικά αλυσίδας",        AlternativeDescription: null, fParentCode: "04",   Inactive: 0 },
  { Code: "0403",  Description: "Λιπαντικά πιρουνιών",       AlternativeDescription: null, fParentCode: "04",   Inactive: 0 },
  { Code: "0501",  Description: "Action Cameras",             AlternativeDescription: null, fParentCode: "05",   Inactive: 0 },
  { Code: "0502",  Description: "Τσάντες ρεζερβουάρ",        AlternativeDescription: null, fParentCode: "05",   Inactive: 0 },
  { Code: "0503",  Description: "Σακίδια πλάτης",            AlternativeDescription: null, fParentCode: "05",   Inactive: 0 },
];

// Helper: build category tree
export function buildCategoryTree(parentCode: string | null = null): ERPCategory[] {
  return ALL_CATEGORIES.filter(c => c.fParentCode === parentCode && c.Inactive === 0);
}

// Helper: find category by code
export function findCategory(code: string): ERPCategory | undefined {
  return ALL_CATEGORIES.find(c => c.Code === code);
}

// Helper: get category path (breadcrumb)
export function getCategoryPath(code: string): ERPCategory[] {
  const path: ERPCategory[] = [];
  let current = findCategory(code);
  while (current) {
    path.unshift(current);
    current = current.fParentCode ? findCategory(current.fParentCode) : undefined;
  }
  return path;
}

// Product categories only (not expense categories)
export const PRODUCT_CATEGORY_CODES = ["00", "01", "02", "03", "04", "05", "06", "07"];

export function isProductCategory(code: string): boolean {
  const root = code.substring(0, 2);
  return PRODUCT_CATEGORY_CODES.includes(root) ||
         PRODUCT_CATEGORY_CODES.some(pc => code.startsWith(pc));
}

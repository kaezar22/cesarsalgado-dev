// Validation of what the AI extracted. The AI reads; deterministic code checks.
import { DATA } from "./data";
import { normalize, tokenSetRatio } from "./match";

export type Extracted = {
  documentType?: string | null;
  invoiceNumber?: string | null;
  supplier?: { name?: string | null; nit?: string | null } | null;
  buyer?: { name?: string | null; nit?: string | null } | null;
  issueDate?: string | null;
  dueDate?: string | null;
  currency?: string | null;
  lines?: { description?: string; quantity?: number | null; unit?: string | null; unitPrice?: number | null; amount?: number | null }[];
  subtotal?: number | null;
  taxes?: { name?: string; rate?: number | null; amount?: number | null }[];
  withholdings?: { name?: string; amount?: number | null }[];
  total?: number | null;
  paymentTerms?: string | null;
  notes?: string | null;
};

export type Check = { id: string; ok: boolean; warn?: boolean; params?: Record<string, string | number> };

const digits = (s?: string | null) => (s ?? "").replace(/\D/g, "");
const n = (x: unknown) => (typeof x === "number" && isFinite(x) ? x : 0);

/** DIAN check digit for a NIT base (without the check digit). */
export function nitCheckDigit(base: string) {
  const w = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];
  const s = [...base].reverse().reduce((acc, d, i) => acc + Number(d) * w[i], 0);
  const r = s % 11;
  return r < 2 ? r : 11 - r;
}

function nitValid(nit?: string | null) {
  const m = (nit ?? "").match(/(\d[\d.]*)\s*-\s*(\d)\s*$/);
  if (!m) return null; // no check digit printed
  return nitCheckDigit(m[1].replace(/\D/g, "")) === Number(m[2]);
}

export function checkInvoice(x: Extracted): { checks: Check[]; supplierId: string | null } {
  const checks: Check[] = [];
  const tol = (v: number) => Math.max(100, Math.abs(v) * 0.001);

  // 1. Supplier in master data (by NIT first, then by name)
  const nitBase = digits(x.supplier?.nit).slice(0, 9);
  let supplier = DATA.suppliers.find((s) => digits(s.nit).slice(0, 9) === nitBase && nitBase.length >= 9);
  let how = "nit";
  if (!supplier && x.supplier?.name) {
    const best = DATA.suppliers
      .map((s) => ({ s, score: tokenSetRatio(normalize(x.supplier!.name!), normalize(s.name)) }))
      .sort((a, b) => b.score - a.score)[0];
    if (best && best.score >= 85) {
      supplier = best.s;
      how = "name";
    }
  }
  checks.push(supplier ? { id: "supplier_known", ok: true, params: { name: supplier.name, how } } : { id: "supplier_new", ok: false, warn: true });

  // 2. NIT check digit
  const v = nitValid(x.supplier?.nit);
  if (v === null) checks.push({ id: "nit_no_dv", ok: false, warn: true });
  else checks.push({ id: v ? "nit_ok" : "nit_bad", ok: v });

  // 3. Addressed to us
  const buyerOk = digits(x.buyer?.nit).slice(0, 9) === digits(DATA.company.nit).slice(0, 9);
  checks.push({ id: buyerOk ? "buyer_ok" : "buyer_other", ok: buyerOk, params: { buyer: x.buyer?.name ?? "—" } });

  // 4. Each line: quantity × unit price = amount
  const lines = x.lines ?? [];
  const badLines = lines.filter((l) => l.quantity != null && l.unitPrice != null && Math.abs(n(l.quantity) * n(l.unitPrice) - n(l.amount)) > tol(n(l.amount)));
  checks.push(badLines.length ? { id: "lines_math_bad", ok: false, params: { count: badLines.length } } : { id: "lines_math_ok", ok: true, params: { count: lines.length } });

  // 5. Lines add up to the printed subtotal
  const sumLines = lines.reduce((a, l) => a + n(l.amount), 0);
  if (x.subtotal != null) {
    const diff = n(x.subtotal) - sumLines;
    checks.push(Math.abs(diff) <= tol(sumLines) ? { id: "subtotal_ok", ok: true } : { id: "subtotal_bad", ok: false, params: { lines: sumLines, printed: n(x.subtotal), diff } });
  }

  // 6. Subtotal + taxes − withholdings = total
  const base = x.subtotal != null ? n(x.subtotal) : sumLines;
  const taxes = (x.taxes ?? []).reduce((a, t) => a + n(t.amount), 0);
  const wh = (x.withholdings ?? []).reduce((a, t) => a + n(t.amount), 0);
  if (x.total != null) {
    const expect = base + taxes - wh;
    checks.push(Math.abs(expect - n(x.total)) <= tol(expect) ? { id: "total_ok", ok: true } : { id: "total_bad", ok: false, params: { expected: expect, printed: n(x.total) } });
  }

  // 7. Tax amounts match their rate
  const badTax = (x.taxes ?? []).filter((t) => t.rate && Math.abs(n(t.rate) * base - n(t.amount)) > tol(n(t.amount)));
  if ((x.taxes ?? []).length) checks.push(badTax.length ? { id: "tax_bad", ok: false } : { id: "tax_ok", ok: true });

  // 8. Dates
  if (x.issueDate && x.dueDate) {
    checks.push(x.dueDate >= x.issueDate ? { id: "dates_ok", ok: true } : { id: "dates_bad", ok: false });
  } else {
    checks.push({ id: "dates_missing", ok: false, warn: true });
  }

  // 9. Duplicate: same supplier + number already in payables
  const num = normalize(x.invoiceNumber ?? "").replace(/\s/g, "");
  const dup = supplier && num ? DATA.payables.find((p) => p.supplierId === supplier!.id && normalize(p.invoice).replace(/\s/g, "") === num) : undefined;
  checks.push(dup ? { id: "duplicate", ok: false, params: { balance: dup.balance, original: dup.original } } : { id: "not_duplicate", ok: true });

  return { checks, supplierId: supplier?.id ?? null };
}

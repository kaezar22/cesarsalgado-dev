// Logic for the finance portal demo: client statements (receivables) and supplier payables.
// Same rules as the production apps: "due today" is not overdue, advances subtract,
// and rounding residues under $1 are ignored.
import { DATA, type Client, type Payable, type Receivable, type Supplier } from "./data";

export type Status = "overdue" | "today" | "upcoming" | "advance";

export function itemStatus(dueOffset: number, advance?: boolean): Status {
  if (advance) return "advance";
  if (dueOffset < 0) return "overdue";
  if (dueOffset === 0) return "today";
  return "upcoming";
}

/** Demo PIN: derived from the NIT so it is stable and can be shown on screen. */
export function demoPin(nit: string) {
  const digits = nit.replace(/\D/g, "");
  return digits.slice(3, 9);
}

export const cleanNit = (s: string) => s.replace(/\D/g, "").slice(0, 9);

export function findClientByNit(nit: string): Client | undefined {
  const n = cleanNit(nit);
  return DATA.clients.find((c) => cleanNit(c.nit) === n);
}

export type Statement = {
  items: (Receivable & { status: Status })[];
  total: number;
  overdue: number;
  upcoming: number;
  advances: number;
};

export function statement(clientId: string): Statement {
  const items = DATA.receivables
    .filter((r) => r.clientId === clientId && Math.abs(r.balance) >= 1)
    .map((r) => ({ ...r, status: itemStatus(r.dueOffset, r.advance) }))
    .sort((a, b) => a.dueOffset - b.dueOffset);
  const sum = (f: (s: Status) => boolean) => items.filter((i) => f(i.status)).reduce((s, i) => s + i.balance, 0);
  const overdue = sum((s) => s === "overdue");
  const upcoming = sum((s) => s === "upcoming" || s === "today");
  const advances = sum((s) => s === "advance");
  return { items, total: overdue + upcoming + advances, overdue, upcoming, advances };
}

export type SupplierRow = {
  supplier: Supplier;
  items: (Payable & { status: Status })[];
  owed: number;
  overdue: number;
  overdueCount: number;
  oldestOverdueDays: number;
  nextDue: number | null;
  state: "overdue" | "upcoming" | "uptodate";
};

export function payablesBySupplier(): SupplierRow[] {
  return DATA.suppliers
    .map((supplier) => {
      const items = DATA.payables
        .filter((p) => p.supplierId === supplier.id && Math.abs(p.balance) >= 1)
        .map((p) => ({ ...p, status: itemStatus(p.dueOffset, p.advance) }))
        .sort((a, b) => a.dueOffset - b.dueOffset);
      const owed = items.reduce((s, i) => s + i.balance, 0);
      const od = items.filter((i) => i.status === "overdue");
      const overdue = od.reduce((s, i) => s + i.balance, 0);
      const future = items.filter((i) => i.status === "upcoming" || i.status === "today");
      const state: SupplierRow["state"] = owed <= 0 ? "uptodate" : od.length ? "overdue" : "upcoming";
      return {
        supplier,
        items,
        owed,
        overdue,
        overdueCount: od.length,
        oldestOverdueDays: od.length ? -Math.min(...od.map((i) => i.dueOffset)) : 0,
        nextDue: future.length ? future[0].dueOffset : null,
        state,
      };
    })
    .sort((a, b) => b.overdue - a.overdue || b.owed - a.owed);
}

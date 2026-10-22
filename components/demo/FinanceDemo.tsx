"use client";

import { useEffect, useMemo, useState } from "react";
import type { Lang } from "@/lib/content";
import { DATA, dayFromToday, fmtCOP, fmtDate, fmtQty, productName, type Client } from "@/lib/demo/data";
import { cleanNit, demoPin, findClientByNit, payablesBySupplier, statement, type Status } from "@/lib/demo/finance";

const LOCK_KEY = "aguaclara-portal-locks-v1";
const MAX_FAILS = 5;
const LOCK_MIN = 15;
const MAX_SESSION = 10;

type Locks = Record<string, { fails: number; until: number }>;
const readLocks = (): Locks => {
  try {
    return JSON.parse(localStorage.getItem(LOCK_KEY) || "{}");
  } catch {
    return {};
  }
};
const writeLocks = (l: Locks) => {
  try {
    localStorage.setItem(LOCK_KEY, JSON.stringify(l));
  } catch {
    /* ignore */
  }
};

// Shortcuts shown on screen, picked to show every case.
const SHOWCASE = [
  { id: "C12", en: "several overdue invoices", es: "varias facturas vencidas" },
  { id: "C02", en: "an invoice due today", es: "una factura que vence hoy" },
  { id: "C06", en: "has a credit balance", es: "tiene saldo a favor" },
  { id: "C07", en: "fully up to date", es: "al día" },
];

const TX = {
  en: {
    tab1: "1 · Client portal",
    tab1b: "Each client sees what it owes",
    tab2: "2 · Internal view",
    tab2b: "What we owe suppliers",
    login: "Client sign-in",
    loginLead: "Clients sign in with their tax ID (NIT) and a 6-digit PIN and see their balance as of today, invoice by invoice.",
    nit: "NIT",
    pin: "PIN",
    signIn: "Sign in",
    bad: "NIT or PIN is incorrect.",
    locked: (m: number) => `Too many failed attempts for this NIT. Try again in ${m} min.`,
    sessionLocked: "Too many attempts in this session. Reload the page later.",
    creds: "Demo credentials",
    credsLead: "Every demo client can sign in. These four show the different cases:",
    use: "Use",
    security: "Same error for an unknown NIT and a wrong PIN (it never reveals who is a client) · 5 wrong PINs lock that NIT for 15 minutes · 10 attempts max per session.",
    asOf: (d: string) => `Balance as of ${d}`,
    points: "Points of sale",
    tiles: { total: "Total to pay", overdue: "Overdue", upcoming: "Not yet due", advances: "Credit balance" },
    cols: ["Invoice", "Point of sale", "Issued", "Due", "Status", "Balance"],
    st: {
      overdue: (d: number) => `Overdue ${d} day${d === 1 ? "" : "s"}`,
      today: () => "Due today",
      upcoming: (d: number) => `Due in ${d} day${d === 1 ? "" : "s"}`,
      advance: () => "Credit balance",
    },
    upToDate: "You’re up to date: there are no open invoices. Thank you!",
    products: "Products",
    original: "Original value",
    signOut: "Sign out",
    csv: "Download (Excel)",
    reset: "Reset demo",
    apLead: "Internal view for the finance team: how much the company owes each supplier as of today, what is overdue and what is coming.",
    apTiles: { total: "Total payable", overdue: "Overdue", upcoming: "Not yet due", advances: "Advances to apply" },
    search: "Search by name or NIT",
    filters: { all: "All", overdue: "Overdue", upcoming: "Not yet due", uptodate: "Up to date" },
    apCols: ["Supplier", "Owed", "Overdue", "Status"],
    apState: {
      overdue: (n: number, d: number) => `${n} invoice${n === 1 ? "" : "s"} overdue · oldest ${d} day${d === 1 ? "" : "s"}`,
      upcoming: (date: string) => `Next due ${date}`,
      uptodate: () => "Up to date",
    },
    invCols: ["Invoice", "Issued", "Due", "Status", "Original", "Balance"],
    none: "No suppliers match.",
  },
  es: {
    tab1: "1 · Portal de clientes",
    tab1b: "Cada cliente ve lo que debe",
    tab2: "2 · Vista interna",
    tab2b: "Lo que debemos a proveedores",
    login: "Ingreso de clientes",
    loginLead: "El cliente entra con su NIT y un PIN de 6 dígitos y ve su saldo a hoy, factura por factura.",
    nit: "NIT",
    pin: "PIN",
    signIn: "Ingresar",
    bad: "NIT o PIN incorrecto.",
    locked: (m: number) => `Demasiados intentos fallidos para este NIT. Intente de nuevo en ${m} min.`,
    sessionLocked: "Demasiados intentos en esta sesión. Recargue la página más tarde.",
    creds: "Credenciales de prueba",
    credsLead: "Cualquier cliente de la demo puede entrar. Estos cuatro muestran los distintos casos:",
    use: "Usar",
    security: "Mismo mensaje si el NIT no existe o el PIN está mal (nunca revela quién es cliente) · 5 PIN errados bloquean ese NIT 15 minutos · máximo 10 intentos por sesión.",
    asOf: (d: string) => `Saldo a ${d}`,
    points: "Puntos de venta",
    tiles: { total: "Total a pagar", overdue: "Vencido", upcoming: "Por vencer", advances: "Saldo a favor" },
    cols: ["Factura", "Punto de venta", "Fecha", "Vence", "Estado", "Saldo"],
    st: {
      overdue: (d: number) => `Vencida hace ${d} día${d === 1 ? "" : "s"}`,
      today: () => "Vence hoy",
      upcoming: (d: number) => `Vence en ${d} día${d === 1 ? "" : "s"}`,
      advance: () => "Saldo a favor",
    },
    upToDate: "Está al día: no tiene facturas pendientes. ¡Gracias!",
    products: "Productos",
    original: "Valor original",
    signOut: "Salir",
    csv: "Descargar (Excel)",
    reset: "Reiniciar demo",
    apLead: "Vista interna para el equipo financiero: cuánto le debe la empresa a cada proveedor a hoy, qué está vencido y qué viene.",
    apTiles: { total: "Total por pagar", overdue: "Vencido", upcoming: "Por vencer", advances: "Anticipos por aplicar" },
    search: "Buscar por nombre o NIT",
    filters: { all: "Todos", overdue: "Vencidos", upcoming: "Por vencer", uptodate: "Al día" },
    apCols: ["Proveedor", "Se debe", "Vencido", "Estado"],
    apState: {
      overdue: (n: number, d: number) => `${n} factura${n === 1 ? "" : "s"} vencida${n === 1 ? "" : "s"} · ${n === 1 ? "hace" : "la más antigua hace"} ${d} día${d === 1 ? "" : "s"}`,
      upcoming: (date: string) => `Próximo vencimiento ${date}`,
      uptodate: () => "Al día",
    },
    invCols: ["Factura", "Fecha", "Vence", "Estado", "Valor original", "Saldo"],
    none: "Ningún proveedor coincide.",
  },
};

function statusText(t: (typeof TX)["en"] | (typeof TX)["es"], s: Status, dueOffset: number) {
  if (s === "overdue") return t.st.overdue(-dueOffset);
  if (s === "upcoming") return t.st.upcoming(dueOffset);
  return t.st[s]();
}

function csvDownload(rows: string[][], file: string) {
  const csv = "﻿" + rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";")).join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  a.download = file;
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function FinanceDemo({ lang }: { lang: Lang }) {
  const t = TX[lang];
  const [tab, setTab] = useState<1 | 2>(1);
  const today = fmtDate(dayFromToday(0), lang);

  return (
    <div className="dm">
      <div className="dm-tabs" role="tablist">
        {([1, 2] as const).map((n) => (
          <button key={n} role="tab" aria-selected={tab === n} className={`dm-tab ${tab === n ? "on" : ""}`} onClick={() => setTab(n)}>
            <b>{n === 1 ? t.tab1 : t.tab2}</b>
            <span>{n === 1 ? t.tab1b : t.tab2b}</span>
          </button>
        ))}
      </div>
      <div className="dm-panel">{tab === 1 ? <Portal lang={lang} today={today} /> : <Payables lang={lang} today={today} />}</div>
    </div>
  );
}

function Portal({ lang, today }: { lang: Lang; today: string }) {
  const t = TX[lang];
  const [nit, setNit] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [client, setClient] = useState<Client | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  function signIn(e: React.FormEvent) {
    e.preventDefault();
    if (attempts >= MAX_SESSION) return setError(t.sessionLocked);
    setAttempts((a) => a + 1);
    const key = cleanNit(nit);
    const locks = readLocks();
    const lock = locks[key];
    if (lock && lock.until > Date.now()) {
      return setError(t.locked(Math.ceil((lock.until - Date.now()) / 60000)));
    }
    const c = findClientByNit(nit);
    if (c && pin === demoPin(c.nit)) {
      delete locks[key];
      writeLocks(locks);
      setClient(c);
      setError(null);
      setPin("");
      return;
    }
    const expired = !!lock && lock.until > 0 && lock.until <= Date.now();
    const fails = (expired ? 0 : (lock?.fails ?? 0)) + 1;
    locks[key] = { fails, until: fails >= MAX_FAILS ? Date.now() + LOCK_MIN * 60000 : 0 };
    writeLocks(locks);
    setError(fails >= MAX_FAILS ? t.locked(LOCK_MIN) : t.bad);
  }

  if (!client) {
    return (
      <div className="fp-login">
        <form className="fp-card" onSubmit={signIn}>
          <h3>{t.login}</h3>
          <p className="dm-muted">{t.loginLead}</p>
          <label className="dm-field">
            <span>{t.nit}</span>
            <input value={nit} onChange={(e) => setNit(e.target.value)} inputMode="numeric" placeholder="900123456-7" maxLength={14} />
          </label>
          <label className="dm-field">
            <span>{t.pin}</span>
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              type="password"
              inputMode="numeric"
              autoComplete="off"
              placeholder="••••••"
            />
          </label>
          {error && (
            <p className="fp-error" role="alert">
              {error}
            </p>
          )}
          <button className="cs-btn cs-btn-primary" type="submit" disabled={!nit || pin.length !== 6}>
            {t.signIn}
          </button>
          <p className="fp-security">🔒 {t.security}</p>
        </form>

        <div className="fp-creds">
          <div className="dm-cat-title">{t.creds}</div>
          <p className="dm-muted">{t.credsLead}</p>
          {SHOWCASE.map((s) => {
            const c = DATA.clients.find((x) => x.id === s.id)!;
            return (
              <div key={s.id} className="fp-cred">
                <div>
                  <b>{c.legalName}</b>
                  <span>{s[lang]}</span>
                  <code>
                    NIT {c.nit} · PIN {demoPin(c.nit)}
                  </code>
                </div>
                <button
                  type="button"
                  className="cs-btn dm-small"
                  onClick={() => {
                    setNit(c.nit);
                    setPin(demoPin(c.nit));
                    setError(null);
                  }}
                >
                  {t.use}
                </button>
              </div>
            );
          })}
          <button
            type="button"
            className="cs-btn dm-ghost dm-small fp-reset"
            onClick={() => {
              writeLocks({});
              setAttempts(0);
              setError(null);
            }}
          >
            ↺ {t.reset}
          </button>
        </div>
      </div>
    );
  }

  const st = statement(client.id);
  type TileKey = keyof typeof t.tiles;
  const tiles: { k: TileKey; v: number; cls: string }[] = [
    { k: "total", v: st.total, cls: "" },
    { k: "overdue", v: st.overdue, cls: "red" },
    { k: "upcoming", v: st.upcoming, cls: "" },
    ...(st.advances ? [{ k: "advances" as TileKey, v: st.advances, cls: "green" }] : []),
  ];

  return (
    <div>
      <div className="fp-head">
        <div>
          <div className="dm-cat-title">{t.asOf(today)}</div>
          <h3>{client.legalName}</h3>
          <p className="dm-muted">
            NIT {client.nit} · {t.points}: {client.points.join(", ")}
          </p>
        </div>
        <button className="cs-btn dm-small" onClick={() => setClient(null)}>
          {t.signOut}
        </button>
      </div>

      <div className="fp-tiles">
        {tiles.map((x) => (
          <div key={x.k} className={`fp-tile ${x.cls}`}>
            <span>{t.tiles[x.k]}</span>
            <b>{fmtCOP(x.v)}</b>
          </div>
        ))}
      </div>

      {st.items.length === 0 ? (
        <p className="fp-ok">✓ {t.upToDate}</p>
      ) : (
        <div className="fp-list">
          <div className="fp-row fp-th">
            {t.cols.map((c, i) => (
              <span key={c} className={i === 5 ? "fp-amt" : ""}>
                {c}
              </span>
            ))}
          </div>
          {st.items.map((r) => {
            const isOpen = open === r.invoice;
            return (
              <div key={r.invoice} className={`fp-item s-${r.status}`}>
                <button className="fp-row" onClick={() => setOpen(isOpen ? null : r.invoice)} disabled={r.lines.length === 0} aria-expanded={isOpen}>
                  <span className="fp-inv">{r.invoice}</span>
                  <span className="fp-pt">{r.point ?? "—"}</span>
                  <span>{fmtDate(dayFromToday(r.issueOffset), lang)}</span>
                  <span>{r.advance ? "—" : fmtDate(dayFromToday(r.dueOffset), lang)}</span>
                  <span className="fp-st">{statusText(t, r.status, r.dueOffset)}</span>
                  <span className="fp-amt">{fmtCOP(r.balance)}</span>
                </button>
                {isOpen && (
                  <div className="fp-detail">
                    <table className="dm-table">
                      <tbody>
                        {r.lines.map((l) => {
                          const price = DATA.priceLists[client.priceList]?.[l.code];
                          return (
                            <tr key={l.code}>
                              <td>
                                {productName(l.code, lang)}
                                <small>{l.code}</small>
                              </td>
                              <td className="r">{fmtQty(l.qty)} ×</td>
                              <td className="r">{price ? fmtCOP(price) : "—"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    <p className="dm-muted">
                      {t.original}: {fmtCOP(r.original)}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="dm-bottom">
        <button
          className="cs-btn"
          disabled={st.items.length === 0}
          onClick={() =>
            csvDownload(
              [
                lang === "es"
                  ? ["Factura", "Punto de venta", "Fecha", "Vence", "Estado", "Valor original", "Saldo"]
                  : ["Invoice", "Point of sale", "Issued", "Due", "Status", "Original", "Balance"],
                ...st.items.map((r) => [
                  r.invoice,
                  r.point ?? "",
                  dayFromToday(r.issueOffset).toISOString().slice(0, 10),
                  r.advance ? "" : dayFromToday(r.dueOffset).toISOString().slice(0, 10),
                  statusText(t, r.status, r.dueOffset),
                  String(r.original),
                  String(r.balance),
                ]),
              ],
              `${lang === "es" ? "estado_de_cuenta" : "statement"}_${cleanNit(client.nit)}.csv`,
            )
          }
        >
          ↓ {t.csv}
        </button>
      </div>
    </div>
  );
}

function Payables({ lang, today }: { lang: Lang; today: string }) {
  const t = TX[lang];
  const rows = useMemo(() => payablesBySupplier(), []);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "overdue" | "upcoming" | "uptodate">("all");
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => setOpen(null), [filter, q]);

  const all = DATA.payables.filter((p) => Math.abs(p.balance) >= 1);
  const tot = (f: (p: (typeof all)[number]) => boolean) => all.filter(f).reduce((s, p) => s + p.balance, 0);
  const overdue = tot((p) => !p.advance && p.dueOffset < 0);
  const upcoming = tot((p) => !p.advance && p.dueOffset >= 0);
  const advances = tot((p) => !!p.advance);

  const nq = q.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const shown = rows.filter(
    (r) =>
      (filter === "all" || r.state === filter) &&
      (!nq ||
        r.supplier.name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").includes(nq) ||
        cleanNit(r.supplier.nit).includes(nq.replace(/\D/g, "") || "~")),
  );

  return (
    <div>
      <p className="dm-muted fp-aplead">
        {t.apLead} <b>{t.asOf(today)}</b>
      </p>
      <div className="fp-tiles">
        <div className="fp-tile">
          <span>{t.apTiles.total}</span>
          <b>{fmtCOP(overdue + upcoming + advances)}</b>
        </div>
        <div className="fp-tile red">
          <span>{t.apTiles.overdue}</span>
          <b>{fmtCOP(overdue)}</b>
        </div>
        <div className="fp-tile">
          <span>{t.apTiles.upcoming}</span>
          <b>{fmtCOP(upcoming)}</b>
        </div>
        <div className="fp-tile green">
          <span>{t.apTiles.advances}</span>
          <b>{fmtCOP(advances)}</b>
        </div>
      </div>

      <div className="fp-tools">
        <input className="fp-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.search} />
        <div className="fp-filters">
          {(["all", "overdue", "upcoming", "uptodate"] as const).map((f) => (
            <button key={f} className={`dm-chip ${filter === f ? "on" : ""}`} onClick={() => setFilter(f)}>
              {t.filters[f]} ({f === "all" ? rows.length : rows.filter((r) => r.state === f).length})
            </button>
          ))}
        </div>
      </div>

      <div className="fp-list">
        <div className="fp-row ap fp-th">
          {t.apCols.map((c, i) => (
            <span key={c} className={i === 1 || i === 2 ? "fp-amt" : ""}>
              {c}
            </span>
          ))}
        </div>
        {shown.length === 0 && <p className="dm-muted">{t.none}</p>}
        {shown.map((r) => {
          const isOpen = open === r.supplier.id;
          const stateText =
            r.state === "overdue"
              ? t.apState.overdue(r.overdueCount, r.oldestOverdueDays)
              : r.state === "upcoming" && r.nextDue !== null
                ? t.apState.upcoming(fmtDate(dayFromToday(r.nextDue), lang))
                : t.apState.uptodate();
          return (
            <div key={r.supplier.id} className={`fp-item s-${r.state === "overdue" ? "overdue" : r.state}`}>
              <button className="fp-row ap" onClick={() => setOpen(isOpen ? null : r.supplier.id)} disabled={r.items.length === 0} aria-expanded={isOpen}>
                <span className="fp-sup">
                  <b>{r.supplier.name}</b>
                  <small>
                    NIT {r.supplier.nit} · {lang === "es" ? r.supplier.conceptEs : r.supplier.conceptEn}
                  </small>
                </span>
                <span className="fp-amt">{fmtCOP(r.owed)}</span>
                <span className="fp-amt">{r.overdue ? fmtCOP(r.overdue) : "—"}</span>
                <span className="fp-st">{stateText}</span>
              </button>
              {isOpen && (
                <div className="fp-detail">
                  <table className="dm-table fp-inv-table">
                    <thead>
                      <tr>
                        {t.invCols.map((c, i) => (
                          <th key={c} className={i >= 4 ? "r" : ""}>
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {r.items.map((p) => (
                        <tr key={p.invoice} className={p.status === "overdue" ? "miss" : ""}>
                          <td>{p.invoice}</td>
                          <td>{fmtDate(dayFromToday(p.issueOffset), lang)}</td>
                          <td>{p.advance ? "—" : fmtDate(dayFromToday(p.dueOffset), lang)}</td>
                          <td>{statusText(t, p.status, p.dueOffset)}</td>
                          <td className="r">{fmtCOP(p.original)}</td>
                          <td className="r">{fmtCOP(p.balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="dm-bottom">
        <button
          className="cs-btn"
          onClick={() =>
            csvDownload(
              [
                lang === "es"
                  ? ["Proveedor", "NIT", "Concepto", "Factura", "Fecha", "Vence", "Estado", "Valor original", "Saldo"]
                  : ["Supplier", "NIT", "Concept", "Invoice", "Issued", "Due", "Status", "Original", "Balance"],
                ...rows.flatMap((r) =>
                  r.items.map((p) => [
                    r.supplier.name,
                    r.supplier.nit,
                    lang === "es" ? r.supplier.conceptEs : r.supplier.conceptEn,
                    p.invoice,
                    dayFromToday(p.issueOffset).toISOString().slice(0, 10),
                    p.advance ? "" : dayFromToday(p.dueOffset).toISOString().slice(0, 10),
                    statusText(t, p.status, p.dueOffset),
                    String(p.original),
                    String(p.balance),
                  ]),
                ),
              ],
              lang === "es" ? "cuentas_por_pagar.csv" : "accounts_payable.csv",
            )
          }
        >
          ↓ {t.csv}
        </button>
      </div>
    </div>
  );
}

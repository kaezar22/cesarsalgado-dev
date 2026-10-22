"use client";

import { useEffect, useMemo, useState } from "react";
import type { Lang } from "@/lib/content";
import {
  DATA,
  dayFromToday,
  fmtCOP,
  fmtDate,
  fmtQty,
  productByCode,
  productName,
  type Line,
  type Order,
} from "@/lib/demo/data";
import { matchClient, priceLines, type Match } from "@/lib/demo/match";

const STORE_KEY = "aguaclara-orders-v1";

type Saved = { mine: Order[]; confirmed: string[]; invoiced: Record<string, string> };
const EMPTY: Saved = { mine: [], confirmed: [], invoiced: {} };

function load(): Saved {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    return EMPTY;
  }
}
function save(s: Saved) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(s));
  } catch {
    /* private mode: the demo still works for this visit */
  }
}

const TX = {
  en: {
    tab1: "1 · Restaurant",
    tab1b: "Place an order",
    tab2: "2 · Back office",
    tab2b: "Match, price & invoice",
    nameLabel: "Your restaurant",
    nameHint: "Pick one of the clients below or type it yourself. Typos and missing words are fine: try “forno chico” or “mirador”, or a name that isn’t a client.",
    clientsTitle: (n: number, c: number) => `Our clients: ${n} points of sale from ${c} companies`,
    namePh: "e.g. forno chico",
    delivery: "Delivery date",
    products: "Products",
    noPrices: "Restaurants don’t see prices here; the back office applies each client’s own price list.",
    cats: { yogurt: "Yogurts & kumis", cheese: "Cheeses", butter: "Butter & cream", milk: "Milk & milk powder", sweets: "Condensed milk & arequipe" } as Record<string, string>,
    unit: { kg: "kg", unit: "" },
    yourOrder: "Your order",
    empty: "Add at least one product.",
    send: "Send order",
    needName: "Write the restaurant name.",
    sent: (id: string) => `Order ${id} sent. Here is what the back office sees:`,
    stats: ["Orders", "Matched automatically", "Need review", "Not found", "Ready to invoice"],
    typed: "Typed",
    matched: "Matched point",
    legal: "Legal entity",
    list: "List",
    noMatch: "No client found. The system never guesses: someone has to create the client or call the restaurant.",
    review: "Low confidence. Check that this is the right client before invoicing.",
    confirm: "Confirm match",
    missingPrice: (n: number) => `${n} product(s) are not in this client’s price list. They are left out of the invoice and flagged.`,
    notInList: "not in price list",
    invoice: "Invoice PDF",
    invoiced: "Invoiced",
    placed: "Placed",
    deliver: "Delivery",
    yours: "Your order",
    total: "Total",
    csv: "Download all lines (Excel)",
    reset: "Reset demo",
    resetDone: "Demo reset.",
    similarity: "similarity",
    status: { ok: "Auto-matched", review: "Review", notfound: "Not found" },
  },
  es: {
    tab1: "1 · Restaurante",
    tab1b: "Hacer un pedido",
    tab2: "2 · Back office",
    tab2b: "Cruce, precios y factura",
    nameLabel: "Su restaurante",
    nameHint: "Elija uno de los clientes de abajo o escríbalo usted. Se valen errores y palabras de menos: pruebe “forno chico” o “mirador”, o un nombre que no sea cliente.",
    clientsTitle: (n: number, c: number) => `Nuestros clientes: ${n} puntos de venta de ${c} empresas`,
    namePh: "ej. forno chico",
    delivery: "Fecha de entrega",
    products: "Productos",
    noPrices: "El restaurante no ve precios: el back office aplica la lista de precios de cada cliente.",
    cats: { yogurt: "Yogures y kumis", cheese: "Quesos", butter: "Mantequilla y cremas", milk: "Leche y leche en polvo", sweets: "Leche condensada y arequipe" } as Record<string, string>,
    unit: { kg: "kg", unit: "" },
    yourOrder: "Su pedido",
    empty: "Agregue al menos un producto.",
    send: "Enviar pedido",
    needName: "Escriba el nombre del restaurante.",
    sent: (id: string) => `Pedido ${id} enviado. Esto es lo que ve el back office:`,
    stats: ["Pedidos", "Cruzados automáticamente", "Por revisar", "No encontrados", "Listos para facturar"],
    typed: "Escrito",
    matched: "Punto encontrado",
    legal: "Razón social",
    list: "Lista",
    noMatch: "No se encontró el cliente. El sistema nunca adivina: alguien debe crear el cliente o llamar al restaurante.",
    review: "Confianza baja. Verifique que sea el cliente correcto antes de facturar.",
    confirm: "Confirmar cruce",
    missingPrice: (n: number) => `${n} producto(s) no están en la lista de precios del cliente. Quedan por fuera de la factura y marcados.`,
    notInList: "no está en la lista",
    invoice: "Factura PDF",
    invoiced: "Facturado",
    placed: "Pedido",
    deliver: "Entrega",
    yours: "Su pedido",
    total: "Total",
    csv: "Descargar todas las líneas (Excel)",
    reset: "Reiniciar demo",
    resetDone: "Demo reiniciada.",
    similarity: "similitud",
    status: { ok: "Cruce automático", review: "Revisar", notfound: "No encontrado" },
  },
};

type Row = { order: Order; match: Match; confirmed: boolean };

const POINTS = DATA.clients
  .flatMap((c) => c.points.map((point) => ({ point, legal: c.legalName })))
  .sort((a, b) => a.point.localeCompare(b.point, "es"));

export default function OrdersDemo({ lang }: { lang: Lang }) {
  const t = TX[lang];
  const [tab, setTab] = useState<1 | 2>(1);
  const [saved, setSaved] = useState<Saved>(EMPTY);
  const [flash, setFlash] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [delivery, setDelivery] = useState(1);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setSaved(load()), []);
  const update = (s: Saved) => {
    setSaved(s);
    save(s);
  };

  const rows: Row[] = useMemo(() => {
    const all = [...saved.mine.slice().reverse(), ...DATA.pendingOrders.slice().sort((a, b) => b.id.localeCompare(a.id))];
    return all.map((order) => ({ order, match: matchClient(order.typedName), confirmed: saved.confirmed.includes(order.id) }));
  }, [saved]);

  const counts = useMemo(() => {
    const ok = rows.filter((r) => r.match.status === "ok" || (r.match.status === "review" && r.confirmed)).length;
    const review = rows.filter((r) => r.match.status === "review" && !r.confirmed).length;
    const nf = rows.filter((r) => r.match.status === "notfound").length;
    const ready = rows.filter((r) => (r.match.status === "ok" || r.confirmed) && !saved.invoiced[r.order.id]).length;
    return [rows.length, ok, review, nf, ready];
  }, [rows, saved.invoiced]);

  const cart: Line[] = Object.entries(qty)
    .filter(([, q]) => q > 0)
    .map(([code, q]) => ({ code, qty: q }));

  const step = (code: string, dir: 1 | -1) => {
    const unit = productByCode[code].unit;
    const inc = unit === "kg" ? 0.5 : 1;
    setQty((q) => ({ ...q, [code]: Math.max(0, Math.round(((q[code] ?? 0) + dir * inc) * 10) / 10) }));
  };

  function submit() {
    if (!name.trim()) return setError(t.needName);
    if (cart.length === 0) return setError(t.empty);
    const next = 2001 + saved.mine.length;
    const order: Order = { id: `PW-${next}`, placedOffset: 0, deliveryOffset: delivery, typedName: name.trim(), lines: cart, mine: true };
    update({ ...saved, mine: [...saved.mine, order] });
    setName("");
    setQty({});
    setError(null);
    setOpen(order.id);
    setFlash(t.sent(order.id));
    setTab(2);
    requestAnimationFrame(() => document.getElementById("dm-top")?.scrollIntoView({ behavior: "smooth" }));
  }

  async function invoice(r: Row) {
    if (!r.match.client || !r.match.point) return;
    const no = saved.invoiced[r.order.id] ?? `FE-D${String(7000 + Object.keys(saved.invoiced).length + 1)}`;
    const { downloadInvoicePdf } = await import("@/lib/demo/invoicePdf");
    await downloadInvoicePdf({
      order: r.order,
      client: r.match.client,
      point: r.match.point,
      lines: priceLines(r.order.lines, r.match.client),
      invoiceNo: no,
      lang,
    });
    update({ ...saved, invoiced: { ...saved.invoiced, [r.order.id]: no } });
  }

  function downloadCsv() {
    const head =
      lang === "es"
        ? ["Pedido", "Fecha pedido", "Fecha entrega", "Cliente escrito", "Punto", "Razón social", "NIT", "Lista", "Similitud %", "Estado", "Código", "Producto", "Cantidad", "Precio", "Subtotal"]
        : ["Order", "Placed", "Delivery", "Typed name", "Point", "Legal entity", "NIT", "List", "Similarity %", "Status", "Code", "Product", "Qty", "Price", "Subtotal"];
    const iso = (o: number) => dayFromToday(o).toISOString().slice(0, 10);
    const out = [head];
    for (const r of rows) {
      for (const l of priceLines(r.order.lines, r.match.client)) {
        out.push([
          r.order.id,
          iso(r.order.placedOffset),
          iso(r.order.deliveryOffset),
          r.order.typedName,
          r.match.point ?? (lang === "es" ? "no aparece" : "not found"),
          r.match.client?.legalName ?? "",
          r.match.client?.nit ?? "",
          r.match.client?.priceList ?? "",
          String(r.match.score),
          t.status[r.match.status],
          l.code,
          productName(l.code, lang),
          String(l.qty),
          l.price === null ? (lang === "es" ? "no aparece" : "not found") : String(l.price),
          l.subtotal === null ? "" : String(l.subtotal),
        ]);
      }
    }
    const csv = "﻿" + out.map((row) => row.map((v) => `"${v.replace(/"/g, '""')}"`).join(";")).join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    a.download = lang === "es" ? "aguaclara_pedidos_con_precios.csv" : "aguaclara_orders_priced.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const categories = Array.from(new Set(DATA.products.map((p) => p.category)));

  return (
    <div className="dm" id="dm-top">
      <div className="dm-tabs" role="tablist">
        {([1, 2] as const).map((n) => (
          <button key={n} role="tab" aria-selected={tab === n} className={`dm-tab ${tab === n ? "on" : ""}`} onClick={() => setTab(n)}>
            <b>{n === 1 ? t.tab1 : t.tab2}</b>
            <span>{n === 1 ? t.tab1b : t.tab2b}</span>
          </button>
        ))}
      </div>

      {tab === 1 && (
        <div className="dm-panel">
          <div className="dm-form-grid">
            <label className="dm-field">
              <span>{t.nameLabel}</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t.namePh} maxLength={60} />
              <small>{t.nameHint}</small>
            </label>
            <label className="dm-field">
              <span>{t.delivery}</span>
              <select value={delivery} onChange={(e) => setDelivery(Number(e.target.value))}>
                {[1, 2, 3].map((d) => (
                  <option key={d} value={d}>
                    {fmtDate(dayFromToday(d), lang)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="dm-clients">
            <div className="dm-cat-title">{t.clientsTitle(POINTS.length, DATA.clients.length)}</div>
            <div className="dm-chips">
              {POINTS.map(({ point, legal }) => (
                <button
                  key={point}
                  type="button"
                  title={legal}
                  className={`dm-chip ${name === point ? "on" : ""}`}
                  onClick={() => {
                    setName(point);
                    setError(null);
                  }}
                >
                  {point}
                </button>
              ))}
            </div>
          </div>

          <h3 className="dm-h3">{t.products}</h3>
          <p className="dm-muted">{t.noPrices}</p>
          {categories.map((cat) => (
            <div key={cat} className="dm-cat">
              <div className="dm-cat-title">{t.cats[cat] ?? cat}</div>
              <div className="dm-products">
                {DATA.products
                  .filter((p) => p.category === cat)
                  .map((p) => {
                    const q = qty[p.code] ?? 0;
                    return (
                      <div key={p.code} className={`dm-prod ${q > 0 ? "on" : ""}`}>
                        <div>
                          <b>{p[lang]}</b>
                          <span>
                            {p.code}
                            {p.unit === "kg" ? " · kg" : ""}
                          </span>
                        </div>
                        <div className="dm-stepper">
                          <button type="button" onClick={() => step(p.code, -1)} disabled={q === 0} aria-label="−">
                            −
                          </button>
                          <output>{fmtQty(q)}</output>
                          <button type="button" onClick={() => step(p.code, 1)} aria-label="+">
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}

          <div className="dm-cart">
            <div>
              <b>{t.yourOrder}</b>
              <span>
                {cart.length === 0
                  ? t.empty
                  : cart.map((l) => `${fmtQty(l.qty)}${productByCode[l.code].unit === "kg" ? " kg" : " ×"} ${productName(l.code, lang)}`).join(" · ")}
              </span>
              {error && <em>{error}</em>}
            </div>
            <button className="cs-btn cs-btn-primary" onClick={submit}>
              {t.send} →
            </button>
          </div>
        </div>
      )}

      {tab === 2 && (
        <div className="dm-panel">
          {flash && (
            <div className="dm-flash" role="status">
              {flash}
            </div>
          )}
          <div className="dm-stats">
            {counts.map((n, i) => (
              <div key={i} className={`dm-stat s${i}`}>
                <b>{n}</b>
                <span>{t.stats[i]}</span>
              </div>
            ))}
          </div>

          <div className="dm-orders">
            {rows.map((r) => {
              const { order, match, confirmed } = r;
              const priced = priceLines(order.lines, match.client);
              const missing = match.client ? priced.filter((l) => l.price === null).length : 0;
              const total = priced.reduce((s, l) => s + (l.subtotal ?? 0), 0);
              const canInvoice = match.status === "ok" || (match.status === "review" && confirmed);
              const status = match.status === "review" && confirmed ? "ok" : match.status;
              const isOpen = open === order.id;
              return (
                <div key={order.id} className={`dm-order st-${status} ${order.mine ? "mine" : ""}`}>
                  <button className="dm-order-head" onClick={() => setOpen(isOpen ? null : order.id)} aria-expanded={isOpen}>
                    <div className="dm-oid">
                      <b>{order.id}</b>
                      {order.mine && <i>{t.yours}</i>}
                      <span>
                        {t.deliver}: {fmtDate(dayFromToday(order.deliveryOffset), lang)}
                      </span>
                    </div>
                    <div className="dm-omatch">
                      <span className="dm-typed">“{order.typedName}”</span>
                      <span className="dm-arrow">→</span>
                      <span className="dm-point">{match.point ?? "—"}</span>
                    </div>
                    <div className="dm-oright">
                      <span className={`dm-badge b-${status}`}>
                        {saved.invoiced[order.id] ? `✓ ${t.invoiced}` : t.status[status]}
                      </span>
                      <span className="dm-score">
                        {match.score}% {t.similarity}
                      </span>
                    </div>
                    <span className="dm-chev">{isOpen ? "▴" : "▾"}</span>
                  </button>

                  {isOpen && (
                    <div className="dm-order-body">
                      {match.client && (
                        <div className="dm-kv">
                          <div>
                            <span>{t.legal}</span>
                            <b>{match.client.legalName}</b>
                          </div>
                          <div>
                            <span>NIT</span>
                            <b>{match.client.nit}</b>
                          </div>
                          <div>
                            <span>{t.list}</span>
                            <b>{match.client.priceList}</b>
                          </div>
                          <div>
                            <span>{t.placed}</span>
                            <b>{fmtDate(dayFromToday(order.placedOffset), lang)}</b>
                          </div>
                        </div>
                      )}
                      {match.status === "notfound" && <p className="dm-warn">{t.noMatch}</p>}
                      {match.status === "review" && !confirmed && (
                        <p className="dm-warn">
                          {t.review}{" "}
                          <button className="cs-btn dm-small" onClick={() => update({ ...saved, confirmed: [...saved.confirmed, order.id] })}>
                            {t.confirm}
                          </button>
                        </p>
                      )}
                      {missing > 0 && <p className="dm-warn">{t.missingPrice(missing)}</p>}

                      <table className="dm-table">
                        <tbody>
                          {priced.map((l) => (
                            <tr key={l.code} className={l.price === null && match.client ? "miss" : ""}>
                              <td>
                                {productName(l.code, lang)}
                                <small>{l.code}</small>
                              </td>
                              <td className="r">
                                {fmtQty(l.qty)}
                                {productByCode[l.code].unit === "kg" ? " kg" : " ×"}
                              </td>
                              <td className="r">{l.price === null ? (match.client ? t.notInList : "—") : fmtCOP(l.price)}</td>
                              <td className="r">{l.subtotal === null ? "—" : fmtCOP(l.subtotal)}</td>
                            </tr>
                          ))}
                        </tbody>
                        {match.client && (
                          <tfoot>
                            <tr>
                              <td colSpan={3} className="r">
                                {t.total}
                              </td>
                              <td className="r">{fmtCOP(total)}</td>
                            </tr>
                          </tfoot>
                        )}
                      </table>

                      <div className="dm-actions">
                        <button className="cs-btn cs-btn-primary" disabled={!canInvoice || total === 0} onClick={() => invoice(r)}>
                          ↓ {t.invoice}
                          {saved.invoiced[order.id] ? ` · ${saved.invoiced[order.id]}` : ""}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="dm-bottom">
            <button className="cs-btn" onClick={downloadCsv}>
              ↓ {t.csv}
            </button>
            <button
              className="cs-btn dm-ghost"
              onClick={() => {
                update(EMPTY);
                setOpen(null);
                setFlash(t.resetDone);
              }}
            >
              ↺ {t.reset}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

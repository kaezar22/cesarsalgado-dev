"use client";

import { useEffect, useMemo, useState } from "react";
import type { Lang } from "@/lib/content";
import { DATA, type ProdBatch, type ProdProduct } from "@/lib/demo/data";

const STORE = "aguaclara-plant-v1";

type Ev = { t: number; k: "start" | "step2" | "step3" | "end" | "pause" | "resume" };
type Batch = { id: string; product: string; step: 1 | 2 | 3; inputs: number[]; outputs: number[]; events: Ev[]; paused: boolean };
type Done = { id: string; product: string; inputL: number; outputKg: number; minutes: number; phase: [number, number, number]; pauseMin: number };
type Shift = { id: string; operator: string; startedAt: number; batches: Done[] };
type State = { shift: Shift | null; current: Batch | null; closed: (ProdBatch & { mine: true })[]; fast: boolean; review: boolean };

const EMPTY: State = { shift: null, current: null, closed: [], fast: true, review: false };

const load = (): State => {
  try {
    const raw = localStorage.getItem(STORE);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    return EMPTY;
  }
};
const persist = (s: State) => {
  try {
    localStorage.setItem(STORE, JSON.stringify(s));
  } catch {
    /* ignore */
  }
};

const PRODUCTS = DATA.productionProducts;
const prod = (code: string) => PRODUCTS.find((p) => p.code === code)!;

/** Active milliseconds between a and b, excluding pauses. */
function activeMs(events: Ev[], a: number, b: number) {
  let paused = 0;
  let since: number | null = null;
  for (const e of events) {
    if (e.k === "pause") since = e.t;
    if (e.k === "resume" && since !== null) {
      paused += Math.max(0, Math.min(e.t, b) - Math.max(since, a));
      since = null;
    }
  }
  if (since !== null) paused += Math.max(0, b - Math.max(since, a));
  return Math.max(0, b - a - paused);
}

const TX = {
  en: {
    clockFast: "Demo clock: 1 second = 10 minutes",
    clockReal: "Real time",
    operatorApp: "Operator’s phone",
    supervisor: "What the supervisor sees",
    startShift: "Start shift",
    who: "Operator",
    today: "Today",
    pick: "Choose the product for the next batch",
    search: "Search product",
    startBatch: (p: string) => `Start batch: ${p}`,
    endShift: "End shift",
    batchesToday: "Batches this shift",
    none: "No batches yet.",
    steps: ["Receive", "Process", "Weigh"],
    step1: (inp: string) => `Step 1 · Register each pour of ${inp} into the vat (liters)`,
    step2: "Step 2 · Process",
    step3: "Step 3 · Weigh the finished product (kg)",
    procHint: {
      "P-CAM": "Coagulate, cut, drain whey, salt and mold.",
      "P-DCR": "Acidify, stretch the curd with cream, mold.",
      "P-MOZ": "Coagulate, acidify, stretch in hot water, shape.",
      "P-CUA": "Coagulate, drain and pack.",
      "P-GRI": "Ferment and strain the whey.",
      "P-ARE": "Cook down with sugar until it thickens.",
      "P-MAN": "Churn the cream, wash and knead.",
    } as Record<string, string>,
    milk: "milk",
    cream: "cream",
    liters: "liters",
    add: "Add",
    undo: "Undo last",
    doneIn: "Done receiving →",
    doneProc: "Done processing →",
    finish: "Finish batch ✓",
    discard: "Discard batch",
    pause: "Pause",
    resume: "Resume",
    paused: "Paused: time does not count",
    sampleKg: "Demo: add a typical weight",
    totalIn: "In",
    totalOut: "Out",
    net: "Net time",
    lastResult: (p: string) => `Batch saved: ${p}`,
    perKg: "L per kg",
    std: "standard",
    review: "Review the shift",
    confirm: "Confirm and close shift",
    back: "Back",
    closedMsg: "Shift closed. The batches are now in the supervisor’s report →",
    newShift: "Start a new shift",
    reloadTip: "Tip: reload the page in the middle of a batch. It picks up exactly where it was, like the real app does when a phone loses signal.",
    supLead: (n: number) => `Last 30 days · ${n} batches. Your closed shifts are added live.`,
    cols: ["Product", "Batches", "Milk/cream in", "Product out", "L per kg", "vs standard", "kg per hour"],
    good: "uses less than standard",
    bad: "uses more than standard",
    yours: "Your batches",
    csv: "Download batches (Excel)",
    reset: "Reset demo",
    min: "min",
  },
  es: {
    clockFast: "Reloj de demo: 1 segundo = 10 minutos",
    clockReal: "Tiempo real",
    operatorApp: "Celular del operario",
    supervisor: "Lo que ve el supervisor",
    startShift: "Iniciar turno",
    who: "Operario",
    today: "Hoy",
    pick: "Elija el producto del próximo lote",
    search: "Buscar producto",
    startBatch: (p: string) => `Iniciar lote: ${p}`,
    endShift: "Terminar turno",
    batchesToday: "Lotes de este turno",
    none: "Todavía no hay lotes.",
    steps: ["Recibir", "Procesar", "Pesar"],
    step1: (inp: string) => `Paso 1 · Registre cada tanda de ${inp} que entra a la tina (litros)`,
    step2: "Paso 2 · Procesar",
    step3: "Paso 3 · Pesar el producto terminado (kg)",
    procHint: {
      "P-CAM": "Cuajar, cortar, desuerar, salar y moldear.",
      "P-DCR": "Acidificar, hilar la cuajada con crema y moldear.",
      "P-MOZ": "Cuajar, acidificar, hilar en agua caliente y formar.",
      "P-CUA": "Cuajar, escurrir y empacar.",
      "P-GRI": "Fermentar y desuerar.",
      "P-ARE": "Concentrar con azúcar hasta que espese.",
      "P-MAN": "Batir la crema, lavar y amasar.",
    } as Record<string, string>,
    milk: "leche",
    cream: "crema",
    liters: "litros",
    add: "Agregar",
    undo: "Deshacer última",
    doneIn: "Terminé de recibir →",
    doneProc: "Terminé de procesar →",
    finish: "Terminar lote ✓",
    discard: "Descartar lote",
    pause: "Pausa",
    resume: "Reanudar",
    paused: "En pausa: el tiempo no cuenta",
    sampleKg: "Demo: agregar un peso típico",
    totalIn: "Entrada",
    totalOut: "Salida",
    net: "Tiempo neto",
    lastResult: (p: string) => `Lote guardado: ${p}`,
    perKg: "L por kg",
    std: "estándar",
    review: "Revisar el turno",
    confirm: "Confirmar y cerrar turno",
    back: "Volver",
    closedMsg: "Turno cerrado. Los lotes ya están en el informe del supervisor →",
    newShift: "Iniciar otro turno",
    reloadTip: "Pruebe: recargue la página en medio de un lote. Sigue exactamente donde iba, como la app real cuando el celular pierde la señal.",
    supLead: (n: number) => `Últimos 30 días · ${n} lotes. Sus turnos cerrados se suman en vivo.`,
    cols: ["Producto", "Lotes", "Leche/crema entrada", "Producto salida", "L por kg", "vs estándar", "kg por hora"],
    good: "usa menos que el estándar",
    bad: "usa más que el estándar",
    yours: "Sus lotes",
    csv: "Descargar lotes (Excel)",
    reset: "Reiniciar demo",
    min: "min",
  },
};

const num = (n: number, d = 0) => n.toLocaleString("es-CO", { minimumFractionDigits: d, maximumFractionDigits: d });

function fmtClock(min: number) {
  const h = Math.floor(min / 60);
  const m = Math.floor(min % 60);
  return h ? `${h} h ${String(m).padStart(2, "0")} min` : `${m} min`;
}

export default function ProductionDemo({ lang }: { lang: Lang }) {
  const t = TX[lang];
  const [s, setS] = useState<State>(EMPTY);
  const [ready, setReady] = useState(false);
  const [, tick] = useState(0);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<string | null>(null);
  const [operator, setOperator] = useState(DATA.operators[0]);
  const [val, setVal] = useState("");
  const [flash, setFlash] = useState<string | null>(null);
  const [closedNow, setClosedNow] = useState(false);

  useEffect(() => {
    setS(load());
    setReady(true);
  }, []);
  useEffect(() => {
    if (!s.current) return;
    const id = setInterval(() => tick((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, [s.current]);

  const up = (next: State) => {
    setS(next);
    persist(next);
  };
  const factor = s.fast ? 600 : 1; // demo clock: 1 real second = 10 minutes
  const toMin = (ms: number) => (ms * factor) / 60000;

  // ---------- actions ----------
  const startShift = () => {
    setClosedNow(false);
    up({ ...s, shift: { id: `T-${Date.now().toString(36).toUpperCase()}`, operator, startedAt: Date.now(), batches: [] }, review: false });
  };
  const startBatch = () => {
    if (!sel) return;
    setFlash(null);
    up({ ...s, current: { id: `L-${(s.shift?.batches.length ?? 0) + 1}`, product: sel, step: 1, inputs: [], outputs: [], events: [{ t: Date.now(), k: "start" }], paused: false } });
    setSel(null);
    setVal("");
  };
  const cur = s.current;
  const ev = (k: Ev["k"]) => cur && up({ ...s, current: { ...cur, events: [...cur.events, { t: Date.now(), k }], paused: k === "pause" ? true : k === "resume" ? false : cur.paused } });
  const addReading = (v: number) => {
    if (!cur || !(v > 0)) return;
    const key = cur.step === 1 ? "inputs" : "outputs";
    up({ ...s, current: { ...cur, [key]: [...cur[key], Math.round(v * 10) / 10] } });
    setVal("");
  };
  const undo = () => {
    if (!cur) return;
    const key = cur.step === 1 ? "inputs" : "outputs";
    up({ ...s, current: { ...cur, [key]: cur[key].slice(0, -1) } });
  };
  const nextStep = () => {
    if (!cur) return;
    const k = cur.step === 1 ? "step2" : "step3";
    const events = [...cur.events];
    if (cur.paused) events.push({ t: Date.now(), k: "resume" });
    events.push({ t: Date.now(), k });
    up({ ...s, current: { ...cur, step: (cur.step + 1) as 2 | 3, events, paused: false } });
    setVal("");
  };
  const finish = () => {
    if (!cur || !s.shift) return;
    const now = Date.now();
    const events = [...cur.events, ...(cur.paused ? [{ t: now, k: "resume" as const }] : []), { t: now, k: "end" as const }];
    const at = (k: Ev["k"]) => events.find((e) => e.k === k)!.t;
    const p1 = toMin(activeMs(events, at("start"), at("step2")));
    const p2 = toMin(activeMs(events, at("step2"), at("step3")));
    const p3 = toMin(activeMs(events, at("step3"), now));
    const total = p1 + p2 + p3;
    const pause = toMin(now - at("start")) - total;
    const done: Done = {
      id: cur.id,
      product: cur.product,
      inputL: cur.inputs.reduce((a, b) => a + b, 0),
      outputKg: Math.round(cur.outputs.reduce((a, b) => a + b, 0) * 10) / 10,
      minutes: Math.max(1, Math.round(total)),
      phase: [Math.round(p1), Math.round(p2), Math.round(p3)],
      pauseMin: Math.max(0, Math.round(pause)),
    };
    up({ ...s, current: null, shift: { ...s.shift, batches: [...s.shift.batches, done] } });
    setFlash(done.id);
  };
  const discard = () => up({ ...s, current: null });
  const closeShift = () => {
    if (!s.shift) return;
    const mine = s.shift.batches.map((b) => ({ dayOffset: 0, product: b.product, operator: s.shift!.operator, inputL: b.inputL, outputKg: b.outputKg, minutes: b.minutes, mine: true as const }));
    up({ ...s, shift: null, current: null, review: false, closed: [...s.closed, ...mine] });
    setClosedNow(true);
    setFlash(null);
  };

  // ---------- supervisor report ----------
  const all: ProdBatch[] = useMemo(() => [...DATA.production, ...s.closed], [s.closed]);
  const report = useMemo(
    () =>
      PRODUCTS.map((p) => {
        const rows = all.filter((b) => b.product === p.code && b.outputKg > 0);
        const L = rows.reduce((a, b) => a + b.inputL, 0);
        const kg = rows.reduce((a, b) => a + b.outputKg, 0);
        const min = rows.reduce((a, b) => a + b.minutes, 0);
        const lpk = kg ? L / kg : 0;
        return { p, n: rows.length, mine: rows.filter((r) => r.mine).length, L, kg, lpk, varPct: lpk ? (lpk / p.stdLPerKg - 1) * 100 : 0, kgh: min ? kg / (min / 60) : 0 };
      }),
    [all],
  );

  function csv() {
    const head =
      lang === "es"
        ? ["Fecha (días desde hoy)", "Producto", "Operario", "Entrada (L)", "Salida (kg)", "Minutos", "L por kg", "Estándar L/kg", "Lote del visitante"]
        : ["Date (days from today)", "Product", "Operator", "Input (L)", "Output (kg)", "Minutes", "L per kg", "Standard L/kg", "Visitor batch"];
    const rows = [...all].sort((a, b) => b.dayOffset - a.dayOffset).map((b) => {
      const p = prod(b.product);
      return [String(b.dayOffset), p[lang], b.operator, String(b.inputL), String(b.outputKg), String(b.minutes), b.outputKg ? (b.inputL / b.outputKg).toFixed(2) : "", String(p.stdLPerKg), b.mine ? "✓" : ""];
    });
    const out = "﻿" + [head, ...rows].map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(";")).join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([out], { type: "text/csv;charset=utf-8" }));
    a.download = lang === "es" ? "lotes_produccion.csv" : "production_batches.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // ---------- operator screens ----------
  const inputName = (p: ProdProduct) => (p.input === "milk" ? t.milk : t.cream);

  function Phone() {
    if (!ready) return <div className="pl-screen" />;

    if (!s.shift) {
      return (
        <div className="pl-screen">
          {closedNow && <p className="dm-flash">{t.closedMsg}</p>}
          <div className="pl-big-title">{t.today}</div>
          <label className="dm-field">
            <span>{t.who}</span>
            <select value={operator} onChange={(e) => setOperator(e.target.value)}>
              {DATA.operators.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </label>
          <button className="pl-btn pl-primary" onClick={startShift}>
            {closedNow ? t.newShift : t.startShift}
          </button>
          <p className="pl-tip">{t.reloadTip}</p>
        </div>
      );
    }

    if (s.review) {
      return (
        <div className="pl-screen">
          <div className="pl-big-title">{t.review}</div>
          <BatchTable batches={s.shift.batches} />
          <button className="pl-btn pl-primary" onClick={closeShift} disabled={s.shift.batches.length === 0}>
            {t.confirm}
          </button>
          <button className="pl-btn" onClick={() => up({ ...s, review: false })}>
            ← {t.back}
          </button>
        </div>
      );
    }

    if (!cur) {
      const nq = q.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
      const list = PRODUCTS.filter((p) => p[lang].toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").includes(nq));
      const last = flash ? s.shift.batches.find((b) => b.id === flash) : null;
      return (
        <div className="pl-screen">
          {last && <ResultCard b={last} />}
          <div className="pl-label">{t.pick}</div>
          <input className="pl-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.search} />
          <div className="pl-grid">
            {list.map((p) => (
              <button key={p.code} className={`pl-prod ${sel === p.code ? "on" : ""}`} onClick={() => setSel(p.code)}>
                {p[lang]}
              </button>
            ))}
          </div>
          <button className="pl-btn pl-primary" disabled={!sel} onClick={startBatch}>
            {sel ? t.startBatch(prod(sel)[lang]) : t.pick}
          </button>
          <div className="pl-label">
            {t.batchesToday} ({s.shift.batches.length})
          </div>
          {s.shift.batches.length ? <BatchTable batches={s.shift.batches} /> : <p className="pl-muted">{t.none}</p>}
          <button className="pl-btn" onClick={() => up({ ...s, review: true })} disabled={s.shift.batches.length === 0}>
            {t.endShift}
          </button>
        </div>
      );
    }

    // Active batch
    const p = prod(cur.product);
    const now = Date.now();
    const elapsed = toMin(activeMs(cur.events, cur.events[0].t, now));
    const inL = cur.inputs.reduce((a, b) => a + b, 0);
    const outKg = cur.outputs.reduce((a, b) => a + b, 0);
    const readings = cur.step === 1 ? cur.inputs : cur.outputs;
    const unit = cur.step === 1 ? "L" : "kg";
    // Stable "true" yield for this batch (between 5% better and 7% worse than standard).
    const seed = [...(s.shift.id + cur.id)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 997, 7) / 997;
    const target = inL / (p.stdLPerKg * (0.95 + seed * 0.12));
    const remaining = target - outKg;
    const typicalKg = () => Math.round((remaining > 60 ? remaining * 0.55 : remaining) * 10) / 10;

    return (
      <div className="pl-screen">
        <div className="pl-batch-head">
          <div>
            <b>{p[lang]}</b>
            <span>
              {cur.id} · {s.shift.operator}
            </span>
          </div>
          <div className={`pl-clock ${cur.paused ? "paused" : ""}`}>{fmtClock(elapsed)}</div>
        </div>
        <ol className="pl-steps">
          {t.steps.map((st, i) => (
            <li key={st} className={cur.step === i + 1 ? "on" : cur.step > i + 1 ? "done" : ""}>
              {st}
            </li>
          ))}
        </ol>

        {cur.paused && <p className="pl-paused">⏸ {t.paused}</p>}

        {cur.step === 2 ? (
          <div className="pl-proc">
            <div className="pl-label">{t.step2}</div>
            <p>{t.procHint[p.code]}</p>
            <div className="pl-proc-clock">{fmtClock(toMin(activeMs(cur.events, cur.events.find((e) => e.k === "step2")!.t, now)))}</div>
          </div>
        ) : (
          <>
            <div className="pl-label">{cur.step === 1 ? t.step1(inputName(p)) : t.step3}</div>
            <form
              className="pl-entry"
              onSubmit={(e) => {
                e.preventDefault();
                addReading(parseFloat(val.replace(",", ".")));
              }}
            >
              <input value={val} onChange={(e) => setVal(e.target.value)} inputMode="decimal" placeholder={unit} disabled={cur.paused} />
              <button className="pl-btn pl-primary" type="submit" disabled={cur.paused || !val}>
                {t.add}
              </button>
            </form>
            {cur.step === 1 ? (
              <div className="pl-quick">
                {[50, 100, 200, 500].map((v) => (
                  <button key={v} type="button" onClick={() => addReading(v)} disabled={cur.paused}>
                    +{v} L
                  </button>
                ))}
              </div>
            ) : (
              <button type="button" className="pl-link" onClick={() => addReading(typicalKg())} disabled={cur.paused || remaining < 0.5}>
                + {t.sampleKg}
              </button>
            )}
            <div className="pl-readings">
              {readings.map((r, i) => (
                <span key={i}>
                  {num(r, unit === "kg" ? 1 : 0)} {unit}
                </span>
              ))}
            </div>
            {readings.length > 0 && (
              <button type="button" className="pl-link" onClick={undo} disabled={cur.paused}>
                ↶ {t.undo}
              </button>
            )}
          </>
        )}

        <div className="pl-totals">
          <div>
            <span>{t.totalIn}</span>
            <b>{num(inL)} L</b>
          </div>
          <div>
            <span>{t.totalOut}</span>
            <b>{num(outKg, 1)} kg</b>
          </div>
          {outKg > 0 && (
            <div>
              <span>{t.perKg}</span>
              <b>{num(inL / outKg, 2)}</b>
            </div>
          )}
        </div>

        {cur.step === 1 && (
          <button className="pl-btn pl-primary" onClick={nextStep} disabled={cur.inputs.length === 0}>
            {t.doneIn}
          </button>
        )}
        {cur.step === 2 && (
          <button className="pl-btn pl-primary" onClick={nextStep}>
            {t.doneProc}
          </button>
        )}
        {cur.step === 3 && (
          <button className="pl-btn pl-primary" onClick={finish} disabled={cur.outputs.length === 0}>
            {t.finish}
          </button>
        )}
        <div className="pl-row2">
          <button className="pl-btn" onClick={() => ev(cur.paused ? "resume" : "pause")}>
            {cur.paused ? `▶ ${t.resume}` : `⏸ ${t.pause}`}
          </button>
          {cur.step === 1 && (
            <button className="pl-btn pl-danger" onClick={discard}>
              {t.discard}
            </button>
          )}
        </div>
      </div>
    );
  }

  function ResultCard({ b }: { b: Done }) {
    const p = prod(b.product);
    const lpk = b.outputKg ? b.inputL / b.outputKg : 0;
    const v = (lpk / p.stdLPerKg - 1) * 100;
    return (
      <div className={`pl-result ${v > 3 ? "bad" : "good"}`}>
        <b>{t.lastResult(p[lang])}</b>
        <span>
          {num(b.inputL)} L → {num(b.outputKg, 1)} kg · <strong>{num(lpk, 2)} {t.perKg}</strong> ({t.std} {num(p.stdLPerKg, 1)}) · {fmtClock(b.minutes)}
        </span>
      </div>
    );
  }

  function BatchTable({ batches }: { batches: Done[] }) {
    return (
      <table className="pl-table">
        <tbody>
          {batches.map((b) => {
            const p = prod(b.product);
            const lpk = b.outputKg ? b.inputL / b.outputKg : 0;
            return (
              <tr key={b.id}>
                <td>
                  <b>{p[lang]}</b>
                  <small>
                    {b.id} · {fmtClock(b.minutes)}
                    {b.pauseMin ? ` (+${b.pauseMin} ${t.min} ⏸)` : ""}
                  </small>
                </td>
                <td className="r">
                  {num(b.inputL)} L → {num(b.outputKg, 1)} kg
                  <small className={lpk > p.stdLPerKg * 1.03 ? "bad" : "good"}>
                    {num(lpk, 2)} {t.perKg}
                  </small>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  return (
    <div className="pl">
      <div className="pl-clockbar">
        <label className="pl-toggle">
          <input type="checkbox" checked={s.fast} onChange={(e) => up({ ...s, fast: e.target.checked })} disabled={!!cur} />
          <span>{s.fast ? t.clockFast : t.clockReal}</span>
        </label>
      </div>
      <div className="pl-layout">
        <div>
          <div className="pl-cap">{t.operatorApp}</div>
          <div className="pl-phone">{Phone()}</div>
        </div>
        <div className="pl-side">
          <div className="pl-cap">{t.supervisor}</div>
          <div className="pl-report">
            <p className="dm-muted">{t.supLead(DATA.production.length)}</p>
            <div className="pl-rtable">
              <div className="pl-rrow pl-rhead">
                {t.cols.map((c, i) => (
                  <span key={c} className={i ? "r" : ""}>
                    {c}
                  </span>
                ))}
              </div>
              {report.map((r) => (
                <div key={r.p.code} className={`pl-rrow ${r.mine ? "mine" : ""}`}>
                  <span className="pl-rname">
                    {r.p[lang]}
                    {r.mine > 0 && (
                      <i>
                        +{r.mine} {t.yours.toLowerCase()}
                      </i>
                    )}
                  </span>
                  <span className="r">{r.n}</span>
                  <span className="r">{num(r.L)} L</span>
                  <span className="r">{num(r.kg)} kg</span>
                  <span className="r">
                    <b>{num(r.lpk, 2)}</b> <small>/ {num(r.p.stdLPerKg, 1)}</small>
                  </span>
                  <span className={`r ${r.varPct > 2 ? "bad" : r.varPct < -1 ? "good" : ""}`} title={r.varPct > 0 ? t.bad : t.good}>
                    {r.varPct > 0 ? "+" : ""}
                    {num(r.varPct, 1)}%
                  </span>
                  <span className="r">{num(r.kgh, 1)}</span>
                </div>
              ))}
            </div>
            <p className="pl-legend">
              <span className="bad">+%</span> {t.bad} · <span className="good">−%</span> {t.good}
            </p>
          </div>
          <div className="dm-bottom">
            <button className="cs-btn" onClick={csv}>
              ↓ {t.csv}
            </button>
            <button
              className="cs-btn dm-ghost"
              onClick={() => {
                up(EMPTY);
                setFlash(null);
                setClosedNow(false);
              }}
            >
              ↺ {t.reset}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

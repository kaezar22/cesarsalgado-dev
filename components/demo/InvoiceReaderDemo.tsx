"use client";

import { useEffect, useRef, useState } from "react";
import type { Lang } from "@/lib/content";
import { fmtCOP } from "@/lib/demo/data";
import { checkInvoice, type Check, type Extracted } from "@/lib/demo/invoiceCheck";
import type { SampleKey } from "@/lib/demo/samplePdfs";

type Phase = "idle" | "reading" | "done" | "error";

const TX = {
  en: {
    pick: "1 · Pick an invoice",
    samples: {
      milk: ["Raw-milk settlement", "Cooperative · 15 days of milk, bonuses and deductions"],
      packaging: ["Packaging e-invoice", "Cups, bottles and pails · VAT 19%"],
      maintenance: ["Cold-room maintenance", "Services and spare parts · VAT 19%"],
    } as Record<SampleKey, [string, string]>,
    upload: "…or upload your own PDF",
    uploadHint: "Text PDF up to 2 MB and 4 pages. It is read once and not stored.",
    read: "2 · AI reading",
    steps: ["Extract the text from the PDF", "Read it with a language model", "Check the result against arithmetic and master data"],
    preview: "Document",
    open: "Open PDF",
    result: "3 · Extracted data",
    fields: { documentType: "Document", invoiceNumber: "Number", supplier: "Supplier", buyer: "Billed to", issueDate: "Issued", dueDate: "Due", paymentTerms: "Payment terms" },
    lineCols: ["Description", "Qty", "Unit price", "Amount"],
    subtotal: "Subtotal",
    total: "Total",
    checks: "4 · Validation",
    verdictOk: "Ready to post to accounts payable",
    verdictBad: (n: number) => `Needs review: ${n} issue${n === 1 ? "" : "s"} before paying`,
    msgs: {
      supplier_known: (p: Record<string, string | number>) => `Known supplier: ${p.name}${p.how === "name" ? " (matched by name)" : ""}`,
      supplier_new: () => "Supplier not in the master data: register it before posting",
      nit_ok: () => "Supplier NIT check digit is valid",
      nit_bad: () => "Supplier NIT check digit is NOT valid",
      nit_no_dv: () => "NIT printed without check digit",
      buyer_ok: () => "Billed to Lácteos Agua Clara",
      buyer_other: (p: Record<string, string | number>) => `Billed to another company: ${p.buyer}`,
      lines_math_ok: (p: Record<string, string | number>) => `${p.count} lines: quantity × price = amount`,
      lines_math_bad: (p: Record<string, string | number>) => `${p.count} line(s) where quantity × price ≠ amount`,
      subtotal_ok: () => "Lines add up to the subtotal",
      subtotal_bad: (p: Record<string, string | number>) => `Lines add up to ${fmtCOP(+p.lines)} but the subtotal says ${fmtCOP(+p.printed)} (difference ${fmtCOP(+p.diff)})`,
      total_ok: () => "Subtotal + taxes − withholdings = total",
      total_bad: (p: Record<string, string | number>) => `Total should be ${fmtCOP(+p.expected)}, the document says ${fmtCOP(+p.printed)}`,
      tax_ok: () => "Tax amounts match their rates",
      tax_bad: () => "A tax amount doesn’t match its rate",
      dates_ok: () => "Due date is after the issue date",
      dates_bad: () => "Due date is before the issue date",
      dates_missing: () => "Issue or due date missing",
      not_duplicate: () => "Not registered before (no duplicate)",
      duplicate: (p: Record<string, string | number>) => `DUPLICATE: this invoice is already in payables (original ${fmtCOP(+p.original)}, balance ${fmtCOP(+p.balance)})`,
    } as Record<string, (p: Record<string, string | number>) => string>,
    aiNotes: "AI note",
    json: "Download JSON",
    csv: "Download lines (Excel)",
    another: "Read another invoice",
    meta: (pages: number, chars: number, ms?: number, cached?: boolean) =>
      `${pages} page${pages === 1 ? "" : "s"} · ${chars.toLocaleString("en-US")} characters${cached ? " · cached result" : ms ? ` · AI answered in ${(ms / 1000).toFixed(1)} s` : ""}`,
    errors: {
      too_big: "The file is larger than 2 MB.",
      not_pdf: "That file is not a PDF.",
      too_many_pages: "The demo reads up to 4 pages.",
      scanned: "This PDF looks like a scanned image with no text. The demo reads text PDFs; in production an OCR step handles scans.",
      unreadable: "The PDF could not be opened.",
      rate_limited: "Too many invoices for now. Try again in a while, or email me.",
      default: "Something went wrong reading the invoice. Please try again.",
    } as Record<string, string>,
  },
  es: {
    pick: "1 · Elija una factura",
    samples: {
      milk: ["Liquidación de leche cruda", "Cooperativa · 15 días de leche, bonificaciones y descuentos"],
      packaging: ["Factura electrónica de empaques", "Vasos, botellas y baldes · IVA 19%"],
      maintenance: ["Mantenimiento de cuartos fríos", "Servicios y repuestos · IVA 19%"],
    } as Record<SampleKey, [string, string]>,
    upload: "…o suba su propio PDF",
    uploadHint: "PDF con texto, hasta 2 MB y 4 páginas. Se lee una vez y no se guarda.",
    read: "2 · Lectura con IA",
    steps: ["Extraer el texto del PDF", "Leerlo con un modelo de lenguaje", "Validar el resultado contra cálculos y datos maestros"],
    preview: "Documento",
    open: "Abrir PDF",
    result: "3 · Datos extraídos",
    fields: { documentType: "Documento", invoiceNumber: "Número", supplier: "Proveedor", buyer: "Facturado a", issueDate: "Fecha", dueDate: "Vence", paymentTerms: "Forma de pago" },
    lineCols: ["Descripción", "Cant.", "Precio unit.", "Valor"],
    subtotal: "Subtotal",
    total: "Total",
    checks: "4 · Validación",
    verdictOk: "Lista para registrar en cuentas por pagar",
    verdictBad: (n: number) => `Requiere revisión: ${n} problema${n === 1 ? "" : "s"} antes de pagar`,
    msgs: {
      supplier_known: (p: Record<string, string | number>) => `Proveedor conocido: ${p.name}${p.how === "name" ? " (por nombre)" : ""}`,
      supplier_new: () => "El proveedor no está en los datos maestros: hay que crearlo antes de registrar",
      nit_ok: () => "El dígito de verificación del NIT es válido",
      nit_bad: () => "El dígito de verificación del NIT NO es válido",
      nit_no_dv: () => "NIT impreso sin dígito de verificación",
      buyer_ok: () => "Facturada a Lácteos Agua Clara",
      buyer_other: (p: Record<string, string | number>) => `Facturada a otra empresa: ${p.buyer}`,
      lines_math_ok: (p: Record<string, string | number>) => `${p.count} líneas: cantidad × precio = valor`,
      lines_math_bad: (p: Record<string, string | number>) => `${p.count} línea(s) donde cantidad × precio ≠ valor`,
      subtotal_ok: () => "Las líneas suman el subtotal",
      subtotal_bad: (p: Record<string, string | number>) => `Las líneas suman ${fmtCOP(+p.lines)} pero el subtotal dice ${fmtCOP(+p.printed)} (diferencia ${fmtCOP(+p.diff)})`,
      total_ok: () => "Subtotal + impuestos − retenciones = total",
      total_bad: (p: Record<string, string | number>) => `El total debería ser ${fmtCOP(+p.expected)}, el documento dice ${fmtCOP(+p.printed)}`,
      tax_ok: () => "Los impuestos corresponden a su tarifa",
      tax_bad: () => "Un impuesto no corresponde a su tarifa",
      dates_ok: () => "El vencimiento es posterior a la fecha de la factura",
      dates_bad: () => "El vencimiento es anterior a la fecha de la factura",
      dates_missing: () => "Falta la fecha o el vencimiento",
      not_duplicate: () => "No estaba registrada (no es duplicada)",
      duplicate: (p: Record<string, string | number>) => `DUPLICADA: esta factura ya está en cuentas por pagar (valor ${fmtCOP(+p.original)}, saldo ${fmtCOP(+p.balance)})`,
    } as Record<string, (p: Record<string, string | number>) => string>,
    aiNotes: "Nota de la IA",
    json: "Descargar JSON",
    csv: "Descargar líneas (Excel)",
    another: "Leer otra factura",
    meta: (pages: number, chars: number, ms?: number, cached?: boolean) =>
      `${pages} página${pages === 1 ? "" : "s"} · ${chars.toLocaleString("es-CO")} caracteres${cached ? " · resultado en caché" : ms ? ` · la IA respondió en ${(ms / 1000).toFixed(1)} s` : ""}`,
    errors: {
      too_big: "El archivo pesa más de 2 MB.",
      not_pdf: "El archivo no es un PDF.",
      too_many_pages: "La demo lee hasta 4 páginas.",
      scanned: "Este PDF parece una imagen escaneada sin texto. La demo lee PDFs con texto; en producción un paso de OCR se encarga de los escaneados.",
      unreadable: "No se pudo abrir el PDF.",
      rate_limited: "Demasiadas facturas por ahora. Intente más tarde o escríbame.",
      default: "Algo salió mal leyendo la factura. Intente de nuevo.",
    } as Record<string, string>,
  },
};

type Result = { data: Extracted; pages: number; chars: number; ms?: number; cached?: boolean };

export default function InvoiceReaderDemo({ lang }: { lang: Lang }) {
  const t = TX[lang];
  const [phase, setPhase] = useState<Phase>("idle");
  const [step, setStep] = useState(0);
  const [active, setActive] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [res, setRes] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => void (pdfUrl && URL.revokeObjectURL(pdfUrl)), [pdfUrl]);

  async function run(blob: Blob, name: string, label: string) {
    setActive(label);
    setError(null);
    setRes(null);
    setPhase("reading");
    setStep(0);
    setPdfUrl((old) => {
      if (old) URL.revokeObjectURL(old);
      return URL.createObjectURL(blob);
    });
    const form = new FormData();
    form.append("file", new File([blob], name, { type: "application/pdf" }));
    const timer = setTimeout(() => setStep(1), 700);
    try {
      const r = await fetch("/api/invoice-reader", { method: "POST", body: form });
      const j = await r.json();
      clearTimeout(timer);
      if (!r.ok || !j.data) throw new Error(j.error || "default");
      setStep(2);
      await new Promise((ok) => setTimeout(ok, 350));
      setRes(j);
      setPhase("done");
      requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } catch (e) {
      clearTimeout(timer);
      const code = e instanceof Error ? e.message : "default";
      setError(t.errors[code] ?? t.errors.default);
      setPhase("error");
    }
  }

  async function sample(k: SampleKey) {
    const { SAMPLES } = await import("@/lib/demo/samplePdfs");
    run(await SAMPLES[k](), `${k}.pdf`, k);
  }

  const x = res?.data;
  const verdict = x ? checkInvoice(x) : null;
  const problems = verdict ? verdict.checks.filter((c) => !c.ok).length : 0;

  function download(kind: "json" | "csv") {
    if (!x) return;
    let blob: Blob;
    let name: string;
    if (kind === "json") {
      blob = new Blob([JSON.stringify({ ...x, validation: verdict?.checks }, null, 2)], { type: "application/json" });
      name = `${x.invoiceNumber ?? "invoice"}.json`;
    } else {
      const head = lang === "es" ? ["Factura", "Proveedor", "NIT", "Descripción", "Cantidad", "Unidad", "Precio unitario", "Valor"] : ["Invoice", "Supplier", "NIT", "Description", "Quantity", "Unit", "Unit price", "Amount"];
      const rows = (x.lines ?? []).map((l) => [x.invoiceNumber ?? "", x.supplier?.name ?? "", x.supplier?.nit ?? "", l.description ?? "", String(l.quantity ?? ""), l.unit ?? "", String(l.unitPrice ?? ""), String(l.amount ?? "")]);
      const csv = "﻿" + [head, ...rows].map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(";")).join("\r\n");
      blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      name = `${x.invoiceNumber ?? "invoice"}.csv`;
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const fmtDateIso = (s?: string | null) => {
    if (!s) return "—";
    const d = new Date(s + "T12:00:00");
    return isNaN(+d) ? s : d.toLocaleDateString(lang === "es" ? "es-CO" : "en-US", { day: "numeric", month: "short", year: "numeric" });
  };
  const num = (v?: number | null) => (v == null ? "—" : v.toLocaleString("es-CO", { maximumFractionDigits: 2 }));

  return (
    <div className="ir">
      <div className="ir-pick">
        <div className="pl-cap">{t.pick}</div>
        <div className="ir-samples">
          {(Object.keys(t.samples) as SampleKey[]).map((k) => (
            <button key={k} className={`ir-sample ${active === k ? "on" : ""}`} disabled={phase === "reading"} onClick={() => sample(k)}>
              <span className="ir-doc" aria-hidden>
                <i />
                <i />
                <i />
              </span>
              <b>{t.samples[k][0]}</b>
              <small>{t.samples[k][1]}</small>
            </button>
          ))}
          <button className={`ir-sample ir-upload ${active === "upload" ? "on" : ""}`} disabled={phase === "reading"} onClick={() => fileRef.current?.click()}>
            <span className="ir-plus">＋</span>
            <b>{t.upload}</b>
            <small>{t.uploadHint}</small>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) run(f, f.name, "upload");
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {phase !== "idle" && (
        <div className="ir-work">
          <div className="ir-preview">
            <div className="pl-cap">{t.preview}</div>
            {pdfUrl && (
              <>
                <iframe src={`${pdfUrl}#toolbar=0&navpanes=0&view=FitH`} title={t.preview} />
                <a className="ir-open" href={pdfUrl} target="_blank" rel="noopener">
                  {t.open} ↗
                </a>
              </>
            )}
          </div>

          <div className="ir-right" ref={resultRef}>
            {phase === "reading" && (
              <div className="ir-progress">
                <div className="pl-cap">{t.read}</div>
                {t.steps.map((s, i) => (
                  <div key={s} className={`ir-step ${i < step ? "done" : i === step ? "on" : ""}`}>
                    <span>{i < step ? "✓" : i === step ? <i className="ir-spin" /> : i + 1}</span>
                    {s}
                  </div>
                ))}
              </div>
            )}
            {phase === "error" && <p className="fp-error">{error}</p>}

            {phase === "done" && x && verdict && (
              <>
                <div className={`ir-verdict ${problems ? "bad" : "ok"}`}>
                  <b>{problems ? `⚠ ${t.verdictBad(problems)}` : `✓ ${t.verdictOk}`}</b>
                  <small>{t.meta(res!.pages, res!.chars, res!.ms, res!.cached)}</small>
                </div>

                <div className="pl-cap">{t.result}</div>
                <div className="ir-fields">
                  <div>
                    <span>{t.fields.supplier}</span>
                    <b>{x.supplier?.name ?? "—"}</b>
                    <small>NIT {x.supplier?.nit ?? "—"}</small>
                  </div>
                  <div>
                    <span>{t.fields.invoiceNumber}</span>
                    <b>{x.invoiceNumber ?? "—"}</b>
                    <small>{x.documentType ?? ""}</small>
                  </div>
                  <div>
                    <span>{t.fields.issueDate}</span>
                    <b>{fmtDateIso(x.issueDate)}</b>
                  </div>
                  <div>
                    <span>{t.fields.dueDate}</span>
                    <b>{fmtDateIso(x.dueDate)}</b>
                    <small>{x.paymentTerms ?? ""}</small>
                  </div>
                  <div className="wide">
                    <span>{t.fields.buyer}</span>
                    <b>{x.buyer?.name ?? "—"}</b>
                    <small>NIT {x.buyer?.nit ?? "—"}</small>
                  </div>
                </div>

                <table className="dm-table ir-lines">
                  <thead>
                    <tr>
                      {t.lineCols.map((c, i) => (
                        <th key={c} className={i ? "r" : ""}>
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(x.lines ?? []).map((l, i) => (
                      <tr key={i} className={(l.amount ?? 0) < 0 ? "neg" : ""}>
                        <td>{l.description}</td>
                        <td className="r">
                          {num(l.quantity)} {l.unit ?? ""}
                        </td>
                        <td className="r">{l.unitPrice == null ? "—" : fmtCOP(l.unitPrice)}</td>
                        <td className="r">{l.amount == null ? "—" : fmtCOP(l.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    {x.subtotal != null && (
                      <tr>
                        <td colSpan={3} className="r">
                          {t.subtotal}
                        </td>
                        <td className="r">{fmtCOP(x.subtotal)}</td>
                      </tr>
                    )}
                    {(x.taxes ?? []).map((tx, i) => (
                      <tr key={`t${i}`}>
                        <td colSpan={3} className="r">
                          {tx.name}
                        </td>
                        <td className="r">{fmtCOP(tx.amount ?? 0)}</td>
                      </tr>
                    ))}
                    {(x.withholdings ?? []).map((w, i) => (
                      <tr key={`w${i}`}>
                        <td colSpan={3} className="r">
                          {w.name}
                        </td>
                        <td className="r">-{fmtCOP(w.amount ?? 0)}</td>
                      </tr>
                    ))}
                    <tr className="ir-total">
                      <td colSpan={3} className="r">
                        {t.total}
                      </td>
                      <td className="r">{x.total == null ? "—" : fmtCOP(x.total)}</td>
                    </tr>
                  </tfoot>
                </table>
                {x.notes && (
                  <p className="dm-muted">
                    <b>{t.aiNotes}:</b> {x.notes}
                  </p>
                )}

                <div className="pl-cap ir-cap2">{t.checks}</div>
                <ul className="ir-checks">
                  {verdict.checks.map((c: Check) => (
                    <li key={c.id} className={c.ok ? "ok" : c.warn ? "warn" : "bad"}>
                      <span>{c.ok ? "✓" : c.warn ? "!" : "✕"}</span>
                      {t.msgs[c.id]?.(c.params ?? {}) ?? c.id}
                    </li>
                  ))}
                </ul>

                <div className="dm-bottom">
                  <button className="cs-btn" onClick={() => download("csv")}>
                    ↓ {t.csv}
                  </button>
                  <button className="cs-btn" onClick={() => download("json")}>
                    ↓ {t.json}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

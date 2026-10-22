// Three fictional supplier invoices for the AI invoice-reader demo, generated in the browser
// so their dates are always current. Each one has a different layout on purpose; two of
// them carry a problem the validation step should catch.
import { DATA, dayFromToday } from "./data";

export type SampleKey = "milk" | "packaging" | "maintenance";

const sup = (id: string) => DATA.suppliers.find((s) => s.id === id)!;
const co = DATA.company;
const cop = (n: number) => "$ " + Math.round(n).toLocaleString("es-CO");
const d = (offset: number) => {
  const x = dayFromToday(offset);
  return `${String(x.getDate()).padStart(2, "0")}/${String(x.getMonth() + 1).padStart(2, "0")}/${x.getFullYear()}`;
};

async function newDoc() {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  return { doc, autoTable, W: doc.internal.pageSize.getWidth(), H: doc.internal.pageSize.getHeight() };
}

function demoFooter(doc: import("jspdf").jsPDF, W: number, H: number) {
  doc.setFontSize(7);
  doc.setTextColor(150);
  doc.text("Documento ficticio generado para una demostración · Fictional document for a demo", W / 2, H - 20, { align: "center" });
}

/** 1. Fortnightly raw-milk settlement from a cooperative (clean: every check should pass). */
async function milk() {
  const { doc, autoTable, W, H } = await newDoc();
  const s = sup("P03");
  doc.setFillColor(232, 240, 228);
  doc.rect(0, 0, W, 90, "F");
  doc.setFont("times", "bold");
  doc.setFontSize(20);
  doc.setTextColor(40, 70, 40);
  doc.text(s.name, 40, 42);
  doc.setFont("times", "normal");
  doc.setFontSize(10);
  doc.text(`NIT ${s.nit} · Vereda El Salitre, Sutatausa (Cund.) · Régimen común`, 40, 60);
  doc.text("Asociados productores de leche cruda desde 1998", 40, 74);

  doc.setTextColor(20);
  doc.setFont("times", "bold");
  doc.setFontSize(13);
  doc.text("LIQUIDACIÓN QUINCENAL DE LECHE  No. LQ-2026-0418", 40, 120);
  doc.setFont("times", "normal");
  doc.setFontSize(10);
  const from = -16;
  const to = -2;
  doc.text(
    [
      `Comprador: ${co.name.toUpperCase()}  ·  NIT ${co.nit}`,
      `Periodo: ${d(from)} al ${d(to)}`,
      `Fecha de expedición: ${d(-1)}      Fecha límite de pago: ${d(-1 + s.termDays)}`,
    ],
    40,
    140,
  );

  const liters = [1712, 1688, 1745, 1702, 1690, 1731, 1756, 1724, 1698, 1710, 1743, 1762, 1705, 1719, 1736];
  const rows = liters.map((l, i) => [d(from + i), i % 2 ? "Ruta 2 · Tausavita" : "Ruta 1 · El Salitre", l.toLocaleString("es-CO")]);
  const totalL = liters.reduce((a, b) => a + b, 0);
  autoTable(doc, {
    startY: 185,
    head: [["Fecha", "Ruta de recolección", "Litros"]],
    body: rows,
    foot: [["", "TOTAL LITROS", totalL.toLocaleString("es-CO")]],
    theme: "striped",
    styles: { font: "times", fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [40, 70, 40] },
    footStyles: { fillColor: [232, 240, 228], textColor: 20 },
    columnStyles: { 2: { halign: "right" } },
    margin: { left: 40, right: W / 2 + 10 },
  });

  const base = 1850;
  const items: [string, number, number][] = [
    ["Leche cruda – precio base por litro", totalL, base],
    ["Bonificación calidad composicional (grasa 3,6% · proteína 3,1%)", totalL, 45],
    ["Bonificación higiénica (UFC < 100.000)", totalL, 20],
    ["Descuento transporte desde finca", totalL, -35],
  ];
  const sum = items.reduce((a, [, q, p]) => a + q * p, 0);
  autoTable(doc, {
    startY: 185,
    head: [["Concepto", "Valor"]],
    body: [
      ...items.map(([c, q, p]) => [`${c}\n${q.toLocaleString("es-CO")} L × ${cop(p)}`, cop(q * p)]),
    ],
    foot: [["VALOR NETO A PAGAR", cop(sum)]],
    theme: "grid",
    styles: { font: "times", fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [40, 70, 40] },
    footStyles: { fillColor: [40, 70, 40], textColor: 255, fontSize: 11 },
    columnStyles: { 1: { halign: "right", cellWidth: 90 } },
    margin: { left: W / 2 + 10, right: 40 },
  });
  doc.setFontSize(9);
  doc.text("Consignar en la cuenta de ahorros de la Cooperativa. Esta liquidación hace las veces de factura.", 40, H - 60);
  demoFooter(doc, W, H);
  return doc.output("blob");
}

/** 2. Packaging e-invoice whose number is already registered (duplicate). */
async function packaging() {
  const { doc, autoTable, W, H } = await newDoc();
  const s = sup("P05");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(0, 86, 145);
  doc.text("ENVASES PLÁSTICOS", 40, 50);
  doc.text("DE LA SABANA", 40, 70);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(90);
  doc.text([`${s.name}  ·  NIT: ${s.nit}`, "Parque Industrial Siberia, Cota · Tel. 601 555 0198", "Responsable de IVA · Actividad CIIU 2229"], 40, 88);

  doc.setDrawColor(0, 86, 145);
  doc.setLineWidth(1);
  doc.rect(W - 230, 36, 190, 76);
  doc.setFontSize(8);
  doc.setTextColor(0, 86, 145);
  doc.text("FACTURA ELECTRÓNICA DE VENTA", W - 135, 52, { align: "center" });
  doc.setFontSize(16);
  doc.setTextColor(20);
  doc.setFont("helvetica", "bold");
  doc.text("EPS-4410", W - 135, 75, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`Emisión: ${d(-45)}   Vence: ${d(0)}`, W - 135, 93, { align: "center" });
  doc.text("Forma de pago: Crédito 45 días", W - 135, 105, { align: "center" });

  doc.setFontSize(9);
  doc.text(["ADQUIRIENTE", `${co.name}`, `NIT ${co.nit}`, `${co.address}, ${co.city}`], 40, 140);

  const lines: [string, string, number, string, number][] = [
    ["VPP-150", "Vaso PP 150 g con tapa termosellable", 20000, "und", 45],
    ["BPET-1L", "Botella PET 1 L con tapa rosca", 6000, "und", 120],
    ["BAL-5K", "Balde PP 5 kg con asa y tapa", 400, "und", 950],
  ];
  const sub = lines.reduce((a, l) => a + l[2] * l[4], 0);
  autoTable(doc, {
    startY: 200,
    head: [["Código", "Descripción", "Cant.", "U.M.", "Vr. unitario", "Vr. total"]],
    body: lines.map((l) => [l[0], l[1], l[2].toLocaleString("es-CO"), l[3], cop(l[4]), cop(l[2] * l[4])]),
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 5 },
    headStyles: { fillColor: [0, 86, 145], textColor: 255 },
    columnStyles: { 2: { halign: "right" }, 4: { halign: "right" }, 5: { halign: "right" } },
    margin: { left: 40, right: 40 },
  });
  const y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 20;
  const iva = Math.round(sub * 0.19);
  const rows: [string, string][] = [
    ["Subtotal", cop(sub)],
    ["IVA 19%", cop(iva)],
    ["TOTAL A PAGAR", cop(sub + iva)],
  ];
  rows.forEach(([k, v], i) => {
    doc.setFont("helvetica", i === 2 ? "bold" : "normal");
    doc.setFontSize(i === 2 ? 11 : 9);
    doc.text(k, W - 220, y + i * 16);
    doc.text(v, W - 40, y + i * 16, { align: "right" });
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(120);
  doc.text("CUFE: 3f9a1c0e7b2d44a8a6c1e5b0d9f8e7a6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5", 40, H - 60);
  demoFooter(doc, W, H);
  return doc.output("blob");
}

/** 3. Cold-room maintenance invoice with an arithmetic error in the subtotal. */
async function maintenance() {
  const { doc, autoTable, W, H } = await newDoc();
  const s = sup("P08");
  doc.setFillColor(30, 30, 30);
  doc.rect(0, 0, 14, H, "F");
  doc.setFont("courier", "bold");
  doc.setFontSize(14);
  doc.setTextColor(20);
  doc.text(s.name, 40, 50);
  doc.setFont("courier", "normal");
  doc.setFontSize(9);
  doc.text(`NIT ${s.nit}  |  Refrigeración industrial  |  Calle 13 # 68-40, Bogotá`, 40, 66);
  doc.line(40, 76, W - 40, 76);
  doc.setFontSize(10);
  doc.text(
    [
      `FACTURA No.      MRF-10027`,
      `FECHA            ${d(-3)}`,
      `VENCIMIENTO      ${d(-3 + s.termDays)}  (30 días)`,
      `CLIENTE          ${co.name.toUpperCase()}`,
      `NIT CLIENTE      ${co.nit}`,
      `ORDEN DE SERVICIO OS-2231 · Planta Ubaté`,
    ],
    40,
    98,
  );
  const lines: [string, number, number][] = [
    ["Mantenimiento preventivo cuarto frío No. 1 (producto terminado)", 1, 980000],
    ["Mantenimiento preventivo cuarto frío No. 2 (leche cruda)", 1, 980000],
    ["Repuesto: válvula de expansión termostática", 2, 285000],
    ["Mano de obra técnica adicional (horas)", 6, 45000],
  ];
  const real = lines.reduce((a, [, q, p]) => a + q * p, 0); // 2.800.000
  const printedSub = real + 120000; // the supplier's mistake
  const iva = Math.round(printedSub * 0.19);
  autoTable(doc, {
    startY: 190,
    head: [["DESCRIPCIÓN", "CANT", "VALOR UNIT.", "VALOR"]],
    body: lines.map(([c, q, p]) => [c, String(q), cop(p), cop(q * p)]),
    theme: "grid",
    styles: { font: "courier", fontSize: 8.5, cellPadding: 4, lineColor: 30 },
    headStyles: { fillColor: [30, 30, 30], textColor: 255 },
    columnStyles: { 1: { halign: "center" }, 2: { halign: "right" }, 3: { halign: "right" } },
    margin: { left: 40, right: 40 },
  });
  const y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 18;
  doc.setFont("courier", "normal");
  doc.setFontSize(10);
  [
    ["SUBTOTAL", cop(printedSub)],
    ["IVA 19%", cop(iva)],
    ["TOTAL", cop(printedSub + iva)],
  ].forEach(([k, v], i) => {
    doc.setFont("courier", i === 2 ? "bold" : "normal");
    doc.text(k, W - 240, y + i * 15);
    doc.text(v, W - 40, y + i * 15, { align: "right" });
  });
  doc.setFont("courier", "normal");
  doc.setFontSize(8);
  doc.text("Garantía de 90 días sobre repuestos instalados.", 40, y + 70);
  demoFooter(doc, W, H);
  return doc.output("blob");
}

export const SAMPLES: Record<SampleKey, () => Promise<Blob>> = { milk, packaging, maintenance };

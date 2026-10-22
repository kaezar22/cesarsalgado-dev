// Builds the demo invoice PDF in the browser. Clearly marked as a fictional demo.
import type { Lang } from "@/lib/content";
import { DATA, dayFromToday, fmtCOP, fmtDate, fmtQty, productByCode, type Client, type Order } from "./data";
import type { PricedLine } from "./match";

const TXT = {
  en: {
    invoice: "SALES INVOICE",
    demo: "DEMO · FICTIONAL DATA · NOT A VALID INVOICE",
    billTo: "Bill to",
    point: "Delivered to",
    order: "Web order",
    issue: "Issue date",
    due: "Due date",
    terms: (d: number) => `Credit: ${d} days`,
    list: "Price list",
    cols: ["Code", "Description", "Unit", "Qty", "Unit price", "Subtotal"],
    total: "TOTAL",
    unit: { kg: "kg", unit: "unit" },
    foot: "Generated automatically from the web order. Taxes omitted in this demo. Lácteos Agua Clara S.A.S. is a fictional company.",
  },
  es: {
    invoice: "FACTURA DE VENTA",
    demo: "DEMO · DATOS FICTICIOS · NO ES UNA FACTURA VÁLIDA",
    billTo: "Cliente",
    point: "Punto de entrega",
    order: "Pedido web",
    issue: "Fecha",
    due: "Vence",
    terms: (d: number) => `Crédito: ${d} días`,
    list: "Lista de precios",
    cols: ["Código", "Descripción", "Unidad", "Cant.", "Precio unit.", "Subtotal"],
    total: "TOTAL",
    unit: { kg: "kg", unit: "und" },
    foot: "Generada automáticamente desde el pedido web. Impuestos omitidos en esta demo. Lácteos Agua Clara S.A.S. es una empresa ficticia.",
  },
};

export async function downloadInvoicePdf(opts: {
  order: Order;
  client: Client;
  point: string;
  lines: PricedLine[];
  invoiceNo: string;
  lang: Lang;
}) {
  const { order, client, point, lines, invoiceNo, lang } = opts;
  const t = TXT[lang];
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const ink: [number, number, number] = [20, 33, 46];
  const accent: [number, number, number] = [15, 123, 95];
  const muted: [number, number, number] = [85, 99, 111];

  // Watermark
  doc.saveGraphicsState();
  doc.setGState(new (doc as unknown as { GState: new (o: object) => object }).GState({ opacity: 0.08 }));
  doc.setFontSize(64);
  doc.setTextColor(...accent);
  doc.text("DEMO", W / 2, H / 2, { align: "center", angle: 30 });
  doc.restoreGraphicsState();

  // Demo banner
  doc.setFillColor(255, 241, 204);
  doc.rect(0, 0, W, 22, "F");
  doc.setFontSize(8);
  doc.setTextColor(122, 74, 0);
  doc.setFont("helvetica", "bold");
  doc.text(t.demo, W / 2, 14, { align: "center" });

  // Company
  const c = DATA.company;
  doc.setTextColor(...ink);
  doc.setFontSize(18);
  doc.text(c.name, 40, 62);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...muted);
  doc.text([`NIT ${c.nit}`, c.address, `${c.city} · ${c.phone}`, c.email], 40, 78);

  // Invoice box
  doc.setDrawColor(...accent);
  doc.setLineWidth(1.2);
  doc.roundedRect(W - 220, 44, 180, 70, 6, 6);
  doc.setTextColor(...accent);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(t.invoice, W - 130, 64, { align: "center" });
  doc.setTextColor(...ink);
  doc.setFontSize(15);
  doc.text(invoiceNo, W - 130, 86, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...muted);
  doc.text(`${t.order}: ${order.id}`, W - 130, 103, { align: "center" });

  // Client + dates
  const issue = dayFromToday(order.deliveryOffset);
  const due = dayFromToday(order.deliveryOffset + client.termDays);
  let y = 150;
  doc.setFontSize(8);
  doc.setTextColor(...muted);
  doc.text(t.billTo.toUpperCase(), 40, y);
  doc.text(t.issue.toUpperCase(), 360, y);
  doc.text(t.due.toUpperCase(), 470, y);
  y += 15;
  doc.setFontSize(10.5);
  doc.setTextColor(...ink);
  doc.setFont("helvetica", "bold");
  doc.text(client.legalName, 40, y);
  doc.setFont("helvetica", "normal");
  doc.text(fmtDate(issue, lang), 360, y);
  doc.text(fmtDate(due, lang), 470, y);
  y += 14;
  doc.setFontSize(9);
  doc.setTextColor(...muted);
  doc.text(`NIT ${client.nit} · ${client.city}`, 40, y);
  doc.text(t.terms(client.termDays), 360, y);
  y += 13;
  doc.text(`${t.point}: ${point} · ${t.list} ${client.priceList}`, 40, y);

  const valid = lines.filter((l) => l.price !== null);
  const total = valid.reduce((s, l) => s + (l.subtotal ?? 0), 0);

  autoTable(doc, {
    startY: y + 20,
    head: [t.cols],
    body: valid.map((l) => {
      const p = productByCode[l.code];
      return [l.code, p?.[lang] ?? l.code, t.unit[p?.unit ?? "unit"], fmtQty(l.qty), fmtCOP(l.price!), fmtCOP(l.subtotal!)];
    }),
    foot: [["", "", "", "", t.total, fmtCOP(total)]],
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 6, textColor: ink, lineColor: [226, 222, 212] },
    headStyles: { fillColor: [15, 30, 46], textColor: 255, fontStyle: "bold" },
    footStyles: { fillColor: [247, 245, 240], textColor: ink, fontStyle: "bold", fontSize: 10.5 },
    columnStyles: { 3: { halign: "right" }, 4: { halign: "right" }, 5: { halign: "right" } },
    margin: { left: 40, right: 40 },
  });

  doc.setFontSize(8);
  doc.setTextColor(...muted);
  doc.text(doc.splitTextToSize(t.foot, W - 80), 40, H - 40);

  doc.save(`${invoiceNo}.pdf`);
}

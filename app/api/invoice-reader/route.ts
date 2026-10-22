import { createHash } from "node:crypto";
import { extractText, getDocumentProxy } from "unpdf";

// AI invoice reader for the live demo: PDF -> text -> DeepSeek -> structured JSON.
// Nothing is stored. Validation happens in the browser (lib/demo/invoiceCheck.ts),
// so the AI's answer is always checked against arithmetic and master data.

export const maxDuration = 60;

const MAX_BYTES = 2 * 1024 * 1024;
const MAX_PAGES = 4;
const MAX_CHARS = 15000;

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 15;
const hits = new Map<string, { count: number; start: number }>();
const cache = new Map<string, unknown>();

function limited(ip: string) {
  const now = Date.now();
  const e = hits.get(ip);
  if (!e || now - e.start > WINDOW_MS) {
    hits.set(ip, { count: 1, start: now });
    return false;
  }
  e.count += 1;
  return e.count > MAX_PER_WINDOW;
}

const PROMPT = `You extract data from supplier invoices (Colombian, usually in Spanish) for an accounts-payable system.
Return ONLY a JSON object with exactly these keys:
{
  "documentType": string,            // e.g. "Factura electrónica de venta", "Liquidación de leche"
  "invoiceNumber": string,
  "supplier": { "name": string, "nit": string },   // NIT as printed, with check digit if present (e.g. "900123456-7")
  "buyer": { "name": string, "nit": string },
  "issueDate": "YYYY-MM-DD" | null,
  "dueDate": "YYYY-MM-DD" | null,
  "currency": "COP" | string,
  "lines": [ { "description": string, "quantity": number, "unit": string, "unitPrice": number, "amount": number } ],
  "subtotal": number | null,          // as PRINTED on the document, even if it looks wrong
  "taxes": [ { "name": string, "rate": number, "amount": number } ],   // rate as a fraction, 19% = 0.19
  "withholdings": [ { "name": string, "amount": number } ],
  "total": number | null,             // as PRINTED
  "paymentTerms": string | null,
  "notes": string | null              // anything unusual, in one short sentence, or null
}
Rules:
- Colombian number format: "1.240.000" is 1240000 and "3,6" is 3.6. Return plain numbers.
- Dates on the document are usually DD/MM/YYYY.
- Discounts or deductions are lines with a NEGATIVE amount (and negative unitPrice).
- For each line, "amount" is the value printed for that line. Copy printed values; never correct or recompute them.
- "lines" are the priced items that make up the amount to pay. Ignore informational tables (e.g. daily quantities with no price).
- If a field is not on the document use null (or [] for lists). Do not invent values.`;

export async function POST(req: Request) {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) return Response.json({ error: "not_configured" }, { status: 500 });
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  let file: File | null = null;
  try {
    const form = await req.formData();
    const f = form.get("file");
    file = f instanceof File ? f : null;
  } catch {
    /* fallthrough */
  }
  if (!file) return Response.json({ error: "no_file" }, { status: 400 });
  if (file.size > MAX_BYTES) return Response.json({ error: "too_big" }, { status: 413 });

  const buf = new Uint8Array(await file.arrayBuffer());
  if (buf.length < 5 || String.fromCharCode(...buf.slice(0, 5)) !== "%PDF-") {
    return Response.json({ error: "not_pdf" }, { status: 415 });
  }

  let text = "";
  let pages = 0;
  try {
    const pdf = await getDocumentProxy(buf);
    pages = pdf.numPages;
    if (pages > MAX_PAGES) return Response.json({ error: "too_many_pages" }, { status: 413 });
    const out = await extractText(pdf, { mergePages: true });
    text = (Array.isArray(out.text) ? out.text.join("\n") : out.text).replace(/[ \t]+/g, " ").trim();
  } catch {
    return Response.json({ error: "unreadable" }, { status: 422 });
  }
  if (text.length < 40) return Response.json({ error: "scanned" }, { status: 422 });
  text = text.slice(0, MAX_CHARS);

  const hash = createHash("sha256").update(text).digest("hex");
  const cached = cache.get(hash);
  if (cached) return Response.json({ data: cached, pages, chars: text.length, cached: true });

  if (limited(ip)) return Response.json({ error: "rate_limited" }, { status: 429 });

  const started = Date.now();
  const upstream = await fetch(`${process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com"}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: "deepseek-chat",
      temperature: 0,
      max_tokens: 2500,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: PROMPT },
        { role: "user", content: `Invoice text:\n"""\n${text}\n"""` },
      ],
    }),
  });
  if (!upstream.ok) {
    console.error("DeepSeek error", upstream.status, await upstream.text().catch(() => ""));
    return Response.json({ error: "ai_error" }, { status: 502 });
  }
  const json = await upstream.json();
  let data: unknown;
  try {
    data = JSON.parse(json.choices?.[0]?.message?.content ?? "");
  } catch {
    return Response.json({ error: "ai_bad_json" }, { status: 502 });
  }
  if (cache.size > 200) cache.clear();
  cache.set(hash, data);
  return Response.json({ data, pages, chars: text.length, ms: Date.now() - started });
}

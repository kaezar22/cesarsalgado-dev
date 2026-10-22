// Fuzzy matching of what a restaurant typed ("polar andino") to a known point of sale
// ("Polar Gelato Andino") and from there to the legal entity and its price list.
// Same idea as the production app: token-set similarity on normalized text, and when
// confidence is low the result is "not found" instead of a guess.
import { DATA, type Client, type Line } from "./data";

export const MATCH_OK = 85; // auto-accepted
export const MATCH_REVIEW = 65; // shown, but flagged for a human

export function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a: string, b: string) {
  if (a === b) return 0;
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = tmp;
    }
  }
  return prev[b.length];
}

/** 0–100 similarity of two strings (like rapidfuzz.ratio). */
export function ratio(a: string, b: string) {
  if (!a && !b) return 100;
  return Math.round((1 - levenshtein(a, b) / Math.max(a.length, b.length)) * 100);
}

/** 0–100, order-insensitive and tolerant to missing words (like rapidfuzz.token_set_ratio). */
export function tokenSetRatio(a: string, b: string) {
  const ta = new Set(normalize(a).split(" ").filter(Boolean));
  const tb = new Set(normalize(b).split(" ").filter(Boolean));
  const inter = [...ta].filter((t) => tb.has(t)).sort().join(" ");
  const onlyA = [...ta].filter((t) => !tb.has(t)).sort().join(" ");
  const onlyB = [...tb].filter((t) => !ta.has(t)).sort().join(" ");
  const sa = [inter, onlyA].filter(Boolean).join(" ");
  const sb = [inter, onlyB].filter(Boolean).join(" ");
  return Math.max(ratio(inter, sa), ratio(inter, sb), ratio(sa, sb));
}

export type Match = {
  point: string | null;
  client: Client | null;
  score: number;
  status: "ok" | "review" | "notfound";
};

export function matchClient(typed: string): Match {
  let best: { point: string; client: Client; score: number } | null = null;
  for (const client of DATA.clients) {
    for (const point of client.points) {
      // Shared words like "café" alone shouldn't be enough: require the whole-string ratio to agree a bit.
      const score = Math.round(
        0.7 * tokenSetRatio(typed, point) + 0.3 * ratio(normalize(typed), normalize(point)),
      );
      if (!best || score > best.score) best = { point, client, score };
    }
  }
  if (!best || best.score < MATCH_REVIEW) {
    return { point: null, client: null, score: best?.score ?? 0, status: "notfound" };
  }
  return { ...best, status: best.score >= MATCH_OK ? "ok" : "review" };
}

export type PricedLine = Line & { price: number | null; subtotal: number | null };

export function priceLines(lines: Line[], client: Client | null): PricedLine[] {
  return lines.map((l) => {
    const price = client ? (DATA.priceLists[client.priceList]?.[l.code] ?? null) : null;
    return { ...l, price, subtotal: price === null ? null : Math.round(price * l.qty) };
  });
}

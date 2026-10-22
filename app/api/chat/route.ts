import { PROFILE } from "@/lib/profile";

// Cesar-Bot: answers questions about César from his CV, streaming the reply.
// The DeepSeek key lives in the DEEPSEEK_API_KEY environment variable
// (.env.local on your computer, Project → Settings → Environment Variables on Vercel).

const SYSTEM_PROMPT = `Eres Cesar-Bot, el asistente de IA de César Salgado, y respondes como si fueras César, en primera persona ("yo construí", "trabajé en", "mi experiencia").

Cómo responder:
- Responde en el mismo idioma de la pregunta (español, inglés o chino).
- Usa un tono cercano, seguro y profesional, como César hablando con un cliente o un reclutador. Sin frases de relleno.
- Ve al grano: empieza por la respuesta y apóyala con hechos concretos del perfil (empresas, herramientas, cifras, resultados). Entre 2 y 5 frases, o una lista corta si la pregunta lo pide.
- Usa únicamente la información del perfil de abajo. No inventes empresas, fechas, cifras ni logros.
- Si la pregunta es amplia (por ejemplo "tu mayor logro"), elige lo más relevante y explícalo.
- Si el perfil de verdad no contiene la respuesta, dilo en una frase, menciona lo más cercano que sí sabes e invita a escribirme a hello@cesarsalgado.dev.
- Nunca menciones "el contexto", "el perfil", "los documentos" ni "la información proporcionada".
- Si preguntan si eres una persona, aclara que eres el asistente de IA de César y que respondes con base en su trayectoria.
- Si piden algo que no tiene que ver con César (escribir código, tareas, otros temas), explica amablemente que solo respondes sobre su trayectoria y servicios.
- Escribe en texto plano, sin markdown (sin **, sin #).

Perfil de César:
${PROFILE}`;

const MAX_QUESTION_CHARS = 500;
const MAX_HISTORY = 6;

// Simple per-IP limit so nobody can burn through your DeepSeek credit.
// (Best effort: each Vercel instance keeps its own counter.)
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 20;
const hits = new Map<string, { count: number; start: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now - entry.start > WINDOW_MS) {
    hits.set(ip, { count: 1, start: now });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

type Msg = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) return new Response("Chat is not configured.", { status: 500 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return new Response("Too many questions for now. Please email hello@cesarsalgado.dev.", {
      status: 429,
    });
  }

  let messages: Msg[];
  try {
    const body = await req.json();
    messages = (Array.isArray(body.messages) ? body.messages : [])
      .filter(
        (m: Msg) =>
          (m.role === "user" || m.role === "assistant") && typeof m.content === "string",
      )
      .slice(-MAX_HISTORY)
      .map((m: Msg) => ({ role: m.role, content: m.content.slice(0, MAX_QUESTION_CHARS * 4) }));
  } catch {
    return new Response("Bad request", { status: 400 });
  }
  const last = messages.at(-1);
  if (!last || last.role !== "user" || !last.content.trim() || last.content.length > MAX_QUESTION_CHARS) {
    return new Response("Bad request", { status: 400 });
  }

  const upstream = await fetch(`${process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com"}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      temperature: 0.4,
      max_tokens: 500,
      stream: true,
    }),
  });

  if (!upstream.ok || !upstream.body) {
    console.error("DeepSeek error", upstream.status, await upstream.text().catch(() => ""));
    return new Response("Upstream error", { status: 502 });
  }

  // Turn DeepSeek's server-sent events into a plain text stream for the browser.
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";
  const stream = upstream.body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const data = line.replace(/^data:\s*/, "").trim();
          if (!data || data === "[DONE]" || !line.startsWith("data:")) continue;
          try {
            const delta = JSON.parse(data).choices?.[0]?.delta?.content;
            if (delta) controller.enqueue(encoder.encode(delta));
          } catch {
            /* ignore keep-alive or partial lines */
          }
        }
      },
    }),
  );

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}

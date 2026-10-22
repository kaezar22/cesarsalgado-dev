import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Preview card shown when the link is shared (WhatsApp, LinkedIn, Slack…).
export const alt = "César Salgado | AI, Data Science & RPA Consultant";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const font = (pkg: string, file: string) =>
  readFile(join(process.cwd(), "node_modules/@fontsource", pkg, "files", file));

export default async function OpengraphImage() {
  const [serif, sans] = await Promise.all([
    font("fraunces", "fraunces-latin-600-normal.woff"),
    font("ibm-plex-sans", "ibm-plex-sans-latin-500-normal.woff"),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#0F1E2E",
          backgroundImage:
            "radial-gradient(700px 500px at 100% 0%, rgba(22,160,120,0.55), transparent 70%)",
          color: "#FFFFFF",
          fontFamily: "Plex",
        }}
      >
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 5, color: "#5EE6B8" }}>
          RPA · DATA ANALYTICS · AI ARCHITECTURE
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontFamily: "Fraunces", fontSize: 104, lineHeight: 1, letterSpacing: -3 }}>
            César Salgado
          </div>
          <div
            style={{
              fontFamily: "Fraunces",
              fontSize: 44,
              lineHeight: 1.25,
              marginTop: 28,
              color: "#DCE4EA",
              maxWidth: 950,
            }}
          >
            I turn manual processes into automated ones, and data into decisions.
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 28, color: "#B8C4CF" }}>
          <span>cesarsalgado.dev</span>
          <span>English · Español · Mandarin</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Fraunces", data: serif, weight: 600, style: "normal" },
        { name: "Plex", data: sans, weight: 500, style: "normal" },
      ],
    },
  );
}

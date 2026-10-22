import Link from "next/link";
import type { Lang } from "@/lib/content";
import { EMAIL } from "@/lib/content";

const TX = {
  en: { back: "← All work", other: "Español", fictional: "Live demo · fictional data", cta: "Want this for your company?", ctaLead: "Tell me how your team handles it today and I’ll reply with how I would automate it.", foot: "Lácteos Agua Clara S.A.S. is a fictional company; all data on this page is invented." },
  es: { back: "← Volver al sitio", other: "English", fictional: "Demo en vivo · datos ficticios", cta: "¿Quiere esto para su empresa?", ctaLead: "Cuénteme cómo lo maneja hoy su equipo y le respondo cómo lo automatizaría.", foot: "Lácteos Agua Clara S.A.S. es una empresa ficticia; todos los datos de esta página son inventados." },
};

export default function DemoShell({
  lang,
  slug,
  title,
  lead,
  how,
  children,
}: {
  lang: Lang;
  slug: string;
  title: string;
  lead: string;
  how: { title: string; items: readonly string[] };
  children: React.ReactNode;
}) {
  const t = TX[lang];
  const home = lang === "en" ? "/" : "/es";
  const otherHref = lang === "en" ? `/es/demos/${slug}` : `/demos/${slug}`;
  return (
    <div className="cs-wrap">
      <header className="cs-top">
        <Link href={home} className="cs-brand">
          César Salgado<span>.</span>
        </Link>
        <nav className="cs-nav">
          <Link href={`${home}#demos`}>{t.back}</Link>
          <Link href={otherHref} className="cs-lang">
            {t.other}
          </Link>
        </nav>
      </header>

      <main>
        <section className="dm-hero">
          <div className="cs-eyebrow">{t.fictional}</div>
          <h1>{title}</h1>
          <p className="cs-lead">{lead}</p>
        </section>

        {children}

        <section className="dm-how">
          <h2>{how.title}</h2>
          <ul>
            {how.items.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        </section>

        <section className="cs-contact">
          <h2>{t.cta}</h2>
          <p>{t.ctaLead}</p>
          <a className="cs-mail" href={`mailto:${EMAIL}`}>
            {EMAIL}
          </a>
        </section>
      </main>
      <footer className="cs-footer">
        © {new Date().getFullYear()} César Salgado · {t.foot}
      </footer>
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import Chat from "./Chat";
import { DEMOS } from "@/lib/demo/pages";
import {
  CV_FILES,
  EMAIL,
  FUN,
  GITHUB,
  LINKEDIN,
  MUSIC,
  PROJECTS,
  T,
  TESTIMONIALS,
  type Lang,
  type Project,
} from "@/lib/content";

const BARS = Array.from({ length: 28 }, (_, i) => 18 + ((i * 37) % 71));

function ProjectCard({ project, lang }: { project: Project; lang: Lang }) {
  const t = T[lang];
  const p = project[lang];
  const url = project.url;
  const internal = !!url && url.startsWith("#");
  const cta = project.video ? t.watch : internal ? t.open_chat : t.open;

  const inner = (
    <>
      <div className="cs-img">
        <Image
          src={`/projects/${project.image}`}
          alt={p.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, 360px"
        />
        {project.video && <span className="cs-badge">▶ {t.video_badge}</span>}
      </div>
      <div className="cs-body">
        <div className="cs-tag">{p.tag}</div>
        <h3>{p.title}</h3>
        {p.body ? (
          <p>{p.body}</p>
        ) : (
          <>
            <div className="cs-label">{t.problem}</div>
            <p>{p.problem}</p>
            <div className="cs-label">{t.solution}</div>
            <p>{p.solution}</p>
          </>
        )}
        {p.note && <div className="cs-flag">⚠ {p.note}</div>}
        {url && (
          <div className="cs-cta">
            {cta}
            <i>{internal ? "↓" : "→"}</i>
          </div>
        )}
      </div>
    </>
  );

  if (!url) return <div className="cs-card">{inner}</div>;
  return internal ? (
    <a className="cs-card" href={url}>
      {inner}
    </a>
  ) : (
    <a className="cs-card" href={url} target="_blank" rel="noopener">
      {inner}
    </a>
  );
}

export default function Site({ lang }: { lang: Lang }) {
  const t = T[lang];
  const other: Lang = lang === "en" ? "es" : "en";

  return (
    <div className="cs-wrap">
      <header className="cs-top">
        <Link href={lang === "en" ? "/" : "/es"} className="cs-brand">
          César Salgado<span>.</span>
        </Link>
        <nav className="cs-nav">
          <a href="#services">{t.nav_services}</a>
          <a href="#projects">{t.nav_projects}</a>
          <a href="#demos">{t.nav_demos}</a>
          <a href="#chat">{t.nav_chat}</a>
          <a href="#contact">{t.nav_contact}</a>
          <Link href={other === "en" ? "/" : "/es"} className="cs-lang" hrefLang={other}>
            {t.other_lang}
          </Link>
        </nav>
      </header>

      <main>
        <section className="cs-hero">
          <div className="cs-eyebrow">{t.eyebrow}</div>
          <h1>César Salgado</h1>
          <p className="cs-tagline">{t.h1}</p>
          <p className="cs-lead">{t.lead}</p>
          <div className="cs-actions">
            <a className="cs-btn cs-btn-primary" href={`mailto:${EMAIL}`}>
              {t.cta_mail}
            </a>
            <a className="cs-btn" href={LINKEDIN} target="_blank" rel="noopener">
              {t.cta_linkedin}
            </a>
            <a className="cs-btn" href={CV_FILES[lang]} download>
              {t.cv} ↓
            </a>
          </div>
        </section>

        <div className="cs-stats">
          {t.stats.map(([n, label]) => (
            <div className="cs-stat" key={n}>
              <b>{n}</b>
              <span>{label}</span>
            </div>
          ))}
        </div>

        <section className="cs-section" id="services">
          <div className="cs-kicker">{t.services_kicker}</div>
          <h2>{t.services_title}</h2>
          <div className="cs-services">
            {t.services.map((s, i) => (
              <div className="cs-service" key={s.title}>
                <div className="n">0{i + 1}</div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                <ul>
                  {s.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {TESTIMONIALS.length > 0 && (
          <section className="cs-section" id="testimonials">
            <div className="cs-kicker">{t.testimonials_kicker}</div>
            <h2>{t.testimonials_title}</h2>
            {TESTIMONIALS.map((item) => (
              <figure className="cs-quote" key={item.client}>
                <div className="cs-quote-main">
                  <span className="cs-qmark" aria-hidden>
                    “
                  </span>
                  <blockquote>{item[lang].quote}</blockquote>
                  <figcaption>
                    <Image src={item.logo} alt={item.client} width={120} height={38} />
                    <span>{item[lang].role}</span>
                  </figcaption>
                </div>
                <div className="cs-quote-stat">
                  <b>{item[lang].stat}</b>
                  <span>{item[lang].stat_label}</span>
                </div>
              </figure>
            ))}
          </section>
        )}

        <section className="cs-section" id="projects">
          <div className="cs-kicker">{t.projects_kicker}</div>
          <h2>{t.projects_title}</h2>
          <p className="cs-note">{t.projects_note}</p>
          <div className="cs-grid">
            {PROJECTS.map((p) => (
              <ProjectCard key={p.image} project={p} lang={lang} />
            ))}
          </div>
        </section>

        <section className="cs-section" id="demos">
          <div className="cs-kicker">{t.demos_kicker}</div>
          <h2>{t.demos_title}</h2>
          <p className="cs-note">{t.demos_lead}</p>
          <div className="dm-cards">
            {Object.values(DEMOS).map((d) => (
              <Link key={d.slug} className="dm-card" href={`${lang === "es" ? "/es" : ""}/demos/${d.slug}`}>
                <div className="dm-card-art" aria-hidden>
                  <span className="a1">“forno chico”</span>
                  <span className="a2">→ Forno Vivo Chicó · 91%</span>
                  <span className="a3">FE-D7001.pdf ✓</span>
                </div>
                <div className="dm-card-body">
                  <div className="cs-tag">{d[lang].tag}</div>
                  <h3>{d[lang].title}</h3>
                  <p>{d[lang].card}</p>
                  <div className="cs-cta">
                    {t.demos_open}
                    <i>→</i>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <p className="cs-note dm-soon">{t.demos_soon}</p>
        </section>

        <section className="cs-section" id="chat">
          <div className="cs-kicker">{t.chat_kicker}</div>
          <h2>{t.chat_title}</h2>
          <p className="cs-note">{t.chat_lead}</p>
          <Chat t={t} />
        </section>

        <section className="cs-section" id="music">
          <div className="cs-kicker">{t.music_kicker}</div>
          <h2>{t.music_title}</h2>
          <p className="cs-note">{t.music_lead}</p>
          <div className="cs-grid">
            {MUSIC.map((item) => (
              <a
                key={item.url}
                className={`cs-music cs-music-${item.style}`}
                href={item.url}
                target="_blank"
                rel="noopener"
              >
                <div className="cs-wave">
                  <span className="cs-play">▶</span>
                  {BARS.map((h, i) => (
                    <i key={i} style={{ height: `${h}%` }} />
                  ))}
                </div>
                <div className="cs-body">
                  <div className="cs-tag">{item[lang][2]}</div>
                  <h3>{item[lang][0]}</h3>
                  <p>{item[lang][1]}</p>
                  <div className="cs-cta">
                    {t.listen}
                    <i>→</i>
                  </div>
                </div>
              </a>
            ))}
          </div>
          <h3 className="cs-fun-title">{t.fun_title}</h3>
          <div className="cs-fun">
            {FUN.map((item) => (
              <a key={item.url} className="cs-funitem" href={item.url} target="_blank" rel="noopener">
                <div>
                  <b>{item[lang][0]}</b>
                  <span>{item[lang][1]}</span>
                </div>
                <i>→</i>
              </a>
            ))}
          </div>
        </section>

        <section className="cs-contact" id="contact">
          <h2>{t.contact_title}</h2>
          <p>{t.contact_lead}</p>
          <a className="cs-mail" href={`mailto:${EMAIL}`}>
            {EMAIL}
          </a>
          <a className="cs-ext" href={LINKEDIN} target="_blank" rel="noopener">
            LinkedIn ↗
          </a>
          <a className="cs-ext" href={GITHUB} target="_blank" rel="noopener">
            GitHub ↗
          </a>
        </section>
      </main>

      <footer className="cs-footer">
        © {new Date().getFullYear()} César Salgado · {t.footer}
      </footer>
    </div>
  );
}

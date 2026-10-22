import type { Metadata } from "next";
import Site from "@/components/Site";
import { T } from "@/lib/content";

export const metadata: Metadata = {
  title: T.es.meta_title,
  description: T.es.meta_description,
  alternates: { canonical: "/es", languages: { en: "/", es: "/es" } },
  openGraph: { title: T.es.meta_title, description: T.es.meta_description, locale: "es_CO" },
};

export default function HomeEs() {
  return <Site lang="es" />;
}

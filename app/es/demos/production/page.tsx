import type { Metadata } from "next";
import DemoShell from "@/components/demo/DemoShell";
import ProductionDemo from "@/components/demo/ProductionDemo";
import { DEMOS } from "@/lib/demo/pages";

const d = DEMOS.production.es;

export const metadata: Metadata = {
  title: `${d.title} · Demo en vivo | César Salgado`,
  description: d.card,
  alternates: { canonical: "/es/demos/production", languages: { en: "/demos/production", es: "/es/demos/production" } },
};

export default function Page() {
  return (
    <DemoShell lang="es" slug="production" title={d.title} lead={d.lead} how={d.how}>
      <ProductionDemo lang="es" />
    </DemoShell>
  );
}

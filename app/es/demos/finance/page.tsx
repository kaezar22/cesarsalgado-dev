import type { Metadata } from "next";
import DemoShell from "@/components/demo/DemoShell";
import FinanceDemo from "@/components/demo/FinanceDemo";
import { DEMOS } from "@/lib/demo/pages";

const d = DEMOS.finance.es;

export const metadata: Metadata = {
  title: `${d.title} · Demo en vivo | César Salgado`,
  description: d.card,
  alternates: { canonical: "/es/demos/finance", languages: { en: "/demos/finance", es: "/es/demos/finance" } },
};

export default function Page() {
  return (
    <DemoShell lang="es" slug="finance" title={d.title} lead={d.lead} how={d.how}>
      <FinanceDemo lang="es" />
    </DemoShell>
  );
}

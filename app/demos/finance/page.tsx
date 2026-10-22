import type { Metadata } from "next";
import DemoShell from "@/components/demo/DemoShell";
import FinanceDemo from "@/components/demo/FinanceDemo";
import { DEMOS } from "@/lib/demo/pages";

const d = DEMOS.finance.en;

export const metadata: Metadata = {
  title: `${d.title} · Live demo | César Salgado`,
  description: d.card,
  alternates: { canonical: "/demos/finance", languages: { en: "/demos/finance", es: "/es/demos/finance" } },
};

export default function Page() {
  return (
    <DemoShell lang="en" slug="finance" title={d.title} lead={d.lead} how={d.how}>
      <FinanceDemo lang="en" />
    </DemoShell>
  );
}

import type { Metadata } from "next";
import DemoShell from "@/components/demo/DemoShell";
import InvoiceReaderDemo from "@/components/demo/InvoiceReaderDemo";
import { DEMOS } from "@/lib/demo/pages";

const d = DEMOS.invoices.es;

export const metadata: Metadata = {
  title: `${d.title} · Demo en vivo | César Salgado`,
  description: d.card,
  alternates: { canonical: "/es/demos/invoices", languages: { en: "/demos/invoices", es: "/es/demos/invoices" } },
};

export default function Page() {
  return (
    <DemoShell lang="es" slug="invoices" title={d.title} lead={d.lead} how={d.how}>
      <InvoiceReaderDemo lang="es" />
    </DemoShell>
  );
}

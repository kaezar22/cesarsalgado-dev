import type { Metadata } from "next";
import DemoShell from "@/components/demo/DemoShell";
import InvoiceReaderDemo from "@/components/demo/InvoiceReaderDemo";
import { DEMOS } from "@/lib/demo/pages";

const d = DEMOS.invoices.en;

export const metadata: Metadata = {
  title: `${d.title} · Live demo | César Salgado`,
  description: d.card,
  alternates: { canonical: "/demos/invoices", languages: { en: "/demos/invoices", es: "/es/demos/invoices" } },
};

export default function Page() {
  return (
    <DemoShell lang="en" slug="invoices" title={d.title} lead={d.lead} how={d.how}>
      <InvoiceReaderDemo lang="en" />
    </DemoShell>
  );
}

import type { Metadata } from "next";
import DemoShell from "@/components/demo/DemoShell";
import OrdersDemo from "@/components/demo/OrdersDemo";
import { DEMOS } from "@/lib/demo/pages";

const d = DEMOS.orders.en;

export const metadata: Metadata = {
  title: `${d.title} · Live demo | César Salgado`,
  description: d.card,
  alternates: { canonical: "/demos/orders", languages: { en: "/demos/orders", es: "/es/demos/orders" } },
};

export default function Page() {
  return (
    <DemoShell lang="en" slug="orders" title={d.title} lead={d.lead} how={d.how}>
      <OrdersDemo lang="en" />
    </DemoShell>
  );
}

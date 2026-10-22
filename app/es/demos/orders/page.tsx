import type { Metadata } from "next";
import DemoShell from "@/components/demo/DemoShell";
import OrdersDemo from "@/components/demo/OrdersDemo";
import { DEMOS } from "@/lib/demo/pages";

const d = DEMOS.orders.es;

export const metadata: Metadata = {
  title: `${d.title} · Demo en vivo | César Salgado`,
  description: d.card,
  alternates: { canonical: "/es/demos/orders", languages: { en: "/demos/orders", es: "/es/demos/orders" } },
};

export default function Page() {
  return (
    <DemoShell lang="es" slug="orders" title={d.title} lead={d.lead} how={d.how}>
      <OrdersDemo lang="es" />
    </DemoShell>
  );
}

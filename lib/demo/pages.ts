import type { Lang } from "@/lib/content";

/** Texts for the demo pages and for the "Live demos" cards on the home page. */
export const DEMOS = {
  orders: {
    slug: "orders",
    en: {
      tag: "RPA · Order to cash",
      title: "From order to invoice",
      card: "A restaurant places an order with its name typed any way it likes. The back office matches it to the right client, applies that client’s price list and produces the invoice PDF.",
      lead:
        "Restaurants order from a simple form and type their name however they want. The system figures out which client and legal entity it is, applies that client’s own price list, flags anything it can’t resolve, and generates the invoice. Try it: place an order, then open the back office.",
      how: {
        title: "How it works in production",
        items: [
          "A version of this runs every day at a food distributor in Bogotá, replacing hours of copying orders into the ERP by hand.",
          "Orders land in Google Sheets; client names, price lists and credit terms come live from the accounting system.",
          "Fuzzy matching resolves trading names to legal entities. Below the confidence threshold the system asks a human instead of guessing.",
          "Invoices are generated as PDFs and saved to Drive, grouped by client and delivery date.",
        ],
      },
    },
    es: {
      tag: "RPA · Del pedido al cobro",
      title: "Del pedido a la factura",
      card: "Un restaurante hace su pedido escribiendo su nombre como quiera. El back office lo cruza con el cliente correcto, aplica su lista de precios y genera la factura en PDF.",
      lead:
        "Los restaurantes piden desde un formulario sencillo y escriben su nombre como quieran. El sistema identifica el cliente y la razón social, aplica la lista de precios de ese cliente, marca lo que no puede resolver y genera la factura. Pruébelo: haga un pedido y luego abra el back office.",
      how: {
        title: "Cómo funciona en producción",
        items: [
          "Una versión de esto funciona a diario en una distribuidora de alimentos en Bogotá y reemplazó horas de pasar pedidos a mano al ERP.",
          "Los pedidos llegan a Google Sheets; los clientes, listas de precios y plazos de crédito salen en vivo del sistema contable.",
          "El cruce difuso resuelve nombres comerciales a razones sociales. Por debajo del umbral de confianza, el sistema pregunta a una persona en vez de adivinar.",
          "Las facturas se generan en PDF y se guardan en Drive, agrupadas por cliente y fecha de entrega.",
        ],
      },
    },
  },
} as const;

export type DemoKey = keyof typeof DEMOS;
export const demoText = (k: DemoKey, lang: Lang) => DEMOS[k][lang];

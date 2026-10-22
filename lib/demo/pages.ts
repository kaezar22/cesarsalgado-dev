import type { Lang } from "@/lib/content";

/** Texts for the demo pages and for the "Live demos" cards on the home page. */
export const DEMOS = {
  orders: {
    slug: "orders",
    art: ["“forno chico”", "→ Forno Vivo Chicó · 91%", "FE-D7001.pdf ✓"],
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
  finance: {
    slug: "finance",
    art: ["NIT 900922426-5 · PIN ••••••", "FE-5231 · overdue 66 days", "Suppliers: 6 overdue ⚠"],
    en: {
      tag: "Finance · Self-service portal",
      title: "Client statements and supplier payables",
      card: "Clients sign in with their NIT and a PIN to see what they owe, invoice by invoice. The finance team sees what the company owes each supplier, what is overdue and what is coming.",
      lead:
        "Two views of the same accounting data. Clients get a self-service portal with their balance as of today, so nobody has to email statements by hand. The finance team gets an internal dashboard of supplier payables. Sign in with one of the demo credentials, then open the internal view.",
      how: {
        title: "How it works in production",
        items: [
          "A version of this runs at a food distributor in Bogotá, reading live from its cloud accounting system (read-only: the app never changes anything).",
          "Balances match the accounting system to the peso: payments, advances and credit notes are already applied, and each invoice keeps its own due date.",
          "Clients get a PIN from the finance team; wrong PINs lock the NIT for a while and the error message never reveals who is a client.",
          "The payables view queries every supplier in parallel and exports everything to Excel with one click.",
        ],
      },
    },
    es: {
      tag: "Finanzas · Portal de autoservicio",
      title: "Estados de cuenta y cuentas por pagar",
      card: "Los clientes entran con su NIT y un PIN y ven lo que deben, factura por factura. El equipo financiero ve lo que la empresa le debe a cada proveedor, qué está vencido y qué viene.",
      lead:
        "Dos vistas de los mismos datos contables. Los clientes tienen un portal de autoservicio con su saldo a hoy, así nadie tiene que enviar estados de cuenta a mano. El equipo financiero tiene un tablero interno de cuentas por pagar. Entre con una de las credenciales de prueba y luego abra la vista interna.",
      how: {
        title: "Cómo funciona en producción",
        items: [
          "Una versión de esto funciona en una distribuidora de alimentos en Bogotá y lee en vivo de su sistema contable en la nube (solo lectura: la app nunca modifica nada).",
          "Los saldos cuadran al peso con la contabilidad: pagos, anticipos y notas crédito ya están aplicados, y cada factura conserva su propio vencimiento.",
          "El equipo financiero le asigna el PIN a cada cliente; los PIN errados bloquean el NIT por un tiempo y el mensaje de error nunca revela quién es cliente.",
          "La vista de cuentas por pagar consulta todos los proveedores en paralelo y exporta todo a Excel con un clic.",
        ],
      },
    },
  },
} as const;

export type DemoKey = keyof typeof DEMOS;
export const demoText = (k: DemoKey, lang: Lang) => DEMOS[k][lang];

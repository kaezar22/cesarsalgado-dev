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
          "Orders land in Google Sheets; client names, price lists and credit terms come live from World Office, the company’s ERP.",
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
          "Los pedidos llegan a Google Sheets; los clientes, listas de precios y plazos de crédito salen en vivo de World Office, el ERP de la empresa.",
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
      tag: "Finance · World Office integration",
      title: "Client statements and supplier payables",
      card: "Clients sign in with their NIT and a PIN to see what they owe, invoice by invoice. The finance team sees what the company owes each supplier, what is overdue and what is coming.",
      lead:
        "Two views of the same accounting data. Clients get a self-service portal with their balance as of today, so nobody has to email statements by hand. The finance team gets an internal dashboard of supplier payables. Sign in with one of the demo credentials, then open the internal view.",
      how: {
        title: "How it works in production",
        items: [
          "A version of this runs at a food distributor in Bogotá, reading live from World Office Cloud through its API (read-only: the app never changes anything in the ERP).",
          "Balances match World Office’s own reports to the peso: payments, advances and credit notes are already applied, and each invoice keeps its own due date.",
          "Clients get a PIN from the finance team; wrong PINs lock the NIT for a while and the error message never reveals who is a client.",
          "The payables view queries every supplier in parallel and exports everything to Excel with one click.",
        ],
      },
    },
    es: {
      tag: "Finanzas · Integración con World Office",
      title: "Estados de cuenta y cuentas por pagar",
      card: "Los clientes entran con su NIT y un PIN y ven lo que deben, factura por factura. El equipo financiero ve lo que la empresa le debe a cada proveedor, qué está vencido y qué viene.",
      lead:
        "Dos vistas de los mismos datos contables. Los clientes tienen un portal de autoservicio con su saldo a hoy, así nadie tiene que enviar estados de cuenta a mano. El equipo financiero tiene un tablero interno de cuentas por pagar. Entre con una de las credenciales de prueba y luego abra la vista interna.",
      how: {
        title: "Cómo funciona en producción",
        items: [
          "Una versión de esto funciona en una distribuidora de alimentos en Bogotá y lee en vivo de World Office Cloud a través de su API (solo lectura: la app nunca modifica nada en el ERP).",
          "Los saldos cuadran al peso con los informes de World Office: pagos, anticipos y notas crédito ya están aplicados, y cada factura conserva su propio vencimiento.",
          "El equipo financiero le asigna el PIN a cada cliente; los PIN errados bloquean el NIT por un tiempo y el mensaje de error nunca revela quién es cliente.",
          "La vista de cuentas por pagar consulta todos los proveedores en paralelo y exporta todo a Excel con un clic.",
        ],
      },
    },
  },
  production: {
    slug: "production",
    art: ["Mozzarella · L-3 · 2 h 40 min", "820 L → 84,1 kg", "9,75 L/kg · std 9,9 ✓"],
    en: {
      tag: "Operations · Mobile app",
      title: "Plant production log",
      card: "Operators log each batch from their phone: milk in, process time with pauses, kilos out. The supervisor sees how many liters each product really takes per kilo versus the standard.",
      lead:
        "The operator’s side runs on a phone at the vat: start the shift, pick a product, register each pour of milk, time the process (pauses don’t count) and weigh the finished product. Every batch feeds the supervisor’s report, where yield is compared with each product’s standard. The demo clock runs ten minutes per second, so a full batch takes a few seconds.",
      how: {
        title: "How it works in production",
        items: [
          "A version of this runs on the operators’ phones at a food processor in Bogotá, logging yield, waste and time per batch.",
          "Every tap is saved the moment it happens: if the phone reloads or loses signal, the shift resumes exactly where it was.",
          "Batches land in Google Sheets with a per-product summary that recalculates every time a shift is closed.",
          "The result is a real yield and productivity database instead of estimates: which products, operators and days drift from the standard.",
        ],
      },
    },
    es: {
      tag: "Operaciones · App móvil",
      title: "Registro de producción en planta",
      card: "Los operarios registran cada lote desde el celular: leche que entra, tiempo de proceso con pausas y kilos que salen. El supervisor ve cuántos litros gasta de verdad cada producto por kilo frente al estándar.",
      lead:
        "El lado del operario funciona en un celular junto a la tina: inicia el turno, elige el producto, registra cada tanda de leche, mide el tiempo de proceso (las pausas no cuentan) y pesa el producto terminado. Cada lote alimenta el informe del supervisor, que compara el rendimiento con el estándar de cada producto. El reloj de la demo corre diez minutos por segundo, así un lote completo toma pocos segundos.",
      how: {
        title: "Cómo funciona en producción",
        items: [
          "Una versión de esto funciona en los celulares de los operarios de una procesadora de alimentos en Bogotá y registra rendimiento, merma y tiempo por lote.",
          "Cada toque se guarda en el momento: si el celular se recarga o pierde la señal, el turno sigue exactamente donde iba.",
          "Los lotes llegan a Google Sheets con un resumen por producto que se recalcula cada vez que se cierra un turno.",
          "El resultado es una base real de rendimiento y productividad en vez de estimaciones: qué productos, operarios y días se salen del estándar.",
        ],
      },
    },
  },
  invoices: {
    slug: "invoices",
    art: ["factura_proveedor.pdf", "→ AI: 14 fields · 4 lines", "⚠ Duplicate · already in payables"],
    en: {
      tag: "AI · Document processing",
      title: "AI invoice reader",
      card: "Drop a supplier invoice in any format. A language model extracts supplier, dates, lines, taxes and totals, and deterministic checks catch what the AI can’t be trusted with: wrong sums, invalid NITs and duplicates.",
      lead:
        "Accounts payable teams retype supplier invoices that all look different. Here a language model reads the PDF and returns structured data, and then plain code checks it: do the lines add up, is the NIT check digit valid, is the supplier in the master data, was this invoice already registered? Try the three samples (two of them hide a problem) or upload your own.",
      how: {
        title: "How it works in production",
        items: [
          "It started as a template parser for a food distributor’s supplier invoices; a language model replaces one template per supplier with a single reader for any layout.",
          "The model only extracts. Every number is re-checked with arithmetic, and suppliers and invoice numbers are matched against the ERP (World Office) before anything is posted.",
          "Invoices that pass every check go straight to accounts payable; the rest land in a review queue with the reason highlighted.",
          "Scanned invoices add an OCR step before the model. Nothing in this demo is stored: the file is read once and discarded.",
        ],
      },
    },
    es: {
      tag: "IA · Procesamiento de documentos",
      title: "Lector de facturas con IA",
      card: "Suba una factura de proveedor en cualquier formato. Un modelo de lenguaje extrae proveedor, fechas, ítems, impuestos y totales, y validaciones automáticas atrapan lo que no se le puede confiar a la IA: sumas erradas, NIT inválidos y duplicados.",
      lead:
        "Los equipos de cuentas por pagar digitan a mano facturas de proveedores que vienen cada una en un formato distinto. Aquí un modelo de lenguaje lee el PDF y devuelve datos estructurados, y luego código simple los verifica: ¿cuadran las líneas?, ¿el dígito de verificación del NIT es válido?, ¿el proveedor existe en los datos maestros?, ¿esta factura ya estaba registrada? Pruebe las tres de ejemplo (dos esconden un problema) o suba la suya.",
      how: {
        title: "Cómo funciona en producción",
        items: [
          "Empezó como un lector por plantillas para las facturas de proveedores de una distribuidora de alimentos; el modelo de lenguaje reemplaza una plantilla por proveedor con un solo lector para cualquier formato.",
          "El modelo solo extrae. Cada número se vuelve a verificar con aritmética, y el proveedor y el número de factura se cruzan con el ERP (World Office) antes de registrar nada.",
          "Las facturas que pasan todas las validaciones van directo a cuentas por pagar; las demás quedan en una cola de revisión con el motivo resaltado.",
          "Para facturas escaneadas se agrega un paso de OCR antes del modelo. En esta demo no se guarda nada: el archivo se lee una vez y se descarta.",
        ],
      },
    },
  },
} as const;

export type DemoKey = keyof typeof DEMOS;
export const demoText = (k: DemoKey, lang: Lang) => DEMOS[k][lang];

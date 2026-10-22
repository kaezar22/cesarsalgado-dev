"""
Generates the fictional data used by the live demos on cesarsalgado.dev.

Company: Lácteos Agua Clara S.A.S. (FICTIONAL), a dairy processor near Bogotá that sells
yogurts, cheeses, butter, cream, milk powder and dairy sweets to restaurants, bakeries,
cafés and hotels, in several sizes, styles and flavors.

Every name, NIT and number here is invented. Dates are stored as day offsets from
"today" so the demos never look out of date; the site turns them into real dates.

Run:  python scripts/generate_demo_data.py   ->  data/demo/lacteos.json
"""

import json
import random
from pathlib import Path

random.seed(2026)

OUT = Path(__file__).resolve().parent.parent / "data" / "demo" / "lacteos.json"


def nit(base: int) -> str:
    """Colombian NIT with its check digit (DIAN algorithm)."""
    weights = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71]
    digits = [int(d) for d in reversed(str(base))]
    s = sum(d * w for d, w in zip(digits, weights))
    r = s % 11
    dv = r if r < 2 else 11 - r
    return f"{base}-{dv}"


def r100(x: float) -> int:
    return int(round(x / 100.0)) * 100


COMPANY = {
    "name": "Lácteos Agua Clara S.A.S.",
    "nit": nit(901558204),
    "city": "Ubaté, Cundinamarca",
    "address": "Km 4 Vía Ubaté – Zipaquirá, Planta 2",
    "phone": "+57 601 555 0142",
    "email": "pedidos@lacteos-aguaclara.example",
    "fictional": True,
}

# code, English, Spanish, unit, category, base price (COP)
PRODUCTS = [
    # Yogurts and fermented
    ("YOG-GRI-NAT-150", "Greek yogurt, plain 150 g", "Yogurt griego natural 150 g", "unit", "yogurt", 3900),
    ("YOG-GRI-FRE-150", "Greek yogurt, strawberry 150 g", "Yogurt griego fresa 150 g", "unit", "yogurt", 4200),
    ("YOG-GRI-NAT-1K", "Greek yogurt, plain 1 kg (food service)", "Yogurt griego natural 1 kg (institucional)", "unit", "yogurt", 21500),
    ("YOG-BEB-FRE-1L", "Drinking yogurt, strawberry 1 L", "Yogurt bebible fresa 1 L", "unit", "yogurt", 8900),
    ("YOG-BEB-MOR-1L", "Drinking yogurt, blackberry 1 L", "Yogurt bebible mora 1 L", "unit", "yogurt", 8900),
    ("YOG-BEB-MEL-1L", "Drinking yogurt, peach 1 L", "Yogurt bebible melocotón 1 L", "unit", "yogurt", 8900),
    ("YOG-BEB-FRE-200", "Drinking yogurt, strawberry 200 ml", "Yogurt bebible fresa 200 ml", "unit", "yogurt", 2300),
    ("YOG-NAT-SA-1K", "Natural yogurt, no added sugar 1 kg", "Yogurt natural sin azúcar 1 kg", "unit", "yogurt", 12800),
    ("KUM-1L", "Kumis 1 L", "Kumis 1 L", "unit", "yogurt", 7600),
    # Cheeses
    ("QSO-CAM-500", "Farmer's cheese 500 g", "Queso campesino 500 g", "unit", "cheese", 11900),
    ("QSO-DCR-2K5", "Double-cream cheese, block 2.5 kg", "Queso doble crema bloque 2.5 kg", "unit", "cheese", 54900),
    ("QSO-MOZ-TAJ-1K", "Mozzarella, sliced 1 kg", "Mozzarella tajada 1 kg", "unit", "cheese", 29800),
    ("QSO-MOZ-BLQ-2K5", "Mozzarella, block 2.5 kg", "Mozzarella bloque 2.5 kg", "unit", "cheese", 68500),
    ("QSO-COS-500", "Costeño cheese 500 g", "Queso costeño 500 g", "unit", "cheese", 12600),
    ("QSO-PAR-RAL-1K", "Parmesan-style, grated 1 kg", "Queso tipo parmesano rallado 1 kg", "unit", "cheese", 46900),
    ("QSO-CRE-1K", "Cream cheese 1 kg", "Queso crema 1 kg", "unit", "cheese", 23400),
    ("CUA-500", "Cuajada (fresh curd) 500 g", "Cuajada 500 g", "unit", "cheese", 8700),
    # Butter and cream
    ("MAN-SAL-250", "Butter, salted 250 g", "Mantequilla con sal 250 g", "unit", "butter", 8400),
    ("MAN-SIN-2K5", "Butter, unsalted 2.5 kg (bakery)", "Mantequilla sin sal 2.5 kg (pastelería)", "unit", "butter", 71500),
    ("CRE-LEC-1L", "Heavy cream 1 L", "Crema de leche 1 L", "unit", "butter", 16900),
    ("CRE-AGR-500", "Sour cream 500 g", "Crema agria 500 g", "unit", "butter", 9800),
    # Milk and powder
    ("LEC-ENT-1L", "Whole milk 1 L", "Leche entera 1 L", "unit", "milk", 4300),
    ("LEC-DES-1L", "Lactose-free milk 1 L", "Leche deslactosada 1 L", "unit", "milk", 4900),
    ("LPO-ENT-400", "Whole milk powder 400 g", "Leche en polvo entera 400 g", "unit", "milk", 15800),
    ("LPO-DES-400", "Lactose-free milk powder 400 g", "Leche en polvo deslactosada 400 g", "unit", "milk", 17400),
    ("LPO-ENT-25K", "Whole milk powder, 25 kg bag", "Leche en polvo entera bulto 25 kg", "unit", "milk", 742000),
    # Dairy sweets
    ("CON-LAT-395", "Condensed milk, can 395 g", "Leche condensada lata 395 g", "unit", "sweets", 7900),
    ("CON-DOY-1K", "Condensed milk, pouch 1 kg", "Leche condensada doypack 1 kg", "unit", "sweets", 17900),
    ("ARE-500", "Arequipe (dulce de leche) 500 g", "Arequipe 500 g", "unit", "sweets", 10200),
    ("ARE-5K", "Arequipe (dulce de leche) 5 kg pail", "Arequipe balde 5 kg", "unit", "sweets", 82500),
]

# Plant production families: code, English, Spanish, input ("milk" or "cream"),
# standard liters of input per kg of product, typical batch liters, typical process minutes.
PRODUCTION = [
    ("P-CAM", "Farmer's cheese", "Queso campesino", "milk", 8.5, (400, 900), (80, 130)),
    ("P-DCR", "Double-cream cheese", "Queso doble crema", "milk", 9.6, (500, 1000), (150, 220)),
    ("P-MOZ", "Mozzarella", "Mozzarella", "milk", 9.9, (600, 1200), (140, 200)),
    ("P-CUA", "Cuajada (fresh curd)", "Cuajada", "milk", 6.4, (200, 500), (50, 80)),
    ("P-GRI", "Greek yogurt", "Yogurt griego", "milk", 3.7, (300, 700), (420, 600)),
    ("P-ARE", "Arequipe (dulce de leche)", "Arequipe", "milk", 2.6, (200, 500), (180, 260)),
    ("P-MAN", "Butter", "Mantequilla", "cream", 2.1, (150, 400), (60, 100)),
]
OPERATORS = ["Ana Rojas", "Luis Pardo", "Marta Gil"]

# Price lists: A = large accounts, B = standard, C = small/occasional.
LIST_FACTOR = {"A": 0.92, "B": 1.0, "C": 1.08}
NOT_IN_LIST = {"C": {"LPO-ENT-25K", "QSO-PAR-RAL-1K", "MAN-SIN-2K5"}}  # some lists don't carry every product

# Legal entity -> points whose trading names often look nothing like the legal name.
CLIENTS = [
    ("INVERSIONES MIRADOR DEL NORTE S.A.S.", "A", 30, "Bogotá", ["Café Mirador Chapinero", "Café Mirador Usaquén", "Mirador Bakery Cedritos"]),
    ("GRUPO GASTRONÓMICO ALTAMAR S.A.S.", "A", 45, "Bogotá", ["Altamar Cevichería", "La Terraza 93", "Brunch Club Parque 93"]),
    ("HOTELERA SABANA REAL S.A.", "A", 60, "Chía", ["Hotel Sabana Real", "Sabana Real Spa & Bistró"]),
    ("TRES CUCHARAS RESTAURANTES S.A.S.", "B", 30, "Bogotá", ["Tres Cucharas Galerías", "Tres Cucharas Andino"]),
    ("BOWLS & CO COLOMBIA S.A.S.", "B", 30, "Bogotá", ["Açaí Lab", "Green Bowl Zona G"]),
    ("PIZZERÍAS FORNO VIVO S.A.S.", "A", 30, "Bogotá", ["Forno Vivo Chicó", "Forno Vivo Cedritos", "Forno Vivo Chía"]),
    ("PANADERÍA LA ESPIGA DORADA LTDA.", "B", 15, "Cajicá", ["La Espiga Dorada"]),
    ("CLUB CAMPESTRE LOS ARRAYANES", "B", 45, "Sopó", ["Club Los Arrayanes"]),
    ("POSTRES DE LA 85 S.A.S.", "C", 8, "Bogotá", ["Postres de la 85"]),
    ("HELADERÍA POLAR ARTESANAL S.A.S.", "B", 30, "Bogotá", ["Polar Gelato Usaquén", "Polar Gelato Andino"]),
    ("COCINA DE MAMÁ INÉS S.A.S.", "C", 15, "Zipaquirá", ["Donde Mamá Inés"]),
    ("ROOFTOP SEIS S.A.S.", "B", 30, "Bogotá", ["Seis Rooftop Bar"]),
    ("CATERING EVENTOS NOGAL S.A.S.", "A", 45, "Bogotá", ["Nogal Catering"]),
]

SUPPLIERS = [
    ("HATO LECHERO SAN ISIDRO S.A.S.", "Raw milk", "Leche cruda", 15),
    ("ASOCIACIÓN DE GANADEROS DEL VALLE DE UBATÉ", "Raw milk", "Leche cruda", 15),
    ("COOPERATIVA LECHERA SUTATAUSA", "Raw milk", "Leche cruda", 15),
    ("CULTIVOS Y FERMENTOS ANDINOS S.A.S.", "Cultures and rennet", "Cultivos lácticos y cuajo", 30),
    ("ENVASES PLÁSTICOS DE LA SABANA S.A.S.", "Packaging: cups, bottles, pails", "Empaques: vasos, botellas, baldes", 45),
    ("FRUTAS PARA INDUSTRIA S.A.S.", "Fruit preparations for yogurt", "Preparaciones de fruta para yogurt", 30),
    ("TRANSFRÍO LOGÍSTICA S.A.S.", "Refrigerated transport", "Transporte refrigerado", 30),
    ("ENERGÍA Y FRÍO INDUSTRIAL S.A.S.", "Cold-room maintenance", "Mantenimiento de cuartos fríos", 30),
    ("ETIQUETAS RÁPIDAS LTDA.", "Labels and printing", "Etiquetas e impresión", 30),
    ("QUÍMICOS LIMPIOS DE COLOMBIA S.A.S.", "Sanitation supplies", "Insumos de limpieza y desinfección", 30),
]


def price_lists():
    lists = {}
    for lst, factor in LIST_FACTOR.items():
        lists[lst] = {
            code: r100(base * factor)
            for code, _en, _es, _u, _c, base in PRODUCTS
            if code not in NOT_IN_LIST.get(lst, set())
        }
    return lists


def typo(name: str) -> str:
    """How people really type a restaurant name into a form."""
    variants = [
        name.lower(),
        name.lower().replace("é", "e").replace("á", "a").replace("í", "i").replace("ó", "o"),
        name.split(" ")[0] + " " + name.split(" ")[-1] if " " in name else name,
        name.replace("Café ", "cafe ").replace("Hotel ", "hotel "),
        name[:-1] if len(name) > 6 else name,
    ]
    return random.choice(variants).strip()


def main():
    lists = price_lists()
    clients = []
    for i, (legal, lst, term, city, points) in enumerate(CLIENTS):
        clients.append(
            {
                "id": f"C{i + 1:02d}",
                "nit": nit(900100000 + random.randint(1000, 899999)),
                "legalName": legal,
                "priceList": lst,
                "termDays": term,
                "city": city,
                "points": points,
            }
        )

    suppliers = [
        {"id": f"P{i + 1:02d}", "nit": nit(900200000 + random.randint(1000, 799999)), "name": n, "conceptEn": en, "conceptEs": es, "termDays": t}
        for i, (n, en, es, t) in enumerate(SUPPLIERS)
    ]

    codes = [p[0] for p in PRODUCTS]

    def random_lines(lst: str):
        available = [c for c in codes if c in lists[lst]]
        picks = random.sample(available, random.randint(2, 5))
        out = []
        for c in picks:
            unit = next(p[3] for p in PRODUCTS if p[0] == c)
            qty = 1 if c == "LPO-ENT-25K" else random.choice([2, 3, 4, 5, 6, 8, 10, 12, 24]) if unit == "unit" else random.choice([1.5, 2, 2.5, 3, 4, 5, 6])
            out.append({"code": c, "qty": qty})
        return out

    # Orders waiting to be invoiced (as typed by the restaurants), placed in the last 3 days.
    pending = []
    for n in range(7):
        cl = random.choice(clients)
        point = random.choice(cl["points"])
        typed = typo(point)
        pending.append(
            {
                "id": f"PW-{1040 + n}",
                "placedOffset": -random.randint(0, 3),
                "deliveryOffset": random.randint(1, 3),
                "typedName": typed,
                "lines": random_lines(cl["priceList"]),
            }
        )
    # A small client ordering something its price list (C) doesn't carry: the price must stay "not found".
    pending.append(
        {
            "id": "PW-1048",
            "placedOffset": 0,
            "deliveryOffset": 1,
            "typedName": "postres la 85",
            "lines": [{"code": "ARE-500", "qty": 10}, {"code": "MAN-SIN-2K5", "qty": 2}, {"code": "CON-LAT-395", "qty": 24}],
        }
    )
    # One order from someone who is not a client: the app must say "not found", never guess.
    pending.append(
        {
            "id": "PW-1047",
            "placedOffset": -1,
            "deliveryOffset": 2,
            "typedName": "restaurante la ceiba",
            "lines": [{"code": "QSO-MOZ-TAJ-1K", "qty": 6}, {"code": "CRE-LEC-1L", "qty": 4}],
        }
    )

    # Accounts receivable: invoices from the last ~100 days, some paid in part, some overdue.
    receivables = []
    inv_no = 5120
    for cl in clients:
        for _ in range(random.randint(3, 7)):
            issue = -random.randint(2, 100)
            due = issue + cl["termDays"]
            lines = random_lines(cl["priceList"])
            total = sum(lists[cl["priceList"]][l["code"]] * l["qty"] for l in lines)
            total = r100(total)
            # Older invoices are more likely to be paid.
            if due < -20 and random.random() < 0.75:
                continue  # fully paid -> not open anymore
            paid_part = 0
            if random.random() < 0.2:
                paid_part = r100(total * random.choice([0.3, 0.5]))
            inv_no += random.randint(1, 4)
            receivables.append(
                {
                    "clientId": cl["id"],
                    "invoice": f"FE-{inv_no}",
                    "point": random.choice(cl["points"]),
                    "issueOffset": issue,
                    "dueOffset": due,
                    "original": total,
                    "balance": total - paid_part,
                    "lines": lines,
                }
            )
    # Two clients with a credit balance (advance payment) and one fully up to date.
    receivables.append({"clientId": "C06", "invoice": "RC-2210", "point": None, "issueOffset": -5, "dueOffset": -5, "original": -150000, "balance": -150000, "lines": [], "advance": True})

    # Accounts payable. Raw-milk suppliers bill every 15 days (big amounts, short terms);
    # the rest bill now and then.
    payables = []
    for sp in suppliers:
        is_milk = sp["conceptEn"] == "Raw milk"
        issues = [-d for d in range(1, 61, 15)] if is_milk else [-random.randint(1, 70) for _ in range(random.randint(1, 4))]
        for issue in issues:
            due = issue + sp["termDays"]
            if due < -10 and random.random() < 0.6:
                continue
            base = random.uniform(9_000_000, 24_000_000) if is_milk else random.choice([380000, 620000, 950000, 1450000, 2100000, 3200000]) * random.uniform(0.85, 1.15)
            amount = r100(base)
            payables.append(
                {
                    "supplierId": sp["id"],
                    "invoice": f"{''.join(w[0] for w in sp['name'].split()[:3])}-{random.randint(1000, 9999)}",
                    "issueOffset": issue,
                    "dueOffset": due,
                    "original": amount,
                    "balance": amount if random.random() > 0.15 else r100(amount * 0.5),
                }
            )
    # Edge cases the app must handle: an invoice due today (not overdue yet) and an advance payment.
    payables.append({"supplierId": "P05", "invoice": "EPS-4410", "issueOffset": -45, "dueOffset": 0, "original": 2380000, "balance": 2380000})
    payables.append({"supplierId": "P09", "invoice": "ANT-0031", "issueOffset": -12, "dueOffset": -12, "original": -300000, "balance": -300000, "advance": True})
    receivables.append({"clientId": "C02", "invoice": "FE-5300", "point": "La Terraza 93", "issueOffset": -45, "dueOffset": 0, "original": 486000, "balance": 486000, "lines": [{"code": "QSO-MOZ-BLQ-2K5", "qty": 4}, {"code": "CRE-LEC-1L", "qty": 12}]})

    # One client that is fully up to date, so the portal shows that case too.
    receivables = [r for r in receivables if r["clientId"] != "C07"]
    # Same on the supplier side: one supplier fully paid.
    payables = [p for p in payables if p["supplierId"] != "P08"]

    # Plant history: finished batches over the last 30 days (yield varies around the standard).
    production = []
    for day in range(30, 0, -1):
        for _ in range(random.randint(2, 4)):
            code, _en, _es, _inp, std, (lo, hi), (mlo, mhi) = random.choice(PRODUCTION)
            liters = round(random.uniform(lo, hi) / 10) * 10
            ratio = std * random.uniform(0.94, 1.09)  # some batches use more milk than they should
            production.append(
                {
                    "dayOffset": -day,
                    "product": code,
                    "operator": random.choice(OPERATORS),
                    "inputL": liters,
                    "outputKg": round(liters / ratio, 1),
                    "minutes": random.randint(mlo, mhi),
                }
            )

    data = {
        "note": "FICTIONAL demo data generated by scripts/generate_demo_data.py. Any resemblance to real companies is coincidental.",
        "company": COMPANY,
        "products": [{"code": c, "en": en, "es": es, "unit": u, "category": cat} for c, en, es, u, cat, _ in PRODUCTS],
        "priceLists": lists,
        "clients": clients,
        "suppliers": suppliers,
        "pendingOrders": pending,
        "receivables": receivables,
        "payables": payables,
        "productionProducts": [
            {"code": c, "en": en, "es": es, "input": inp, "stdLPerKg": std} for c, en, es, inp, std, _l, _m in PRODUCTION
        ],
        "operators": OPERATORS,
        "production": production,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"{OUT}: {len(clients)} clients, {len(PRODUCTS)} products, {len(pending)} pending orders, "
          f"{len(receivables)} open receivables, {len(payables)} open payables")


if __name__ == "__main__":
    main()

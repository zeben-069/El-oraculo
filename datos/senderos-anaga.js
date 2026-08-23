// Naira — Senderos oficiales de Anaga (término municipal de Santa Cruz de Tenerife)
// Fuente: senderos_anaga.csv (Ayuntamiento de Santa Cruz) — 148 tramos agrupados en 7 caminos.
// `metros` = campo LONGITUD (longitud oficial del camino completo).
// OJO: el CSV no trae la geometría de la línea, solo inicio/fin/centroide de cada tramo.
//      Para dibujar el trazado real hace falta itinerarios.geojson.

const SENDEROS_ANAGA = [
  {
    slug: "la-laguna-taganana",
    nombre: "Camino de La Laguna a Taganana",
    metros: 9076,
    tramos: 25,
    firme: ["tierra", "asfalto"],
    principal: true, // único con JERARQUÍA 0 en el CSV
    pdf: "https://www.santacruzdetenerife.es/fileadmin/Senderos/1_LA_LAGUNA_A_TAGANANA.pdf",
    // Pasa por el Mirador Pico del Inglés y baja por Las Vueltas de Taganana.
    ref: { lat: 28.5325, lng: -16.2621 },
  },
  {
    slug: "cumbre-punta-de-anaga",
    nombre: "Camino de la Cumbre a la Punta de Anaga",
    metros: 14963,
    tramos: 44,
    firme: ["tierra", "asfalto", "hormigon"],
    principal: false,
    pdf: "https://www.santacruzdetenerife.es/fileadmin/Senderos/2_CUMBRE_A_LA_PUNTA_DE_ANAGA.pdf",
    // El más largo: recorre la cresta desde El Bailadero hasta Chamorga.
    ref: { lat: 28.5588, lng: -16.1722 },
  },
  {
    slug: "san-andres-taganana-abicore",
    nombre: "Camino de San Andrés a Taganana por Abicore",
    metros: 9000,
    tramos: 22,
    firme: ["tierra", "asfalto", "peatonal"],
    principal: false,
    pdf: "https://www.santacruzdetenerife.es/fileadmin/Senderos/3_ABICORE.pdf",
    // Arranca junto al Castillo de San Andrés (hito 45 del itinerario histórico).
    ref: { lat: 28.5049, lng: -16.1906 },
  },
  {
    slug: "taganana-faro-de-anaga",
    nombre: "Camino de Taganana al Faro de Anaga",
    metros: 11185,
    tramos: 32,
    firme: ["tierra", "asfalto", "peatonal"],
    principal: false,
    pdf: "https://www.santacruzdetenerife.es/fileadmin/Senderos/7_FARO_DE_ANAGA_A_TAGANANA.pdf",
    // Pasa por Almáciga, Benijo y Fabián: el tramo de playas del norte.
    ref: { lat: 28.5721, lng: -16.1955 },
  },
  {
    slug: "igueste-punta-de-anaga",
    nombre: "Igueste de San Andrés a la Punta de Anaga",
    metros: 6238,
    tramos: 17,
    firme: ["tierra", "asfalto", "peatonal", "hormigon"],
    principal: false,
    pdf: "https://www.santacruzdetenerife.es/fileadmin/Senderos/4_IGUESTE_DE_SAN_ANDRES_A_PUNTA_DE_ANAGA.pdf",
    // Sale del aparcamiento de Igueste y sube por Las Casillas.
    ref: { lat: 28.5273, lng: -16.1544 },
  },
  {
    slug: "chamorga-roque-bermejo",
    nombre: "Chamorga a Roque Bermejo",
    metros: 3051,
    tramos: 3,
    firme: ["tierra", "peatonal", "asfalto"],
    principal: false,
    pdf: "https://www.santacruzdetenerife.es/fileadmin/Senderos/5_CHAMORGA_A_ROQUE_BERMEJO.pdf",
    ref: { lat: 28.5689, lng: -16.1592 },
  },
  {
    slug: "faro-de-anaga-roque-bermejo",
    nombre: "Faro de Anaga a Roque Bermejo",
    metros: 1574,
    tramos: 2,
    firme: ["tierra"],
    principal: false,
    pdf: "https://www.santacruzdetenerife.es/fileadmin/Senderos/6_ROQUE_BERMEJO_A_FARO_DE_ANAGA.pdf",
    // El más corto y el único 100% de tierra. Enlaza con Chamorga-Roque Bermejo.
    ref: { lat: 28.5788, lng: -16.1353 },
  },
];

const FIRMES = [
  { id: "tierra",   label: "Tierra" },
  { id: "asfalto",  label: "Asfalto" },
  { id: "peatonal", label: "Peatonal" },
  { id: "hormigon", label: "Hormigón" },
];

// ~55 km de senderos oficiales en total.
const METROS_TOTALES = SENDEROS_ANAGA.reduce((s, x) => s + x.metros, 0);

const imagenDeSendero = (slug) => `img/senderos/${slug}.jpg`;

// Estimación de tiempo a pie (Naismith simplificado, sin desnivel: no viene en el CSV).
// Ritmo cómodo de paseante: 3,5 km/h. Añade margen: Anaga tiene mucha pendiente.
const horasAprox = (metros) => +(metros / 3500).toFixed(1);

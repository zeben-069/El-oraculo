// Naira — Itinerario Histórico de Santa Cruz de Tenerife
// Fuente: hitos_ruta_historica.csv (Ayuntamiento de Santa Cruz de Tenerife)
// 46 hitos. Coordenadas WGS84 (las UTM del CSV se descartan, no hacen falta).
// Imagen opcional: `img/hitos/${slug}.jpg` — si no existe, la tarjeta va sin foto.

const HITOS_HISTORICOS = [
  // --- Tramo 1: casco fundacional (Barranco de Santos) ---
  { n: 1,  nombre: "La Fundación",                                slug: "la-fundacion",                       lat: 28.4647470, lng: -16.2480017, tramo: "casco-fundacional" },
  { n: 2,  nombre: "Plaza de la Iglesia",                         slug: "plaza-de-la-iglesia",                lat: 28.4647158, lng: -16.2485238, tramo: "casco-fundacional" },
  { n: 3,  nombre: "Parroquia de la Concepción",                  slug: "parroquia-de-la-concepcion",         lat: 28.4644399, lng: -16.2489863, tramo: "casco-fundacional" },
  { n: 4,  nombre: "Calle de las Norias",                         slug: "calle-de-las-norias",                lat: 28.4649342, lng: -16.2505982, tramo: "casco-fundacional" },
  { n: 5,  nombre: "Puente de El Cabo",                           slug: "puente-de-el-cabo",                  lat: 28.4640929, lng: -16.2494240, tramo: "casco-fundacional" },
  { n: 6,  nombre: "Antiguo Hospital Civil (Centro de Museos)",   slug: "antiguo-hospital-civil",             lat: 28.4636390, lng: -16.2495560, tramo: "casco-fundacional" },
  { n: 7,  nombre: "Fuente de Morales",                           slug: "fuente-de-morales",                  lat: 28.4637185, lng: -16.2489330, tramo: "casco-fundacional" },
  { n: 8,  nombre: "Ermita de San Telmo",                         slug: "ermita-de-san-telmo",                lat: 28.4625884, lng: -16.2488182, tramo: "casco-fundacional" },
  { n: 9,  nombre: "Hospicio y Cuartel de San Carlos",            slug: "hospicio-y-cuartel-de-san-carlos",   lat: 28.4617015, lng: -16.2492914, tramo: "casco-fundacional" },

  // --- Tramo 2: defensas del sur ---
  { n: 10, nombre: "Ermita de Regla",                             slug: "ermita-de-regla",                    lat: 28.4570052, lng: -16.2522005, tramo: "defensas-del-sur" },
  { n: 11, nombre: "Batería de San Francisco",                    slug: "bateria-de-san-francisco",           lat: 28.4577795, lng: -16.2504842, tramo: "defensas-del-sur" },
  { n: 12, nombre: "Castillo de San Juan Bautista",               slug: "castillo-de-san-juan-bautista",      lat: 28.4554289, lng: -16.2523802, tramo: "defensas-del-sur" },
  { n: 13, nombre: "Casa de la Pólvora",                          slug: "casa-de-la-polvora",                 lat: 28.4553266, lng: -16.2537638, tramo: "defensas-del-sur" },
  { n: 14, nombre: "Cementerio de San Rafael y San Roque",        slug: "cementerio-san-rafael-san-roque",    lat: 28.4622569, lng: -16.2541766, tramo: "defensas-del-sur" },
  { n: 15, nombre: "Ermita de San Sebastián",                     slug: "ermita-de-san-sebastian",            lat: 28.4641826, lng: -16.2551114, tramo: "defensas-del-sur" },

  // --- Tramo 3: centro y ensanche ---
  { n: 16, nombre: "La Recova",                                   slug: "la-recova",                          lat: 28.4655330, lng: -16.2507665, tramo: "centro-y-ensanche" },
  { n: 17, nombre: "Teatro Guimerá",                              slug: "teatro-guimera",                     lat: 28.4659347, lng: -16.2505854, tramo: "centro-y-ensanche" },
  { n: 18, nombre: "Plaza y Fuente de Santo Domingo",             slug: "plaza-y-fuente-de-santo-domingo",    lat: 28.4662879, lng: -16.2511233, tramo: "centro-y-ensanche" },
  { n: 19, nombre: "Plaza General Weyler",                        slug: "plaza-general-weyler",               lat: 28.4676964, lng: -16.2557103, tramo: "centro-y-ensanche" },
  { n: 20, nombre: "Palacio de la Capitanía General (Maestranza)",slug: "palacio-de-la-capitania-general",    lat: 28.4677540, lng: -16.2562582, tramo: "centro-y-ensanche" },
  { n: 21, nombre: "Institución Imeldo Serís",                    slug: "institucion-imeldo-seris",           lat: 28.4696178, lng: -16.2561282, tramo: "centro-y-ensanche" },
  { n: 22, nombre: "Plaza de Toros",                              slug: "plaza-de-toros",                     lat: 28.4699708, lng: -16.2599260, tramo: "centro-y-ensanche" },
  { n: 23, nombre: "La Estatua",                                  slug: "la-estatua",                         lat: 28.4716496, lng: -16.2572096, tramo: "centro-y-ensanche" },
  { n: 24, nombre: "Los Lavaderos",                               slug: "los-lavaderos",                      lat: 28.4752019, lng: -16.2523364, tramo: "centro-y-ensanche" },
  { n: 25, nombre: "Parque Municipal García Sanabria",            slug: "parque-garcia-sanabria",             lat: 28.4720224, lng: -16.2536873, tramo: "centro-y-ensanche" },
  { n: 26, nombre: "Plaza de los Patos",                          slug: "plaza-de-los-patos",                 lat: 28.4705402, lng: -16.2558014, tramo: "centro-y-ensanche" },
  { n: 27, nombre: "Ayuntamiento",                                slug: "ayuntamiento",                       lat: 28.4698103, lng: -16.2546780, tramo: "centro-y-ensanche" },
  { n: 28, nombre: "Institución de Enseñanza",                    slug: "institucion-de-ensenanza",           lat: 28.4696638, lng: -16.2530919, tramo: "centro-y-ensanche" },
  { n: 29, nombre: "Logia Masónica",                              slug: "logia-masonica",                     lat: 28.4688587, lng: -16.2526737, tramo: "centro-y-ensanche" },
  { n: 30, nombre: "Iglesia del Pilar",                           slug: "iglesia-del-pilar",                  lat: 28.4692080, lng: -16.2520191, tramo: "centro-y-ensanche" },
  { n: 31, nombre: "Parlamento de Canarias",                      slug: "parlamento-de-canarias",             lat: 28.4676058, lng: -16.2519394, tramo: "centro-y-ensanche" },

  // --- Tramo 4: marina y Plaza de España ---
  { n: 32, nombre: "Plaza del Príncipe de Asturias",              slug: "plaza-del-principe",                 lat: 28.4683215, lng: -16.2503906, tramo: "marina" },
  { n: 33, nombre: "Museo de Bellas Artes y Biblioteca Municipal",slug: "museo-de-bellas-artes",              lat: 28.4684714, lng: -16.2496661, tramo: "marina" },
  { n: 34, nombre: "Iglesia de San Francisco de Asís",            slug: "iglesia-de-san-francisco",           lat: 28.4679495, lng: -16.2492884, tramo: "marina" },
  { n: 35, nombre: "Capilla de la Venerable Orden Tercera",       slug: "capilla-venerable-orden-tercera",    lat: 28.4678459, lng: -16.2491993, tramo: "marina" },
  { n: 36, nombre: "Plaza de la Candelaria",                      slug: "plaza-de-la-candelaria",             lat: 28.4669091, lng: -16.2488133, tramo: "marina" },
  { n: 37, nombre: "Calle General Gutiérrez",                     slug: "calle-general-gutierrez",            lat: 28.4661625, lng: -16.2478824, tramo: "marina" },
  { n: 38, nombre: "Plaza de España",                             slug: "plaza-de-espana",                    lat: 28.4667502, lng: -16.2472711, tramo: "marina" },
  { n: 39, nombre: "El Muelle Antiguo y el 25 de Julio",          slug: "muelle-antiguo",                     lat: 28.4678728, lng: -16.2456122, tramo: "marina" },
  { n: 40, nombre: "La Farola y La Marquesina",                   slug: "la-farola-y-la-marquesina",          lat: 28.4693545, lng: -16.2458120, tramo: "marina" },
  { n: 41, nombre: "Alameda de Branciforte (o de la Marina)",     slug: "alameda-de-branciforte",             lat: 28.4675202, lng: -16.2476078, tramo: "marina" },
  { n: 42, nombre: "Fuente de Isabel II",                         slug: "fuente-de-isabel-ii",                lat: 28.4697003, lng: -16.2481435, tramo: "marina" },

  // --- Tramo 5: norte y Anaga (fuera del casco, no es paseable) ---
  { n: 43, nombre: "Fuerte de Almeida y Museo Militar",           slug: "fuerte-de-almeida",                  lat: 28.4753780, lng: -16.2477914, tramo: "norte-y-anaga" },
  { n: 44, nombre: "Castillo del Santo Cristo de Paso Alto",      slug: "castillo-de-paso-alto",              lat: 28.4807593, lng: -16.2409149, tramo: "norte-y-anaga" },
  { n: 45, nombre: "San Andrés y su Torre",                       slug: "san-andres-y-su-torre",              lat: 28.5048457, lng: -16.1908755, tramo: "norte-y-anaga" },
  { n: 46, nombre: "Taganana y su Iglesia",                       slug: "taganana-y-su-iglesia",              lat: 28.5605169, lng: -16.2170703, tramo: "norte-y-anaga" },
];

const TRAMOS = [
  { id: "todos",              label: "Ruta completa" },
  { id: "casco-fundacional",  label: "Casco fundacional" },
  { id: "defensas-del-sur",   label: "Defensas del sur" },
  { id: "centro-y-ensanche",  label: "Centro y ensanche" },
  { id: "marina",             label: "Marina y Plaza de España" },
  { id: "norte-y-anaga",      label: "Norte y Anaga" },
];

// Todos los hitos pertenecen al término municipal de Santa Cruz de Tenerife.
const MUNICIPIO_HITOS = "santa-cruz-de-tenerife";

// Ficha oficial en PDF del Ayuntamiento (1 por hito, mismo número que `n`).
const fichaDe = (n) =>
  `https://www.santacruzdetenerife.es/fileadmin/itinerariohistorico/ITI_HCO_${n}.pdf`;

const imagenDeHito = (slug) => `img/hitos/${slug}.jpg`;

const hitosDeTramo = (tramo) =>
  tramo === "todos" ? HITOS_HISTORICOS : HITOS_HISTORICOS.filter((h) => h.tramo === tramo);

// Hitos cercanos a una posición (metros). Útil para el "¿qué tengo cerca?" de Naira.
const hitosCerca = (lat, lng, radio = 400) => {
  const R = 6371000;
  const rad = (x) => (x * Math.PI) / 180;
  return HITOS_HISTORICOS
    .map((h) => {
      const dLat = rad(h.lat - lat);
      const dLng = rad(h.lng - lng);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(rad(lat)) * Math.cos(rad(h.lat)) * Math.sin(dLng / 2) ** 2;
      return { ...h, distancia: Math.round(2 * R * Math.asin(Math.sqrt(a))) };
    })
    .filter((h) => h.distancia <= radio)
    .sort((a, b) => a.distancia - b.distancia);
};

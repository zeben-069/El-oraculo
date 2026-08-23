// Naira — Miradores del término de Santa Cruz de Tenerife
// Fuente: miradores.geojson (Ayuntamiento de Santa Cruz). 18 puntos.
//
// OJO CON EL CATÁLOGO: siete de los dieciocho están DENTRO del Palmetum y no
// son sitios a los que se vaya. Son balcones temáticos del jardín botánico,
// a metro y medio unos de otros y detrás de una entrada de pago. Mandar a
// alguien al «Mirador Indochina» sería mandarlo al Palmetum sin decírselo.
// Van marcados con dentro_de:'Palmetum' y NO deben ofrecerse como parada.

const MIRADORES = [
  // ── Paradas de verdad ──────────────────────────────────────────────
  { slug:'los-campitos',       nombre:'Mirador de Los Campitos',
    lat:28.4753605, lng:-16.2605805, acceso:'libre', coche:true,
    zona:'sobre la ciudad',
    nota:'Encima de Santa Cruz, con la ciudad entera y el puerto abajo.' },
  { slug:'parque-las-mesas',   nombre:'Mirador de Parque Las Mesas',
    lat:28.4837057, lng:-16.2701430, acceso:'libre', coche:true,
    zona:'sobre la ciudad', nota:'Zona recreativa arriba de la ciudad.' },
  { slug:'la-alegria',         nombre:'Mirador de La Alegría',
    lat:28.4831708, lng:-16.2416524, acceso:'libre', coche:true,
    zona:'sobre la ciudad', nota:'Asomado al puerto y a la bahía.' },
  { slug:'vistabella',         nombre:'Mirador de Vistabella',
    lat:28.4650881, lng:-16.2822311, acceso:'libre', coche:true,
    zona:'sobre la ciudad', nota:'El más cercano al casco.' },

  { slug:'pico-del-ingles',    nombre:'Mirador de Pico del Inglés',
    lat:28.5325319, lng:-16.2637781, acceso:'libre', coche:true,
    zona:'Anaga', nota:'El balcón grande de Anaga. Se nubla con facilidad.' },
  { slug:'el-bailadero',       nombre:'Mirador de El Bailadero',
    lat:28.5491629, lng:-16.2069033, acceso:'libre', coche:true,
    zona:'Anaga', nota:'Cruce de caminos: de aquí sale media Anaga a pie.' },
  { slug:'la-chamuscada',      nombre:'Mirador de La Chamuscada',
    lat:28.5392358, lng:-16.2191854, acceso:'libre', coche:true, zona:'Anaga' },
  { slug:'amogoje',            nombre:'Mirador de Amogoje',
    lat:28.5583254, lng:-16.2056423, acceso:'libre', coche:true, zona:'Anaga' },
  { slug:'taborno',            nombre:'Mirador de Taborno',
    lat:28.5573503, lng:-16.2644212, acceso:'libre', coche:true,
    zona:'Anaga', nota:'Enfrente del Roque de Taborno.' },
  { slug:'roque-negro',        nombre:'Mirador de Roque Negro',
    lat:28.5434406, lng:-16.2471206, acceso:'libre', coche:true, zona:'Anaga' },
  { slug:'las-teresitas',      nombre:'Mirador de Las Teresitas, Las Gaviotas y Los Órganos',
    lat:28.5121140, lng:-16.1791392, acceso:'libre', coche:true,
    zona:'Anaga', nota:'La foto clásica de Las Teresitas desde arriba.' },

  // ── Dentro del Palmetum: no son parada, son parte de la visita ─────
  { slug:'palmetum-hawaii',          nombre:'Mirador Hawaii',          lat:28.4518572, lng:-16.2575425, dentro_de:'Palmetum' },
  { slug:'palmetum-melanesia',       nombre:'Mirador Melanesia',       lat:28.4515989, lng:-16.2570056, dentro_de:'Palmetum' },
  { slug:'palmetum-nueva-caledonia-1',nombre:'Mirador Nueva Caledonia I', lat:28.4515092, lng:-16.2568038, dentro_de:'Palmetum' },
  { slug:'palmetum-nueva-caledonia-2',nombre:'Mirador Nueva Caledonia II',lat:28.4514574, lng:-16.2566533, dentro_de:'Palmetum' },
  { slug:'palmetum-indochina',       nombre:'Mirador Indochina',       lat:28.4513320, lng:-16.2555673, dentro_de:'Palmetum' },
  { slug:'palmetum-africa',          nombre:'Mirador África',          lat:28.4513147, lng:-16.2551115, dentro_de:'Palmetum' },
  { slug:'palmetum-caribe',          nombre:'Mirador Caribe',          lat:28.4525929, lng:-16.2546506, dentro_de:'Palmetum' },
];

/* Los que se pueden ofrecer como parada: fuera del Palmetum y de acceso libre. */
const miradoresVisitables = () => MIRADORES.filter(m => !m.dentro_de);

/* Los de Anaga son de carretera de curvas: sin coche no se llega bien. */
const miradoresPara = (hayCoche) =>
  miradoresVisitables().filter(m => hayCoche || !m.coche);

const imagenDeMirador = (slug) => `img/miradores/${slug}.jpg`;

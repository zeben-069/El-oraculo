#!/usr/bin/env node
/*
  Naira — extraer las cabeceras de los senderos de Tenerife
  ---------------------------------------------------------
  El geojson del Cabildo pesa 14 MB porque lleva el trazado completo: cada
  sendero son cientos de puntos. Para lo que necesita Naira sobra casi todo.
  De cada itinerario nos quedamos con:
     · el primer punto de la línea  -> la cabecera, por dónde se empieza
     · el último punto              -> dónde se acaba (importa: si no es
                                       circular, hay que volver a por el coche)
     · el punto medio               -> para centrar el mapa
  y toda la metadata (matrícula, desnivel, municipios...).

  El resultado son unos pocos KB.

  USO
    1. Descarga el geojson del Cabildo:
       https://datos.tenerife.es/ckan/dataset/8d10c221-0910-43c5-9b2f-d9df59efded7/resource/fb1d87f2-49d3-44c2-a9a6-f8a3759e6da0/download/itinerarios.geojson
    2. Ponlo en la misma carpeta que este archivo.
    3. node cabeceras-senderos.js itinerarios.geojson

  Genera `senderos-tenerife.js`, listo para meter en datos/.

  Node necesita más memoria de la normal para 14 MB de JSON con este anidamiento.
  Si se queja con "heap out of memory", arráncalo así:
       node --max-old-space-size=2048 cabeceras-senderos.js itinerarios.geojson
*/

const fs = require('fs');

const entrada = process.argv[2] || 'itinerarios.geojson';
if (!fs.existsSync(entrada)) {
  console.error('No encuentro el fichero: ' + entrada);
  console.error('Uso: node cabeceras-senderos.js itinerarios.geojson');
  process.exit(1);
}

console.log('Leyendo ' + entrada + ' (' + Math.round(fs.statSync(entrada).size / 1048576) + ' MB)…');
/* Los ficheros del Cabildo vienen con BOM (marca invisible al principio).
   JSON.parse se atraganta con ella, así que se quita antes de nada. */
const gj = JSON.parse(fs.readFileSync(entrada, 'utf8').replace(/^\uFEFF/, ''));
const feats = gj.features || [];
console.log('Itinerarios en el fichero: ' + feats.length);

/* Las geometrías vienen como LineString o MultiLineString. Se aplanan a una
   lista única de puntos [lon, lat] para poder coger extremos y medio. */
function puntosDe(g) {
  if (!g) return [];
  if (g.type === 'LineString') return g.coordinates || [];
  if (g.type === 'MultiLineString') return (g.coordinates || []).flat();
  if (g.type === 'Point') return [g.coordinates];
  return [];
}

const r5 = n => Math.round(n * 1e5) / 1e5;   /* 5 decimales ≈ 1 metro, de sobra */
const slug = s => String(s || '').toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

const salida = [];
let sinGeometria = 0;

/* ¡OJO! El geojson del Cabildo trae las ETIQUETAS mal puestas: los valores van
   en el orden correcto del CSV, pero los nombres de campo están corridos.
   Comprobado contra la fila PR-TF 86 del CSV y verificado en los 225 registros:
   el patrón de tipos es idéntico en todos. Así que se leen POR POSICIÓN.
   Si algún día el Cabildo lo arregla, esto seguirá funcionando porque se
   comprueba antes si las etiquetas ya cuadran. */
/* Orden real, deducido cotejando la fila PR-TF 86 y la BC-1 del CSV oficial:
     0 matricula   1 nombre      2 clase        3 FIN         4 modalidad
     5 inicio      6 alt_max     7 alt_min      8 municipios  9 distancia
    10 espacios   11 desnivel+  12 desnivel-                              */
const ORDEN = ['matricula','nombre','clase','fin','modalidad','inicio',
               'altura_maxima','altura_minima','municipios','distancia',
               'espacios','desnivel_positivo','desnivel_negativo'];
function campos(props) {
  const v = Object.keys(props).map(k => props[k]);
  /* si las etiquetas ya son de fiar (distancia numérica y municipios en lista),
     se usan tal cual; si no, se leen por posición */
  const sano = typeof props.itinerario_distancia === 'number'
            && Array.isArray(props.municipios_nombres);
  if (sano) return {
    matricula: props.itinerario_matricula, nombre: props.itinerario_nombre,
    clase: props.itinerario_clase, modalidad: props.itinerario_modalidad,
    inicio: props.itinerario_inicio, fin: props.itinerario_fin,
    distancia: props.itinerario_distancia,
    altura_minima: props.itinerario_altura_minima, altura_maxima: props.itinerario_altura_maxima,
    desnivel_positivo: props.itinerario_desnivel_positivo,
    desnivel_negativo: props.itinerario_desnivel_negativo,
    municipios: props.municipios_nombres, espacios: props.espacios_naturales };
  const o = {};
  ORDEN.forEach((n, i) => { o[n] = v[i]; });
  return o;
}

feats.forEach(f => {
  const p = campos(f.properties || {});
  const pts = puntosDe(f.geometry);
  if (!pts.length) { sinGeometria++; return; }

  const ini = pts[0];
  const fin = pts[pts.length - 1];
  const med = pts[Math.floor(pts.length / 2)];

  /* Circular = empieza y acaba prácticamente en el mismo sitio. Se comprueba
     con la geometría en vez de fiarse solo del campo modalidad. */
  const dLon = (ini[0] - fin[0]) * 111000 * Math.cos(ini[1] * Math.PI / 180);
  const dLat = (ini[1] - fin[1]) * 111000;
  const vuelta = Math.hypot(dLon, dLat);

  salida.push({
    matricula: p.matricula || null,
    nombre: p.nombre || null,
    slug: slug(p.matricula || p.nombre),
    clase: p.clase || null,
    modalidad: p.modalidad || null,
    desde: p.inicio || null,
    hasta: p.fin || null,
    metros: p.distancia != null ? Math.round(p.distancia) : null,
    alt_min: p.altura_minima != null ? Math.round(p.altura_minima) : null,
    alt_max: p.altura_maxima != null ? Math.round(p.altura_maxima) : null,
    subida: p.desnivel_positivo != null ? Math.round(p.desnivel_positivo) : null,
    bajada: p.desnivel_negativo != null ? Math.round(p.desnivel_negativo) : null,
    municipios: Array.isArray(p.municipios) ? p.municipios.join('|') : (p.municipios || null),
    espacios: Array.isArray(p.espacios) ? p.espacios.join('|') : (p.espacios || null),
    /* lo que de verdad le faltaba al catálogo */
    lat: r5(ini[1]), lng: r5(ini[0]),
    lat_fin: r5(fin[1]), lng_fin: r5(fin[0]),
    lat_medio: r5(med[1]), lng_medio: r5(med[0]),
    circular: vuelta < 150,
    /* si no es circular, esto es lo que hay que caminar de vuelta al coche
       (en línea recta; por carretera será más) */
    vuelta_al_coche_m: vuelta < 150 ? 0 : Math.round(vuelta),
    puntos_originales: pts.length
  });
});

salida.sort((a, b) => String(a.matricula).localeCompare(String(b.matricula), 'es', { numeric: true }));

const soloSenderos = salida.filter(x => /sendero/i.test(x.clase || ''));
const cabecera = `// Naira — cabeceras de los itinerarios de Tenerife
// Generado por cabeceras-senderos.js a partir de itinerarios.geojson
// Fuente: Cabildo de Tenerife, datos abiertos (CC-BY). Actualización mensual.
//
// De cada itinerario se guarda el inicio, el fin y el punto medio, no el
// trazado. Para dibujar la línea completa hay que ir al geojson original.
//
// Itinerarios: ${salida.length}  ·  de ellos senderos a pie: ${soloSenderos.length}
// Generado el ${new Date().toISOString().slice(0, 10)}

const SENDEROS_TF = `;

fs.writeFileSync('senderos-tenerife.js',
  cabecera + JSON.stringify(salida, null, 1) + ';\n\n' +
  `/* Los que se hacen a pie. */
const senderosAPie = () => SENDEROS_TF.filter(s => /sendero/i.test(s.clase || ''));

/* Buscar por matrícula oficial (PR TF 6, GR 131...). */
const senderoPorMatricula = (m) =>
  SENDEROS_TF.find(s => String(s.matricula).toLowerCase() === String(m).toLowerCase());

/* Senderos que pasan por un municipio. */
const senderosDe = (municipio) =>
  SENDEROS_TF.filter(s => (s.municipios || '').toLowerCase().includes(municipio.toLowerCase()));

/* Lo que de verdad cansa no son los kilómetros, es la subida.
   Regla de andar por casa: 4 km/h en llano, más una hora por cada 600 m de
   desnivel positivo. Es la de Naismith, que se queda corta cuesta abajo pero
   sirve para avisar. */
const horasAPie = (s) => {
  if (!s.metros) return null;
  const h = s.metros / 4000 + (s.subida || 0) / 600;
  return Math.round(h * 10) / 10;
};

/* Para avisar en el plan: un sendero de 300 m de subida no es un paseo. */
const dureza = (s) => {
  const d = s.subida || 0;
  if (d < 150) return 'suave';
  if (d < 400) return 'con su cuesta';
  if (d < 800) return 'exigente';
  return 'para gente entrenada';
};
`, 'utf8');

console.log('');
console.log('Escrito senderos-tenerife.js');
console.log('  itinerarios con geometría : ' + salida.length);
console.log('  sin geometría (saltados)  : ' + sinGeometria);
console.log('  senderos a pie            : ' + soloSenderos.length);
console.log('  circulares                : ' + salida.filter(x => x.circular).length);
console.log('  tamaño                    : ' + Math.round(fs.statSync('senderos-tenerife.js').size / 1024) + ' KB');
console.log('');
console.log('Clases encontradas:');
const clases = {};
salida.forEach(x => { clases[x.clase || '(sin clase)'] = (clases[x.clase || '(sin clase)'] || 0) + 1; });
Object.entries(clases).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log('  ' + String(v).padStart(5) + '  ' + k));
console.log('');
console.log('Muestra:');
salida.slice(0, 5).forEach(x => console.log('  ' + String(x.matricula).padEnd(12) +
  String(x.metros + ' m').padEnd(10) + '+' + String(x.subida) + ' m  ' + String(x.nombre).slice(0, 45)));

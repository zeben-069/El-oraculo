/*
  Naira — prueba la web de verdad, en un navegador real
  ------------------------------------------------------
  Yo no puedo pulsar botones desde donde estoy: solo recibo el HTML inicial,
  y Naira se construye entera con JavaScript. Esto lo resuelve: abre Chrome,
  recorre los flujos como una persona, y trae de vuelta lo que yo no veo.

  Lo más valioso que captura son los ERRORES DE CONSOLA. Un fallo de
  JavaScript no se ve en la pantalla: el botón simplemente no hace nada, y
  eso puede estar pasando ahora mismo sin que ninguno de los dos lo sepa.

  CÓMO SE USA
  ------------
  Hace falta Node instalado. En una carpeta vacía:

      npm init -y
      npm i -D playwright
      npx playwright install chromium
      node probar-web.js

  Para probar otra dirección:
      node probar-web.js https://otra-url.netlify.app

  Deja las capturas en ./capturas y escribe el informe por pantalla.
  Pásame ese informe y las capturas y ya sé qué arreglar.
*/

const { chromium } = require('playwright');
const fs = require('fs');

const URL = process.argv[2] || 'https://leafy-cobbler-d24e23.netlify.app';
const CARPETA = './capturas';

/* Cada guion es un recorrido: una lista de textos de botón a pulsar en orden.
   Se busca el botón por su texto, que es como lo haría una persona. */
const GUIONES = [
  { nombre: 'plan-basico-coche-pareja',
    pasos: ['La Laguna', 'Sí, tenemos coche', 'Grupo, sin niños', '¿Qué plan hacemos hoy?',
            'Un poco de todo', 'Lo que haya bueno'] },
  { nombre: 'con-ninos-playa',
    pasos: ['Candelaria', 'Sí, tenemos coche', 'Familia con niños',
            '¿Qué plan hacemos hoy?', 'Agua: playas y piscinas naturales', 'Lo que haya bueno'] },
  { nombre: 'sin-coche',
    pasos: ['Puerto de la Cruz', 'No, vamos en guagua', 'Grupo, sin niños',
            '¿Qué plan hacemos hoy?', 'Un poco de todo', 'Lo que haya bueno'] },
  { nombre: 'sorpresa',
    pasos: ['Tegueste', 'Sí, tenemos coche', 'Familia con niños', '✨'] },
  { nombre: 'ajustar-parada',
    pasos: ['La Laguna', 'Sí, tenemos coche', 'Grupo, sin niños', '¿Qué plan hacemos hoy?',
            'Un poco de todo', 'Lo que haya bueno', 'Esta no'] },
  { nombre: 'mas-tranquilo',
    pasos: ['Candelaria', 'Sí, tenemos coche', 'Familia con niños',
            '¿Qué plan hacemos hoy?', 'Un poco de todo', 'Lo que haya bueno',
            'Otra cosa más tranquila'] },
  { nombre: 'ingles',
    pasos: ['EN', 'La Laguna', 'Yes, we have a car', 'Group, no children'] },
];

async function main() {
  if (!fs.existsSync(CARPETA)) fs.mkdirSync(CARPETA);
  const navegador = await chromium.launch();
  const informe = [];

  for (const guion of GUIONES) {
    const ctx = await navegador.newContext({ viewport: { width: 420, height: 900 } });
    const pag = await ctx.newPage();

    /* Lo que de verdad interesa: fallos que no se ven en pantalla */
    const errores = [], avisos = [], fallosRed = [];
    pag.on('console', m => {
      if (m.type() === 'error') errores.push(m.text().slice(0, 300));
      if (m.type() === 'warning') avisos.push(m.text().slice(0, 200));
    });
    pag.on('pageerror', e => errores.push('EXCEPCIÓN: ' + String(e.message).slice(0, 300)));
    pag.on('requestfailed', r =>
      fallosRed.push(r.url().slice(0, 120) + ' → ' + (r.failure() || {}).errorText));
    pag.on('response', r => {
      if (r.status() >= 400) fallosRed.push(r.status() + ' en ' + r.url().slice(0, 120));
    });

    const dados = [], fallados = [];
    try {
      await pag.goto(URL, { waitUntil: 'networkidle', timeout: 45000 });
      await pag.waitForTimeout(1200);

      for (const paso of guion.pasos) {
        /* se busca cualquier botón cuyo texto contenga lo pedido */
        const btn = pag.locator('button', { hasText: paso }).first();
        try {
          await btn.waitFor({ state: 'visible', timeout: 9000 });
          await btn.click();
          dados.push(paso);
          await pag.waitForTimeout(1600);   /* Naira escribe con pausas */
        } catch (e) {
          fallados.push(paso);
          break;   /* si un paso no aparece, el resto ya no tiene sentido */
        }
      }

      /* el plan tarda: se le da margen */
      await pag.waitForTimeout(9000);
    } catch (e) {
      errores.push('NAVEGACIÓN: ' + String(e.message).slice(0, 200));
    }

    /* qué quedó en pantalla */
    const texto = await pag.evaluate(() => document.body.innerText).catch(() => '');
    const hayBarra = await pag.locator('#barraEscribir').isVisible().catch(() => false);
    const hayTarjetas = await pag.locator('a.mapa').count().catch(() => 0);
    const hayAjustes = await pag.locator('.ajustes button').count().catch(() => 0);
    const hayMapa = await pag.locator('.leaflet-container').count().catch(() => 0);

    await pag.screenshot({ path: `${CARPETA}/${guion.nombre}.png`, fullPage: true });
    informe.push({ guion: guion.nombre, dados, fallados, errores, avisos: avisos.slice(0, 5),
                   fallosRed: [...new Set(fallosRed)].slice(0, 8),
                   hayBarra, hayTarjetas, hayAjustes, hayMapa,
                   largoTexto: texto.length,
                   diceNoPuedo: /no puedo responderle por escrito/i.test(texto),
                   sinTiempo: /Sin parte para|no contestó a tiempo/i.test(texto) });
    await ctx.close();
  }

  await navegador.close();

  /* ── informe ── */
  console.log('\n═══ NAIRA · prueba en navegador real ═══');
  console.log('URL: ' + URL + '\n');
  let totalErr = 0;
  informe.forEach(r => {
    const ok = !r.errores.length && !r.fallados.length;
    console.log((ok ? '✓ ' : '✗ ') + r.guion);
    console.log('   pasos dados: ' + r.dados.length + '/' + (r.dados.length + r.fallados.length));
    if (r.fallados.length) console.log('   NO ENCONTRÓ el botón: ' + r.fallados.join(' · '));
    console.log('   tarjetas: ' + r.hayTarjetas + ' | botones de ajuste: ' + r.hayAjustes +
                ' | mapa: ' + (r.hayMapa ? 'sí' : 'no') + ' | caja de texto: ' + (r.hayBarra ? 'sí' : 'NO'));
    if (r.sinTiempo) console.log('   ⚠ AEMET no dio parte');
    if (r.diceNoPuedo) console.log('   ⚠ la caja de diálogo respondió que no puede escribir (¿falta la clave?)');
    if (r.errores.length) {
      totalErr += r.errores.length;
      console.log('   ERRORES DE CONSOLA (' + r.errores.length + '):');
      [...new Set(r.errores)].slice(0, 6).forEach(e => console.log('      · ' + e));
    }
    if (r.fallosRed.length) {
      console.log('   PETICIONES FALLIDAS:');
      r.fallosRed.forEach(e => console.log('      · ' + e));
    }
    console.log('');
  });
  console.log('Errores de consola en total: ' + totalErr);
  console.log('Capturas en ' + CARPETA + '/');
  fs.writeFileSync('informe.json', JSON.stringify(informe, null, 1));
  console.log('Informe completo en informe.json — ese es el que me interesa.');
}

main().catch(e => { console.error('El script falló:', e); process.exit(1); });

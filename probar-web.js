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
   Se busca el botón por su texto, que es como lo haría una persona.

   OJO: estos textos son los RÓTULOS DE VERDAD, sacados de `tr()`. Cuando las
   preguntas pasaron a ser carteles con dibujo, «Sí, tenemos coche» se quedó en
   «Con coche» y «Lo que haya bueno» desapareció — y esta prueba siguió
   fallando siete de siete recorridos como si la web estuviera rota, cuando la
   web estaba perfecta. Si vuelven a cambiar los rótulos, hay que cambiarlos
   aquí: los de la interfaz salen todos de la tabla `T` de `index.html`. */
/* Los guiones, en el orden que puso Zeben el 13 de septiembre:
   1 qué le apetece · 2 comarca y municipio · 3 coche o guagua · 4 cuántos son
   · 5 qué comer. Antes empezaban por el pueblo donde duermen y acababan en el
   tipo de día, así que TODOS hubo que darles la vuelta.
   Ojo con dos cosas de la propia prueba, que ya están apuntadas en CLAUDE.md y
   aquí muerden otra vez:
   · el chip de la comarca lleva DENTRO el rótulo largo y el corto, así que su
     texto es «MetropolitanaMetrop.» y hay que buscarlo sin exigir exacto;
   · la carta del tipo de día y la de qué comer ya NO se llaman igual —«Un poco
     de todo» y «De todo un poco»—, que es lo que traían los carteles de Zeben;
     aun así siguen siendo el primer paso y el último del mismo guion. */
const GUIONES = [
  { nombre: 'plan-basico-coche-pareja',
    pasos: ['Un poco de todo', 'Metropolitana', 'La Laguna', 'Con coche',
            'Seguimos', 'De todo un poco'] },
  { nombre: 'con-ninos-playa',
    pasos: ['Charcos y playas', 'Güímar', 'Candelaria', 'Con coche',
            '@[data-p="n+"]', '@[data-p="n+"]', 'Seguimos', 'Comida típica'] },
  { nombre: 'sin-coche',
    pasos: ['Senderos y naturaleza', 'Valle de La Orotava', 'Puerto de la Cruz',
            'Sin coche, en guagua', 'Seguimos', 'De todo un poco'] },
  /* «Ahora mismo» ya no es un botón de ningún sitio: lo dice el calendario.
     La prueba corre con la fecha de hoy y sin tocarla, así que este recorrido
     ES el de hoy —el reloj recorta el día— y lo que se mide es que salga plan
     igual a cualquier hora a la que se ejecute. */
  { nombre: 'hoy-con-lo-que-queda',
    pasos: ['Un poco de todo', 'Metropolitana', 'Tegueste',
            'Con coche', 'Seguimos', 'De todo un poco'] },
  /* El contador de cuántos son, que desde que se fueron las tres cartas es el
     ÚNICO camino del paso 4. Aquí se suben dos adultos —cuatro en total— para
     comprobar que sale el número que se ha marcado: `personas` en el informe es
     siempre lo que dicen ellos, nunca una cifra nuestra. Y el de con niños
     —`con-ninos-playa`— sube dos por el otro contador, que es lo que enciende
     `S.ninos` desde que no hay una carta que lo diga. */
  /* El calendario mandando el «cuándo», que son los dos caminos que el resto
     de recorridos no pisa: todos corren con la fecha de hoy, o sea que todos
     van por la rama de «hoy, con lo que queda». Estos dos van por las otras.
     · un día FUTURO —el primero del mes que viene— da el día entero;
     · dos días seguidos dan la escapada, sin preguntar cuántos. */
  /* Ojo con el `@#btnCal` del final: hay que CERRAR el calendario antes de
     seguir el hilo. Con él abierto, «La Laguna» casa antes con el chip de su
     programa en el pie del calendario que con la estampa del municipio, y el
     recorrido se va por otro lado sin decir nada. Es la trampa de los dos
     botones que se llaman igual, otra vez. */
  { nombre: 'dia-futuro-entero',
    pasos: ['@#btnCal', '@button.calNav[data-mes="1"]', '@.calRej .calD:not([disabled])',
            '@#btnCal', 'Un poco de todo', 'Metropolitana', 'La Laguna', 'Con coche',
            'Seguimos', 'De todo un poco'] },
  { nombre: 'rango-escapada',
    pasos: ['@#btnCal', '@.calD.sel ~ .calD', '@#btnCal',
            'Un poco de todo', 'Metropolitana', 'La Laguna', 'Con coche',
            'Seguimos', 'De todo un poco'] },
  { nombre: 'cuantos-son',
    pasos: ['Un poco de todo', 'Metropolitana', 'La Laguna', 'Con coche',
            '=+', '=+', 'Seguimos', 'De todo un poco'] },
  { nombre: 'ajustar-parada',
    pasos: ['Un poco de todo', 'Metropolitana', 'La Laguna', 'Con coche',
            'Seguimos', 'De todo un poco', 'Esta no'] },
  { nombre: 'mas-tranquilo',
    pasos: ['Un poco de todo', 'Güímar', 'Candelaria', 'Con coche',
            '@[data-p="n+"]', '@[data-p="n+"]', 'Seguimos', 'De todo un poco', 'Otra cosa más tranquila'] },
  /* El camino del mapa eligiendo A DÓNDE IR, que es otra cosa que elegir dónde
     dormir: se llega por «prefiero elegir el sitio yo», ya con el plan hecho.
     Pasa por Vilaflor a propósito, que lleva aviso de «eso está en el otro
     cartel» — y ahí cazó que el botón del salto se pintaba y se borraba solo. */
  { nombre: 'mapa-comarcas',
    pasos: ['Un poco de todo', 'Sur', 'Arona', 'Con coche', 'Seguimos',
            'De todo un poco', 'Volver al menú', 'Quiero ver un sitio concreto',
            'Sur', 'Vilaflor', 'Un poco de todo', 'De todo un poco'] },
  /* La carta que abre el calendario en vez de filtrar el catálogo, y que ahora
     es la PRIMERA pregunta: ahí todavía no hay cama, así que la lista va sin
     minutos de viaje. Está escrito para que valga los dos días posibles — el
     «me da igual» va opcional, así que el día con fiestas sale de la lista por
     ahí y el día vacío se lo salta, porque la carta ya ha dicho que no hay
     nada y ha repintado las cartas debajo. */
  { nombre: 'tenderete',
    pasos: ['Tenderete y tradiciones', '?Me da igual', 'Un poco de todo',
            'Metropolitana', 'La Laguna', 'Con coche', 'Seguimos',
            'De todo un poco'] },
  /* Y el tenderete entrando POR EL PUEBLO, que es el camino nuevo: la estampa
     del municipio y, si ese pueblo tiene más de una cosa, la lista de dentro.
     Los tres primeros pasos van opcionales a propósito, que esta prueba corre
     con la fecha de hoy y el día manda: si no hay nada se repintan las cartas
     y entra por «Un poco de todo»; si el pueblo tiene una sola cosa se entra
     solo y no hay lista que pulsar. En los tres casos se acaba con un plan,
     que es lo que se mide. */
  { nombre: 'tenderete-por-pueblo',
    pasos: ['Tenderete y tradiciones', '?@#acciones .estampa', '?@#acciones .opt',
            '?Un poco de todo', 'Metropolitana', 'La Laguna', 'Con coche',
            'Seguimos', 'De todo un poco'] },
  /* El botón de «llévame más lejos», que es el camino nuevo del 13 de
     septiembre y no lo pisa ningún otro: se arma el día, se lee, y desde el
     plan se manda el día entero a otra zona. Va detrás de un plan hecho, así
     que mide las dos cosas — que el botón exista y que lo que sale detrás sea
     otro plan con sus fichas. Desde La Laguna con coche siempre hay zona que
     ofrecer (Candelaria a 20 min), así que el paso NO va opcional: si un día
     no está, es que algo se rompió. */
  { nombre: 'otra-zona',
    pasos: ['Un poco de todo', 'Metropolitana', 'La Laguna', 'Con coche',
            'Seguimos', 'De todo un poco', 'Llévame más lejos'] },
  { nombre: 'ingles',
    pasos: ['=EN', 'A bit of everything', 'Metropolitan', 'La Laguna',
            'With a car', 'Carry on', 'A little of everything'] },
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
        /* Se busca cualquier botón cuyo texto CONTENGA lo pedido, que es como
           mira una persona. Pero un rótulo de dos letras pilla de todo: «EN»,
           el botón del idioma, encajaba también en «JUEVES · 12 EVENTOS», que
           es el que abre el calendario — así que la prueba en inglés abría el
           calendario y luego se quejaba de que no encontraba «With a car».
           Por eso un paso que empiece por «=» se busca EXACTO. */
        /* Un paso que empieza por «?» es OPCIONAL: si el botón no está, se
           sigue sin él y no cuenta como fallo. Hace falta desde que Naira
           pregunta «ese día hay cosas por la isla, ¿le monto el día alrededor
           de alguna?», que solo sale los días con fiesta o con programa — y
           como la prueba corre con la fecha de hoy, unos días sale y otros no.
           Sin esto, los siete recorridos se paraban en el paso cuatro y
           parecía que la web estaba rota. Es la misma trampa de siempre: la
           rota era la prueba. */
        const opcional = paso.startsWith('?');
        const crudo = opcional ? paso.slice(1) : paso;
        /* Ojo con `=` en los rótulos del mapa: `hasText` compara contra el
           textContent, y cada chip de comarca lleva DENTRO el rótulo largo y
           el corto —uno oculto por CSS según el ancho—, así que el de Sur dice
           «SurSur» y el exacto no casa nunca. Para esos va sin `=`. */
        const exacto = crudo.startsWith('=');
        /* Y un paso que empieza por «@» es un SELECTOR CSS, no un rótulo. Hace
           falta para el calendario y solo para él: sus días son números sueltos
           —un «3» casa con cualquier botón que lleve un tres— y el botón que lo
           abre lleva dentro la fecha y el número de eventos, así que cambia
           cada día. Buscarlos por texto es justo la trampa del `=EN` que ya
           está apuntada arriba, por el otro lado. */
        const porSel = crudo.startsWith('@');
        const busca = exacto ? crudo.slice(1) : porSel ? crudo.slice(1) : crudo;
        /* `button:visible` y no `button`: el calendario cerrado NO se quita del
           DOM, solo se oculta, así que sus chips de pueblo siguen ahí. Sin el
           `:visible`, «La Laguna» casaba antes con el chip oculto del pie del
           calendario que con la estampa del municipio, y el paso se quedaba
           esperando a que algo invisible se hiciera visible — o sea, fallaba
           un recorrido que la web hacía perfectamente. */
        const btn = porSel ? pag.locator(busca).first() : pag.locator('button:visible', {
          hasText: exacto ? new RegExp('^\\s*' + busca.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*$') : busca
        }).first();
        try {
          await btn.waitFor({ state: 'visible', timeout: opcional ? 2500 : 9000 });
          await btn.click();
          dados.push(busca);
          await pag.waitForTimeout(1600);   /* Naira escribe con pausas */
        } catch (e) {
          if (opcional) continue;           /* no estaba: ese día no había nada */
          fallados.push(busca);
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

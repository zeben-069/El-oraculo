// naira.js — la pieza que habla con la API
//
// Escrita en el formato clásico de Netlify (exports.handler). Es el que
// funciona siempre en archivos .js, sin necesidad de package.json ni de
// declarar módulos. El formato moderno (export default) exige configuración
// extra y, si falta, la función se despliega pero la ruta no existe.
//
// LA CLAVE
//   Da igual cómo se llame la variable en Netlify: la función recorre todas
//   y se queda con la que empieza por "sk-ant-".
//
// PARA COMPROBAR QUE FUNCIONA
//   https://SU-SITIO.netlify.app/.netlify/functions/naira?probar=1

// EL FRENO
//   Esta función es una URL pública que gasta la clave de Zeben. Sin freno,
//   cualquiera que mire el código del navegador puede apuntarle con lo que
//   quiera —incluido su propio prompt— y usarla de ChatGPT gratis a su costa.
//   Se le ponen tres cierres, de más fuerte a más flojo:
//
//   1. SOLO SIRVE PARA HACER PLANES. Antes se aceptaba el `system` que
//      mandara el cliente, así que valía para cualquier cosa. Ahora tiene que
//      ser el prompt de Naira (se comprueba por una frase que solo está ahí)
//      y una sola pregunta. Lo peor que puede sacar alguien de aquí es un
//      plan de un día en Tenerife.
//   2. SOLO DESDE LA WEB. Se mira de dónde viene la llamada. Con curl se
//      puede falsear, pero corta de raíz el "apunto mi herramienta ahí".
//   3. UN LÍMITE POR IP Y UN TECHO AL DÍA. En memoria del contenedor: Netlify
//      levanta y apaga instancias, así que no es un candado, es un freno. Para
//      un candado de verdad haría falta un contador compartido (Netlify Blobs),
//      y eso obliga a package.json, que es lo que aquí se quiso evitar.

// Una frase del prompt de Naira que no está en ningún otro sitio. Si el
// `system` que llega no la trae, no es Naira quien llama.
var FIRMA = "Eres Naira, gu";

// De dónde se acepta. Vacío = se acepta cualquiera (para probar en local).
// OJO, esto tenía un fallo silencioso: se comparaba contra la cabecera entera,
// y el `origin` llega sin barra («https://x.netlify.app») pero el `referer`
// llega CON ella y con la página detrás («https://x.netlify.app/index.html»).
// El ancla `$` de «.netlify.app$» solo casaba con el primero, así que en el
// navegador que no manda `origin` la llamada se rechazaba con un 403 y la web
// caía al relato local sin decir por qué. Ahora se compara solo el HOST.
// ── DE DÓNDE SE ACEPTA, Y POR QUÉ ASÍ ──
// La auditoría del 11 de septiembre encontró dos agujeros aquí, y los dos son
// de los que solo se ven leyendo despacio:
//   1. `if (de && !CASA.test(de))` — una petición SIN cabecera `Origin` ni
//      `Referer` no entraba en el `if` y pasaba entera. Que es exactamente lo
//      que manda un `curl` a pelo, o sea que el cierre no cerraba nada contra
//      lo único que pretendía cortar. Ahora la cabecera se EXIGE.
//      Se puede exigir con tranquilidad porque está comprobado: el navegador
//      manda `Origin` en todo POST, incluso al mismo sitio, y si no, manda
//      `Referer`. Y si algún día fallara, el turista no se queda sin plan: la
//      web cae sola al relato local.
//   2. `naira` suelto casaba con CUALQUIER host que contuviera esa cadena
//      —`naira-gratis.example.com` entraba—, y `.netlify.app$` con cualquier
//      sitio de Netlify del mundo. Ahora es el sitio exacto, sus previos de
//      despliegue (`algo--leafy-cobbler…`) y un dominio propio que empiece por
//      `naira.`, que es lo único que se pretendía dejar abierto.
var SITIO = "leafy-cobbler-d24e23.netlify.app";
function esDeCasa(host) {
  if (!host) return false;
  host = String(host).toLowerCase();
  if (/^localhost(:|$)/.test(host) || /^127\.0\.0\.1(:|$)/.test(host)) return true;
  if (host === SITIO || host.slice(-(SITIO.length + 2)) === "--" + SITIO) return true;
  if (host.slice(-(SITIO.length + 1)) === "." + SITIO) return true;
  return /^naira\.[a-z0-9.-]+$/.test(host);
}
function hostDe(cadena) {
  if (!cadena) return "";
  try { return new URL(cadena).host; } catch (e) { return String(cadena); }
}

// El contador vive en la memoria del contenedor. Si Netlify lo recicla, se
// pone a cero: por eso es un freno y no un candado.
var visitas = {};        // ip -> {n, desde}
var hoyTotal = 0, hoyDia = "";
var POR_IP_HORA = 20;    // un turista hace 3 o 4 planes en una tarde
var TECHO_DIA = 600;     // si un día se pasa de aquí, algo raro está pasando

function ipDe(event) {
  var h = event.headers || {};
  return (h["x-nf-client-connection-ip"] || h["client-ip"] ||
          (h["x-forwarded-for"] || "").split(",")[0] || "sin-ip").trim();
}

function pasaElFreno(event) {
  var ahora = Date.now();
  var dia = new Date().toISOString().slice(0, 10);
  if (dia !== hoyDia) { hoyDia = dia; hoyTotal = 0; }
  if (hoyTotal >= TECHO_DIA) return "techo del día";

  var ip = ipDe(event);
  var v = visitas[ip];
  if (!v || ahora - v.desde > 3600000) v = visitas[ip] = { n: 0, desde: ahora };
  if (v.n >= POR_IP_HORA) return "demasiadas seguidas";

  // limpieza, que el objeto no crezca sin fin en un contenedor de días
  var claves = Object.keys(visitas);
  if (claves.length > 5000) {
    for (var i = 0; i < claves.length; i++)
      if (ahora - visitas[claves[i]].desde > 3600000) delete visitas[claves[i]];
  }
  v.n++; hoyTotal++;
  return null;
}

// ── EL CONTADOR COMPARTIDO (Netlify Blobs) ──
// El freno de aquí abajo lleva la cuenta en una variable, o sea EN LA MEMORIA
// DEL CONTENEDOR. Netlify levanta y apaga varios contenedores según le llega
// el tráfico, y cada uno empieza la cuenta de cero; encima ahora hay dos
// funciones —esta y su gemela— con su cuenta cada una. O sea que el techo real
// no son 600 al día: son 600 por cada contenedor que haya levantado. Por eso
// siempre se ha dicho aquí que era un freno y no un candado.
//
// Netlify Blobs es un cajón de guardar cosas que viene con el proyecto: se
// apunta la cuenta en un solo sitio y todos los contenedores leen la misma.
// Eso lo convierte en candado de verdad.
//
// LO QUE HAY QUE SABER ANTES DE FIARSE:
// · **Es opcional a propósito.** Se carga con `import()` dentro de un try: si
//   el paquete no está, o Netlify no da el contexto, se sigue con la cuenta en
//   memoria exactamente como antes. Un freno que revienta es peor que un freno
//   flojo, porque deja al turista sin plan.
// · **Obliga a `package.json`**, que es lo único que este proyecto llevaba
//   evitando desde el principio para que publicar fuese soltar el zip y ya.
//   Que eso siga funcionando es justo lo que hay que probar: se suelta el zip
//   y se abre `?probar=1`, que dice si la cuenta va al cajón o a la memoria.
// · **No es atómico.** Dos peticiones a la vez pueden leer el mismo número y
//   escribir el mismo+1. Para un freno da igual; para un contador de dinero no
//   valdría.
let _tienda = null, _porQue = "sin probar";
async function tienda() {
  if (_tienda !== null) return _tienda;
  try {
    const mod = await import("@netlify/blobs");
    _tienda = mod.getStore({ name: "naira-freno", consistency: "strong" });
    _porQue = "va";
  } catch (e) {
    _tienda = false;
    _porQue = "no se pudo cargar @netlify/blobs: " + ((e && e.message) || e);
    console.warn("Blobs no disponible, se cuenta en memoria ·", _porQue);
  }
  return _tienda;
}
// Las claves llevan el día y la hora dentro, así que caducan solas: la de
// ayer deja de leerse y no hay que limpiar nada.
async function suma(t, clave, techo) {
  let n = 0;
  try { const v = await t.get(clave, { type: "json" }); n = (v && v.n) || 0; } catch (e) {}
  if (n >= techo) return { pasa: false, n: n };
  try { await t.setJSON(clave, { n: n + 1 }); } catch (e) {}
  return { pasa: true, n: n + 1 };
}
async function frenoCompartido(ip) {
  const t = await tienda();
  if (!t) return null;                       // sin cajón: que decida la memoria
  const ahora = new Date().toISOString();
  const dia = ahora.slice(0, 10), hora = ahora.slice(0, 13);
  try {
    const d = await suma(t, "dia-" + dia, TECHO_DIA);
    if (!d.pasa) return "techo del día";
    const i = await suma(t, "ip-" + ip + "-" + hora, POR_IP_HORA);
    if (!i.pasa) return "demasiadas seguidas";
    return "";                               // cadena vacía = pasa, y ya contado
  } catch (e) {
    console.warn("fallo contando en Blobs:", e && e.message);
    return null;                             // que lo resuelva la memoria
  }
}
// Para `?probar=1`: ida y vuelta de verdad, que saber que el módulo carga no
// es saber que el cajón escribe.
async function pruebaDelCajon() {
  const t = await tienda();
  if (!t) return { almacen: "memoria", porque: _porQue };
  try {
    const k = "prueba-" + Date.now();
    await t.setJSON(k, { ok: true });
    const v = await t.get(k, { type: "json" });
    try { await t.delete(k); } catch (e) {}
    return v && v.ok
      ? { almacen: "blobs", porque: "escribe y lee: el freno es compartido" }
      : { almacen: "memoria", porque: "escribió pero no leyó lo mismo" };
  } catch (e) {
    return { almacen: "memoria", porque: "el cajón falló: " + ((e && e.message) || e) };
  }
}

function buscarClave() {
  var env = process.env || {};
  var nombres = Object.keys(env);
  for (var i = 0; i < nombres.length; i++) {
    var v = env[nombres[i]];
    if (typeof v === "string" && v.indexOf("sk-ant-") === 0) return v;
  }
  return null;
}

exports.handler = async function (event) {
  var cabeceras = { "Content-Type": "application/json" };

  var q = event.queryStringParameters || {};
  if (q.probar) {
    var k = buscarClave();
    var cajon = await pruebaDelCajon();
    return {
      statusCode: 200,
      headers: cabeceras,
      body: JSON.stringify({
        funcion: "viva",
        formato: "clasico",
        // Esto es lo que hay que mirar al soltar el zip con package.json
        // dentro: si dice «blobs», el freno pasa a ser de verdad.
        freno: cajon.almacen,
        freno_porque: cajon.porque,
        claveEncontrada: !!k,
        // Antes esto enseñaba doce caracteres de la clave. Son el prefijo y no
        // el secreto, pero esta URL es pública y enseñar trozos de una clave
        // en público es una costumbre que un día sale cara.
        // Ni la longitud de la clave ni cuántas variables hay: esta URL es
        // pública y las dos cosas le sirven a quien esté tanteando, y a Zeben
        // no le sirven de nada. Con saber si está o no, basta.
        pista: k ? "hay una variable que empieza por sk-ant-"
                 : "ninguna variable empieza por sk-ant-"
      }, null, 2)
    };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: cabeceras, body: JSON.stringify({ error: "Solo POST" }) };
  }

  // 2 · de dónde viene
  var h = event.headers || {};
  var de = hostDe(h.origin || h.referer || h.Origin || h.Referer || "");
  if (!esDeCasa(de)) {
    console.warn("llamada desde fuera:", (de || "(sin cabecera)").slice(0, 80));
    return { statusCode: 403, headers: cabeceras, body: JSON.stringify({ error: "Desde ahí no" }) };
  }

  // 3 · cuántas van. Primero el contador compartido; si no hay cajón, el de
  // memoria de siempre. `""` quiere decir «pasa, y ya está contado allí».
  var frenado = await frenoCompartido(ipDe(event));
  if (frenado === null) frenado = pasaElFreno(event);
  if (frenado) {
    console.warn("freno:", frenado, ipDe(event));
    // 429 y no 500: el navegador ya sabe caer al relato local, así que el
    // turista recibe su plan igual, narrado con plantillas.
    return { statusCode: 429, headers: cabeceras,
             body: JSON.stringify({ error: "Demasiadas peticiones", motivo: frenado }) };
  }

  var clave = buscarClave();
  if (!clave) {
    return { statusCode: 200, headers: cabeceras, body: JSON.stringify({ sinClave: true }) };
  }

  var cuerpo;
  try {
    cuerpo = JSON.parse(event.body || "{}");
  } catch (e) {
    return { statusCode: 400, headers: cabeceras, body: JSON.stringify({ error: "Cuerpo ilegible" }) };
  }

  if (!cuerpo.system || !Array.isArray(cuerpo.messages)) {
    return { statusCode: 400, headers: cabeceras, body: JSON.stringify({ error: "Faltan system o messages" }) };
  }

  // 1 · esto solo hace planes de Naira, y nada más
  // La firma se busca en el arranque, no exactamente en el carácter 0: el
  // panel deja editar el prompt, y sería absurdo que retocar la primera línea
  // dejara a Zeben fuera de su propia web con un 400 sin explicación.
  if (String(cuerpo.system).slice(0, 500).indexOf(FIRMA) < 0) {
    console.warn("system que no es el de Naira");
    return { statusCode: 400, headers: cabeceras, body: JSON.stringify({ error: "Esto solo sirve para los planes de Naira" }) };
  }
  if (String(cuerpo.system).length > 40000) {
    return { statusCode: 413, headers: cabeceras, body: JSON.stringify({ error: "Prompt demasiado largo" }) };
  }
  if (cuerpo.messages.length !== 1 || cuerpo.messages[0].role !== "user") {
    return { statusCode: 400, headers: cabeceras, body: JSON.stringify({ error: "Una sola pregunta" }) };
  }

  if (JSON.stringify(cuerpo.messages).length > 60000) {
    return { statusCode: 413, headers: cabeceras, body: JSON.stringify({ error: "Mensaje demasiado largo" }) };
  }

  try {
    var r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": clave,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        // 700 cortaba el plan a media frase: un día con el tiempo, tres
        // paradas, restaurante y alternativas no cabe en 700 tokens.
        max_tokens: 1800,
        system: cuerpo.system,
        messages: cuerpo.messages
      })
    });

    if (!r.ok) {
      var detalle = await r.text();
      console.error("La API respondio", r.status, detalle.slice(0, 300));
      return {
        statusCode: 502,
        headers: cabeceras,
        body: JSON.stringify({ error: "La API respondió " + r.status, detalle: detalle.slice(0, 200) })
      };
    }

    var datos = await r.json();
    var texto = (datos.content || [])
      .filter(function (x) { return x.type === "text"; })
      .map(function (x) { return x.text; })
      .join("\n");

    return { statusCode: 200, headers: cabeceras, body: JSON.stringify({ texto: texto }) };
  } catch (e) {
    console.error("Fallo hablando con la API:", e && e.message);
    return {
      statusCode: 502,
      headers: cabeceras,
      body: JSON.stringify({ error: "No se pudo contactar con la API" })
    };
  }
};

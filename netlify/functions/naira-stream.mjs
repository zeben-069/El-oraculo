// naira-stream.mjs — lo mismo que naira.js, pero el texto va llegando
//
// POR QUÉ EXISTE ESTE SEGUNDO FICHERO
//   Zeben: «deberíamos poner que Naira trabaje en streaming porque tarda mucho
//   pensando y a mí, por ejemplo, no me va la apikey». Las dos mitades de esa
//   frase son el mismo problema: el informe son unos 8.800 tokens de entrada y
//   hasta 1.800 de salida, y eso tarda entre veinte y treinta y cinco segundos.
//   El turista mira tres puntitos medio minuto y, si algo por el camino corta
//   antes —nuestro reloj, el de las funciones de Netlify—, se queda con el
//   relato local sin saber por qué. En streaming la primera frase aparece en
//   dos o tres segundos y ya no hay espera que agotar: no se espera a que la
//   respuesta esté entera, se va pintando.
//
//   Y va aparte, en un fichero nuevo, a propósito. El formato clásico
//   (`exports.handler`, que devuelve un objeto) NO puede ir soltando texto:
//   para eso hace falta el formato moderno de Netlify, que devuelve un
//   `Response` de verdad. La extensión `.mjs` es lo que se lo dice a Netlify
//   sin necesidad de `package.json`, que es justo lo que este proyecto lleva
//   evitando desde el principio. Si algún día ese formato no estuviera
//   disponible, `naira.js` sigue ahí y el navegador cae solo en él: por eso
//   son dos ficheros y no uno reescrito.
//
// OJO — LOS TRES CIERRES ESTÁN AQUÍ TAMBIÉN, Y SON LOS MISMOS
//   Esta URL es tan pública como la otra y gasta la misma clave. Está copiada
//   de `naira.js` a mano porque un fichero compartido dentro de
//   `netlify/functions` lo trataría Netlify como otra función. **Lo que se
//   toque en uno hay que tocarlo en el otro**, y quien lo olvide deja la
//   puerta de atrás abierta en la que no mire:
//     1. el `system` tiene que ser el prompt de Naira, con una sola pregunta
//     2. la llamada tiene que venir del sitio
//     3. 20 por IP y hora, y un techo de 600 al día, en memoria del contenedor
//   El contador es SUYO, no el de `naira.js`: son dos procesos distintos y no
//   comparten memoria. O sea que el techo real es el doble del escrito. Se
//   asume: sigue siendo un freno y no un candado, que es lo que ya era.

const FIRMA = "Eres Naira, gu";
// Los mismos dos agujeros que en naira.js, cerrados igual: se EXIGE la
// cabecera —sin ella entraba un curl a pelo— y el host es el sitio exacto, no
// «cualquier cosa que contenga naira» ni «cualquier netlify.app».
const SITIO = "leafy-cobbler-d24e23.netlify.app";
function esDeCasa(host) {
  if (!host) return false;
  host = String(host).toLowerCase();
  if (/^localhost(:|$)/.test(host) || /^127\.0\.0\.1(:|$)/.test(host)) return true;
  if (host === SITIO || host.endsWith("--" + SITIO) || host.endsWith("." + SITIO)) return true;
  return /^naira\.[a-z0-9.-]+$/.test(host);
}
const POR_IP_HORA = 20;
const TECHO_DIA = 600;

const visitas = {};
let hoyTotal = 0, hoyDia = "";

function hostDe(cadena) {
  if (!cadena) return "";
  try { return new URL(cadena).host; } catch (e) { return String(cadena); }
}

function ipDe(req) {
  const h = req.headers;
  return (h.get("x-nf-client-connection-ip") || h.get("client-ip") ||
          (h.get("x-forwarded-for") || "").split(",")[0] || "sin-ip").trim();
}

function pasaElFreno(req) {
  const ahora = Date.now();
  const dia = new Date().toISOString().slice(0, 10);
  if (dia !== hoyDia) { hoyDia = dia; hoyTotal = 0; }
  if (hoyTotal >= TECHO_DIA) return "techo del día";

  const ip = ipDe(req);
  let v = visitas[ip];
  if (!v || ahora - v.desde > 3600000) v = visitas[ip] = { n: 0, desde: ahora };
  if (v.n >= POR_IP_HORA) return "demasiadas seguidas";

  const claves = Object.keys(visitas);
  if (claves.length > 5000)
    for (const k of claves) if (ahora - visitas[k].desde > 3600000) delete visitas[k];

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
  const env = process.env || {};
  for (const n of Object.keys(env)) {
    const v = env[n];
    if (typeof v === "string" && v.indexOf("sk-ant-") === 0) return v;
  }
  return null;
}

const json = (codigo, obj) => new Response(JSON.stringify(obj), {
  status: codigo, headers: { "Content-Type": "application/json" }
});

export default async (req) => {
  const url = new URL(req.url);
  if (url.searchParams.get("probar")) {
    const k = buscarClave();
    const cajon = await pruebaDelCajon();
    return json(200, {
      funcion: "viva",
      formato: "streaming",
      freno: cajon.almacen,
      freno_porque: cajon.porque,
      claveEncontrada: !!k,
      pista: k ? "hay una variable que empieza por sk-ant-"
               : "ninguna variable empieza por sk-ant-"
    });
  }

  if (req.method !== "POST") return json(405, { error: "Solo POST" });

  // 2 · de dónde viene
  const de = hostDe(req.headers.get("origin") || req.headers.get("referer") || "");
  if (!esDeCasa(de)) {
    console.warn("llamada desde fuera:", (de || "(sin cabecera)").slice(0, 80));
    return json(403, { error: "Desde ahí no" });
  }

  // 3 · cuántas van. Ojo: el contador de Blobs SÍ es el mismo que el de la
  // función gemela —es el mismo cajón—, así que con él el techo deja de ser el
  // doble por tener dos funciones. Sin él, cada una cuenta por su lado.
  let frenado = await frenoCompartido(ipDe(req));
  if (frenado === null) frenado = pasaElFreno(req);
  if (frenado) {
    console.warn("freno:", frenado, ipDe(req));
    return json(429, { error: "Demasiadas peticiones", motivo: frenado });
  }

  const clave = buscarClave();
  if (!clave) return json(200, { sinClave: true });

  let cuerpo;
  try { cuerpo = await req.json(); }
  catch (e) { return json(400, { error: "Cuerpo ilegible" }); }

  if (!cuerpo.system || !Array.isArray(cuerpo.messages))
    return json(400, { error: "Faltan system o messages" });

  // 1 · esto solo hace planes de Naira, y nada más
  if (String(cuerpo.system).slice(0, 500).indexOf(FIRMA) < 0) {
    console.warn("system que no es el de Naira");
    return json(400, { error: "Esto solo sirve para los planes de Naira" });
  }
  if (String(cuerpo.system).length > 40000)
    return json(413, { error: "Prompt demasiado largo" });
  if (cuerpo.messages.length !== 1 || cuerpo.messages[0].role !== "user")
    return json(400, { error: "Una sola pregunta" });
  if (JSON.stringify(cuerpo.messages).length > 60000)
    return json(413, { error: "Mensaje demasiado largo" });

  let r;
  try {
    r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": clave,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1800,
        stream: true,
        system: cuerpo.system,
        messages: cuerpo.messages
      })
    });
  } catch (e) {
    console.error("Fallo hablando con la API:", e && e.message);
    return json(502, { error: "No se pudo contactar con la API" });
  }

  if (!r.ok || !r.body) {
    const detalle = await r.text().catch(() => "");
    console.error("La API respondio", r.status, detalle.slice(0, 300));
    return json(502, { error: "La API respondió " + r.status, detalle: detalle.slice(0, 200) });
  }

  /* Lo que va saliendo. La API manda su propio formato de eventos y aquí se
     traduce a uno más simple —una línea `data:` por trocito de texto— para que
     el navegador no tenga que saber nada de la API. Así, si mañana cambia el
     formato de allá, cambia solo este fichero.
     Y los errores de mitad de camino también viajan: cuando la cabecera ya se
     mandó no se puede devolver un 502, así que se manda un evento `error` y el
     navegador decide si cae al relato local. */
  const flujo = new ReadableStream({
    async start(control) {
      const enc = new TextEncoder();
      const manda = (o) => control.enqueue(enc.encode("data: " + JSON.stringify(o) + "\n\n"));
      const lector = r.body.getReader();
      const dec = new TextDecoder();
      let resto = "";
      try {
        for (;;) {
          const { done, value } = await lector.read();
          if (done) break;
          resto += dec.decode(value, { stream: true });
          const lineas = resto.split("\n");
          resto = lineas.pop();                  // la última puede venir a medias
          for (const linea of lineas) {
            if (!linea.startsWith("data:")) continue;
            const crudo = linea.slice(5).trim();
            if (!crudo || crudo === "[DONE]") continue;
            let ev;
            try { ev = JSON.parse(crudo); } catch (e) { continue; }
            if (ev.type === "content_block_delta" && ev.delta && typeof ev.delta.text === "string")
              manda({ t: ev.delta.text });
            else if (ev.type === "error")
              manda({ error: (ev.error && ev.error.message) || "error de la API" });
          }
        }
        manda({ fin: true });
      } catch (e) {
        console.error("se cortó el flujo:", e && e.message);
        manda({ error: "se cortó a mitad" });
      } finally {
        control.close();
      }
    }
  });

  return new Response(flujo, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive"
    }
  });
};

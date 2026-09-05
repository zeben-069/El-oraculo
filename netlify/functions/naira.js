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
var CASA = /(^https?:\/\/localhost)|(^https?:\/\/127\.0\.0\.1)|(\.netlify\.app$)|(^https?:\/\/[^/]*naira)/i;

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
    return {
      statusCode: 200,
      headers: cabeceras,
      body: JSON.stringify({
        funcion: "viva",
        formato: "clasico",
        claveEncontrada: !!k,
        // Antes esto enseñaba doce caracteres de la clave. Son el prefijo y no
        // el secreto, pero esta URL es pública y enseñar trozos de una clave
        // en público es una costumbre que un día sale cara.
        pista: k ? "empieza por sk-ant- y tiene " + k.length + " caracteres"
                 : "ninguna variable empieza por sk-ant-",
        variablesVistas: Object.keys(process.env || {}).length
      }, null, 2)
    };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: cabeceras, body: JSON.stringify({ error: "Solo POST" }) };
  }

  // 2 · de dónde viene
  var h = event.headers || {};
  var de = h.origin || h.referer || h.Origin || h.Referer || "";
  if (de && !CASA.test(de)) {
    console.warn("llamada desde fuera:", de.slice(0, 80));
    return { statusCode: 403, headers: cabeceras, body: JSON.stringify({ error: "Desde ahí no" }) };
  }

  // 3 · cuántas van
  var frenado = pasaElFreno(event);
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

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
        pista: k ? k.slice(0, 12) + "..." : "ninguna variable empieza por sk-ant-",
        variablesVistas: Object.keys(process.env || {}).length
      }, null, 2)
    };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: cabeceras, body: JSON.stringify({ error: "Solo POST" }) };
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

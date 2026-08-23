// tiempo.js — el parte de AEMET para el municipio del plan
//
// Vive en el servidor, como naira.js, porque la clave de AEMET no puede
// quedar a la vista en el navegador.
//
// LA CLAVE
//   Ponga en Netlify una variable con la clave de AEMET. Da igual el nombre:
//   la función busca cualquier variable cuyo valor sea largo y NO empiece por
//   "sk-ant-" (esa es la de Anthropic). También reconoce los nombres típicos.
//
// CÓMO SE USA
//   /.netlify/functions/tiempo?municipio=38031
//   El código es el del INE, cinco cifras. Ejemplo: Santa Cruz = 38038.
//
// COMPROBAR
//   /.netlify/functions/tiempo?probar=1

function buscarClaveAemet() {
  var env = process.env || {};
  var preferidos = ["AEMET", "AEMET_API_KEY", "AEMET_KEY", "CLAVE_AEMET"];
  for (var i = 0; i < preferidos.length; i++) {
    if (env[preferidos[i]]) return env[preferidos[i]];
  }
  // Las claves de AEMET son cadenas largas tipo JWT (tres partes con puntos)
  var nombres = Object.keys(env);
  for (var j = 0; j < nombres.length; j++) {
    var v = env[nombres[j]];
    if (typeof v !== "string") continue;
    if (v.indexOf("sk-ant-") === 0) continue;
    if (v.length > 100 && v.split(".").length === 3) return v;
  }
  return null;
}

// Memoria dentro de la función: mientras el servidor siga caliente, el parte
// del mismo municipio no se vuelve a pedir. AEMET limita mucho las peticiones
// y así se evita el 429.
var CACHE = {};
var VIDA_MS = 3 * 60 * 60 * 1000;   // tres horas: el parte diario no cambia más

function esperar(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

// AEMET responde con un enlace y hay que ir a buscarlo: son dos saltos.
// Si contesta 429 (demasiadas peticiones), se espera y se reintenta.
async function pedirAemet(url, clave) {
  var espera = 900;
  for (var intento = 0; intento < 3; intento++) {
    var r1 = await fetch(url, { headers: { api_key: clave } });
    if (r1.status === 429) {
      if (intento === 2) throw new Error("AEMET está limitando las peticiones (429). Inténtelo en un minuto.");
      await esperar(espera);
      espera *= 2;
      continue;
    }
    if (!r1.ok) throw new Error("AEMET respondió " + r1.status);
    var meta = await r1.json();
    if (!meta.datos) throw new Error("AEMET no devolvió enlace de datos");
    var r2 = await fetch(meta.datos);
    if (r2.status === 429) {
      if (intento === 2) throw new Error("AEMET está limitando las peticiones (429).");
      await esperar(espera);
      espera *= 2;
      continue;
    }
    if (!r2.ok) throw new Error("El enlace de datos respondió " + r2.status);
    return await r2.json();
  }
  throw new Error("AEMET no respondió tras varios intentos");
}

exports.handler = async function (event) {
  var cabeceras = {
    "Content-Type": "application/json",
    // se puede cachear una hora: el parte no cambia cada minuto
    "Cache-Control": "public, max-age=3600"
  };
  var q = event.queryStringParameters || {};
  var clave = buscarClaveAemet();

  if (q.probar) {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        funcion: "viva",
        claveAemetEncontrada: !!clave,
        pista: clave ? clave.slice(0, 14) + "..." : "no encuentro ninguna clave de AEMET"
      }, null, 2)
    };
  }

  if (!clave) {
    return { statusCode: 200, headers: cabeceras, body: JSON.stringify({ sinClave: true }) };
  }

  var muni = (q.municipio || "").replace(/\D/g, "");
  if (muni.length !== 5) {
    return { statusCode: 400, headers: cabeceras, body: JSON.stringify({ error: "Falta el código de municipio (5 cifras)" }) };
  }

  // ¿lo tenemos guardado y todavía fresco?
  var guardado = CACHE[muni];
  if (guardado && (Date.now() - guardado.cuando) < VIDA_MS) {
    return { statusCode: 200, headers: cabeceras, body: JSON.stringify(guardado.datos) };
  }

  try {
    var base = "https://opendata.aemet.es/opendata/api";
    var datos = await pedirAemet(base + "/prediccion/especifica/municipio/diaria/" + muni, clave);
    var d = (datos && datos[0]) || {};
    var dias = (d.prediccion && d.prediccion.dia) || [];

    var salida = dias.slice(0, 4).map(function (x) {
      var estado = (x.estadoCielo || []).filter(function (e) { return e.descripcion; });
      var viento = (x.viento || []).filter(function (v) { return v.velocidad; });
      return {
        fecha: (x.fecha || "").slice(0, 10),
        cielo: estado.length ? estado[0].descripcion : null,
        prob_lluvia: (x.probPrecipitacion || []).reduce(function (a, p) {
          return Math.max(a, Number(p.value) || 0);
        }, 0),
        max: x.temperatura ? x.temperatura.maxima : null,
        min: x.temperatura ? x.temperatura.minima : null,
        viento_kmh: viento.length ? Number(viento[0].velocidad) : null,
        viento_dir: viento.length ? viento[0].direccion : null,
        uv: x.uvMax != null ? Number(x.uvMax) : null
      };
    });

    var respuesta = {
      municipio: d.nombre || null,
      provincia: d.provincia || null,
      elaborado: d.elaborado || null,
      dias: salida,
      fuente: "AEMET — Agencia Estatal de Meteorología"
    };
    CACHE[muni] = { cuando: Date.now(), datos: respuesta };
    return { statusCode: 200, headers: cabeceras, body: JSON.stringify(respuesta) };
  } catch (e) {
    console.error("Fallo con AEMET:", e && e.message);
    // Antes que quedarnos sin nada, se devuelve el último parte guardado
    if (guardado) {
      return {
        statusCode: 200,
        headers: cabeceras,
        body: JSON.stringify(Object.assign({}, guardado.datos, { algo_viejo: true }))
      };
    }
    return { statusCode: 502, headers: cabeceras, body: JSON.stringify({ error: String(e && e.message) }) };
  }
};

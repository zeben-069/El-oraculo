# Naira · guía de Tenerife

Una guía que arma el plan del día para un turista en Tenerife: dónde ir, dónde
comer y a qué hora, según dónde se aloje, si lleva coche, si va con niños y qué
le apetece. Habla español, inglés y alemán.

Desplegada en Netlify: <https://leafy-cobbler-d24e23.netlify.app>

> El contexto largo del proyecto —las decisiones del motor y **por qué** se
> tomaron, las trampas conocidas y cómo trabajar en esto— está en
> [`CLAUDE.md`](CLAUDE.md). Conviene leerlo antes de tocar el motor.

## Qué hay aquí

| Fichero | Qué es |
| --- | --- |
| `index.html` | Todo: datos, CSS, motor de planificación y prompt (~1,1 MB) |
| `datos/` | Senderos del Cabildo, hitos históricos y miradores |
| `netlify/functions/naira.js` | Proxy a la API, para que la clave no salga del servidor |
| `netlify/functions/tiempo.js` | El parte de AEMET (dos saltos, con reintentos) |
| `banco.js` | Ejecuta el motor real fuera del navegador, con un DOM de mentira |
| `prueba.js` / `lote.js` | Pruebas del motor sin navegador |
| `probar-web.js` | Siete flujos en Chrome con Playwright, contra la web desplegada |
| `cabeceras-senderos.js` | Lee el geojson de itinerarios del Cabildo |
| `generar-imagen.html` | Rehace la imagen de compartir con las tipografías buenas |

Los datos viven dentro de `index.html` como constantes: 589 lugares, 318
restaurantes, 148 eventos y 31 municipios. Las fotos de las fichas están en
`img/estampas/`, una por municipio.

## Probar

Sin navegador, ejecutando el motor de verdad:

```
node prueba.js     # unos pocos escenarios, con detalle
node lote.js       # 24 planes en 21 municipios, con banderas
```

`lote.js` es el que hay que pasar **después de tocar el motor**. Marca
DISPERSO, SALTO, CIERRE-LEJOS, COMIDA-LEJOS, RECINTO y CURVAS-NOCHE.
Referencia actual: dispersión mediana 4 km, cero banderas salvo 3 planes con la
comida lejos (por escasez de restaurantes abiertos, no por lógica) y 3 días de
2 paradas (por la regla del sentido único).

Y siempre, antes de dar nada por bueno:

```
node -e "const s=require('fs').readFileSync('index.html','utf8');
new Function(s.slice(s.indexOf('/* ===================== DATOS'),s.lastIndexOf('</script>')));
console.log('sintaxis OK');"
```

Con navegador, contra la web desplegada (hace falta Playwright):

```
npm i -D playwright && npx playwright install chromium
node probar-web.js                       # o: node probar-web.js https://otra-url
```

Recorre siete flujos en Chrome, deja las capturas en `capturas/` y —lo que más
importa— recoge los errores de consola, que no se ven en pantalla.

## Desplegar

Sitio estático servido desde la raíz; `netlify.toml` le señala a Netlify la
carpeta de funciones y publica `/api/naira`. Las claves se ponen como variables
de entorno en Netlify y **no van en el código**:

- la clave de la API para `naira.js` (la que empieza por `sk-ant-`);
- la clave de AEMET para `tiempo.js` (`AEMET`, `AEMET_API_KEY`, `AEMET_KEY` o
  `CLAVE_AEMET`).

## Lo que falta

La lista viva está al final de `CLAUDE.md`. Lo más gordo que queda: partir
`index.html`, que sigue llevando datos, CSS, motor y prompt en una sola pieza.

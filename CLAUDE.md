# Naira — guía turística de Tenerife

Contexto del proyecto. Léelo entero antes de tocar nada: aquí están las
decisiones y, sobre todo, **por qué** se tomaron. Varias parecen raras hasta
que se sabe qué fallo arreglaron.

---

## Qué es

Una guía que arma el plan del día para un turista en Tenerife: dónde ir,
dónde comer y a qué hora, según dónde se aloje, si lleva coche, si va con
niños y qué le apetece. Habla español, inglés y alemán.

El autor, **Zeben, vive en Tenerife**. Su conocimiento local es la fuente
más valiosa del proyecto y ha corregido cosas que ningún dato abierto tenía.
Cuando él dice que algo está mal, está mal.

## Estado

Desplegado en Netlify: `https://leafy-cobbler-d24e23.netlify.app`

## Estructura

```
index.html                    TODO: datos, CSS, motor, prompt (~2,3 MB)
manifest.webmanifest          para instalar en la pantalla de inicio
icono.svg / icono-*.png
img/naira-social.jpg          previsualización al compartir
netlify.toml
netlify/functions/naira.js    proxy a la API (guarda la clave)
netlify/functions/tiempo.js   AEMET, dos saltos con reintentos
datos/hitos-historicos.js     46 hitos del itinerario de Santa Cruz
datos/senderos-anaga.js       7 caminos de Anaga (CARGADO PERO SIN USAR)
datos/senderos-tenerife.js    225 itinerarios del Cabildo con desnivel
datos/miradores.js            18 miradores de Santa Cruz
```

**La deuda técnica principal:** `index.html` son 2,3 MB de una pieza, y el
55% son 31 fotos de municipio en base64 dentro del código. Sacarlas a
ficheros y partir el archivo es lo que más facilitaría todo lo demás.

## Los datos

Dentro de `index.html`, como constantes:

- `LUGARES` (589) — sitios que visitar. Solo 4 sin coordenadas.
- `REST` (318) — restaurantes, incluidas 38 heladerías.
- `EVENTOS` (148) — fiestas. **Sin coordenadas**, solo municipio y corredor.
- `BASES` (31) — los municipios, con su centro y corredor.
- `ESTAMPA` (31) — las fotos en base64.

Campos que el motor usa de un `LUGAR`: `n` nombre, `m` municipio, `c`
corredor, `fr` franja, `dur` minutos, `tipo`, `w` peso, `et` etiquetas,
`ninos`, `seg` aviso de seguridad, `la`/`lo`, `flex` (puede cambiar de
franja), `bus` metros a la parada de guagua, `carretera:'dura'`,
`recinto` (día completo de pago), `sub` desnivel, `mts` largo, `mat`
matrícula oficial, `desc` descripción del Cabildo, `bic`, `pos_aprox`.

---

## Las reglas del motor y por qué existen

Cada una nació de un plan malo de verdad. No las quites sin entender cuál.

**El alcance se mide en kilómetros, no en etiquetas.** Antes filtraba por
corredor y eso obligaba a que alguien clasificara cada sitio a mano; en las
fronteras fallaba. Las piscinas de Bajamar estaban fichadas en Anaga siendo
La Laguna, así que desde Tegueste, a 4,4 km, **no podían salir nunca**. Radio:
18 km con coche, 10 sin, 8 si piden algo tranquilo. Los corredores siguen ahí
para calcular tiempos de viaje y para los eventos, que no tienen coordenadas.

**Cada parada se mide contra la ANTERIOR, no solo contra el alojamiento.**
Este fue el peor. Bajamar está a 8,2 km de La Laguna y la Playa de La Nea a
9,3 — las dos "cerca de casa" — pero **17 km la una de la otra**, cruzando la
isla después de una tarde en el agua. Penalización 1,4 por km más allá de 3.

**El día cierra cerca de casa.** Doble penalización por distancia en la
última franja. Un atardecer a 20 km significa conducir de noche después.

**Carreteras duras, solo por la mañana.** Taganana, Chamorga, Teno Alto,
Masca y Chinamada: 65 sitios marcados. Al atardecer, −20 puntos.
Ojo: la penalización mira la franja **de la casilla**, no la de la ficha.
Un sitio con `flex` puede estar fichado como «mañana» y acabar de cierre.

**Los recintos de pago se excluyen, no se penalizan.** Siam Park, Loro
Parque, Aqualand, Parque Marítimo, Lago Martiánez. Ahí se echa el día
entero, no se pasa dos horas. Con −30 puntos se colaban igual en cuanto los
rivales cargaban con la penalización de la guagua. Se ofrecen aparte, en
`o_si_prefieren_un_recinto`.

**Sin coche manda la guagua.** 3.872 paradas de TITSA cruzadas: cada ficha
tiene `bus` en metros. Antes «sin coche» solo acortaba el radio y salía el
mismo plan que con coche en cuatro de cuatro bases.

**Con niños gana lo divertido.** `diversion` +7, aviso de seguridad −12.
Antes «van con niños» solo descartaba lo peligroso y luego elegía igual que
para una pareja: salía la casa de un coleccionista por delante del Museo de
la Ciencia y el Cosmos.

**El reloj recorta el día.** Si el plan es para hoy, no se ofrece nada de
por la mañana a las seis de la tarde.

**Si piden algo y no lo hay en el radio, se abre el radio.** Alguien elegía
La Laguna y pedía playa; el foco recortaba a 7 km, ahí no hay costa, y le
montaba un día de museos.

**La variedad de tipos no pisa lo que piden.** Se evita repetir tipo en el
mismo día, pero quien pide agua quiere agua: tras el charco de Bajamar
quedaban excluidos Punta del Hidalgo y Jover por ser también charcos.

**Las heladerías no son sitio de almorzar.** Marcadas con `remate`. Se
ofrecen al final, para cerrar la tarde con niños.

---

## Trampas conocidas

**Cuidado con los radios en línea recta.** Marcar «carretera dura» por radio
alrededor de tres zonas marcó 101 sitios, incluidas las Charcas de Erjos y el
Mirador de La Alegría, que están en carretera normal. Hubo que hacerlo por
núcleos concretos con radio corto. **La línea recta no sabe por dónde va el
asfalto.**

**El geojson de itinerarios del Cabildo trae las etiquetas mal puestas.**
`itinerario_distancia` contiene la altura máxima, `municipios_nombres` el
desnivel, todo corrido. `cabeceras-senderos.js` lee por posición.

**Los ficheros del Cabildo vienen con BOM.** `JSON.parse` se atraganta.

**Los municipios del registro vienen como «OROTAVA (LA)» y en mayúsculas.**
Reconstruir el nombre bonito da «Santa Cruz De Tenerife» y «GÜImar». Lo que
funciona es comparar sin acentos ni artículos contra los que ya existen.

**El registro de hostelería no trae coordenadas**, solo la calle. Lo que se
añade desde ahí va con `pos_aprox`, y entonces el botón de mapa busca por
nombre en vez de navegar a una chincheta inventada.

**Google Maps: `/maps/dir/?destination=` para navegar.** `/maps/search/?query=`
busca en la zona y enseña el negocio de al lado en vez del punto.

---

## Cómo probar

**Sin navegador** — ejecuta el motor real con un DOM de mentira:

```
node prueba.js     # unos pocos escenarios, con detalle
node lote.js       # 24 planes en 21 municipios, con banderas
```

`lote.js` es el que hay que pasar **después de tocar el motor**. Marca
DISPERSO, SALTO, CIERRE-LEJOS, COMIDA-LEJOS, RECINTO, CURVAS-NOCHE.
Referencia actual: dispersión mediana 4 km, cero banderas salvo 3 planes con
la comida lejos (por escasez de restaurantes abiertos, no por lógica) y 3
días de 2 paradas (por la regla del sentido único).

**Con navegador** — `probar-web.js` con Playwright recorre siete flujos en
Chrome contra la web desplegada y captura los errores de consola.

Y siempre, antes de dar nada por bueno:

```
node -e "const s=require('fs').readFileSync('index.html','utf8');
new Function(s.slice(s.indexOf('/* ===================== DATOS'),s.lastIndexOf('</script>')));
console.log('sintaxis OK');"
```

---

## Cómo trabajar en esto

**No inventes datos de sitios.** Naira presume de que «todas las cifras
salen del informe» y tiene un detector que lo comprueba. Si un sitio no
tiene descripción, se calla; no se rellena a ojo.

**Los avisos de seguridad no se tocan a la ligera.** Hubo una ficha que
decía a la vez que Bajamar tenía socorristas y que estaba clasificada como
PELIGROSA. Se resolvió contrastando con el portal oficial de turismo, no
borrando el aviso.

**Todo texto de interfaz pasa por `tr()`.** Hay 116 claves en tres idiomas
y las tres tienen que cuadrar. Se han colado pantallas enteras en español.

**Los datos nuevos entran por el informe, nunca por fuera.** El prompt es
largo (~2.600 palabras) a propósito: si añades un campo al informe y no lo
mencionas ahí, el modelo lo ignora. Ya pasó con todo un día de trabajo.

**Zeben corrige.** Si dice que una playa no es buena con niños o que un
restaurante está mal ubicado, tiene razón: vive allí.

---

## Pendiente

- **Sacar las imágenes del HTML.** 1.169 KB en base64, el 55% del fichero.
- **Partir `index.html`** en varios ficheros.
- `datos/senderos-anaga.js` está cargado y no lo usa nadie.
- Falta la opción **«pareja»** en la pregunta de con quién van: solo hay
  «Familia con niños» y «Grupo, sin niños».
- Pocos restaurantes abiertos en domingo en algunos municipios (Arona: 15
  en 18 km). Es escasez de catálogo.
- La imagen de compartir está dibujada a mano; `generar-imagen.html` la
  rehace en el navegador con las tipografías buenas.
- Si algún día hay dominio propio, hay que cambiar la URL en **cuatro
  sitios** del `<head>`: canonical, og:url y las dos de imagen.
- **Búsqueda web: decidido que NO, por ahora.** Rompería el sello de «todo
  sale del informe», que es lo que diferencia a Naira. Y nunca para
  alergias o celiaquía: ahí la respuesta correcta es el teléfono del sitio.

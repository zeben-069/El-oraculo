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
index.html                    TODO: datos, CSS, motor, prompt (~1,1 MB)
manifest.webmanifest          para instalar en la pantalla de inicio
icono.svg / icono-*.png
img/naira-social.jpg          previsualización al compartir
img/estampas/*.jpg            las 31 fotos de municipio (una por ficha)
img/cartas/*.jpg              los 5 carteles de las preguntas con dibujo
netlify.toml
netlify/functions/naira.js    proxy a la API (guarda la clave)
netlify/functions/tiempo.js   AEMET, dos saltos con reintentos
datos/hitos-historicos.js     46 hitos del itinerario de Santa Cruz
datos/senderos-anaga.js       7 caminos de Anaga (CARGADO PERO SIN USAR)
datos/senderos-tenerife.js    225 itinerarios del Cabildo con desnivel
datos/miradores.js            18 miradores de Santa Cruz
```

**La deuda técnica principal:** `index.html` sigue siendo una sola pieza con
los datos, el CSS, el motor y el prompt dentro. Ya no lleva las fotos: las 31
estampas salieron a `img/estampas/` y el fichero pasó de 2,3 MB a 1,1 MB (208 KB
comprimido, contra 1,09 MB antes). Partir el archivo es lo que queda.

## Los datos

Dentro de `index.html`, como constantes:

- `LUGARES` (589) — sitios que visitar. Solo 4 sin coordenadas.
- `REST` (318) — restaurantes, incluidas 38 heladerías.
- `EVENTOS` (148) — fiestas. **Sin coordenadas**, solo municipio y corredor.
- `BASES` (31) — los municipios, con su centro y corredor.
- `ESTAMPA` (31) — por municipio, la ruta de su foto (`f`) y su lema.

Campos que el motor usa de un `LUGAR`: `n` nombre, `m` municipio, `c`
corredor, `fr` franja, `dur` minutos, `tipo`, `w` peso, `et` etiquetas,
`ninos`, `seg` aviso de seguridad, `la`/`lo`, `flex` (puede cambiar de
franja), `bus` metros a la parada de guagua, `carretera:'dura'`,
`recinto` (día completo de pago), `sub` desnivel, `mts` largo, `mat`
matrícula oficial, `desc` descripción del Cabildo, `bic`, `pos_aprox`.

---

## Las reglas del motor y por qué existen

Cada una nació de un plan malo de verdad. No las quites sin entender cuál.

**El día se arma alrededor del sitio pedido, no de la cama.** El radio de
candidatos sale del centro de gravedad del día: el sitio que eligió el turista,
o la fiesta que manda. Antes salía del alojamiento, y en una escapada eso
juntaba un sitio lejano con otros de casa: hubo días con Bajamar y Torviscas,
65 km. Medido sobre 124 días de escapada: de 45 días por encima de 25 km a
**cero**, y el máximo baja de 64,8 a 12,6 km. Sin ancla, ese centro ES el
alojamiento y no cambia nada. La regla del sentido único sigue midiendo desde
la cama, así que el día sigue cerrando de camino a casa — solo que dentro de
la zona del sitio pedido.

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

**Con niños gana lo divertido.** +9 a lo apto y divertido (playa, charco,
piscina, parque, museo, jardín marcados «niños: Sí»), +3 a todo lo marcado
«niños: Sí», aviso de seguridad −12. Antes «van con niños» solo descartaba lo
peligroso y luego elegía igual que para una pareja: salía la casa de un
coleccionista por delante del Museo de la Ciencia y el Cosmos. El peso alto
hace falta desde que los `flex` compiten en todas las franjas: con +3 los
senderos los desplazaban y los sitios «niños: Sí» bajaban al 42% de las
paradas. Ahora son el 67% (24% en pareja) y el plan con niños es distinto al
de pareja en el 99% de los casos.

**Los `flex` compiten en todas las franjas.** Marcar una ficha `flex` es decir
«esto vale a otra hora»; tenerlos de suplentes dejaba días cojos: 3 de 24
planes se quedaban en dos paradas y la dispersión máxima era de 12,7 km.
Compitiendo: 1 día de dos paradas y 9,6 km.

**El reloj recorta el día.** Si el plan es para hoy, no se ofrece nada de
por la mañana a las seis de la tarde.

**Si piden algo y no lo hay en el radio, se abre el radio.** Alguien elegía
La Laguna y pedía playa; el foco recortaba a 7 km, ahí no hay costa, y le
montaba un día de museos.

**La variedad de tipos no pisa lo que piden.** Se evita repetir tipo en el
mismo día, pero quien pide agua quiere agua: tras el charco de Bajamar
quedaban excluidos Punta del Hidalgo y Jover por ser también charcos.

**Ni el municipio ni la comida pedida pisan la cercanía.** El desvío a las
paradas se calcula ANTES de filtrar. Un filtro (mismo municipio, pescado,
canaria) solo se aplica si deja algo a menos de 6 km de alguna parada; si no,
lo pedido pasa delante pero lo de al lado sigue en la lista. Con el santuario
de La Laguna y una parada en El Rosario, el filtro de municipio tiraba los que
estaban a 100 metros de la segunda parada, y pedir pescado dejaba 7 sitios, los
7 en San Andrés a 12 km, habiendo 42 abiertos a menos de 6 km. Si lo que
pidieron queda lejos, va igual en la lista y el informe lo dice con el número
en `lo_que_pidieron_queda_lejos`: que elijan entre moverse o comer cerca.

**Cada sitio de comer viaja con su desvío.** `km_de_desvio` y
`queda_de_camino` en el informe, para el principal y para las alternativas.
Sin eso el modelo se lo inventaba: llegó a ofrecer tres restaurantes a doce
kilómetros como «alternativas sin rodeo».

**El restaurante se mide desde el día, no desde la cama.** El radio de
restaurantes (18 km con coche, 10 sin) sale del centro de gravedad del día
—el sitio que pidió el turista, o la fiesta que manda—, no del alojamiento.
Midiendo desde la cama, en una escapada salía ir a ver el drago de Icod y
almorzar en Arico. Y la rotación por día (`saltoComida`) gira **dentro** de
los que quedan a menos de 6 km de alguna parada: rotando sobre la lista
entera, el cuarto día empezaba a contar ya dentro de los lejanos. Las dos
cosas juntas: de 31 días malos de 124 a 2.

**El día no se remata siempre igual.** El remate se elige entre lo que hay
**de vuelta a casa**, rotando por fecha: un mirador al atardecer, un paseo por
el casco, un parque, un heladito o una tapita — y a veces dos combinados
(mirador y luego el helado). Nunca repite el tipo con el que ya cierra el día:
si el día acaba en un mirador, el remate no es otro mirador. Antes el cierre
tomando algo saltaba uno de cada tres días por semilla y el helado se ofrecía
siempre, así que todos los días remataban igual. Va en `parada_de_vuelta`,
`cerrar_tomando_algo` y `para_rematar_el_dia`; si no hay nada, no se ofrece
nada y el relato cierra con la última parada.

**En `seg` no todo es un peligro.** Conviven avisos de seguridad de verdad (50),
avisos de acceso (`seg_tipo:'acceso'`: pista de tierra, carretera estrecha,
obras, cortes por romería), notas que no avisan de nada (`'nota'`) y un aviso
sobre el relato de un sitio (`'relato'`). Sin etiqueta se trata como peligro,
que es lo prudente. Sin distinguir, la ficha de Las Teresitas —«la mejor para
familias de toda la zona metropolitana»— viajaba al informe como
`aviso_seguridad` y el modelo la leía como una advertencia. Ahora salen por
`ojo_para_llegar`, `nota_del_sitio` y `el_relato_no_esta_probado`.

**Las heladerías no son sitio de almorzar.** Marcadas con `remate`. Se
ofrecen al final, en `para_rematar_el_dia`, y ya no solo con niños: un helado
de camino al coche vale igual para dos adultos. Se buscan a 2,5 km de la
última parada y, si ahí no hay, junto a cualquier otra parada del día —el
informe dice junto a cuál en `junto_a`. Mirando solo la última, un día que
acababa en La Esperanza se quedaba sin remate teniendo cuatro heladerías a
400 m de la parada de la mañana.

---

## Trampas conocidas

**El ancla del turista pasa por un camino aparte.** Cuando eligen un sitio
concreto (o cuando la escapada siembra otra zona), `construir()` mete esa
parada antes del bucle. Ese trozo se ejecuta solo en ese caso, así que un
fallo ahí no lo ve `lote.js`, que nunca pone ancla: pruébalo a mano.

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

Ninguna prueba usa **la fecha de hoy**: para hoy el motor recorta el día según
la hora, así que una referencia con la fecha de hoy cambia sola con el paso de
las horas. Ya pasó con el bloque de perfiles.

`lote.js` es el que hay que pasar **después de tocar el motor**. Marca
DISPERSO, SALTO, CIERRE-LEJOS, COMIDA-LEJOS, RECINTO, CURVAS-NOCHE.
Referencia actual: dispersión mediana 4 km, cero banderas salvo 1 plan con la
comida lejos (Granadilla, dentro del mismo municipio) y 3 días de 2 paradas
(por la regla del sentido único). Eran 3 los de comida lejos, y no era escasez
de catálogo como se creía: era el filtro de municipio ganándole a la cercanía.

Trae doce planes **con ancla**, que es el camino que la tabla no
pisa: el sitio lo elige el turista y `construir()` lo mete antes del bucle.
Referencia: 0 reventones y 0 planes donde el sitio pedido no salga. Los
sitios no están escritos a mano —se sacan de los datos, el de más peso de
cada municipio— así que la prueba no se pudre al cambiar el catálogo.

Y cierra con la **escapada**: 4 días desde cada una de las 31 bases, 124 días.
Referencia: 0 reventones, 0 días por encima de 25 km de dispersión (mediana 8,
máximo 12,6) y 1 día con la comida a más de 8 km de toda parada — ese es en
Granadilla, dentro del mismo municipio, que es geografía y no lógica.

Y un bloque de **perfiles**: el mismo día en cuatro versiones (coche/guagua ×
pareja/niños) desde las 31 bases. Referencia: 0 sitios no aptos con niños, 67%
de paradas «niños: Sí» con niños contra 24% en pareja, 61% de tipo divertido,
1% de planes iguales entre pareja y niños, 54% iguales entre coche y guagua
—esos son legítimos: sitios que ya están junto a una parada— y 229 m de media
a la guagua sin coche.

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

**Todo texto de interfaz pasa por `tr()`.** Hay 142 claves en tres idiomas
y las tres tienen que cuadrar. Se han colado pantallas enteras en español.

**Lo que dice Naira también pasa por `tr()`.** Nueve preguntas suyas estaban
escritas en español a pelo —la zona, el municipio, el momento del día, el
«sorpréndame»— y un inglés las veía en español. Las que llevan hueco
(`qZonaDetalle`, `qQueVer`, `qMasSitios`) son funciones: `tr('qQueVer')(muni)`.

**Los carteles no llevan el rótulo dentro.** Las tres preguntas con dibujo
—coche o guagua, qué tipo de día y qué apetece comer— se pintan con
`cartas()`, y el rótulo va
DEBAJO, sacado de `tr()`. Los carteles originales traían el texto incrustado
y en español: así no valían en inglés ni en alemán. Se recortaron por el
círculo, y si se añaden más hay que hacer lo mismo.

**Los datos nuevos entran por el informe, nunca por fuera.** El prompt es
largo (~2.600 palabras) a propósito: si añades un campo al informe y no lo
mencionas ahí, el modelo lo ignora. Ya pasó con todo un día de trabajo.

**Zeben corrige.** Si dice que una playa no es buena con niños o que un
restaurante está mal ubicado, tiene razón: vive allí.

---

## Pendiente

- **Partir `index.html`** en varios ficheros.
- `datos/senderos-anaga.js` está cargado y no lo usa nadie.
- La pregunta de con quién van sí tiene las tres opciones («Dos adultos»,
  «Familia con niños», «Grupo, sin niños»). Guarda en `S.gente` el **número**
  de personas (2, 4 o 6), no una etiqueta: quien compare con cadenas se lleva
  una rama muerta, que es justo lo que le pasaba al aviso de aforo.
- La pregunta de qué comer ofrece dos cartas (comida típica / un poco de todo).
  El pescado salió de ahí, pero el motor sigue sabiendo filtrarlo y el menú de
  «cambiar dónde comer» lo mantiene.
- Pocos restaurantes abiertos en domingo en algunos municipios (Arona: 15
  en 18 km). Es escasez de catálogo.
- Los nombres del registro que venían dados la vuelta ya están enderezados
  («Heladeria, la» → «La Heladería»; «El Tanque, Espacio Cultural» → «Espacio
  Cultural El Tanque»). Si se importa más registro, volverán a aparecer.
- Sin coche salen paradas a 1,7–2,3 km de la parada de guagua (19 de 744
  planes barridos, todas senderos y paisajes). El informe lo dice en
  `guagua_mas_cercana`, así que no se oculta, pero está sin decidir si debería
  descartarlas. Probé a penalizar el cierre y a acortar el radio sin coche: no
  mejoró nada medible y empeoraba esto, así que se quitó.
- Falta foto de los sitios (playas, museos). Hay estampa por municipio, no por
  sitio.
- La imagen de compartir está dibujada a mano; `generar-imagen.html` la
  rehace en el navegador con las tipografías buenas.
- Si algún día hay dominio propio, hay que cambiar la URL en **cuatro
  sitios** del `<head>`: canonical, og:url y las dos de imagen.
- **Búsqueda web: decidido que NO, por ahora.** Rompería el sello de «todo
  sale del informe», que es lo que diferencia a Naira. Y nunca para
  alergias o celiaquía: ahí la respuesta correcta es el teléfono del sitio.

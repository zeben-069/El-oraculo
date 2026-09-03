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
index.html                    el motor y la interfaz (~228 KB)
estilos.css                   el CSS (27 KB)
prompt.js                     el prompt de Naira (18 KB)
datos/lugares.js              LUGARES (328 KB)
datos/restaurantes.js         REST (118 KB)
datos/eventos.js              EVENTOS · datos/bases.js · datos/estampas.js
datos/titsa-matriz.js         MATRIZ (338 KB) · datos/titsa-regreso.js · datos/ine.js
manifest.webmanifest          para instalar en la pantalla de inicio
icono.svg / icono-*.png
img/naira-social.jpg          previsualización al compartir
img/estampas/*.jpg            las 31 fotos de municipio (una por ficha)
img/cartas/*.jpg              los 10 carteles de las preguntas con dibujo
img/zonas/*.jpg               las 6 franjas de las zonas de la isla
netlify.toml
netlify/functions/naira.js    proxy a la API (guarda la clave)
netlify/functions/tiempo.js   AEMET, dos saltos con reintentos
datos/hitos-historicos.js     46 hitos del itinerario de Santa Cruz
datos/senderos-anaga.js       7 caminos de Anaga (CARGADO PERO SIN USAR)
datos/senderos-tenerife.js    225 itinerarios del Cabildo con desnivel
datos/miradores.js            18 miradores de Santa Cruz
empaquetar.js                 arma el zip que se suelta en Netlify Drop
fotos.js                      la lista de fotos que faltan, y las mete
fotos-buscar.js               busca candidatas en Commons (se ejecuta en su máquina)
plantilla-buscar.html         el molde de la página de elegir fotos
buscar-fotos.html             esa página ya con los 82 sitios dentro
miradores.js                  arma la página de miradores, y mete los elegidos
plantilla-miradores.html      su molde
buscar-miradores.html         esa página, lista para abrir
eventos.js                    arma la página de pegar fiestas, y mete las marcadas
plantilla-eventos.html        su molde
pegar-eventos.html            esa página, lista para abrir
```

**`index.html` ya está partido.** Era una sola pieza de 1,1 MB con los datos,
el CSS, el motor y el prompt dentro; ahora son 228 KB de motor e interfaz, y
los 827 KB de datos, los 27 de CSS y los 18 del prompt viven en ficheros
aparte que el navegador carga con su propio `<script>` antes que el motor.
Como son `<script>` clásicos, las constantes de nivel superior siguen estando
disponibles para el motor igual que cuando vivían dentro.

**Quien toque los ficheros de datos, que sepa esto:** `banco.js` los junta en
el orden en que aparecen en `index.html` —los lee de las etiquetas `<script
src=...>`, no de una lista escrita a mano—, así que añadir otro fichero de
datos no obliga a tocar las pruebas. Y `fotos.js` escribe en
`datos/lugares.js`, no en `index.html`.

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

**Qué se mueve estos días.** Las 148 fiestas solo se veían si caían justo en
la fecha elegida. `agenda()` saca las de los próximos 21 días, ordenadas por
día y por lo que se tarda en llegar; elegir una salta la fecha del plan a ese
día y la fiesta manda. No hay agenda oficial de las fiestas de los 31
municipios: esto es de lo poco que Naira ofrece y no se encuentra en otro
sitio, y es lo que mueve al turista fuera de los cuatro sitios de siempre.

**Cuando manda un ancla, algo tiene que tirar HACIA ella.** El día tenía una
sola fuerza, la de volver a casa, así que con una romería en Arafo las paradas
se pegaban al borde del radio por el lado de casa: 11 km de la fiesta, en El
Rosario. Con el contrapeso (1,2 por km más allá de 3 desde el ancla): 5,7 km
y comiendo en Arafo. En Güímar, de 12,8 km a 1,4. La dispersión mediana de la
escapada baja de 7,4 a 5,2 km y los 24 planes de un día no se mueven.

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

**La carta que pulsan promete algo concreto, y si no lo hay se dice.** La
carta de «Senderos» dibuja gente andando, pero el filtro de detrás
(`TIPOS_DIA.naturaleza`) también deja pasar miradores, árboles y áreas
recreativas. En Santa Úrsula, que **no tiene un solo sendero fichado**, el ancla
salía Mirador de Chipeque y el panel lo daba por bueno en verde: nadie se
enteraba de que lo pedido no estaba. Ahora hay un `NUCLEO_DIA` —lo que la carta
promete de verdad— y tres escalones: uno del núcleo en el pueblo; si no, uno a
menos de 6 km aunque sea de otro término (los dos senderos de La Matanza están
a 5,2 km del centro de Santa Úrsula y **no podían salir nunca**, que es otra vez
lo de Bajamar y Tegueste); y si tampoco, se ancla en lo mejor que haya **y se
dice**, por `no_hay_de_lo_que_pidieron_para_ver`. De 108 combinaciones de
comarca × carta: 79 dan lo pedido en el pueblo, 22 lo traen de al lado y 7 se
avisan. Y si el pueblo tiene uno pero lejos del casco —el museo de Vilaflor
está a 7,5 km, subiendo al Teide— no se dice «no hay»: se dice que lo hay y a
cuánto, por `lo_hay_pero_lejos_del_pueblo`.

**El núcleo de museos abarca a propósito, y por eso el rótulo cambió.** Un día
de museos en un pueblo de aquí es el casco, la iglesia, la plaza y el caserío
tanto como el museo; apretarlo a `/^Museo/` dejaba 18 comarcas sin respuesta
—Candelaria, Güímar, Arafo, Guía de Isora— teniendo un casco declarado a
doscientos metros. Pero abarcar más con la carta diciendo «Museos» a secas es
otra vez prometer una cosa y dar otra. Lo que arregla las dos es el **rótulo**:
`cMuseos` dice «Museos y cascos» / «Museums and old towns» / «Museen und
Altstädte», y entonces el filtro ancho es lo que promete. Con eso: 33 comarcas
dan lo pedido en el pueblo, 3 lo traen de al lado y **ninguna** se queda sin
respuesta. El aviso sigue saltando donde toca —senderos en Fasnia, playa en
Vilaflor—, que ahí no es una etiqueta ancha, es que no lo hay.

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

**El regalo de camino.** Entre la cama y la primera parada suele quedar un
mirador a un paso de la carretera. En un mirador se está media hora, se sacan
dos fotos y se ve media isla: no es una parada, es lo que suelta quien vive
aquí. Va en `de_camino_al_primer_sitio`, medido por **desvío** —lo que se
alarga el viaje por pasar— como los restaurantes, no en línea recta: hasta 3
km, y solo con coche, que a quien va en guagua no puedes decirle que se baje a
mitad de trayecto. Sale en el 12% de los planes, con 1,2 km de desvío mediano;
el techo es el catálogo, que solo tiene **25 miradores**. El de vuelta ya
existía: es una de las rotaciones del remate. Lo que cambió ahí es el tono, en
el prompt: el de ida se cuenta como un regalo y el de vuelta como un secreto.

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

**El mapa encuadra el DÍA, no la carretera hasta el día.** Durmiendo en
Buenavista con el plan en Santa Úrsula, la cama queda a 39 km y estiraba el
encuadre hasta dejar el día entero en una esquina: la parada y el restaurante,
a 5 km uno de otro, salían pegados. Y se pintaban **las cinco** opciones de
comer, que en Santa Úrsula caen en 500 metros: cinco chinchetas una encima de
otra tapando la del sitio que se propone. Ahora el `fitBounds` ignora la clase
`base` —la cama se sigue pintando y la leyenda avisa con los km si queda
fuera— y al mapa solo va el restaurante propuesto y el remate; las
alternativas están en la lista de abajo con su teléfono.

**Cuidado al añadir campos al informe: los nombres se pisan sin avisar.**
`no_hay_de_lo_que_pidieron` ya estaba cogido por la comida. Al reusarlo para
los sitios, siendo el mismo objeto literal, la última clave ganaba y la nueva
se perdía **entera y sin error**. Se llama
`no_hay_de_lo_que_pidieron_para_ver`.

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

`herramientas-horarios.js` cruza el texto del horario de cada restaurante con
su array de días abiertos y canta las contradicciones. Referencia: de 318
restaurantes, 76 mencionan días de cierre y **cero se contradicen**.

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
node -e "const c=require('./banco.js'); console.log('sintaxis OK ·',c.LUGARES.length,'sitios')"
```

Eso compila **las piezas juntas**, en el mismo orden que el navegador: si un
fichero de datos se queda a medias o el motor no cuadra con ellos, salta ahí.

---

## Cómo trabajar en esto

**No inventes datos de sitios.** Naira presume de que «todas las cifras
salen del informe» y tiene un detector que lo comprueba. Si un sitio no
tiene descripción, se calla; no se rellena a ojo.

**Los avisos de seguridad no se tocan a la ligera.** Hubo una ficha que
decía a la vez que Bajamar tenía socorristas y que estaba clasificada como
PELIGROSA. Se resolvió contrastando con el portal oficial de turismo, no
borrando el aviso.

**Elegir sitio es elegir PUEBLO y TIPO, no un nombre de una lista.** Zona →
pueblo → qué tipo de día (senderos, playas, museos, un poco de todo), y el
ancla la pone el motor: el sitio de más peso de ese tipo **a menos de 6 km del
centro urbano** del pueblo. Antes salía la lista de los treinta sitios del
municipio, y un turista recién llegado no puede elegir lo que no conoce. El
centro es el de `BASES`, no el centroide de los sitios: La Orotava va de la
costa a la cumbre y con el centroide ganaba el Observatorio del Teide, a 10 km
y 2.400 m de altura. Quien sí sabe lo que quiere ver tiene el botón «Prefiero
elegir el sitio yo».

**Todo texto de interfaz pasa por `tr()`.** Hay 182 claves en tres idiomas
y las tres tienen que cuadrar. Se han colado pantallas enteras en español.

**La leyenda del mapa también.** Los cuatro rótulos —«Dónde duermen», «La
ruta del día», «Dónde comer», «Para el bañito»— y los globos de las chinchetas
estaban escritos en español a pelo: en inglés y en alemán el mapa seguía
hablando español. Van por `capCama`, `capRuta`, `capComer`, `capAgua` y
`gRemate`, y el tipo del sitio por `tipoTr()`.

**Lo que dice Naira también pasa por `tr()`.** Nueve preguntas suyas estaban
escritas en español a pelo —la zona, el municipio, el momento del día, el
«sorpréndame»— y un inglés las veía en español. Las que llevan hueco
(`qZonaDetalle`, `qQueVer`, `qMasSitios`) son funciones: `tr('qQueVer')(muni)`.

**Las zonas van con el rótulo ENCIMA, sobre un velo.** Son franjas anchas y
bajas, y el rótulo cabe dentro. El velo (un degradado oscuro de izquierda a
derecha) no es adorno: las seis fotos tienen brillos muy distintos —el casco
de La Orotava es casi blanco y el monteverde de Anaga casi negro— y un texto
claro sin velo se pierde en unas y canta en otras. Los nombres de zona
también salen de `tr()`: estaban escritos en español a pelo. Los corredores,
que son lo que usa el motor, no se traducen.

**Los carteles no llevan el rótulo dentro.** Las cuatro preguntas con dibujo
—coche o guagua, con quién viajan, qué tipo de día y qué apetece comer— se
pintan con `cartas()`, y el rótulo va
DEBAJO, sacado de `tr()`. Los carteles originales traían el texto incrustado
y en español: así no valían en inglés ni en alemán. Se recortaron por el
círculo, y si se añaden más hay que hacer lo mismo. Los de «con quién viajan»
son apaisados y con forma de bocadillo: van uno por fila, con `ancho:true`, y
se pintan con `object-fit:contain` sobre el color del fondo, porque
recortarlos por el centro les cortaría el pico.

**Los datos nuevos entran por el informe, nunca por fuera.** El prompt es
largo (~2.600 palabras) a propósito: si añades un campo al informe y no lo
mencionas ahí, el modelo lo ignora. Ya pasó con todo un día de trabajo.

**Los festivos no se escriben a mano.** La matriz de TITSA trae tres horarios
—laborable, finde y festivo— y los tres están cargados. El código conocía un
solo festivo, el 15 de agosto de 2026, puesto a mano en dos sitios: en Navidad
o el Día de Canarias daba el horario de un día normal. En 341 de 849 pares de
municipios la última guagua cambia en festivo, y en 272 sale ANTES, alguna
quince horas antes. Ahora `tipoDeDia()` mira los festivos fijos de Canarias y
calcula el Viernes Santo (algoritmo de la Pascua), que se mueve.

**Las notas del catálogo van en español y las traduce el modelo.** `nota`,
`nota_extra` y `ojo` son apuntes escritos a mano (142 restaurantes con `ojo`,
308 con nota libre). La ficha los enseña tal cual —son datos—, pero el prompt
manda traducirlos al idioma de la conversación al contarlos, que traducir un
dato no es inventarlo.

**Los datos también hablan tres idiomas.** El tipo de sitio (32 valores
cerrados) y el lema de cada municipio se traducen con tabla; el horario del
restaurante es texto libre y se traduce con `horarioTr()`, que toca SOLO las
palabras: comprobado sobre los 318, no cambia un solo número. Y `pintaFijos()`
repinta la cabecera, la fecha, el pie y el botón del panel al cambiar de
idioma, que antes se quedaban en español para siempre porque `arranque()` solo
rehace el hilo.

**Zeben corrige.** Si dice que una playa no es buena con niños o que un
restaurante está mal ubicado, tiene razón: vive allí.

---

## Pendiente

- **Partir `index.html`** en varios ficheros.
- `datos/senderos-anaga.js` está cargado y no lo usa nadie.
- `datos/miradores.js` tampoco lo usa nadie, pero no hace falta: de sus 18
  puntos, 7 están dentro del Palmetum y no son sitios a los que se vaya, y de
  los 11 restantes **10 ya están en `LUGARES`**. El único que falta es el
  Mirador de Taborno. No es la mina que parecía.
- La pregunta de con quién van sí tiene las tres opciones («Dos adultos»,
  «Familia con niños», «Grupo, sin niños»). Guarda en `S.gente` el **número**
  de personas (2, 4 o 6), no una etiqueta: quien compare con cadenas se lleva
  una rama muerta, que es justo lo que le pasaba al aviso de aforo.
- La pregunta de qué comer ofrece dos cartas (comida típica / un poco de todo).
  El pescado salió de ahí, pero el motor sigue sabiendo filtrarlo y el menú de
  «cambiar dónde comer» lo mantiene.
- Pocos restaurantes abiertos en domingo en algunos municipios (Arona: 15
  en 18 km). Es escasez de catálogo.
- Las comarcas (`co`) usan el **nombre oficial del municipio**. Había seis
  pares duplicados —«Granadilla» y «Granadilla de Abona», «Buenavista» y
  «Buenavista del Norte», «Santa Cruz», «San Miguel», «La Laguna», «Vilaflor»—
  y salían dos veces en la lista de pueblos. Unificados: 127 fichas. De paso,
  con el nombre oficial el centro urbano de `BASES` sí se encuentra, que es lo
  que usa el ancla. Las comarcas que NO son un municipio siguen con su nombre
  propio: «Anaga norte — Taganana y Benijo», «Anaga cumbre — Cruz del Carmen»,
  «Anaga oeste», «Costa de La Laguna — Bajamar y Punta del Hidalgo».
- Los nombres del registro que venían dados la vuelta ya están enderezados
  («Heladeria, la» → «La Heladería»; «El Tanque, Espacio Cultural» → «Espacio
  Cultural El Tanque»). Si se importa más registro, volverán a aparecer.
- Sin coche salen paradas a 1,7–2,3 km de la parada de guagua (19 de 744
  planes barridos, todas senderos y paisajes). El informe lo dice en
  `guagua_mas_cercana`, así que no se oculta, pero está sin decidir si debería
  descartarlas. Probé a penalizar el cierre y a acortar el radio sin coche: no
  mejoró nada medible y empeoraba esto, así que se quitó.
- **Cuando no hay foto, telón del pueblo.** Para 203 fichas (iglesias, cascos,
  museos, caseríos) la ortofoto aérea solo enseñaba un tejado. Ahora esas usan
  la estampa de su municipio **desenfocada** detrás del icono: se queda el
  color y el aire del sitio. Desenfocada a propósito, porque las estampas
  llevan el nombre del pueblo escrito dentro y al recortarlas salía medio
  rótulo («LA OROTA»). Playas, charcos y paisajes siguen con el aéreo, que
  ahí sí dice algo.
- **Fotos por sitio.** La ficha ya las admite: `marco()` usa `l.foto` si la
  hay y, si no, una ortofoto aérea de GRAFCAN. Para una playa se defiende;
  para un museo es un tejado. Barrido de 744 planes: de 589 sitios del
  catálogo solo **198 salen alguna vez**, y de esos solo **82** tienen el
  aéreo inútil. Con **40 fotos** se arregla el 82% de esas paradas.
  `fotos.js` sin argumentos escribe `fotos-pendientes.md` con la lista
  agrupada por pueblo; con una carpeta como argumento, mete las fotos:
  recorta al cuadrado, deja 240 px, comprime y añade el campo a la ficha.
  Los ficheros se emparejan por el nombre sin acentos.
  `fotos-buscar.js` busca candidatas en Wikimedia Commons y guarda autor y
  licencia; **hay que ejecutarlo fuera de aquí**, porque desde el contenedor
  de trabajo el proxy deniega Commons, Wikipedia y hasta GRAFCAN.
  Y como Zeben no programa, hay un camino que no pide consola:
  `node fotos.js buscar` mete los 82 sitios pendientes —ordenados por lo que
  salen en los planes— dentro de `plantilla-buscar.html` y escribe
  `buscar-fotos.html`. Esa página se abre en el navegador de casa, busca ella
  sola en Commons, y con pulsar la foto buena de cada sitio arma un zip con
  las fotos y un `creditos.json`. Ese zip es exactamente lo que come
  `node fotos.js esa-carpeta/`. Detalles que costaron: el zip se escribe a
  mano y hay que marcar la **bandera UTF-8** (bit 11) o los acentos de
  «Casa del Plátano.jpg» salen rotos; solo busca **lo que asoma por la
  pantalla**, que 82 llamadas de golpe a Commons es una espera larga y fea; y
  se descarta la candidata **sin autor o sin licencia**, que sin crédito no se
  puede publicar. Se pregunta a Commons **tres veces por sitio**, no una: el
  nombre entero con el pueblo, el nombre sin el genérico de delante («Casco
  histórico de Candelaria» → «Candelaria», quitando también el «de» que queda
  colgando) y el pueblo con el tipo. Con una sola consulta, media lista salía
  vacía. Y lo que Commons no tiene no se pierde: el botón **«esta la hago yo»**
  arma dentro del zip un `las-hago-yo.md` **agrupado por pueblo**, con el
  nombre exacto que tiene que llevar cada fichero, para hacerlas con el móvil
  de una tirada. Para las tres cuartas partes de estos sitios —un guachinche,
  la casa de un coleccionista, un caserío— la foto de quien vive allí es la
  única que va a existir. Para probarla sin red: `?api=...` apunta a otra Commons —hay
  una de mentira en el borrador— y sin `Access-Control-Allow-Origin` el
  navegador tira la respuesta, igual que haría la de verdad. Ojo: ese
  guion tiene que guardarse el `fetch` de verdad ANTES de cargar `banco.js`,
  que lo sustituye por un tapón que siempre falla. Si una foto trae crédito,
  la ficha lo cita al pie del plan: la licencia lo exige.
- **Las fiestas entran pegando texto, no buscándolas.** Zeben tiene un aviso
  semanal que le llega con la agenda cultural de la isla. Encontrar la
  información ya está resuelto; lo que faltaba era el puente. `node eventos.js
  pegar` escribe `pegar-eventos.html`: se pega el correo, trocea por fechas,
  propone nombre, municipio y hora, y **él corrige y marca**. Nada entra sin
  que alguien lo mire — en un correo, «Romería de Benijos» puede ser una
  fiesta o la frase de un consejo gastronómico.
  Dos cosas que salieron probándolo con un correo de verdad: el título
  («3 al 9 de Septiembre») se colaba como si fuera un día, así que las líneas
  con **rango** de fechas no valen de cabecera; y hay que recortar el arranque
  de frase, que si no el nombre queda «Tendrá lugar la Bajada de San Carlos en
  el municipio de Güímar» en vez de «Bajada de San Carlos».
  Y la trampa buena: comparar solo la MISMA fecha no basta. La Romería de
  Benijos ya estaba fichada el 7 de septiembre y el correo la daba el 13;
  entraron las dos. Ahora se avisa —y el que mete la rechaza— cuando la misma
  fiesta ya está a **menos de dos semanas**: se corrige la que hay, no se
  añade otra.

- **Los iconos de fiesta salen del nombre.** Etiquetar 148 fiestas a mano es
  trabajo que no se hace nunca y se pudre al añadir más. `iconoFiesta()` mira
  el nombre: 🐂 romería, ⛪ procesión, 🎶 verbena o música, 🧺 feria, 🎆 fuegos,
  🤼 lucha, y 🪘 para las 41 que se quedan en fiesta a secas — que también está
  bien: el icono tiene que decir algo, y si no lo sabe, mejor el genérico que
  uno inventado.

- **Miradores: no se pueden traer desde aquí.** Zeben pidió sacarlos de
  webtenerife o de datos.tenerife.es. Comprobado: la política de red del
  contenedor deniega **todo** lo de fuera (403 en el CONNECT), y la búsqueda
  web da títulos pero no coordenadas, que es lo único que serviría. Así que
  igual que con las fotos, lo hace el navegador de casa: `node miradores.js
  buscar` escribe `buscar-miradores.html`, que le pregunta a **Overpass**
  (OpenStreetMap, `tourism=viewpoint`) por el rectángulo de la isla. OSM es
  ODbL: cada ficha se lleva `of:'OpenStreetMap (ODbL) · n12345'`, que la
  licencia pide citarlo.
  Tres cosas que la página **no** decide, a propósito: si el mirador vale;
  de qué municipio es —el más cercano de `BASES` se equivoca de lo lindo:
  Taborno cae en Anaga y le tocaba Tegueste, Chirche es Guía de Isora y le
  tocaba Vilaflor, así que el desplegable **empieza vacío** y sin elegirlo la
  ficha no se baja—; y si la carretera es de las duras. Eso lo marca quien
  vive allí.
  Al meterlos (`node miradores.js miradores.json`) el **corredor no sale del
  municipio** sino del vecino fichado más cercano: Santa Cruz es
  «Metropolitana» y el Mirador de Taborno es Anaga, que a efectos de tiempos
  de viaje no tiene nada que ver. Y se descarta lo repetido por nombre o por
  estar a menos de 150 m de un mirador ya fichado.
- La imagen de compartir está dibujada a mano; `generar-imagen.html` la
  rehace en el navegador con las tipografías buenas.
- Si algún día hay dominio propio, hay que cambiar la URL en **cuatro
  sitios** del `<head>`: canonical, og:url y las dos de imagen.
- **Búsqueda web: decidido que NO, por ahora.** Rompería el sello de «todo
  sale del informe», que es lo que diferencia a Naira. Y nunca para
  alergias o celiaquía: ahí la respuesta correcta es el teléfono del sitio.

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

**Y desde el 10 de septiembre se puede mirar desde aquí.** Zeben instaló la
extensión de Netlify, y con ella se ve el proyecto, los despliegues y las
variables de entorno sin salir de la sesión. Eso cierra una pregunta que
llevaba semanas abierta —«¿está puesta la clave?»— y abre un camino que antes
no había: **desplegar sin el zip**.
Lo que se vio al asomarse la primera vez:
· El sitio es `e84eebf4-6891-40d8-a3b8-ae1ba8b155c0`, del equipo
  `69bdca29865a3ff4d7482763`, y las dos funciones están desplegadas.
· **La clave SÍ está.** Hay dos variables, `AEMET_KEY` y `MIAPY_KEY`, las dos
  marcadas como secretas. El nombre da igual: `buscarClave()` recorre TODAS las
  variables y se queda con la que **empieza por `sk-ant-`**, así que se puede
  llamar como sea. Eso descarta de una vez la hipótesis de la clave y deja el
  reloj y el freno como únicos sospechosos de que la web narre en local.
  Ojo con un detalle: `MIAPY_KEY` está **vacía en el contexto `dev`**. En
  producción está puesta, así que no afecta al turista, pero si algún día se
  prueba con `netlify dev` va a parecer que no hay clave.
· **Lo publicado se queda viejo sin que se note.** El despliegue vivo era del
  8 de septiembre y decía «Build from drop deployment»: o sea, el zip de
  aquella tarde. Toda una semana de trabajo —el calendario con los actos, las
  fiestas con su sitio, los 63 miradores, los 76 restaurantes, las paradas de
  guagua— estaba en la rama y no en la web. **Mirar la fecha del despliegue es
  ahora parte de dar algo por hecho.**
Y lo que la extensión **no** arregla: desde el contenedor sigue sin poder
llamarse a la web (403 en el proxy, como con GRAFCAN y Commons), así que
`…/functions/naira?probar=1` hay que abrirlo desde casa.

**Y lo segundo que no arregla, probado el 11 de septiembre: tampoco puedo
desplegar yo.** Zeben lo dio por hecho —«cuando crees el zip o tengas que
hacer una mejora lo subes tú mismo, que para eso te puse la extensión»— y era
lo razonable de suponer, pero no sale. La extensión tiene la operación de
desplegar y lo que devuelve es **un comando para ejecutar aquí**, que comprime
la carpeta y la sube; y esa subida va a `netlify-mcp.netlify.app`, que la
política de red del contenedor **deniega igual que todo lo demás** (403 en el
CONNECT). Comprobado también `api.netlify.com` y `app.netlify.com`: los tres.
O sea que la extensión sirve para **mirar** —el proyecto, los despliegues, las
variables— y no para **escribir**. El zip sigue soltándolo él.
Lo que sí quedó hecho es que el día que esa puerta se abra no haya que pensar:
`empaquetar.js` escribe `.netlifyignore` desde su propia lista, así que
desplegar la carpeta publicaría exactamente lo mismo que el zip y no las
herramientas ni los ficheros del Cabildo.

## Estructura

```
index.html                    el motor y la interfaz (~228 KB)
estilos.css                   el CSS (27 KB)
prompt.js                     el prompt de Naira (18 KB)
datos/lugares.js              LUGARES (328 KB)
datos/restaurantes.js         REST (118 KB)
datos/eventos.js              EVENTOS · datos/actos.js · datos/bases.js · datos/estampas.js
datos/titsa-matriz.js         MATRIZ (338 KB) · datos/titsa-regreso.js · datos/ine.js
manifest.webmanifest          para instalar en la pantalla de inicio
icono.svg / icono-*.png
img/naira-social.jpg          previsualización al compartir
img/estampas/*.jpg            las 31 fotos de municipio (una por ficha)
img/cartas/*.jpg              los 10 carteles de las preguntas con dibujo
img/zonas/*.jpg               las 6 franjas de las zonas de la isla
netlify.toml
package.json                  SOLO para que las funciones declaren @netlify/blobs
robots.txt / sitemap.xml      para que Google vea los tres idiomas
netlify/functions/naira.js    proxy a la API (guarda la clave)
netlify/functions/naira-stream.mjs  el mismo, soltando el texto según llega
netlify/functions/tiempo.js   AEMET, dos saltos con reintentos
datos/hitos-historicos.js     46 hitos del itinerario de Santa Cruz
datos/senderos-anaga.js       7 caminos de Anaga (CARGADO PERO SIN USAR)
datos/senderos-tenerife.js    225 itinerarios del Cabildo con desnivel
datos/miradores.js            18 miradores de Santa Cruz
empaquetar.js                 arma el zip que se suelta en Netlify Drop
probar-aereo.html             prueba en casa qué ortofoto contesta
fusionar.js                   junta sitios repetidos (ensayo sin tocar nada)
hosteleria.js                 rellena con el registro del Cabildo donde falta comer
guaguas.js                    le pone a cada ficha su parada de guagua
matriz.js                     rehace la matriz de TITSA desde el GTFS oficial
fotos.js                      la lista de fotos que faltan, y las mete
fotos-encargo.md              esa lista para encargársela a otro (con reglas)
fotos-buscar.js               busca candidatas en Commons (se ejecuta en su máquina)
plantilla-buscar.html         el molde de la página de elegir fotos
buscar-fotos.html             esa página con los sitios que faltan dentro
plantilla-subir.html          el molde de la página de subir fotos propias
subir-fotos.html              esa página, para las fotos que hace él
miradores.js                  arma la página de miradores, y mete los elegidos
plantilla-miradores.html      su molde
buscar-miradores.html         esa página, lista para abrir
nucleos.js                    arma la página de poner un caserío en el mapa
plantilla-nucleos.html        su molde
buscar-nucleos.html           esa página, lista para abrir
eventos.js                    arma la página de pegar fiestas, y mete las marcadas
actos-parecidos.md            las parejas de actos que pueden ser el mismo
plantilla-sitios.html         el molde de la página de dónde es cada fiesta
sitios-fiestas.html           esa página, lista para abrir
instagram.js                  el contenido de la semana para la cuenta de Naira
plantilla-instagram.html      su molde
instagram.html                esa página, lista para abrir
avisar-fiestas.js             qué fiestas llegan sin programa cargado
vigilar-agenda.js             mira si hay novedades en lagenda.org
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

- `LUGARES` (644) — sitios que visitar. Solo 4 sin coordenadas. **88 son
  miradores**, y 41 llevan `pos_aprox` porque su coordenada es estimada.
- `REST` (394) — restaurantes, incluidas 38 heladerías. **128 salen del
  registro del Cabildo** (`reg`): 43 del fichero que solo trae la calle, con
  `pos_aprox`, y 76 del que trae coordenadas, metidos con `hosteleria.js`.
- `EVENTOS` (138) — fiestas. Municipio y corredor siempre; **127 fichas (87
  fiestas × sus años) llevan ya `la`/`lo`/`lu`**, colocadas por Zeben con
  `node eventos.js sitios`, y entonces mandan ellas sobre el casco del pueblo.
  Quedan 13 sin colocar, en 6 municipios.
- `ACTOS` (571) — los actos de 31 programas de fiestas de 16 municipios:
  día, municipio,
  hora, dónde es y `q` («ninos»/«noche»), que dice a quién le sirve. No son
  fiestas: cuelgan de una que ya está en `EVENTOS` y no anclan el día.
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
Ese cruce se rehace con **`guaguas.js`**, y hay que rehacerlo cada vez que
entren fichas nuevas: se hizo una vez a mano y no quedó herramienta, así que
los 63 miradores, los caseríos y los 76 restaurantes del registro entraron
**sin `bus`** — 215 fichas mudas para quien va en guagua. Comprobado antes de
tocar nada: de los 542 sitios que ya lo tenían, **537 dan el mismo número
recalculando (99%)**; los 5 que no salen de `fusionar.js`, que al juntar fichas
repetidas se quedó a propósito con la parada más cercana de todo el grupo, y
por eso la herramienta **nunca pisa un `bus` que ya esté puesto**.

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

**Los dos botones de arriba hacían lo mismo.** «Sorpréndame» y «¿Qué plan
hacemos hoy?» acababan los dos en `pedirPlan()` con el reloj recortando: a las
nueve menos veinte de la noche, el segundo daba un día de UNA parada y UN
restaurante. Ahora `plan` es **el día entero** (`S.diaEntero`, que apaga el
recorte por reloj) y, si es hoy y pasan de las cuatro, **salta a mañana y lo
dice**; `sorprender()` se queda con lo que resta de hoy. Los rótulos lo dicen:
«Un plan para el día entero» y «Sorpréndame — con el tiempo que queda».

**Un filtro no puede dejar una sola opción de comer.** `filtrar()` solo abría
la mano cuando el filtro dejaba **cero** de camino; dejando uno, se aplicaba
entero. En Buenavista un jueves eso daba **un solo restaurante** habiendo diez
abiertos a menos de 8 km de la parada, tres de ellos más cerca que el
propuesto. Ahora el filtro tiene que dejar al menos **3** a menos de 6 km de
alguna parada; si no, van los dos grupos, lo pedido delante. De 496 planes
barridos, los que ofrecían una sola opción pasan de 21 a **cero**.

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
mitad de trayecto. Salía en el 12% de los planes, con 1,2 km de desvío mediano, y
el techo era el catálogo: **25 miradores** en toda la isla. Con los 63 del
artefacto son **88**, y el regalo pasa al **36%** con el mismo desvío mediano
(1,3 km). O sea que no era la lógica: era que no había de dónde sacarlos. El de vuelta ya
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

**El programa de la fiesta se cuenta según con quién viajan.** Una fiesta de
`EVENTOS` es una línea —«Fiesta del Santísimo Cristo, La Laguna, 14 de
septiembre»—, pero unas fiestas de pueblo duran tres semanas y traen un
programa de cuarenta actos, y ahí está lo que de verdad le sirve al turista:
el domingo hay feria infantil en la Plaza del Cristo y el viernes hay verbena.
Eso no cabe en `EVENTOS` —serían cuarenta fiestas en La Laguna la misma semana
y la agenda de los próximos 21 días quedaría inservible—, así que los actos
viven en `ACTOS`, colgando del día y del municipio, y **no compiten por ser el
ancla del día**: no son una parada, son lo que está pasando en el pueblo.

Cada acto trae en `q` a quién le sirve, sacado **del nombre** como los iconos
de fiesta. **Y `q` dice UNA sola cosa: si el acto es de niños.** Eso, y solo
eso, va al plan con niños —la feria infantil, el cine al aire libre, los
castillos de agua—; **todo lo demás va al de dos adultos**, incluida la misa
cantada y el campeonato de envite.

No era así, y lo cambió Zeben: «para los adultos muestra todas las fiestas,
porque a lo mejor hay una procesión y eso le puede interesar a mucha gente;
para niños lee el enunciado». Antes `q` era una **caja de dos lados** —`ninos`
o `noche`— y lo que no caía en ninguna no se le ofrecía a nadie: de 648 actos,
**371 se callaban** y una feria de artesanía de las once de la mañana dejaba de
ofrecérsele a una pareja porque la hora la había metido en la caja de los
niños. De 480 actos ofrecidos se pasa a **863**, y quien va con niños sigue sin
ver un torneo de dominó.
Lo que esto obliga a cambiar en dos sitios más, y hay que entenderlo antes de
tocarlo:
· **La regla de la hora ya no marca `ninos`.** Un pasacalle de las once no dice
  en su nombre que sea de niños, y marcarlo así lo escondía de la pareja. Sigue
  marcando `noche`, que describe el acto y no le quita nada a nadie. Fueron 21
  actos que salen de la caja de los niños: sortijas, ferias de artesanía,
  actuaciones, la zumba de la playa.
· **Y el tono cambia.** A dos adultos ya no se les puede decir «hay cosas del
  programa que les van a encajar»: va el programa entero. El informe lleva
  `elegido_para_ellos`, el prompt lo explica y el narrador local dice «esto es
  lo que pone el programa» en vez de prometer. Prometer que una misa cantada
  les va a encajar es exactamente lo que esta casa no hace.
De paso entraron en el nombre tres cosas que faltaban —«Fiesta de la Familia»,
«Fiesta del agua» y los «castillos acuáticos»—, que son de niños y se estaban
colando por la hora.

Solo salen los del día del plan y de la zona por donde pasa —municipio de
alguna parada, de la fiesta o de la cama—, que anunciar una verbena a 40 km no
es un regalo, es un anuncio. El «al lado» se mide en **kilómetros**, no por
corredor: por corredor, quien duerme en Arona veía la romería de Los Abrigos, a
10 km, solo porque las dos cosas son «Sur». Son 8 km entre los centros de los
dos pueblos, que deja pasar Tegueste con La Laguna (3,6) y Los Realejos con La
Orotava (5,9). Para elegir cuáles caben mandan los del propio pueblo; para
contarlos, manda la hora. Van en `actividades_de_la_fiesta` con su hora y
su sitio: sin el sitio no se puede decir «date un saltito a la plaza», que es
justo lo que hace útil el dato.

**La madrugada es del día de antes.** Los Fuegos de la Víspera del Cristo son
el 14 a las 00:00 y quien sale la noche del 13 es quien los ve. Así que un acto
que empieza antes de las seis se ofrece en el plan del **día anterior** —y no en
el suyo, donde ya habría pasado antes de que el turista se levante—, va el
último de la lista y viaja con `de_madrugada` para que Naira diga «esta noche a
las doce» y no «mañana». Zeben lo corrigió: hay fuegos las dos noches, la del 13
—los de la víspera— y la del 14 —los del Risco, que son los grandes—, y con la
ficha movida al 13 los de la víspera se los perdía todo el mundo.

**Las fiestas también hablan tres idiomas, pero el nombre no se traduce.** Un
acto se llama «1.º Domingo de Feria Infantil» porque así lo publica el
ayuntamiento, y así es como el turista lo va a ver escrito en el cartel de la
plaza: traducirle el nombre sería dejarlo sin poder reconocerlo. Lo que se hace
es acompañarlo. Con clave de API lo traduce el modelo, y el prompt le dice cómo:
traducir **lo que describe** el acto, no tocar los nombres propios —la Plaza del
Cristo es la Plaza del Cristo en los tres idiomas—, y dejar en español
**verbena, romería y guachinche** explicándolas media frase, que no tienen
traducción buena y son las palabras que va a necesitar.
Sin clave, el relato local hace lo mismo con una tabla cerrada, `actoTr()`: deja
el nombre y le pone al lado de qué va —«1.º Domingo de Feria Infantil
(children's fair)»—, igual que `horarioTr()` toca solo las palabras del horario.
No aclara cuando no hace falta: «Verbena» a secas no se anota «(verbena — the
open-air dance)», que eso no aclara nada.
Y dos cosas de la cabecera, que se vieron probándolo en inglés: el pueblo que
sale es **el que más actos pone**, no el del acto más temprano —quien duerme en
La Laguna veía «Tegueste is in fiestas» por una verbena de las cinco—, y los
actos de otro pueblo se marcan con el suyo al lado. Y la fiesta solo se nombra
si **todos** los actos son de la misma: en La Laguna coinciden el Cristo y San
Mateo de Punta del Hidalgo, y decir una de las dos como si fuera todo es contar
mal.

**Un ancla por día, pero las otras fiestas se cuentan.** Idea de Zeben: «si hay
fiesta en La Laguna y fiesta en Punta del Hidalgo deberíamos poder poner las
dos». El motor elegía una y las demás se perdían: como mucho una salía por
`evento_lejano`, y solo cuando quedaba lejos. El día se sigue armando alrededor
de UN sitio —esa regla no se toca—, pero las que pillan cerca van ahora en
`otras_fiestas_de_hoy`, con su pueblo, su hora y sus kilómetros. El «cerca» se
mide **en kilómetros**, como con los actos y por la misma razón: por corredor,
quien duerme en Arona vería la de Los Abrigos solo porque las dos cosas son
«Sur». Y van **todas** las que quedan cerca, no las tres primeras —«si ya nos
pegamos el curro de meter las fiestas de todos los pueblos, deberían aparecer
todas»—; el día más cargado del calendario tiene seis. De 20 días con dos
fiestas a menos de 8 km, los 20 cuentan ahora la segunda. Y si la que se había apartado por lejana
resulta estar al lado —la Romería de San Miguel está a 4,6 km de la de El
Médano— se recoloca aquí y deja de contarse como lejana.

**La fiesta de las once de la noche no arma el día: lo remata.** Este era el
fallo de debajo. El 14 de septiembre La Laguna tiene dos fichas, la Fiesta del
Santísimo Cristo —dos semanas, sin hora— y los Fuegos del Cristo a las 23:00.
`puntuar()` da +2 por tener hora confirmada, así que ganaban los fuegos y **la
fiesta grande desaparecía entera del informe**: el día se armaba alrededor de un
espectáculo de veinte minutos a las once. Ahora `esFiestaDeNoche()` —hora a
partir de las 20:30, o antes de las seis— las manda al final del orden. Ojo:
una fiesta de noche **sí** puede ser el ancla cuando ese día no hay otra cosa;
el 8 de agosto en Arafo lo único que hay es la Noche de Humor de las nueve y
media. Lo que no puede es tapar a una de día, y eso es lo que mide `lote.js`.

**Y no se cuenta dos veces lo mismo.** Los Fuegos del Cristo estaban en `EVENTOS`
(«Fuegos del Cristo y Noche de las Pandorgas», 23:00) y en `ACTOS` («Fuegos del
Risco», 23:00): la misma cosa por dos fuentes. Zeben decidió cuál manda —«deja
los fuegos de los actos, que es lo que pone el programa de las fiestas»— y la
ficha de `EVENTOS` se quitó con `node eventos.js en-el-programa`. El motor sigue
llevando el cortafuegos por si entra otra fuente: mismo pueblo y misma hora —el
criterio de `duplicados`— y si el acto ya se ofrece, la fiesta no se repite. Y
se resuelve solo según con quién viajen: a dos adultos el acto pasa el filtro de
`q` y lleva él la noticia; **con niños el acto se descarta y entonces sí sale la
fiesta**, así que no se pierde por ningún lado.
Ojo con esa herramienta: **lista y espera, no borra sola**, y por poco me la
llevo por delante. El mismo barrido caza «Romería de Los Abrigos» contra
«Romería Barquera de San Blasito» —mismo pueblo, mismo día, misma hora— y
pueden ser lo mismo o dos actos seguidos de la misma romería; encima esa fecha
la había corregido él a mano. Coincidir en pueblo, día y hora **no** quiere
decir que sean lo mismo. Se borra la que se nombre, y en todos los años a la
vez, que están fichadas dos veces.

**Y una fiesta puede llevar SU sitio, no el casco del pueblo.** Zeben otra vez:
«no es lo mismo las fiestas de La Jaca en Arico que la fiesta del pueblo de
Arico; una es en la playa y la otra en el casco histórico, entonces se pueden
crear cosas diferentes aunque sean en el mismo municipio». Y tenía razón: una
fiesta de `EVENTOS` solo sabía su municipio, así que `focoEvento` cogía el
centro urbano de `BASES` y **dos fiestas del mismo pueblo daban el mismo día**.
Ahora, si la ficha trae `la`/`lo`, manda ese punto: el foco del día, los
kilómetros de las otras fiestas y el radio de la cena salen de ahí.
Lo que **no** se hace es adivinar las coordenadas del nombre. Probado sobre las
138: salen 22 y **una de cada cinco cae mal** — «Romería de San Miguel» se iba
al Castillo de San Miguel, que está en Aldea Blanca, y «Romería de Benijos» a un
sendero. Una coordenada mala mueve el día entero. Así que la corazonada se
enseña y decide quien vive allí: `node eventos.js sitios` escribe
**`sitios-fiestas.html`**, con las 94 fiestas sin sitio agrupadas por pueblo y,
en cada una, un desplegable con los sitios fichados de ese municipio ordenados
por lo lejos que están del casco. El desplegable **empieza en «en el casco del
pueblo»**, que es lo que hace hoy: lo que no toque se queda como está y no hay
manera de empeorar nada dejándolo a medias. Las 12 corazonadas salen como pista
en azul, con un botón, nunca preseleccionadas.
Y se coloca por **nombre y municipio, no por fecha**: cada fiesta está fichada
en 2026 y en 2027, así que marcarla una vez vale para las dos.

**Zeben colocó 81 de las 94 en una sentada, y funciona.** Ninguna apuntaba a un
sitio inexistente. De las 81, **31 caen a más de un kilómetro del casco**, y de
esas **el 77% da un día distinto** al que daba antes. Las otras están en el
casco y por eso no cambian nada, que es lo correcto. Cuatro ejemplos de lo que
esto arregla:

| fiesta | antes el día era | ahora |
|---|---|---|
| Entrada de los Corazones, Tejina (La Laguna) | el casco de La Laguna | Tegueste y Tejina, comiendo en la Tasca Los Corazones |
| Bajada del Socorro (Güímar) | el casco de Güímar | el Camino del Socorro y El Puertito |
| San Sebastián, baño de caballos (Adeje) | el casco de Adeje | la costa, Playa de Fañabé |
| Romería barquera de El Médano | el museo de Granadilla | El Médano |

De paso corrigió dos de mis corazonadas —la Bajada del Socorro es en la Ermita
del Socorro, no en el camino, y la Feria de Pinolere es en el Museo Etnográfico,
no en el caserío—.

**Y una romería tiene salida y llegada; el punto que vale es la LLEGADA.** Se
vio con las dos que yo había dado por dudosas y él fue a mirar:
· *Romería de San Miguel* — sale de la Cooperativa CASMI y baja por la TF-28 y
  la TF-65 hasta la calle Antonio Alonso, junto a la plaza de la iglesia de San
  Miguel Arcángel. O sea que el Castillo de Aldea Blanca **estaba mal**: se
  cambió al casco. Ahí es donde acaba y donde está la gente a la hora buena.
· *Romería barquera de El Médano* — sale de la iglesia después de la misa y
  recorre el casco costero hasta la Playa Chica, donde embarcan a la Virgen.
  La playa **estaba bien**, confirmada.
Con un solo punto por fiesta, la regla es esa: **la llegada, no la salida**. En
San Miguel son tres kilómetros de diferencia y el día se arma en el sitio
equivocado si se coge la salida.

**Las 7 que quedaron sin colocar no son un problema de colocarlas: es que el
sitio no está en el catálogo.** Zeben le pasó a Claude en Cowork las 13 que
faltaban y resolvió 6 —las tres romerías grandes de Garachico y su pregón van
entre plazas del casco, el Carnaval ocupa el centro de Santa Cruz entero, y la
Virgen del Carmen de Guía de Isora es en «Las Higueritas», calle del propio
núcleo—. Las seis caen en el casco, así que **no mueven ningún día**: lo que
ganan es que `evento_ancla.donde` deja de estar vacío y Naira puede decir dónde.
Las 7 restantes se quedan, y el diagnóstico de Cowork es el bueno. Dos casos
distintos, y ninguno se arregla eligiendo mejor de la lista:
· **La Guancha y La Matanza no tienen NADA urbano fichado.** Comprobado sobre
  los 31 municipios: son los dos únicos. La Guancha tiene 5 sitios (el Teide,
  Altavista, Montaña Negra, Montaña Blanca y el Charco del Viento) y La Matanza
  3 (dos senderos y una conexión). Sus fiestas son en la Plaza de la Iglesia y
  en la calle Pedro González Yanes, que existen y no están en `LUGARES`. Como
  el centro urbano sí está en `BASES`, **dejarlas sin colocar ya da el punto
  correcto**: no se pierde nada. Lo que sí se nota es en el día: pidiendo
  «museos y cascos» ahí, el motor tira de la regla de los 6 km y trae ARTlandya
  y la Casa del Plátano de Icod, o Pinolere de La Orotava. Funciona, pero
  porque presta del vecino.
· **Las tres romerías de Granadilla** —Charco del Pino, Los Abrigos y Los
  Blanquitos— son en caseríos costeros que tampoco están fichados, y ahí el
  casco **sí** es el punto equivocado: Los Abrigos está a 9 km del casco de
  Granadilla, monte arriba. Se ve en el plan del 6 de septiembre: el día se
  arma con el Museo de Granadilla y el Caserío de Las Vegas, y a comer al
  Restaurante El Ancla, a 9 km, en la costa. Eso es la bandera COMIDA-LEJOS de
  siempre, pero aquí no es geografía: es que la fiesta está en un pueblo que no
  existe en el catálogo. **Arreglarlo es meter Los Abrigos en `LUGARES`, no
  elegirle una playa de la lista que no es la suya.** Para eso está
  **`nucleos.js`**, abajo.

**Y para meter ese caserío hay un camino, `nucleos.js`.** Zeben contó los tres
recorridos —dónde sale y dónde acaba cada romería—, y eso entró tal cual en la
nota de las fichas, que no necesita coordenadas y ya es útil: Naira puede decir
que la de Los Abrigos empieza con el desembarco de San Blasito en la playa de
Agua Dulce y acaba en el muelle pesquero. Pero el PUNTO sigue faltando, y no se
inventa. Se buscó por si estaba en algún dato de la casa: las paradas de TITSA
solo se guardaron como nombre y metros desde cada ficha, no como coordenadas, y
ninguna cae en esos tres pueblos. (Ojo: eso era verdad de NUESTROS datos, no de
la fuente. El fichero de paradas del Cabildo sí trae `latitud` y `longitud` de
las 3.872, y ahora se lee con `guaguas.js`. Aun así la conclusión no cambia: una
parada de guagua no es un caserío, y ninguna de esas tres romerías se ubica por
ahí.) Así que se hace como los miradores y las
fotos: lo pregunta el navegador de casa.
    node nucleos.js buscar        arma buscar-nucleos.html
    node nucleos.js nucleos.json  mete los que vengan marcados
La página le pregunta a **Overpass** (OpenStreetMap) por nodos `place=village|
hamlet|suburb|neighbourhood|town|locality` dentro del rectángulo de la isla.
**Qué buscar sale solo de los datos**: el caserío está en el nombre de la
fiesta, así que se toman las fiestas sin `la` y se les quita el genérico de
delante. Ojo con ese recorte, que sin apretarlo salían «El Salvador y exhibición
pirotécnica» y «e inauguración de las Fiestas Patronales»: un nombre de sitio
tiene **forma** —de una a tres palabras, todas con mayúscula salvo los
artículos— y con eso quedan Charco del Pino, Las Hayas, Los Abrigos, Los
Blanquitos y un falso, «Papada Guanchera», que es inofensivo porque OSM no
devuelve nada.
Lo que la página **no** decide: cuál de los puntos es el bueno (de «Los Abrigos»
pueden salir dos), de qué municipio es —el desplegable **empieza vacío** y sin
elegirlo la ficha no se baja, como en la de miradores— y si es un casco o un
caserío. Cada punto enseña **a cuántos km del casco más cercano está**, que es
lo que deja ver de un vistazo cuál es el bueno, y un enlace al nodo en OSM.
Y lo que no sale **se dice al final, no en un mensaje que borra el siguiente**:
«Sin nada en OpenStreetMap: Las Hayas, Papada Guanchera». Sin eso, quien mira la
página se queda esperando un resultado que no va a llegar.
Al meterlos, el **corredor sale del vecino fichado más cercano**, no del
municipio —la misma razón que con los miradores, y aquí más, que estos están en
la punta del término—, y se descarta lo repetido por nombre o por estar a menos
de 150 m. Van con `flex` puestos: un caserío vale a cualquier hora. OSM es ODbL,
así que cada ficha se lleva `of:'OpenStreetMap (ODbL) · n12345'`.
Después hay que **colocar la fiesta en él**: `node eventos.js sitios` los ofrece
ya en el desplegable.

**Unas coordenadas también se cruzan contra algo antes de meterlas.** Zeben las
mandó a mano para los tres, y dos entraron y una no. El cruce es barato y lo
dicen los propios datos: a qué distancia queda del casco, de la playa fichada
más cercana y del restaurante más cercano.
· *Charco del Pino* (28.106586, −16.591344) — a 1,9 km del casco, entre el
  museo de Granadilla y San Miguel. Cuadra. **Dentro.**
· *Los Blanquitos* (28.130086, −16.553764) — a 2,6 km del casco y a 1,9 del
  Caserío de Las Vegas. Cuadra. **Dentro.**
· *Los Abrigos* — venían **dos versiones del mismo punto y están a 16,8 km una
  de otra**, así que una está mal por fuerza. Peor: las dos fallan. La náutica
  (28° 06,470′ N, 16° 28,214′ W) cae a **0,2 km de la Playa de Tajao y de un
  restaurante que se llama «Playa Tajao»** — o sea que apunta a Tajao, que está
  en Arico. Y la decimal (28,03060, −16,61720) cae a **4,6 km al oeste de la
  Playa El Confital/Playa del Horno**, que es la playa que tenemos fichada
  **en** Los Abrigos, y más cerca de Los Colmenares, que es de San Miguel.
  **Fuera, y se pregunta.** Para eso está `buscar-nucleos.html`: una consulta a
  OpenStreetMap lo resuelve sin que nadie tenga que fiarse de un número.
La lección: **un par de grados decimales no se puede leer**, así que hay que
apoyarlo en algo que sí se lea — «queda a doscientos metros de un restaurante
que se llama Playa Tajao» es una frase que delata el error sola.
Con los dos metidos, la Romería de Charco del Pino y la de Los Blanquitos ya
paran en su propio pueblo, y de paso el plan de Granadilla deja de quedarse en
dos paradas. Lo que **no** se arregla es la comida: en esas medianías no hay ni
un restaurante fichado —el más cercano está a 6 km—, así que la bandera
COMIDA-LEJOS de Granadilla sigue ahí y ahora se sabe exactamente por qué.
(Eso se arregló después, con `hosteleria.js`: la comida sí estaba, en un
fichero que yo no había abierto.)

**Y donde no había donde comer, sí lo había: `hosteleria.js`.** Esto empieza
con un enfado suyo, y el enfado era justo. El catálogo de comer son 318 fichas
escritas a mano, con horario, nota y valoración, y tenía cuatro agujeros
grandes —Granadilla, San Miguel, Adeje y Arona sin **ni uno** a menos de dos
kilómetros de su casco—. Yo lo di por escasez de la isla y lo escribí aquí. No
lo era: era que hay **dos** ficheros del registro del Cabildo y estaba mirando
el que no trae coordenadas. El otro, «locales de hostelería y restauración»,
trae 9.652 locales con `latitud`, `longitud` y teléfono, 4.065 de ellos de
comer, y me lo había mandado él hacía rato.
Lo que hace la herramienta, y sobre todo lo que **no** hace:
· **No vuelca las 4.065.** Eso sería cambiar un catálogo escrito a mano por un
  listín, y de paso triplicar lo que baja el navegador. Rellena solo donde
  falta, y hasta un mínimo: mira los puntos donde el motor arma el día —los 31
  cascos **y el sitio de cada fiesta**, que la Romería de Los Abrigos acaba en
  el muelle, a nueve kilómetros del casco—, y si junto a uno no hay **4** sitios
  de comer a 2 km, trae los más cercanos que haya a menos de 3. Fueron **76**.
· **No se inventa el horario.** El registro dice que el local tiene licencia, no
  a qué hora abre. Así que la ficha entra con el mismo aparejo que ya usaban las
  43 del otro registro: `h` diciendo «Horario sin confirmar: llamen antes», el
  teléfono, `ojo` con la calle y `reg`/`of` con la fuente. Y no hizo falta tocar
  el motor para que no estorben: la lista de comer ordena por `nota_g` y estas
  no tienen ninguna, así que **solo salen donde no hay una ficha buena cerca**,
  que es justo para lo que se meten. Tampoco entran en la cena, que ahí sí se
  exige un horario escrito que llegue a las 20:30.
· **Un mismo local con tres licencias es uno.** «Sarras», «Tasca La Zurrapa» y
  «Tasquita El Pimentón» están en Arico a veinte metros y comparten el
  922 76 84 86: es una casa con tres papeles. El teléfono lo delata mejor que el
  nombre. Y hay fichas que se llaman «Restaurante» a secas, que se tiran: no se
  puede decirle a nadie «coman en Restaurante».
· El municipio del registro se escribe distinto («San Miguel», «Güimar», «La
  Laguna»), así que se compara sin acentos ni artículos contra los 31 que ya
  existen, como con el padrón. Y el **corredor sale del vecino fichado más
  cercano**, no del municipio, la misma regla que con los miradores.
Resultado: **ningún municipio se queda sin donde comer junto a su casco**, y la
bandera COMIDA-LEJOS pasa a **cero** en los tres barridos de `lote.js`.
Lo que hay que saber para fiarse de esto: **7.600 de las 9.652 fichas tienen la
última actualización entre 2015 y 2018**, así que alguna habrá cerrado. Por eso
entran diciendo que se llame antes y por eso van detrás de las escritas a mano,
nunca delante.

**Y ahí salió un fallo que llevaba escondido desde siempre: la nota de la fiesta
que arma el día no llegaba al informe.** `evento_ancla` llevaba nombre,
municipio, franja, hora y distinción, pero **no `no`** — y **113 de las 138
fiestas tienen nota**, casi todas diciendo dónde es la cosa («En Plaza Ramón
Arocha», «En Basílica de Candelaria») o de qué va («las carretas aquí son barcas
engalanadas, no carretas»). Lo retorcido: las notas de las fiestas
**secundarias** sí viajaban, por `otras_fiestas_de_hoy.lo_bueno`; la de la que
manda el día, no. Ahora va por `evento_ancla.lo_bueno`, está en el prompt y el
narrador local también la cuenta —en español y sin traducir, como los porqués
del Cabildo: traducirla a plantilla sería reescribirla.
Y salió un efecto de segundo orden que hay que entender antes de tocarlo: con
coordenadas de verdad, **la Romería de San Miguel y la barquera de El Médano
pasan de 4,6 km a 9,2**, porque antes se medían entre cascos y ahora entre el
Castillo de Aldea Blanca y la playa. Se salen de los 8 km del «al lado», así
que dejan de contarse juntas y la segunda pasa a `evento_lejano`. Eso es **más
cierto, no menos**: son nueve kilómetros. Por eso `lote.js` cuenta los tres
caminos —las otras fiestas, el programa y el aviso de la lejana—: lo que se
vigila es que no se calle, no por dónde salga.

**Y dónde cenar, que un día de fiesta no acaba con un helado.** También suyo: «y
depende de la hora, ofrecer cenar por la zona». El informe solo llevaba el
almuerzo, pero un día que acaba en una verbena a las nueve o en unos fuegos a
las once se cena cerca de la plaza y se baja andando. `cenar_cerca_de_la_fiesta`
busca a **3 km del centro del pueblo** donde es la cosa —una plaza se va
andando—, abiertos ESE día y con un horario escrito que llegue a las 20:30: son
206 de los 394 — las 76 del registro no entran aquí: sin horario escrito no se
puede decir que abran de noche. El horario es texto libre, así que **no se afirma que abra**: se
manda tal cual, con el teléfono, y el prompt manda decir que llamen si van
justos. Sale en 10 de los 21 días con dos fiestas; los otros 11 son pueblos
—Arafo, Vilaflor, La Guancha— sin nada fichado abierto de noche a esa distancia,
y ahí no se ofrece nada antes que inventarlo.

**Las heladerías no son sitio de almorzar.** Marcadas con `remate`. Se
ofrecen al final, en `para_rematar_el_dia`, y ya no solo con niños: un helado
de camino al coche vale igual para dos adultos. Se buscan a 2,5 km de la
última parada y, si ahí no hay, junto a cualquier otra parada del día —el
informe dice junto a cuál en `junto_a`. Mirando solo la última, un día que
acababa en La Esperanza se quedaba sin remate teniendo cuatro heladerías a
400 m de la parada de la mañana.

---

**El relato tenía que respirar.** El plan son tres mil caracteres y llegaban de
una tirada, todos del mismo tamaño, apoyados solo en `white-space:pre-wrap`.
Zeben lo dijo mirando la pantalla: «se ve muy plano». Y no se arregla con
colorines, se arregla con aire: `ritmo()` convierte los bloques separados por
una línea en blanco en párrafos de verdad y las líneas que empiezan por «·» en
una lista con su sangría y su separador. La primera frase va un punto más
grande, que es por donde se entra. **No reescribe nada**: solo respeta lo que ya
venía escrito, así que vale igual para el texto del modelo que para el del
narrador local.

**El calendario tenía que DECIR para qué está.** Zeben, mirándolo: «no da la
sensación de que uno venga a preparar sus vacaciones». Y tenía razón: una
rejilla bonita sin rótulo es un trasto. Encima va la pregunta —«¿Qué día quiere
disfrutar de Tenerife?»— y dentro, una línea que explica los iconos. Ojo con el
rótulo: en cursiva serif chocaba con el lema, que es lo mismo justo encima; va
recto y con aire por delante para que se lean como dos cosas distintas.

**La entrada era correcta y fría.** «Soy Naira, su guía por aquí» no dice nada
que no diga el logo. Ahora dice a qué juega: «de aquí de toda la vida; le monto
el día como se lo montaría a un primo que viene de fuera: sin colas tontas y
comiendo bien». Es la voz que ya manda el prompt, pero en el primer segundo.
Y ahí salió un fallo de los que escuecen: **«Buenas tardes» estaba escrito a
pelo en español** dentro de la tabla de la luz del día, así que era LO PRIMERO
que leía un inglés o un alemán. `pintaLuz()` devuelve ahora la **clave**
(`sManana`/`sTarde`/`sNoche`) y no el texto: se traduce al decirlo, y sigue
bien aunque cambien de idioma a mitad de la conversación.

**El calendario es donde se asoman las fiestas.** Era un `<input type="date">`:
el cuadrito gris del navegador, el único sitio donde esto parecía un formulario.
Y detrás había 139 fiestas y 300 actos que el turista no podía ver si no
acertaba la fecha a ciegas. Ahora es una rejilla del mes donde **cada día con
fiesta lleva su icono** —el mismo de `iconoFiesta()`— y debajo se lee cuál es,
con su pueblo y su hora. Bonito porque dice algo.
El `<input>` **sigue existiendo, oculto**: es quien guarda el valor y quien
dispara el `change` que ya escuchaba el motor, así que pulsar un día del
calendario entra por el mismo sitio de siempre y nada de lo que funcionaba se
entera del cambio. Los nombres de mes y de día los escribe el navegador con
`toLocaleDateString` en el idioma elegido; los de las fiestas **no se traducen**,
que es la regla de siempre.

**Y el calendario tiene que ver TAMBIÉN los actos.** Zeben lo cazó: «el domingo
hay fuegos en La Laguna y no salen en el calendario». `fiestasDe()` leía solo
`EVENTOS`, así que los 300 `ACTOS` eran invisibles ahí: el domingo 13 de
septiembre salía una romería de La Orotava teniendo La Laguna veinticuatro actos
del Cristo. Ahora hay un `actosDe()` que aplica **la misma regla de madrugada
que el motor** —un acto que empieza antes de las seis es de la noche del día de
antes—, y por eso los Fuegos de la Víspera, fichados el 14 a las 00:00, salen en
el 13, que es la noche en que se ven. El pie los agrupa por pueblo con
`actosPorPueblo()`, mandando el que más pone —la misma regla de la cabecera del
plan— y nombrando la fiesta solo si **todos** los actos del pueblo son de la
misma: en La Laguna coinciden el Cristo y San Mateo de Punta del Hidalgo.
Dos decisiones de pantalla. La lista va **entera**, en una caja que se desliza:
recortarla a cinco dejaba fuera los fuegos de las doce, que es justo lo que se
venía a mirar (hay días de **50 actos** de ocho municipios). Y en la rejilla, el
día con fiesta lleva su icono y el que **solo** tiene programa lleva un punto:
poniendo el icono en los dos, veinticuatro de treinta días de septiembre salían
marcados igual y las fiestas de verdad se perdían entre los tambores.

**El calendario llegó a marcar la estancia entera, y se quitó.** Se puso
porque Zeben lo pidió —«estaría bien poder elegir varios días en el calendario
del encabezado»—: el plan seguía siendo de un día y el rango solo servía para
mirar qué caía en la semana. Lo probó y lo cortó él mismo: **«elegir varios
días y no hacer nada no vale para nada, para eso mejor quitarlo»**. Y tenía
razón: pedía un segundo gesto para enseñar una lista más larga de lo mismo.
Se fue entero —`calRango`, `pieRango`, el tope de 21 días, las tres claves de
`tr()` y sus cuatro reglas de CSS—. Lo que se queda es lo de siempre: una
pulsación escribe en el `<input>` oculto y dispara el `change`.

**Lo que sí hacía falta era que el día elegido se leyera: los pueblos
delante.** También suyo, y viene de mirar el artefacto de Cowork: «podrías
ponerlo separado por municipios, y así cuando pinchas que ponga en Granadilla
3, en Arafo 2, y tú pinches y veas lo que hay, más que una lista entera de
eventos que puede ser muy pesado». Un día grande tiene **cincuenta actos de
diez municipios**, y de corrido eso es un muro que además no le sirve a quien
está en uno solo. Ahora el pie enseña **los pueblos con su número** y se abre
el que se pulse; dentro van **todos** los actos de ese pueblo, que recortar a
cinco dejaba fuera los fuegos de las doce. Tres detalles:
· Si hay **un solo pueblo se abre solo**: pedir un clic para enseñar lo único
  que hay es un clic de más.
· Abrir otro **cierra el anterior**, y volver a pulsar el abierto lo cierra.
· Cambiar de día **cierra lo que hubiera abierto**: otro día, otro programa.
Mandan los que más actos ponen, que es la misma regla de la cabecera del plan.
El nombre de la fiesta sigue saliendo solo si **todos** los actos del pueblo
son de la misma.

**Y dentro del pueblo, por SITIO — que era donde estaba el lío de verdad.**
Zeben, mirando Granadilla: «no que salgan dos de Los Abrigos, en medio una del
Médano y luego dos de Los Abrigos». Pero el arreglo NO era ordenar por `lu`:
**el mismo sitio está escrito de cinco maneras**. Ese día en Granadilla hay
«Calles de Los Abrigos», «Los Abrigos, Granadilla de Abona», «Muelle de Los
Abrigos», «Muelle y playa de Los Abrigos» y «Plaza de Los Abrigos» — cinco
cabeceras para un solo pueblo, y ordenándolas por el texto se quedan igual de
picadas. Hay que sacar la **localidad** del texto.
Se hace como en `nucleos.js`: quitarle el genérico de delante («Calles de»,
«Muelle de», «Plaza de») y el municipio de detrás; lo que queda es la
localidad. Dos cuidados que costaron:
· **Las alternativas largas van PRIMERO en el regex.** Con `muelles?` delante,
  «Muelle y playa de Los Abrigos» se quedaba en «y playa de Los Abrigos» y no
  casaba con los otros cuatro.
· **El trozo de detrás de la coma no siempre es el municipio.** «Plaza de la
  iglesia, Punta del Hidalgo» es La Laguna, y ahí lo de detrás de la coma es
  justo la localidad que se busca. Solo se quita si ES el municipio.
**Y no se fía de su propia corazonada:** una localidad vale solo si sale de
**dos textos distintos** del mismo municipio. Con una sola aparición el sitio
se queda tal cual, y eso es lo que evita que «Parroquia de San Pedro, Sala D»
se convierta en un pueblo llamado «Sala D». Medido sobre los actos cargados:
de **332 cabeceras a 266**, y las que se juntan son las que tenían que juntarse.
El sitio exacto **no se pierde**: la cabecera dice la localidad y cada acto
lleva el suyo debajo cuando no es el de la cabecera. Que es lo que él pidió:
«no hace falta que vaya al sitio exacto, pero sí a la localidad, y ya el turista
allí encontrará la fiesta».
Y la cabecera **se pulsa**: abre esa localidad en el mapa. Se busca por
**nombre**, no por una coordenada — es la misma regla de `urlDe()` con las
fichas de posición aproximada, y aquí es obligada, que de un acto no tenemos
punto ninguno. Se corta por la primera coma o flecha, que «Plaza de los Caídos,
Plaza de la Pescadora y playa de Los Cristianos» no es una búsqueda, es una
frase. Los actos que no dicen dónde son van al final **y se dice que no lo
dicen**: callarlo haría pensar que faltan por cargar.

**Agrupar por sitio destapó actos repetidos, y eran muchos.** Al quedar juntos
se vio que en Los Abrigos había dos «Diana floreada» a las nueve y dos «Gran
Baile» a las diez: el programa que Zeben pegó a mano y el artefacto de Cowork
contando lo mismo con otras palabras. De 648 actos se pasa a **571** en tres
pasadas, cada una más floja que la anterior y ninguna adivinando:

| pasada | qué junta | cuántos |
|---|---|---|
| `duplicados` | un nombre **empieza por** el otro | 6 |
| `parecidos` | las palabras de uno están **todas dentro** del otro | 57 |
| `parecidos actos-parecidos.md` | lo que marcó Zeben a mano | 14 |

· **La primera** se quedaba corta: comparaba los **24 primeros caracteres
  exactos** y «Diana floreada» tiene trece. Ahora vale también que un nombre
  empiece por el otro, con doce caracteres de mínimo para que uno corto no se
  coma a otro.
· **La segunda la abrió Zeben**: «si son los mismos eventos quédate con los que
  más datos tengo y estén más completos, seguro que se mezcló con los que metí
  yo a mano». Y **«parecerse» no es compartir palabras, es que uno esté DENTRO
  del otro**. Con el porcentaje a secas —60% de palabras en común— se juntaban
  «Feria de Artesanía, hasta las 18:00» y «Feria del Motor, hasta las 18:00»,
  que son **dos ferias distintas a la misma hora** en Los Realejos: de tres
  palabras compartían dos y pasaba. Ese es exactamente el caso del que avisa la
  regla de la casa. Exigiendo que TODAS las palabras de uno estén en el otro,
  esa pareja se cae y siguen entrando las de verdad: «Gran Baile con Nueva
  Ilusión» está entero dentro de «Gran Baile con el grupo Nueva Ilusión».
· **Y el que se queda es el MÁS COMPLETO**, que es lo que él pidió: primero
  cuántos campos trae llenos —con el sitio contando doble, que es el que hace
  útil al acto—, y si empatan, el nombre más largo. Lo que le falte se rellena
  con el que cae, así que no se pierde un dato por el camino. Ojo con una cosa
  que costaba ver: **la clasificación hay que recalcularla**, porque rellenar
  campos vacíos le podía pegar al ganador el `q` del que cae, sacado de otro
  nombre.
· **La tercera no es una regla, es él.** Quedaban 15 parejas que ninguna regla
  separa —«Celebración eucarística» contra «Celebración de la eucaristía»,
  «Ntra. Sra.» contra «Nuestra Señora», «Gran fiesta» contra «Gran Verbena»—.
  La herramienta escribe **`actos-parecidos.md`** agrupado por día y con una
  casilla en cada acto; se marca con una equis el que sobra y
  `node eventos.js parecidos actos-parecidos.md` lo quita. Se busca por
  **nombre dentro de su día y su pueblo**, no por el nombre a secas: «Santa
  misa y procesión» está tres veces en el catálogo y quitar «las dos primeras
  que aparezcan» habría borrado la de otro día.
Queda **una pareja sin resolver a propósito**: las dos ferias de Los Realejos
del 26, que son distintas de verdad. Y el informe la sigue enseñando aunque no
se junte nada, que si no, el día que el catálogo esté limpio las parejas
dudosas desaparecerían sin que nadie las hubiera mirado.

**Y antes de armar nada, se enseña lo que hay y se elige.** Este es el fallo
de fondo que destapó Zeben probándolo con su novia: desde Güímar, con coche y
con niños, pidió un día entero para el domingo 13 y le salió una mañana de
sendero de 7 km de ida en La Crucita y luego la Romería de Benijos en La
Orotava. Y mientras tanto, **en La Laguna había fiesta infantil a las diez** y
no salió por ningún lado. La razón: la Romería era lo único que ese día estaba
en `EVENTOS`, y **un acto de programa nunca ha podido armar el día** — solo
anclan las fiestas, los actos viajan de propina si el día ya pasa por su
pueblo.
Su idea, que es la buena: «estás en Güímar y el domingo 13 hay fiesta infantil
en La Laguna, pues le comento: mira, hay fiesta infantil, así que te monto el
día alrededor de ese municipio… y si le interesa más una romería, te armo el
día alrededor de La Orotava». O sea, **enseñar lo que hay y que elijan**, en vez
de elegir por ellos y dispersar el día.
Lo hace `loQueHayEseDia()`, y **no hubo que tocar el motor**: la maquinaria ya
estaba entera y lo que faltaba era preguntarlo.
· Una fiesta se fuerza con `S.forzarEvento`, igual que en `elegirEvento()`.
· Un pueblo con programa se arma con `queApeteceEn(m)`, que es lo que usa
  «prefiero elegir el sitio yo»: pregunta el tipo de día y ancla en lo mejor a
  menos de 6 km del casco. Y entonces **los actos de ese pueblo entran solos**
  en el informe, porque el día ya pasa por allí.
Tres cuidados:
· **Un pueblo con fiesta no se ofrece dos veces.** Si ya sale por su fiesta, no
  sale otra vez por su programa.
· **El programa se filtra por con quién viajan**, con la misma regla que el
  motor: con niños solo lo que el nombre dice que es de niños. Por eso desde
  Güímar con niños sale «La Laguna · 2.º Domingo de Feria Infantil · 10:00 ·
  30 min» y no la verbena de las once.
· **Se ordenan por lo que cuesta llegar**, no por cuántos actos ponen: un
  programa a cuarenta minutos no es un plan de mañana. Cuatro fiestas y cuatro
  pueblos como mucho, y siempre el «me da igual, elija usted», que es lo que
  hacía antes.
Desde Güímar el 13, con niños, ofrece: la Romería de Benijos (50 min), la feria
infantil de La Laguna (30), la cabalgata de Tegueste (30), la fiesta del agua
de Los Realejos (50) y las colchonetas de Adeje (55). Eligiendo La Laguna, el
día se arma en el casco, se come allí y la feria de las diez viaja en el
informe.
Ojo con lo que esto le hizo a `probar-web.js`: la pregunta mete un paso más y
los siete recorridos se paraban en el cuarto. **La rota era la prueba**, como
siempre. Ahora un paso que empieza por `?` es **opcional** —se pulsa si está y
se sigue si no—, que esta pregunta solo sale los días con algo y la prueba
corre con la fecha de hoy.

**Y el botón para montar el día alrededor de un evento, en dos sitios.** Lo
pidió él —«deberíamos crear un botón donde sea "quieres que el día se monte
alrededor de un evento 🎉"»— y es la misma pregunta de arriba, puesta donde
hace falta: en el menú, y **después del plan**, que es cuando uno ve lo que le
han montado y cambia de idea. Desde el plan, «me da igual» vuelve AL PLAN y no
al principio: tirar un día ya armado por curiosear la lista sería un castigo.
El botón solo sale si ese día hay algo, que es la regla de siempre —un botón
que lleva a una lista vacía es peor que no tenerlo—, y lo que hay lo cuenta
`hayCosasEseDia()`, una sola vez para los tres sitios que lo usan: si cada uno
lo contara a su manera, el botón diría un número y la lista enseñaría otro.
De paso **`elegirEvento()` se quedó sin quien lo llame y se fue**: hacía lo
mismo pero SOLO con las fiestas de `EVENTOS`, así que desde Güímar no podía
ofrecer la fiesta infantil de La Laguna. Con él se van cinco claves de `tr()`
que ya no usaba nadie. Y el rótulo del botón del menú deja de decir «5 fiestas
ese día»: son una fiesta y cuatro pueblos con programa, así que dice «cosas».

**El botón de compartir el plan no hacía nada, literalmente.** Zeben lo usó y
lo dijo. Llamaba a `compartir(brief, base)` y **esa función no existe en ningún
sitio del fichero**: el botón reventaba con un ReferenceError. Se va, que con
el de la imagen ya hay uno. Y con él se va **la misma llamada fantasma que
había dentro de `compartirImagen()` como respaldo**, que es lo peor de los dos:
si la imagen fallaba, el respaldo reventaba y se comía el aviso.
De paso, dos botones con icono —🏖 para la playa y 🥾 para la naturaleza—, que
en una lista de siete botones todos iguales el ojo no tiene dónde agarrarse. El
emoji va FUERA de `tr()`: es el mismo en los tres idiomas y meterlo en la tabla
sería repetirlo tres veces para nada. Y el tope de botones pasa de **6 a 7**:
con el del evento nuevo, seis dejaba fuera «prefiero naturaleza», que es justo
uno de los dos que él quería que se vieran mejor.

**El calendario marca con 🎉 el día que solo tiene programa.** Era un punto.
Zeben: «podríamos poner un icono 🎉 para saber que hay un evento». Va, pero
**más pequeño y más flojo** que el icono de la fiesta: con los dos iguales,
veinticuatro de treinta días de septiembre salen marcados igual y las fiestas
de verdad se pierden entre los tambores. Esa regla no se toca; lo que cambia es
que el punto no decía QUÉ era y el 🎉 sí.
Y el rótulo de los pueblos cambia según lo que haya encima: si ya se ha
nombrado una fiesta, esos pueblos son el «además» y el rótulo es **«🎉 También
hay más eventos en:»**, un punto más grande que el rótulo de máquina, porque
ahí se está invitando y no etiquetando. Si no hay fiesta, sigue siendo
«Programa del día · N».

**Los asteriscos del modelo salían a pelo.** Se vio en una captura suya:
«**el sendero no es circular**» y «**Arco de Igueque**» con los asteriscos
puestos, en medio de un texto por lo demás bien resaltado. El modelo escribe en
markdown porque es como escribe siempre, y aquí nadie lo traducía: `escapar()`
los deja tal cual y `marca()` no los mira. Se arregla por los dos lados: el
prompt dice que **nada de markdown** —esto es un WhatsApp, no un documento— y
`resaltar()` los convierte por si acaso, que el modelo va a seguir haciéndolo.
La conversión va **al final**, cuando ya están puestas las marcas: hacerlo
antes metería etiquetas en medio de los nombres que se buscan. Y un asterisco
suelto, sin pareja, se quita: en pantalla no significa nada.

---

## La auditoría del 11 de septiembre

Zeben mandó un artefacto con una revisión técnica de la web desplegada: alguien
la recorrió entera en un navegador, generó planes reales en ocho recorridos y
en los tres idiomas, y midió `titsa-matriz.js` a mano. Cuatro fallos críticos,
siete altos y once fugas de idioma. **Lo primero que se hizo fue comprobar cada
uno contra el código**, que la web revisada era el zip desplegado y podía tener
cosas ya arregladas; salieron todos ciertos.

**El peor, y con diferencia: «la última guagua» era un búho de madrugada.**
`MATRIZ` guardaba UNA hora por par de municipios, la salida más tardía del día.
Y en **427 de los 850 pares laborables** esa salida era después de medianoche,
muchas entre las tres y las cinco y media. El motor la presentaba tal cual —«la
última guagua sale a las 04:09»— y encima añadía «hay guaguas hasta de
madrugada, así que la vuelta no aprieta». A alguien sin coche eso lo deja
tirado de noche en Buenavista, que es literalmente lo que decía el informe.
Aquel día **no se podía inventar la hora buena**: el dato no estaba. `MATRIZ`
traía un número por par y `titsa-regreso.js` —que sí tiene
`ultima_antes_medianoche`— solo cubre dos corredores de origen. Así que se
arregló **lo que se decía**: si la única salida era de madrugada, el informe no
la llamaba `ultima_salida` sino `guagua_de_madrugada`, y añadía
`no_sabemos_la_ultima_de_la_tarde`. El nombre del campo era la mitad del
arreglo, porque el modelo leía «ultima» y decía «la última».
**Y el 12 de septiembre el dato llegó, así que ya no hay que callar nada.**
Ver abajo, «La matriz de guaguas se rehizo desde el GTFS».

**«Merece la pena» pegado a una exclusión por peligro.** La coletilla de «no lo
meto en el plan, pero ustedes deciden: aunque sea acercarse a verlo, merece la
pena» se enganchaba igual a «son 522 metros de subida» que a «está clasificada
como PELIGROSA en el registro oficial de zonas de baño». En el segundo caso es
una invitación a ir a un sitio del que se acaba de avisar. Ahora el motivo
viaja con su clase: `incomodidad` lleva la coletilla, `peligro` sale por
`es_por_seguridad` y se cuenta sin invitar —«se lo digo para que lo sepan, no
para que vayan»—. El prompt lo dice también.

**Decía «hoy» cuando el plan era para mañana.** A partir de media tarde la web
salta sola al día siguiente y lo anuncia bien; dos burbujas después el narrador
soltaba «¡Chos, HOY hay Feria de Pinolere!». En la escapada de tres días el día
2 y el día 3 también decían hoy. Y lo retorcido: **las claves `hoyEs` y
`mananaEs` llevaban definidas en los tres idiomas desde el principio sin que
las usara nadie**. Ahora hay un `cuandoEs(fecha)` que resuelve contra la fecha
DEL PLAN, y si no es ni hoy ni mañana dice el día —«el sábado 26»—, con el
nombre que escribe el navegador, sin tabla que cuadrar.

**La carta «Senderos» podía no dar ni un sendero, y sin avisar.** El salvavidas
—`S.faltaNucleo`— existía, pero solo se armaba dentro de `queApeteceEn()`, el
camino de «prefiero elegir el sitio yo». Por el camino principal, `queApetece()`
lo ponía a `null` y nadie lo volvía a mirar: Puerto de la Cruz + Senderos daba
la Hijuela del Botánico y el Mirador de Humboldt sin decir palabra. Ahora la
comprobación está **donde se cierran las paradas**, que es mejor sitio que la
entrada: mide el resultado, no la intención, y por eso vale en los dos caminos.

**Un museo cerrado como remate del día.** «Sorpréndame» a las 21:40 en Adeje
cerraba en Absurdia, Mundo de Ilusiones, que cierra a las 21:30. Solo 39 de las
644 fichas traen `hor`, pero son justo estas —museos, jardines, centros de
visitantes—, así que `abiertoAl()` cruza la hora de cierre con la de llegada
**solo cuando el reloj recorta el día**. Una playa no cierra y no se juzga.

**Encabezado con la sección vacía debajo.** «Con lo que les queda de día, algo
cerquita:» y a continuación nada, porque el reloj se había llevado todas las
paradas. Se pintaba la cabecera sin mirar si había algo que colgar de ella.

**El botón de compartir, el enlace roto y la página de pruebas.** El de
compartir ya estaba arreglado (llamaba a una función que no existe). Quedaban
dos: el panel decía «se pega en pegar-eventos.html» y esa página **no se
publica** —es una herramienta que se abre desde la carpeta—, así que la
instrucción llevaba a un 404; y `probar-aereo.html` sí está publicada, a
propósito y documentado, pero ahora va con `X-Robots-Tag: noindex`. De paso
entran `robots.txt` y `sitemap.xml` con los tres idiomas declarados como
alternativas de la misma página.

**La función que gasta la clave estaba más abierta de lo que parecía.** Dos
agujeros de los que solo se ven leyendo despacio:
· `if (de && !CASA.test(de))` — una petición **sin cabecera `Origin` ni
  `Referer` no entraba en el `if` y pasaba entera**, que es exactamente lo que
  manda un `curl` a pelo. O sea que el cierre no cortaba lo único que
  pretendía cortar. Ahora la cabecera **se exige**.
· `CASA` casaba con **cualquier host que contuviera la cadena `naira`** y con
  **cualquier `*.netlify.app` del mundo**. Ahora es `esDeCasa()`: el sitio
  exacto, sus previos de despliegue (`algo--leafy-cobbler…`), localhost y un
  dominio propio que empiece por `naira.`. Probado con once casos.
· Y `?probar=1` ya no dice la longitud de la clave ni cuántas variables de
  entorno hay: esa URL es pública y las dos cosas solo le sirven a quien tantee.
**Lo que NO se cerró, y hay que saberlo:** el `system` sigue viniendo del
cliente —el panel deja editar el prompt, y eso es una función, no un descuido—.

**Y el contador del freno YA ES COMPARTIDO, con Netlify Blobs.** Funcionando en
producción desde el 11 de septiembre a las 22:51: `?probar=1` devuelve
`"freno": "blobs"`. Zeben: «monta el zip con el fichero dentro y lo probamos,
no se va a perder nada, tengo los demás zips guardados». El problema era real y
estaba medido: la cuenta vivía en una variable, o sea en la memoria del
contenedor, y Netlify levanta y apaga varios; encima hay DOS funciones con su
cuenta cada una. El techo de 600 al día eran en realidad 600 por contenedor.
**Y la pregunta de fondo quedó contestada: `package.json` NO rompe el
despliegue por zip.** Netlify hace build al soltarlo («Build from drop
deployment»), instala él las dependencias y despliega las tres funciones. No
hizo falta meter `node_modules` —27 MB, casi todo OpenTelemetry— en el zip.
Netlify Blobs es un cajón que viene con el proyecto y deja apuntar la cuenta en
un sitio que todos leen. Cómo está montado:
· **Es opcional a propósito.** Se carga con `import()` dentro de un `try`: si el
  paquete no está, o Netlify no da el contexto, se sigue con la memoria
  exactamente como antes. Un freno que revienta es peor que un freno flojo,
  porque deja al turista sin plan. Probado aquí en los dos casos.
· **No es atómico.** Dos peticiones a la vez pueden leer el mismo número y
  escribir el mismo+1. Para un freno da igual.
· **La prueba la responde `?probar=1`**, que dice `freno: blobs` o
  `freno: memoria`, el porqué, y tres pistas —si cargó el paquete, si el
  contexto venía en el `event` y si venía en el entorno—. Esas pistas existen
  para no tener que preguntar dos veces: dicen QUÉ hay, nunca cuánto vale.

**La primera prueba salió «memoria», por dos cosas encadenadas que conviene no
volver a pisar.** El despliegue en sí fue bien —las tres funciones desplegadas,
y la del streaming como función v2 de verdad—, así que lo que fallaba era el
código:
· **En el formato clásico el acceso al cajón NO está en el entorno: viene
  dentro del `event`**, en `event.blobs`, y hay que engancharlo con
  `connectLambda(event)` antes de pedir la tienda. Sin eso, `getStore()`
  responde «The environment has not been configured to use Netlify Blobs», que
  es exactamente lo que salió. En el formato moderno —el del streaming— no hace
  falta: ahí el entorno sí viene puesto, y por eso esa función sí habría
  funcionado desde el primer intento.
· Y debajo había otro: **`consistency:'strong'` no vale en el formato clásico**,
  porque pide un `uncachedEdgeURL` que el contexto del Lambda no trae, y
  revienta la lectura. Con consistencia normal basta: esto ya no era atómico.
Ojo con cómo se probó, que es la trampa de siempre un piso más abajo: la
primera simulación le pasaba al `event` el contexto ENTERO, y `connectLambda`
quiere solo `{url, token}` en `event.blobs` y el id del sitio y del despliegue
**en las cabeceras** (`x-nf-site-id`, `x-nf-deploy-id`). Con la forma mal, el
fallo parecía del código. **La rota era la prueba**, otra vez.
Probado con un cajón de mentira en local —26 peticiones repartidas entre las
dos funciones cortan a las 20 **contando las dos juntas**, que es justo lo que
no pasaba antes— y confirmado en producción: la respuesta de `?probar=1` trae
`contexto_en_el_event: true` y `contexto_en_el_entorno: false`, que es
exactamente el cuadro del formato clásico y la prueba de que `connectLambda` era
lo que faltaba.
· Y de paso salió un fallo que solo se ve mirando lo que queda escrito en el
  cajón: **el contador del día se miraba ANTES que el de la IP**, así que las
  peticiones que el freno acababa de cortar seguían gastando cupo diario —26 en
  el contador del día habiendo cortado 6—. A quien machacara la web le bastaba
  con eso para agotar el techo de todo el mundo. Ahora manda la IP primero.
· **El zip va SIN `node_modules`** —27 MB, casi todo OpenTelemetry, que entra
  de arrastre por `@netlify/otel`—, porque el despliegue por zip hace build
  («Build from drop deployment») y ahí Netlify instala él las dependencias. Si
  resulta que no, `?probar=1` dirá «Cannot find package» y entonces se mete la
  carpeta y se prueba otra vez.
· Lo que esto **cuesta**: `package.json` en la raíz, que es lo único que el
  proyecto llevaba evitando desde el principio para que publicar fuese soltar
  el zip y ya. Si el build rompiera el despliegue, se quita el fichero y todo
  vuelve a estar como antes.

**Y once fugas de idioma**, todas de fuera del diccionario —que está sano: las
tres tablas cuadran y ninguna clave se llama sin existir—:
· «En Puerto de la Cruz, muy bien.» era **el segundo mensaje de la
  conversación** y estaba escrito en español a pelo: un inglés leía «En Puerto
  de la Cruz, muy bien. Do you have a car?».
· `«muy a menudo, no hace falta mirar el horario»`, `«(de madrugada)»` y el
  botón `«Abrir en Google Maps»` se construían en español antes de traducir.
· `tipoTr()` no se llamaba en la tarjeta del plan: en inglés se leía «Árbol /
  monumento natural · 40 min» teniendo la tabla completa a un paso.
· Los textos se cortaban **a mitad de palabra y sin puntos suspensivos**
  —«…que debían viajar desde e»—. Ahora `recorta()` corta por palabra entera.
· Los errores técnicos viajaban en español dentro del aviso alemán: «Grund: El
  servidor respondió 501 en las dos rutas».
· **Tres claves duplicadas** en los tres idiomas —`otroDia`, `ajustar`,
  `copiado`—: en un objeto literal gana la segunda, así que la primera era
  texto muerto. Fuera.
· `toLowerCase()` sobre nombres propios: «En isla baja (garachico, icod,
  buenavista)».
· Comillas españolas dentro del inglés y del alemán.
· Y `<html lang="es">` **no cambiaba nunca**: se recorría la web entera en
  inglés y el lector de pantalla seguía pronunciándola con fonética española.
  Una línea. De paso, el idioma va ahora en la URL (`?lang=en`) y se lee al
  arrancar, que es lo que permite mandar el enlace ya traducido por WhatsApp.

**Y dos roces de uso que eran de una línea:** «bien con niños» y «NO para
niños» se le enseñaban a quien viaja sin niños —tres charcos con el cartel de
«NO para niños» en un plan de grupo—, y el prompt no decía nada de los
decimales, así que salía «unas 0.8 horas» en vez de «unos 50 minutos».

**Lo que la auditoría dejó sin arreglar a propósito**, porque no es un fallo
sino una decisión pendiente: las horas de verdad en cada parada, el reloj de
cuenta atrás de la última guagua —que **ya no está bloqueado por el dato**
desde que la matriz sale del GTFS: la hora es de verdad y el reloj se puede
hacer—, y lo de descartar las paradas lejos de la guagua sin coche —eso ya se probó y está apuntado abajo: no mejoraba nada
medible y empeoraba otras cosas—.

## La matriz de guaguas, rehecha desde el GTFS

Zeben mandó cuatro ficheros —«en estos archivos tienes todo lo relacionado con
el transporte y con las guaguas en Tenerife, revísalo bien y usa todo lo que
necesitas»— y dentro venía lo que llevaba semanas faltando: **el GTFS oficial
de TITSA**, 49.373 viajes con su hora parada a parada, 3.897 paradas y el
calendario de seis meses. Con eso, la última guagua de la TARDE **se calcula**,
no se estima, y el apaño de callar el número se va.

Lo hace **`matriz.js`**, que es la herramienta que la matriz nunca tuvo —la
primera salió una vez de los horarios y no quedó camino para repetirla, el
mismo error que costó las 215 fichas sin `bus` hasta que se escribió
`guaguas.js`—:

    node matriz.js /ruta/al/gtfs            ensayo: mide y compara, no escribe
    node matriz.js /ruta/al/gtfs escribir   reescribe datos/titsa-matriz.js

Lo que cambia en el dato: `ultima` es ahora, **por construcción**, la última
salida antes de la 01:30, y el búho vive aparte en `buho` con su nombre. De los
**234 pares laborables que solo tenían madrugada, los 234 tienen ya su hora de
la tarde**, y no queda **ni uno** en toda la matriz que solo tenga búho. De
paso, la matriz pasa de 850 pares a **930** y cubre los 850 viejos.

Y cinco decisiones que costaron, cada una de un número absurdo que salió por el
camino. Ninguna se puede quitar sin que vuelva el suyo:

· **El municipio de una parada no viene en el dato** —ni el GTFS ni el fichero
  del Cabildo lo traen— así que sale de lo que ya tenemos fichado. Pero **no
  del punto más cercano a secas**: con eso, la Cruz del Carmen y el Pico del
  Inglés se iban a Tegueste porque justo al lado hay dos senderos fichados ahí.
  **Votan los 7 más cercanos**, pesando 1/(km+0,2).
· **Y aun votando no basta: de un sitio que no conocemos no se dice nada.**
  Guamasa es de La Laguna y no tenemos nada fichado allí, así que el voto lo
  decidían vecinos a dos kilómetros y salía Tegueste — y con él «la última
  guagua de Tegueste a La Laguna es la 01:20», que es la de Guamasa y deja al
  de Tegueste esperando. La regla que lo cierra: una parada solo vale de
  **principio o final** si tiene algo fichado de su municipio a menos de 1,2 km.
  Para **cambiar** de guagua vale cualquiera: ahí no se afirma dónde se está.
· **El viaje tiene que LLEVAR de un pueblo al otro, no cruzar la raya del
  término.** Salía «de La Orotava al Puerto, última la 01:27, un minuto de
  viaje»: una guagua saltando de la última parada de un término a la primera
  del otro. Cierto y completamente inútil. Ahora entre la parada donde suben y
  la parada donde bajan tiene que haber el **60% de lo que separa los dos
  cascos**, que sale del propio dato.
  Lo que **no** vale es exigir que las paradas estén junto al casco: probado, y
  se caen 266 pares de golpe. La estación de Adeje es Costa Adeje, a cinco
  kilómetros del casco, y la de Arona es Los Cristianos. **El pueblo no siempre
  está donde para la guagua.**
· **El trasbordo es en la misma parada o en otra a 400 metros, y con espera de
  entre 10 y 60 minutos.** «En el mismo municipio» no vale —cambiar en Santa
  Cruz puede ser cruzar la ciudad—, pero la parada exacta tampoco: se caían 74
  pares, entre ellos todo Arafo, porque la 121 acaba a doscientos metros de
  donde para la 711. Y el tope de los 60 minutos no es cosmético: sin él, el
  enlace se daba por bueno contra la salida más tardía de la parada, que muchas
  veces es el búho de las cuatro, y salía «última a las 23:50» con cuatro horas
  de plantón en medio.
· **Se admiten DOS cambios, no uno.** A Tegueste solo se llega por La Laguna,
  así que desde el Puerto o desde La Guancha hacen falta dos: con uno solo
  salían horas de la mañana —«la última de La Guancha a Tegueste es la de las
  06:44»— o el par desaparecía. Tres no se ofrecen: eso ya no es volver a casa.
· **Cada cambio cuesta 20 minutos al elegir.** La vuelta buena no es la más
  tardía a secas: salía «la última de Candelaria a Güímar es la 01:15,
  cambiando en Barranco Hondo con 44 minutos de espera» habiendo una directa a
  la 01:00. Quince minutos más de tarde no valen un plantón de madrugada en un
  cruce. Y cuando aun así gana la combinación, **la última directa va también**,
  en `y_hay_una_directa`, como la opción cómoda.

Dos cosas más que hay que saber:
· **`dur` es la MEDIANA del día, no la del último viaje.** El último viaje es
  el más rápido que hay —sin tráfico y con menos paradas— y de ahí salían «9
  minutos» de La Orotava al Puerto, que fue otro de los avisos de la auditoría.
· **Un día, un horario.** Para cada tipo de día se coge UNA fecha de verdad del
  calendario —la de viajes medianos de su grupo, que así ni el 25 de diciembre
  ni un puente mandan— y sale impresa en la cabecera del fichero. Mezclar
  varias daría un horario que no existe ningún día. Y como «finde» son sábado y
  domingo juntos y no tienen el mismo horario, del par se guarda **lo más
  flojo**: equivocarse por ahí les hace volver antes; al revés los deja tirados.

Lo que esto obliga a cambiar arriba: el informe ya no lleva
`guagua_de_madrugada` ni `no_sabemos_la_ultima_de_la_tarde` —no hacen falta— y
sí lleva `cuanto_se_tarda_min`, `cuantos_cambios`, `cambio_en`,
`parada_del_cambio`, `espera_del_cambio_min`, `y_hay_una_directa` y
`y_de_madrugada`. El prompt lo explica y el narrador local lo cuenta con
plantillas nuevas en los tres idiomas. Se fue `avVueltaBuho`, que ya no
describe nada. Y salió **otra fuga de idioma** que la auditoría no cazó: el
aviso de «están en X y duermen en Y, la última guagua sale a las…» estaba
escrito en español a pelo; va por `avEstanFuera`.
La matriz pasa de 340 KB a **542 KB**, que es lo que cuestan las combinaciones
con su parada y su espera. El zip queda en 2,48 MB.

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

**Hay DOS registros del Cabildo y no son el mismo.** Esto costó un agujero de
catálogo entero. El de **establecimientos** (13.678 filas) trae la calle y NO
trae coordenadas: lo que se añade desde ahí va con `pos_aprox`, y entonces el
botón de mapa busca por nombre en vez de navegar a una chincheta inventada.
El de **locales de hostelería y restauración** (9.652 filas) sí trae
`latitud`, `longitud` y teléfono, y es el que llena los agujeros. Aquí escribí
que «el registro no trae coordenadas» a secas, di por bueno que en San Miguel
no había ni un restaurante, y lo que pasaba es que estaba mirando el fichero
equivocado. **Cuando lleguen varios ficheros de la misma fuente, hay que abrir
los dos y comparar las columnas antes de decidir qué se puede hacer con ellos.**

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
su array de días abiertos y canta las contradicciones. Referencia: de 394
restaurantes, 76 mencionan días de cierre y **cero se contradicen**.

`lote.js` es el que hay que pasar **después de tocar el motor**. Marca
DISPERSO, SALTO, CIERRE-LEJOS, COMIDA-LEJOS, RECINTO, CURVAS-NOCHE.
Referencia actual: dispersión mediana 4,1 km, **cero banderas de todas** y
**ningún** día de 2 paradas — eran 3, y el último se cerró al fichar Charco del
Pino. La de comida lejos fueron 3, luego 1 y ahora 0: las dos primeras no eran
escasez de catálogo, era el filtro de municipio ganándole a la cercanía; la
última sí era catálogo, y se cerró con `hosteleria.js`.

Trae doce planes **con ancla**, que es el camino que la tabla no
pisa: el sitio lo elige el turista y `construir()` lo mete antes del bucle.
Referencia: 0 reventones y 0 planes donde el sitio pedido no salga. Los
sitios no están escritos a mano —se sacan de los datos, el de más peso de
cada municipio— así que la prueba no se pudre al cambiar el catálogo.

Y cierra con la **escapada**: 4 días desde cada una de las 31 bases, 124 días.
Referencia: 0 reventones, 0 días por encima de 25 km de dispersión (mediana
4,5, máximo 12,3) y **0 días** con la comida a más de 8 km de toda parada — era
1, en Granadilla, y no era geografía: era que los restaurantes del casco no
estaban fichados.

Y un bloque de **perfiles**: el mismo día en cuatro versiones (coche/guagua ×
pareja/niños) desde las 31 bases. Referencia: 0 sitios no aptos con niños, 71%
de paradas «niños: Sí» con niños contra 23% en pareja, 59% de tipo divertido,
2% de planes iguales entre pareja y niños, 47% iguales entre coche y guagua
—esos son legítimos: sitios que ya están junto a una parada— y 213 m de media
a la guagua sin coche. Ese 47% era 53% antes de `guaguas.js`: con las 215
fichas mudas ya medidas, el motor puede descartar de verdad lo que queda lejos
de una parada, y el plan sin coche se separa más del plan con coche.

Y cierra con los **actos**: por cada día y municipio con programa cargado,
un plan con niños y otro sin ellos —380 planes—. Lo que se vigila ahí no es la
dispersión, es que a nadie se le ofrezca lo que no le toca. Referencia: de los
**571 actos cargados** (66 marcados de niños, 170 de noche, 335 sin marcar),
**811 ofrecidos** y **0 ofrecidos a quien no toca**. Ese cero es la prueba de
toda la regla; los 483 «sin clasificar y ofrecido» ya NO son un fallo, que
desde que `q` dice solo si es de niños, lo que no está marcado va a los
adultos y eso es lo normal.

Y el último bloque, **otras fiestas y la cena**: barre los días que tienen dos
fiestas a menos de 8 km y comprueba que salgan las dos. Referencia: 20 días,
0 reventones, **20 cuentan la segunda (100%)** —por las otras fiestas, por el
programa o por el aviso de la lejana, que los tres valen—, **0 casos de una
fiesta de noche tapando a una de día** y 9 con sitios para cenar.
Y cierra midiendo si colocar la fiesta sirve de algo: arma el día desde su
propio pueblo con las coordenadas y sin ellas. Referencia: **89 fiestas con
sitio, 38 días cambian (43%); de las 33 que están a más de 1 km del casco,
cambian 26 (79%)**. Ojo con ese bloque: tiene que mutar el `EVENTOS` que
**exporta `banco.js`**, no el que `lote.js` lee del fichero con `eval` — con la
copia, quitarle las coordenadas no cambia nada y el porcentaje sale 0%, o sea
que la prueba dice que la mejora no sirve.

Y un bloque de **la vuelta sin coche**, que guarda el fallo más gordo que ha
tenido la web: arma 62 planes sin coche que cruzan de municipio y comprueba que
a nadie se le dé una hora de madrugada como «la última». Referencia: **62 con
hora de vuelta, 0 sin dato, 0 búhos dados como la última y 0 viajes de menos de
tres minutos** —que serían un salto por encima de la raya del término—, 16 con
cambio de guagua, 33 con búho aparte bien contado y 12 minutos de viaje
mediano. Ese bloque vale porque **con la matriz vieja daba 29 búhos de 62**: se
comprobó cambiando el fichero y volviéndolo a poner.

Y el último, **el regalo de camino**: barre 124 planes con coche y cuenta en
cuántos sale un mirador de camino a la primera parada. Referencia: **88
miradores en el catálogo (41 con posición aproximada), 36% de los planes y
1,1 km de desvío mediano**. Eran 25 miradores y el 12%, así que este número
mide sobre todo el catálogo, no el motor.

**Con navegador** — `probar-web.js` con Playwright recorre siete flujos en
Chrome y captura los errores de consola. Sin argumentos va contra la web
desplegada; con una URL detrás va contra lo que se le diga, y **eso es lo que
hay que hacer para probar una rama**: se levanta un servidor de ficheros en el
directorio y se le pasa `http://127.0.0.1:8787/index.html`. Contra la web
desplegada se prueba el zip de la última vez, no lo que se acaba de tocar.
Dos trampas de la propia prueba, las dos encontradas dándola por rota cuando
la rota era ella:
· **Los rótulos son los de `tr()`, y cambian.** Cuando las preguntas pasaron a
  ser carteles con dibujo, «Sí, tenemos coche» se quedó en «Con coche» y «Lo
  que haya bueno» desapareció. Los siete recorridos fallaban en el segundo
  paso y parecía que la web no respondía.
· **Un paso puede no existir ese día.** La pregunta de «ese día hay cosas por
  la isla» solo sale cuando hay fiesta o programa, y la prueba corre con la
  fecha de hoy: unos días sale y otros no. Un paso que empieza por `?` es
  **opcional** y no cuenta como fallo si el botón no está.
· **Un rótulo de dos letras pilla de todo.** Los botones se buscan por texto
  contenido, así que «EN» —el del idioma— encajaba también en «JUEVES · 12
  EVENTOS», que es el que abre el calendario: la prueba en inglés abría el
  calendario y luego se quejaba de no encontrar «With a car». Un paso que
  empieza por `=` se busca ahora **exacto**.
Y desde el contenedor **siempre** va a haber errores de consola que no son de
la web: el proxy corta Leaflet y las tipografías de Google por certificado, y
las funciones de Netlify no existen en un servidor de ficheros. Lo que hay que
mirar es que **no haya ningún error de JavaScript propio** — y que, con la API
caída, el plan salga igual por el narrador local, que es la red de seguridad.
Referencia: **7 de 7 recorridos completan todos sus pasos, 0 errores de
JavaScript propios**, y el plan sale con sus fichas y su caja de texto.

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

## Lo que ha mandado Zeben, y qué se hizo con ello

Esta lista existe porque él preguntó —«no sé de todo lo que te he mandado lo
que has usado y lo que no»— y porque la pregunta estaba justificada: un fichero
suyo se quedó cuatro días sin abrir y eso costó un agujero de catálogo. **Cada
vez que entre algo nuevo, se apunta aquí.**

| qué mandó | cuándo | qué se hizo |
|---|---|---|
| El proyecto entero en zip y su `CLAUDE.md` | 23 ago | La base de todo |
| Capturas de la web (unas 15) | 24 ago – 7 sep | De ahí salieron el mapa con el cartel de «API KEY» encima, el relato plano, el restaurante en el filo del encuadre y el calendario sin rótulo |
| `.mht` de la página en vivo (3) | 5 y 7 sep | La ortofoto detrás del emoji, que ninguna hipótesis había cazado. **Es la mejor herramienta que tenemos para «no se ve bien en la web»** |
| Fotos de sitios, tres zips | 3 sep | **47 fichas con foto**: 33 de Commons con su crédito y 14 suyas |
| Tres programas de fiestas pegados a mano | 5 sep | Los primeros `ACTOS` |
| Artefacto «Fiestas de Tenerife» de Cowork | 5 sep | **300 actos** de 22 programas |
| Artefacto «Miradores de Tenerife» de Cowork | 9 sep | **63 miradores nuevos** (88 en total); el regalo de camino pasó del 12% al 36% |
| `sitios-fiestas.json`, dos tandas | 9 sep | **89 fiestas con su sitio propio**; 26 de las 33 que caen fuera del casco dan ahora un día distinto |
| Los recorridos de cinco romerías, contados de memoria | 9 sep | La regla de «manda la LLEGADA, no la salida», y dos correcciones mías |
| Coordenadas de tres caseríos de Granadilla | 9 sep | Charco del Pino y Los Blanquitos, fichados. Los de Los Abrigos no cuadraban y se apartaron |
| Cinco fechas de romería corregidas | 7 sep | En dos de ellas **no valía ninguna de las dos que teníamos** |
| Registro de **establecimientos** (13.678 filas, csv y json) + su diccionario | 10 sep | Solo la calle, sin coordenadas. De ahí salen **43 fichas con `pos_aprox`** |
| Registro de **locales de hostelería** (9.652 filas, con `latitud`/`longitud`) | 10 sep | **Este es el que se me pasó.** Ahora entra por `hosteleria.js`: 76 fichas nuevas y los cuatro pueblos sin donde comer, cerrados |
| Los 16 ficheros de datos abiertos del Cabildo | 10 sep | Ver la tabla de abajo, uno por uno |
| La extensión de Netlify | 10 sep | Con ella se ve el proyecto, los despliegues y las variables desde aquí. Confirmó que **la clave está puesta** y que **lo publicado era del 8 de septiembre**, una semana por detrás de la rama |
| Segundo artefacto «Fiestas de Tenerife» de Cowork | 10 sep | **538 actos de 22 programas**, transcritos íntegros de lagenda. Cruzados contra los 300 que había: 182 coincidían. `ACTOS` pasa de 300 a **648** tras quitar 47 repetidos, y a **571** tras tres pasadas de repetidos, la última marcada por él a mano |
| «Le monto el día alrededor de la fiesta infantil» | 11 sep | `loQueHayEseDia()`: antes de armar nada se enseñan las fiestas y los pueblos con programa que le sirven, y elige el turista. Antes el motor cogía la única fiesta de `EVENTOS` y los actos no podían anclar |
| «Un icono 🎉 en vez del punto» + el rótulo de los pueblos | 11 sep | Hecho, con el 🎉 más flojo que el icono de la fiesta para que no se pierdan las de verdad |
| Captura con los `**` a la vista | 11 sep | El markdown del modelo se convierte en negrita, y el prompt le dice que no lo use |
| «Monta el zip con el fichero dentro y lo probamos» | 11 sep | El freno de la clave ya cuenta compartido con Netlify Blobs, y de paso quedó probado que `package.json` no rompe el despliegue por zip |
| Artefacto «Auditoría de Naira» | 11 sep | Revisión técnica de la web desplegada: 4 fallos críticos, 7 altos y 11 fugas de idioma, todos comprobados y arreglados. El gordo: «la última guagua» era el búho de madrugada |
| «Quita el compartir, pon iconos y un botón de eventos» | 11 sep | El de compartir llamaba a una función que no existe: fuera, y fuera también el respaldo que la llamaba. 🏖 y 🥾 en las preferencias, y el botón de montar el día alrededor de un evento en el menú y después del plan |
| «Destaca el lugar del evento y que lleve a la localidad» | 11 sep | El calendario agrupa los actos por sitio, con la localidad en negrita y pulsable al mapa. De paso salieron los actos repetidos: 648 → 571 |
| «Elegir varios días en el calendario» | 10 sep | El calendario deja marcar la estancia entera y cuenta día por día lo que cae. El plan sigue siendo de un día |
| Cuatro zips de transporte: el **GTFS de TITSA**, las paradas, las líneas y los itinerarios | 12 sep | El GTFS es el que faltaba: 49.373 viajes con su hora parada a parada. Con él, `matriz.js` rehace la matriz de municipios y **la última guagua de la tarde deja de ser el búho de madrugada** en los 234 pares donde lo era |
| El Instagram de Naira | 9 sep | Suyo, hecho a mano. Ahora `instagram.js` le saca el contenido de la semana del calendario; publicar lo sigue haciendo él. La web todavía no lo enlaza |

**Y los 16 ficheros del Cabildo, cada uno.** Los mandó de golpe preguntando si
había usado todos los datos o solo la mitad. Medido fichero a fichero, cruzando
cada uno contra el catálogo:

| fichero | qué trae | qué se ha hecho |
|---|---|---|
| `paradasdeguagua.csv` / `.geojson` | 3.872 paradas **con coordenada** | Se usó una vez para el campo `bus` y **no quedó herramienta**, así que 215 fichas nuevas se quedaron mudas. Cerrado con `guaguas.js`: quedan 4 sitios sin parada, los 4 que no tienen coordenada |
| `google_transit.zip` (**GTFS de TITSA**) | 49.373 viajes, 3.897 paradas, 1.517 servicios y seis meses de calendario | Es el fichero que le faltaba a la matriz de municipios. Lo lee `matriz.js` y de ahí sale `datos/titsa-matriz.js` entera. El `shapes.txt` (31 MB, el trazado de cada línea) **no se usa**: el mapa dibuja las paradas del día, no el recorrido de la guagua |
| `lineas-y-horarios.csv` / `.json` | los 182 números de línea con su nombre y su web | **No hace falta aparte**: lo mismo está en `routes.txt` del GTFS, que es de donde se lee |
| `itinerarios__titsa1.csv` | 225 itinerarios del Cabildo, columnas BIEN puestas | Es `datos/senderos-tenerife.js`. **112 están fichados en `LUGARES` y los 112 cuadran** al metro con este fichero |
| `itinerarios.geojson` y `itinerarios.geojson_1` | los mismos 225, con el trazado (15 MB cada uno, y son el mismo fichero dos veces) | De aquí solo se sacan los datos, no el trazado: el mapa dibuja las paradas del día, no la línea del sendero. Y **traen las etiquetas corridas** —`itinerario_distancia` contiene la altura máxima—, que es la trampa que ya está apuntada arriba |
| `diccionariodedatosdeitinerarios.json` | el esquema de esas columnas | Es lo que demuestra que el geojson las trae mal y el csv bien |
| `puntosdeinteres.geojson` | 191 puntos con descripción | **179 ya están** (mismo nombre o a menos de 150 m). Los 12 de fuera son 8 árboles monumentales al borde de un sendero, una oficina de turismo, un lagar y un lomo |
| `bic_inmuebles.geojson` | 199 Bienes de Interés Cultural | **141 ya están.** De los 58 restantes, 41 son zonas arqueológicas y sitios históricos sin acceso ni visita —no son sitios a los que se manda a un turista— |
| `bic_inmuebles_entornos.geojson` | 125 polígonos | **No se usa y no hace falta**: es el perímetro de protección alrededor de cada BIC, no un sitio |
| `equipamientos.geojson` | 101 equipamientos del monte | De los 37 visitables (áreas recreativas, miradores, centros de visitantes) **36 ya están**. El que falta es el Aula en la Naturaleza del Barranco de la Arena |
| `actividadesenlanaturaleza.json` | 47 actividades, 23 con coordenada | **No se usa**: son permisos —acampada, barranquismo, escalada, estancia de grupos—, con aforo y solicitud previa. No es plan de un día para quien viene de vacaciones. Sus áreas recreativas ya están fichadas por otro lado |
| `miradores.geojson.json` | los 18 miradores de Santa Cruz | Es `datos/miradores.js`, y arriba está medido por qué no aporta: 7 están dentro del Palmetum y 10 de los 11 restantes ya están en `LUGARES` |
| `senderos_anaga.geojson.json` | 148 tramos **con el trazado de la línea** | `datos/senderos-anaga.js` sigue sin usarse, pero **la razón que había apuntada ya no vale**: decía que el csv no traía la geometría, y este geojson sí la trae. La razón buena es otra: hoy el mapa no dibuja el recorrido de un sendero, así que no hay dónde ponerla |
| `establecimientos…csv` / `.json` + diccionario | los 13.678 sin coordenada | Los 43 restaurantes con `pos_aprox` |

Lo que sigue **sin usar** de lo suyo, y por qué:
· De los 9.652 locales del registro, los **5.587 que no son de comer** —bares,
  cafeterías, discotecas, salones— y los de comer que caen donde ya hay catálogo
  escrito a mano. No es descarte: es que meterlos todos cambiaría un catálogo
  por un listín. Si algún día hace falta un desayuno o un sitio de copas, están
  ahí y `hosteleria.js` sabe leerlos.
· Las **75 heladerías** del registro. El remate del día ya sale del catálogo
  propio; se meterán el día que se vea un pueblo sin nada para rematar.
· El aforo (`aforo_interior`, `aforo_terraza`) del otro registro. El aviso de
  aforo existe pero no lo usa nadie todavía.
· Del Cabildo, lo que la tabla de arriba marca sin usar: los entornos de los
  BIC, las actividades con permiso, el trazado de los senderos de Anaga y 12
  puntos de interés —ocho de ellos árboles monumentales al borde de un camino—.
  Ninguno se queda fuera por pereza: o ya está cubierto por otra ficha, o no es
  un sitio al que se manda a un turista, o no hay dónde pintarlo.

## Pendiente

- **Partir `index.html`** en varios ficheros.
- `datos/senderos-anaga.js` está cargado y no lo usa nadie.
- `datos/titsa-regreso.js` tampoco lo usa nadie, y ahora además **sobra**: era
  el único sitio con `ultima_antes_medianoche` y solo cubría dos corredores de
  origen; la matriz nueva trae ese dato para los 930 pares. Son 6 KB que se
  bajan para nada. Quitarlo es una línea en `index.html`.
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
- **Los cuatro pueblos donde no se podía comer EN el pueblo: resuelto, y la
  lección duele.** Zeben lo preguntó de golpe —«¿no tienes restaurantes en
  Granadilla?»— y le contesté que sí, ocho, pero los ocho a 9–10 km del casco,
  todos en El Médano. Medido sobre los 31 municipios, mirando sitios de comer
  (sin heladerías) a menos de 2 km del centro urbano, salían cuatro con **cero**:

  | municipio | antes, a <2 km del casco | ahora |
  |---|---|---|
  | San Miguel de Abona | **0** (ninguno en todo el término) | 7 |
  | Adeje | 0 | 6 |
  | Arona | 0 | 4 |
  | Granadilla de Abona | 0 | 8 |

  Escribí que eran «cuatro huecos del catálogo» y que San Miguel era el caso
  serio porque «no tiene NI UN restaurante fichado». Lo segundo era verdad del
  catálogo y **mentira de la isla**: el registro de locales del Cabildo trae 120
  sitios de comer en San Miguel, 197 en Granadilla, 576 en Adeje y 812 en Arona,
  **con coordenadas**, y ese fichero ya me lo había mandado él. Yo estaba
  mirando el otro registro, el que solo trae la calle. Zeben se molestó con
  razón: *«te mandé un montón de archivos con un montón de datos y no has
  aprovechado»*.
  Lo arregla **`hosteleria.js`**, abajo. Ahora **ningún municipio se queda a
  cero** junto a su casco y la bandera COMIDA-LEJOS de `lote.js` está en **cero**
  en los tres barridos, cuando llevaba desde el principio marcando Granadilla.

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
- Sin coche salen paradas lejos de la guagua (6 de los 372 planes de perfil,
  todas senderos y paisajes de monte; la media está en 213 m). El informe lo dice en
  `guagua_mas_cercana`, así que no se oculta, pero está sin decidir si debería
  descartarlas. Probé a penalizar el cierre y a acortar el radio sin coche: no
  mejoró nada medible y empeoraba esto, así que se quitó.
- **¿Hay que fichar los caseríos de cada municipio?** Zeben lo preguntó al ver
  lo de Los Abrigos: «entonces lo tendrías que hacer con Bajamar, Punta del
  Hidalgo, San Andrés… ¿no?». Medido, y la respuesta es **no**: esos ya están
  cubiertos, y no por una ficha de pueblo sino por sus propios sitios, que es
  lo que el motor necesita.

  | núcleo | sitios a <2 km | restaurantes a <2 km |
  |---|---|---|
  | Bajamar | 3 (sus piscinas a 0 km) | 7 |
  | Punta del Hidalgo | 6 (la iglesia de San Mateo a 0,4) | 8 |
  | San Andrés | 3 (el búnker, Las Teresitas) | 7 |
  | **Los Abrigos** | **1, y es una playa que no es la suya (1,2 km)** | **0** (lo más cerca a 2,1) |
  | **Charco del Pino** | **0** (lo más cerca a 2,9 km) | **0** (a 6,4 km) |
  | **Los Blanquitos** | **1, el museo de Granadilla a 1,8 km** | **0** (a 6,9 km) |

  Tegueste no entra: es municipio propio y tiene su centro en `BASES`.
  Y el barrido de toda la isla lo confirma. **Los restaurantes marcan dónde hay
  pueblo**: agrupando los 318 por cercanía (700 m) y mirando si hay algún
  `LUGAR` a menos de 2 km, **solo UN grupo de dos o más se queda sin nada** —
  dos guachinches de la medianía de Tegueste, con la iglesia de San Lázaro a
  2,7 km. O sea que el catálogo cubre la isla mucho mejor de lo que parecía; el
  hueco es **una esquina concreta**, la costa y las medianías de Granadilla.
  Ojo con cómo se mide esto: la primera vez puse Bajamar de memoria y me salió
  2,2 km al oeste de donde está, así que el catálogo parecía tener un agujero
  que no tenía. **Las coordenadas de un núcleo se sacan de un dato, no de la
  cabeza** — la ficha de sus piscinas, o de sus restaurantes.

- **Cuando no hay foto, telón del pueblo.** Para 203 fichas (iglesias, cascos,
  museos, caseríos) la ortofoto aérea solo enseñaba un tejado. Ahora esas usan
  la estampa de su municipio **desenfocada** detrás del icono: se queda el
  color y el aire del sitio. Desenfocada a propósito, porque las estampas
  llevan el nombre del pueblo escrito dentro y al recortarlas salía medio
  rótulo («LA OROTA»). Playas, charcos y paisajes siguen con el aéreo, que
  ahí sí dice algo.
- **La ortofoto viene de fuera, y lo de fuera se cae.** Zeben avisó de que en la
  web no salía **ninguna** imagen. La vista aérea de cada ficha se le pide a
  GRAFCAN (`idecan1.grafcan.es/ServicioWMS/OrtoExpress`), y si ese servicio no
  contesta el hueco se quedaba en blanco: la ficha parecía rota. Dos cosas,
  porque son dos problemas distintos.
  **Que nunca haya un hueco vacío.** `marco()` mete ahora una **sonda**: una
  imagen de un píxel con la MISMA url que el fondo —así que no cuesta otra
  petición, el navegador la cachea— y con `onerror`. Si la ortofoto no llega,
  `aereoFalla()` pone detrás la estampa del pueblo desenfocada, que es el mismo
  telón que ya usaban los museos, y si el pueblo no tiene estampa quita el fondo
  y manda el icono. Esto vale para cualquier caída futura, no solo para esta.
  **Y averiguar por qué no contesta.** Desde el contenedor no se puede: el proxy
  deniega GRAFCAN igual que Commons. Así que lo comprueba el navegador de casa,
  como con las fotos y los miradores: `probar-aereo.html` pide la Playa de Las
  Teresitas a **siete** direcciones distintas —la que hay puesta, la capa en
  mayúsculas, WMS 1.3.0 con las coordenadas en los dos órdenes, el otro servidor
  de GRAFCAN, y el PNOA del IGN por si hay que cambiar de fuente— y dice cuáles
  traen imagen. Ojo con el orden de las coordenadas: en WMS 1.1.1 el `BBOX` va
  en lon,lat y en 1.3.0 con `EPSG:4326` va en lat,lon; equivocarse ahí devuelve
  una imagen en blanco, no un error, que es lo que lo hace difícil de ver.

  **Y la primera respuesta descartó la hipótesis obvia.** Zeben abrió esa página
  y le funcionaron seis de las siete: o sea que la dirección está bien y GRAFCAN
  está vivo. Pero la abrió **desde su carpeta**, con `file://`, y ahí el
  navegador no manda la cabecera `Referer`. Desde la web sí la manda, y muchos
  servicios públicos cortan por ahí las peticiones que vienen de otro dominio.
  Por eso la página pasó a ir **dentro del zip**: abrirla en
  `…netlify.app/probar-aereo.html` es la única prueba que reproduce lo que hace
  Naira. Y trae un bloque nuevo que pide la MISMA foto de tres formas —como
  `<img>`, como `<img referrerpolicy="no-referrer">` y como fondo de CSS, que es
  como la pide el motor—: si la segunda funciona y la primera no, el arreglo es
  una línea. Descartado ya: no hay service worker ni CSP en el `<head>`.

- **«Las imágenes no salen» era que no se veían.** Zeben dijo que en la web no
  salía ninguna ortofoto. Se probó todo: GRAFCAN contesta, las siete direcciones
  funcionan, las imágenes propias llegan, el CSS está bien. Lo que lo resolvió
  fue que él **guardó la página en vivo** (`.mht`) y la mandó: Chromium abre esos
  ficheros, así que se pudo renderizar aquí su página tal cual la veía él. Y
  ahí estaban las ortofotos, cargadas y pintadas — **detrás del emoji**.
  El cuadro medía 62 px, el icono ocupaba el centro con su sombra, y una vista
  aérea de 350 metros a ese tamaño es una mancha marrón. No era un fallo: era
  que no se leía. Ahora el cuadro mide 80 px, la ortofoto se pide a 240 px y
  abarca 700 metros —lo que hace falta ver es DÓNDE está el sitio, la playa con
  su bahía— y, **cuando hay una foto de verdad detrás, el icono se va a una
  esquina**, pequeño y sobre un disco oscuro para que se lea igual encima de la
  arena que del monteverde. Con el telón del pueblo no: ese es un dibujo de
  fondo, no una foto del sitio, y ahí el icono sigue mandando en el centro.
  La lección para la próxima: **cuando algo «no sale» en la web, pide el `.mht`
  de la página**. Trae el DOM, el CSS y las imágenes tal como los recibió su
  navegador, y se abre aquí con Playwright. Media hora de hipótesis se resuelve
  en una captura.

- **El mapa llevaba un cartel de «API KEY» pintado encima.** Salió en esa misma
  captura, y no lo había visto nadie. Los mosaicos eran de CARTO, y desde que
  exigen clave le estampan `API KEY` en diagonal a quien no la lleva. Se pasó a
  los de OpenStreetMap, que no piden clave y solo piden que se les cite —cosa
  que ya se hacía en la atribución y en el pie—. Ojo: el servidor de OSM no
  tiene subdominios (`{s}`) ni mosaicos de doble densidad (`{r}`), así que la
  plantilla de la URL es más corta que la de antes.

- **Cuando la API falla, el plan salía plano.** Zeben lo vio: «se ve muy plano,
  con la misma fuente y sin colores». Y tenía razón, pero la causa era un
  descuido de una línea: hay tres caminos para pintar el relato —el bueno, el
  del plantón de 30 segundos y el del error de la API— y **el tercero no
  llamaba a `resaltar()`**. Los otros dos sí. Así que justo cuando la API se
  cae, que es cuando peor pinta tiene que dar, el plan salía sin un solo sitio
  en negrita, sin una hora marcada y sin un teléfono. Se le puso el
  `resaltar(texto,brief)` que le faltaba.
  Y ojo al dato de fondo: que lo viera significa que **la web estaba narrando
  en local**, o sea que la función de Netlify no contestaba. El sello del pie
  lo dice —«Naira, sin conexión a la API»— y ahí es donde hay que mirar:
  `…/.netlify/functions/naira?probar=1` responde si la clave está puesta.

- **El restaurante estaba en el mapa, en el filo.** «En el mapa no salen los
  restaurantes»: la chincheta estaba, pero pegada al borde de abajo y medio
  tapada por la línea de atribución de Leaflet. El encuadre usaba solo margen
  proporcional (`.pad(0.22)`), y con un día estirado de norte a sur ese 22% son
  kilómetros arriba y veinte píxeles abajo. Ahora el margen va también en
  **píxeles** —y por abajo un poco más, que es donde está el rótulo—:
  `.pad(0.12)` con `paddingTopLeft:[26,26]` y `paddingBottomRight:[26,42]`.

- **Sitios repetidos: pasa, y duele de tres maneras.** Garachico tenía TRES
  fichas del mismo casco y La Laguna dos, porque cada fuente que se importó
  —Cabildo, Bienes de Interés Cultural, redacción propia— lo llamaba distinto:
  «Casco histórico de Garachico», «Conjunto Histórico Villa y Puerto de
  Garachico», «Casco de Garachico». El turista lo ve dos veces en la lista, el
  motor puede meter las dos en el mismo día creyéndolas paradas distintas, y
  las fotos se hacen por duplicado. `fusionar.js` los junta: no borra, **funde**
  —el peso mayor, el texto más largo, la parada de guagua más cercana, la foto
  con su crédito— y sin argumentos hace un ensayo sin tocar nada. Los grupos
  van escritos a mano y no se detectan solos: «Montaña Grande» y «Circular
  Montaña Grande» están a 450 m y son cosas distintas. Ojo con el `dur`: coger
  el mayor le ponía 120 minutos al Mirador Pico del Inglés, y en un mirador se
  está veinticinco. Quedaron 579 sitios.

- **Descripciones que no eran del sitio.** Al importar los puntos de interés
  del Cabildo, la descripción de un **árbol monumental** cercano se pegó a la
  ficha de al lado: el Mirador Pico del Inglés contaba que «está ramificado
  desde la base y el tronco principal está muerto». Se detectan exacto por
  `sub_of:'Árbol monumental'` en fichas que no son un árbol —eran **14**— y no
  es un detalle de catálogo: `desc` viaja al informe como `que_es` y el prompt
  manda contarlo como la historia oficial, así que Naira lo estaba diciendo. Se
  les quita `desc`, `desc_of` y `sub_of`: sin descripción, la regla es callarse.

- **Fotos por sitio.** La ficha ya las admite: `marco()` usa `l.foto` si la
  hay y, si no, una ortofoto aérea de GRAFCAN. Para una playa se defiende;
  para un museo es un tejado. Barrido de 744 planes: de 589 sitios del
  catálogo solo **198 salen alguna vez**, y de esos solo **82** tienen el
  aéreo inútil. Con **40 fotos** se arregla el 82% de esas paradas.
  **Van 47 puestas**: 33 elegidas por Zeben en Commons —todas con autor y
  licencia— y 14 hechas por él, que no llevan crédito porque son suyas. Quedan
  33, y de las 1.168 paradas del barrido donde el aéreo no
  dice nada, **688 ya enseñan una foto de verdad (59%)**. Las suyas son casi
  todas cascos históricos, que es el tipo de parada que más sale: por eso
  catorce fotos suben la cobertura del 33% al 59%. Las 25 ocupan
  476 KB en total, que es lo que pesan 240 px al 82% de calidad — el zip de
  Netlify pasa de 1,6 a 2,0 MB.
  `fotos.js` sin argumentos escribe `fotos-pendientes.md` con la lista
  agrupada por pueblo. `node fotos.js encargo` escribe **`fotos-encargo.md`**,
  que es la misma lista pero para dársela a OTRO —Claude en Cowork, por
  ejemplo—: lleva las coordenadas de cada sitio, el nombre exacto que tiene que
  llevar el fichero, el formato del `creditos.json` y, sobre todo, las reglas.
  Y esas reglas son el motivo de que exista el fichero: **la foto tiene que ser
  real y de ese sitio exacto**, con autor y licencia, y si no se encuentra se
  dice y se pasa a la siguiente. Una foto generada de un sitio que existe es
  justo lo que este proyecto no hace: el turista va y no lo reconoce.
  Con una carpeta como argumento, mete las fotos:
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
  única que va a existir, y para esas está la otra mitad del camino:
  `node fotos.js subir` escribe **`subir-fotos.html`**, donde se sueltan las
  fotos del móvil y se elige **de una lista** de qué sitio es cada una. El
  emparejado de `meter()` es por el nombre del fichero y del móvil salen como
  `IMG_4821.jpg`: renombrar diez a mano en el teléfono es justo el fastidio
  que hace que esto no se haga nunca. La página escribe ella el nombre,
  recorta al cuadrado y achica a 240 px —de 140 KB a 4—, así que se pueden
  subir veinte fotos sin que el zip pese nada. Dos detalles que costaron: las
  fotos de móvil vienen **giradas por EXIF** y salen tumbadas si se dibujan a
  pelo (`createImageBitmap` con `imageOrientation:'from-image'` las endereza),
  y dos fotos para el mismo sitio se pisarían dentro del zip, así que la
  segunda se rechaza. Estas fotos son suyas: no llevan `creditos.json` y la
  ficha no cita a nadie.
  Para probarla sin red: `?api=...` apunta a otra Commons —hay
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
  Y ahora la página distingue **dos cosas que se pegan igual pero no son lo
  mismo**: la agenda semanal, que trae fiestas sueltas de varios pueblos, y el
  programa de UNAS fiestas, que trae cuarenta actos del mismo pueblo. Se elige
  arriba, y el fichero que se baja lo dice (`tipo`), así que `node eventos.js
  ese-fichero.json` lo lleva solo a `EVENTOS` o a `ACTOS`. Dos detalles que
  salieron con los tres programas de verdad —El Tablado, el Cristo y La Luz—:
  dentro de un programa **repetir es lo normal** (hay tres domingos de feria
  infantil seguidos y los tres son de verdad), así que el aviso de «esto ya
  está» se apaga en ese modo; y la web pega varios actos en la misma línea
  («Fiesta del agua con castillos de agua.19:30 – Gala de la Reina Infantil»),
  que se parten por la hora seguida de raya. Lo que no se toca solo: un acto
  con **otro municipio** dentro del programa —el «Musical Las historias del
  genio» venía como Santa Cruz en el programa de La Laguna— entra donde dice el
  fichero y se avisa por pantalla. Puede ser un error de la web o puede que el
  ayuntamiento lleve el acto a otro pueblo de verdad; eso lo dice quien vive
  allí.

- **El programa hay que ir a buscarlo, y eso se olvida.** Las fiestas se
  repiten casi en las mismas fechas todos los años —por eso hay 148 fichas con
  2026 y 2027—, pero el programa de actos lo cuelga cada ayuntamiento unos días
  antes. Llega el Cristo, el programa está publicado, y Naira sigue con la
  fiesta en una línea. `avisar-fiestas.js` cruza las dos cosas: qué viene en los
  próximos días (`EVENTOS`) y de qué hay programa cargado (`ACTOS`), con un
  margen de 12 días porque unas fiestas de pueblo duran tres semanas y el día
  grande cae en medio. Lo que falte, lo canta. Sin red y sin API: es una resta
  de fechas, así que no se pudre cuando una web cambie.
  Sale por dos sitios. En la web, la pestaña **«Programas»** del panel —la
  trastienda, no lo ve el turista—. Y por correo, con
  `.github/workflows/aviso-fiestas.yml`: cada lunes ejecuta esto y escribe en
  **un solo asunto** de GitHub, que se actualiza y **solo comenta cuando la
  lista cambia** —comentar es lo que manda el correo, y un correo idéntico cada
  lunes se deja de leer a la tercera semana—. Si no falta ninguno, cierra el
  asunto. Ojo con dos cosas: los trabajos con horario **solo se ejecutan desde
  la rama principal**, así que en una rama de trabajo no salta nunca (a mano sí,
  con «Run workflow»); y el cron va en UTC, o sea que `0 7 * * 1` son las ocho
  de la mañana en Canarias en verano y las siete en invierno.
  Y hay un tercer camino, que es el que está funcionando de verdad: una
  **tarea programada en la cuenta de Zeben** (Routine `trig_01Wwek7tVbHqH4pE`)
  que cada lunes a las 7:00 UTC abre una sesión, se pone en la rama de trabajo,
  ejecuta `node avisar-fiestas.js 21` y le manda el resumen al correo y al
  móvil. Eso no depende de que el proyecto esté en la rama principal, que es
  justo lo que bloqueaba al trabajo con horario. Si algún día se junta todo en
  `main`, sobra una de las dos y hay que quitar la otra: dos correos iguales el
  mismo lunes es peor que ninguno.

- **El vigía de la agenda: avisa, no importa.** Zeben pidió que alguien mirase
  lagenda.org y le dijera si hay novedades en Tenerife. Desde aquí no se puede
  —403 en el CONNECT, como con las fotos y los miradores—, pero la misma
  máquina de GitHub que manda el aviso de las fiestas sí tiene red. Lo hace
  ella, los lunes: `vigilar-agenda.js` lee las **tres páginas de zona de
  Tenerife** —norte, sur y metropolitano, que son las suyas y por eso son el
  filtro de isla— y saca los enlaces de `/programacion/`.
  La clave es de dónde saca cada cosa. **El identificador es el número del
  final de la URL**, que es lo único estable: los títulos y el diseño cambian,
  el id no. **Y el título sale del propio enlace, no del texto del `<a>`**:
  probado contra la página de verdad que guardó Zeben, la mitad de los enlaces
  son una foto sin texto y uno de los que sí tenían texto era el
  «info@lagenda.org» del pie. El trocito de URL
  —`fiestas-de-el-socorro-2026-tegueste-septiembre`— siempre está y siempre
  dice lo que es.
  Lo que huele a fiesta de pueblo va marcado con ⭐ y primero. Ojo con ese
  filtro: llevaba `san-` y `santa-` y marcaba como fiesta el «Distrito Joven
  Santa Cruz», que es un ciclo de conciertos —los nombres de pueblo salen en
  media isla—. Las de San Miguel se cazan igual por el «fiesta» del nombre.
  Tres cosas más, todas por la misma razón: **es la web de otro y esto solo
  avisa**. Son tres peticiones a la semana, con pausa entre ellas y una
  identificación honrada en el `user-agent`. Nada entra solo en el catálogo:
  el correo dice DÓNDE mirar y el programa se sigue pegando a mano. Y si un
  lunes no se puede leer la web, **se dice** —callarse parecería que no hay
  novedades cuando lo que pasa es que ya no nos dejan entrar—, pero como el
  aviso solo comenta cuando el texto cambia, eso se dice una vez y no cada
  lunes.
  La memoria de lo ya visto **no es un fichero**: viaja dentro del propio
  asunto de GitHub, en un comentario oculto (`<!-- vistos: 43577,… -->`). Así
  la nota y su memoria son la misma cosa y el robot no tiene que escribir en
  el repositorio. Y la primera vez se ejecuta con `--sembrar`, que apunta lo
  que hay ese día y calla: sin eso, el primer correo serían los cien eventos
  colgados y un correo así no se lee.

- **La cosecha grande vino de un artefacto de Cowork.** Zeben le pidió a Claude
  en Cowork que le sacara los eventos de Tenerife y publicó un artefacto —«Fiestas
  de Tenerife»— con **266 actos de 15 municipios y 21 programas**, cada uno con
  municipio, fiesta, día, hora y sitio. Eso multiplica por cuatro lo que había.
  Antes de meterlo se **cruzó contra los tres programas que él había pegado a
  mano**: de los 56 actos suyos que caen dentro del rango del artefacto,
  **coinciden todos** salvo diferencias de redacción («Concierto al Cristo de La
  Laguna de Los Cantadores…» / «Concierto Los Cantadores…»). Ese cruce es lo que
  permite fiarse: no es que el artefacto lo diga, es que donde se puede
  comprobar, cuadra. Y encima trae el sitio de cada acto, que nosotros
  sacábamos a duras penas del final del nombre.
  De ahí salieron dos herramientas que van a hacer falta cada vez que entre otra
  fuente:
  · `node eventos.js duplicados` — el mismo acto contado por dos sitios no se
    llama igual («Cine al aire libre: Lilo y Stitch (2025)» / «… Lilo y
    Stitch»). Mismo pueblo, mismo día, misma hora y el nombre empezando igual:
    es el mismo. Gana el que trae el sitio, y lo que le falte se rellena con el
    otro. Sin argumentos hace el ensayo. Fueron **9**.
  · `node eventos.js reclasificar` — las reglas de `q` van a seguir mejorando y
    los actos ya fichados se quedarían con la clasificación vieja. Esto los
    repasa con las reglas de hoy y dice qué cambia.
  Dos reglas que se afinaron con estos datos: `magia` marcaba como infantil la
  «Noche de Humor y Magia» de las once de la noche, y `humor` marcaba como acto
  de noche el «Cross Humorístico» de las cuatro de la tarde. Ahora es
  `noche de humor|humorista`.

  **Y cuando el catálogo dobló, la clasificación se quedó corta.** Zeben lo cazó
  con una pregunta de las buenas: «¿por qué solo ofreces 421 actos si hay 620?».
  Los dos números no medían lo que parecía —el 421 es la SUMA de 380 planes de
  prueba, no actos distintos (son 239), y el 620 es cuántos tienen el sitio
  fichado, que es otro campo—, pero al comprobarlo salió algo de verdad: las
  reglas de `q` se escribieron con 300 actos y con 648 se caían cosas que sí
  valen —la Feria del Pescado, la Fiesta de la Cerveza, el Pasacalle de la
  comparsa, la Zumba en la playa—.
  Esas palabras **no dicen para quién es**: un pasacalle a las once de la mañana
  es de niños y uno a las diez de la noche no. Así que decide la **hora**, que es
  lo que eligió Zeben: antes de las 18:00 a niños, de ahí en adelante a dos
  adultos. Son 31 actos más, de 246 a 277 clasificados y de 421 a 480 ofrecidos.
  **Las dos vueltas que costó son la misma lección dos veces:**
  · La primera versión buscaba `actuación` en cualquier parte del nombre y coló
    «Misa cantada, recorrido procesional y actuación del Grupo Folklórico» como
    acto para niños, y un «Almuerzo de convivencia con la actuación de…»
    también. **La regla va anclada al principio**: importa lo que el acto ES, no
    lo que menciona de pasada.
  · Y al meter un guardián (`NO_ES_PARA_NADIE`: misas, torneos, plenos) lo puse
    delante de TODO y se llevó **21 actos que ya estaban bien**: un «Gran Baile
    de Fin de Fiestas con las orquestas Sabrosa, Guaracha… y entrega de trofeos»
    dejaba de ofrecerse por el final de su nombre, y una «Procesión… y fuegos
    artificiales» de las nueve también. El guardián va **solo delante de la regla
    de la hora**: las reglas explícitas saben lo que dicen, y él solo está para
    que la hora no se invente lo que no sabe.
  **Lo que esto NO resuelve, y hay que saberlo:** `q` es **excluyente**
  —`a.q===q` en `actosDelDia()`—, así que una feria de artesanía de las once de
  la mañana deja de ofrecérsele a una pareja. Hoy no hay manera de decir «esto
  vale para los dos». La lista de los 31 se le pasó en
  `actos-reclasificados.md` para que corrija los que estén en la caja que no
  toca; si hace falta un tercer valor, es una línea en `actosDelDia()` y otra en
  la comprobación de `lote.js`.
  Hubo un desacuerdo de fecha —los **Fuegos de la Víspera** del Cristo: el
  artefacto el 14 a las 00:00, nosotros el 13—, y lo resolvió Zeben: **manda el
  artefacto**. Hay fuegos las dos noches y son distintos: los de la víspera
  (madrugada del 14) y los del Risco (la noche del 14), que son los grandes.
  La fecha del artefacto es la buena; lo que había que arreglar era el motor,
  no el dato. Esa es la regla de la casa: quien vive allí tiene razón.

- **La genérica sin hora y la buena con hora son la misma fiesta.** Zeben lo vio
  en la web: «Bajada de la Virgen del Socorro» y «Bajada del Socorro», el mismo
  día, en el mismo pueblo, una sin hora y otra a las 07:00. Vinieron de dos
  fuentes: la guía general de los 31 municipios puso el titular y la ficha buena
  llegó después con hora y sitio. **Manda la que tiene hora** —lo dijo él, y es
  la regla: una fiesta con hora es un dato, y sin hora es un titular—, y en los
  textos gana el más largo, que la genérica traía la buena descripción y la otra
  un «En De San Pedro al caserío del Socorro» que ni está bien escrito.
  `node eventos.js repetidas` las junta; sin argumentos hace el ensayo. Fueron
  **5** de 148.
  Lo que ese mismo repaso **no** decide: la misma fiesta con el mismo nombre en
  dos fechas. Ahí una de las dos está mal y no hay forma de saber cuál desde
  aquí, así que las canta y espera. Fueron cinco y las resolvió Zeben todas, y
  fíjate en que **en dos de ellas no valía ninguna de las dos fechas**: elegir
  «la más probable» habría acertado tres de cinco.

  | fiesta | había | es |
  |---|---|---|
  | Romería de Benijos, La Orotava | 7 sept | **13 sept** |
  | Romería de San Agustín, Arafo | 28 y 29 ago | **29 ago** |
  | Romería de Los Abrigos, Granadilla | 29 y 31 ago | **6 sept** |
  | Romería de San Miguel | 19 y 21 sept | **26 sept** |
  | Fiestas de San Juan, Puerto de la Cruz | 23 y 24 jun | **23 jun**, la víspera |

  Y las de 2027 de esas romerías salieron copiando las fechas malas de 2026.
  Como además **se mueven de año en año** —«fue el 29 porque cayó ese día», dice
  él—, no se les pone una fecha inventada: se quedan donde están y se marcan en
  la nota como aproximadas, que es lo que ya hacían once fichas del calendario
  municipal. Naira entonces avisa de que el ayuntamiento la publica poco antes.

- **Los iconos de fiesta salen del nombre.** Etiquetar 148 fiestas a mano es
  trabajo que no se hace nunca y se pudre al añadir más. `iconoFiesta()` mira
  el nombre: 🐂 romería, ⛪ procesión, 🎶 verbena o música, 🧺 feria, 🎆 fuegos,
  🤼 lucha, y 🪘 para las 41 que se quedan en fiesta a secas — que también está
  bien: el icono tiene que decir algo, y si no lo sabe, mejor el genérico que
  uno inventado.

- **Los miradores los trajo otro artefacto de Cowork, y hubo que cribarlos.**
  Zeben publicó «Miradores de Tenerife» con **92 fichas de 30 municipios**,
  cada una con nombre, coordenadas, qué se ve, si la carretera es de curvas y
  cuándo se disfruta mejor. De esas, 25 ya estaban y **1 era la misma que
  teníamos** (Los Roques de Fasnia), así que quedaban 66.
  Lo que obligó a mirarlas una a una: **44 de las 66 traen la coordenada
  marcada como aproximada** —estimada por la descripción, sin GPS publicado—.
  Eso no se puede meter a ciegas, pero tampoco hay que tirarlo: el catálogo ya
  tiene el mecanismo, `pos_aprox`, el mismo que usan los restaurantes del
  registro de hostelería que traen la calle y no el punto. Con él, **el botón
  del mapa busca por nombre en vez de navegar a una chincheta inventada**.
  Y el cruce, que es la regla de la casa: para cada uno, a qué distancia queda
  del casco de su municipio y de qué otro casco cae más cerca. **Tres no
  cuadran** y se quedaron fuera esperando:

  | mirador | dice | pero cae a |
  |---|---|---|
  | La Escalona | Vilaflor de Chasna, a 8,5 km | 1,1 km del casco de Adeje |
  | Mirador El Topete | La Guancha, a 5,0 km | 1,9 km del de Icod |
  | Mirador de El Boquerón | La Laguna, a 5,0 km | 1,8 km del de Tegueste |

  El filtro es a propósito estrecho: **solo aparta lo que además tiene la
  coordenada estimada**, porque un término grande no es un error. La Orotava
  llega a Las Cañadas —el Mirador de La Ruleta está a 21 km de su casco y es
  suyo— y La Laguna llega a Anaga y a Punta del Hidalgo. Ocho más entran con
  el municipio discutible y quedan apuntados por si él quiere corregirlos.
  Del artefacto también salen dos cosas que el catálogo aprovecha: **la
  carretera de curvas** (35 de los 63 la traen, y eso son −20 puntos al
  atardecer) y **el aviso de acceso** (11), que entra como `seg_tipo:'acceso'`
  y sale por `ojo_para_llegar`, no como aviso de seguridad.

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
- **El proxy tiene freno, y hacía falta.** `netlify/functions/naira.js` es una
  URL pública que gasta la clave de Zeben. Aceptaba el `system` que le
  mandaran, así que valía de ChatGPT gratis a su costa. Tres cierres, de más
  fuerte a más flojo: **(1)** el `system` tiene que traer la firma del prompt
  de Naira en sus primeros 500 caracteres y venir con **un solo** mensaje de
  usuario —lo peor que se puede sacar de ahí es un plan de un día—; **(2)** se
  mira el `origin`/`referer` y solo se acepta desde el sitio (con `curl` se
  falsea, pero corta el «apunto mi herramienta ahí»); **(3)** 20 por IP y hora
  y un techo de 600 al día, contados **en memoria del contenedor**: Netlify
  recicla instancias, así que es un freno, no un candado. Un candado de verdad
  pide un contador compartido (Netlify Blobs) y eso obliga a `package.json`,
  que es justo lo que la función quiso evitar.
  Lo que hace que esto sea aceptable: cuando el freno salta se devuelve **429**
  y el navegador ya sabe caer al relato local, así que **el turista recibe su
  plan igual**, narrado con plantillas y con su sello. Y las llamadas
  bloqueadas **no llegan a la API**, o sea que no cuestan.
  Ojo con la firma: se busca en los primeros 500 caracteres y no en el 0,
  porque el panel deja editar el prompt y retocar la primera línea dejaría a
  Zeben fuera de su propia web con un 400 sin explicación.
  El `?probar=1` ya no enseña doce caracteres de la clave: son el prefijo y no
  el secreto, pero esa URL es pública.

- **El freno del proxy cortaba por el `referer`, y no lo decía.** Con la clave
  puesta (`?probar=1` decía `claveEncontrada: true`) la web seguía narrando en
  local. El cierre de «solo desde el sitio» comparaba la cabecera **entera**
  contra `/\.netlify\.app$/`, y ahí está la trampa: el `origin` llega sin barra
  —`https://x.netlify.app`, casa— pero el `referer` llega **con** ella y con la
  página detrás —`https://x.netlify.app/index.html`, no casa—. En el navegador
  que no manda `origin`, 403 y a plantillas. Ahora se compara solo el **host**,
  con `new URL(...).host`. Probado con las cinco formas que llegan.
  Y de paso, el aviso de abajo dejó de ser un número pelado: `pedirVoz()` lee el
  cuerpo del error y cuenta el porqué que da la función —«Demasiadas
  peticiones», «Desde ahí no»—, que si no hay que adivinar cuál de los tres
  cierres saltó.

- **Cortábamos la respuesta a los 26 segundos.** Con el freno ya arreglado, el
  plan seguía saliendo con plantillas y el aviso decía «signal is aborted
  without reason» — que no es un rechazo: es NUESTRO reloj. Medido: el informe
  son unos **8.800 tokens de entrada** (23 KB de prompt y 8 de informe) y hasta
  1.800 de salida, y eso tarda entre veinte y treinta y cinco segundos. El corte
  estaba en 26, o sea justo en el filo: unas veces llegaba y otras no.
  Ahora son 55 segundos, y la red de seguridad que narra en local pasó de 30 a
  62 —tiene que ir por DETRÁS del corte, que si no mata una respuesta que venía
  en camino—. De paso, el informe viaja **sin sangría**: 2 KB menos, un 25%, y
  al modelo le da igual leerlo así.
  Si aun así no llega, el siguiente sospechoso es el **límite de tiempo de las
  funciones de Netlify**, que es de unos segundos y no se puede estirar sin
  más. La solución de verdad para eso es **streaming**, y está abajo.

- **Y el streaming, que era el arreglo de verdad.** Zeben: «deberíamos poner
  que Naira trabaje en streaming porque tarda mucho pensando y a mí, por
  ejemplo, no me va la apikey». Las dos mitades de esa frase son el mismo
  problema, y era el que llevaba detrás de los dos relojes que ya habíamos
  alargado dos veces: **no es que fueran cortos, es que se esperaba a tenerlo
  TODO antes de enseñar NADA**. Pidiendo el texto por trozos, la primera frase
  aparece en dos o tres segundos y ya no hay espera que agotar.
  Son **dos ficheros, y a propósito**. El formato clásico de Netlify
  (`exports.handler`, que devuelve un objeto) no puede ir soltando texto: para
  eso hace falta el moderno, que devuelve un `Response` de verdad, y la
  extensión **`.mjs` es lo que se lo dice a Netlify sin `package.json`** —que es
  justo lo que la función lleva evitando desde el principio—. Así que
  `naira-stream.mjs` va al lado de `naira.js`, no en su lugar: **el navegador
  prueba la nueva y, si no está o falla antes de la primera palabra, cae sola en
  la de siempre**, y si esa tampoco, al relato local. Tres redes, no una.
  Cuatro cosas que hay que saber para tocar esto:
  · **Los tres cierres están copiados en el `.mjs` y hay que tocar los dos.** No
    hay fichero compartido porque cualquier cosa dentro de `netlify/functions`
    la trata Netlify como otra función. Quien arregle un cierre en uno y no en
    el otro deja la puerta abierta en el que no mire.
  · **El contador del freno es suyo**, no el de `naira.js`: son dos procesos y
    no comparten memoria, o sea que el techo real es el doble del escrito. Se
    asume, que ya era un freno y no un candado.
  · **La red de seguridad dejó de ser un reloj y pasó a mirar el pulso.** Cortar
    a los 62 segundos a una respuesta que se está escribiendo sola sería tirar
    medio plan ya pintado; ahora la cuenta se reinicia con cada trozo que llega.
  · **`resaltar()` va al final, no mientras llega.** Busca nombres y cifras del
    informe dentro del texto, y sobre una frase a medias marcaría a medias.
    Mientras llega solo se le pasa `ritmo()`, y entero cada vez: un párrafo no
    se sabe que lo es hasta que llega su línea en blanco.
  Y si el flujo se corta antes de decir que acabó, **lo que hay se tira**: medio
  plan es peor que el relato local entero.

- **El Instagram: el contenido sale de los datos, publicar lo hace él.**
  Zeben abrió la cuenta y preguntó si se podía montar un agente que se la
  administrara. Publicar solo se puede —Instagram lo permite con cuenta de
  empresa, una app en Meta y un token—, pero eso es darle permiso de publicar a
  un programa en su cuenta, y encima obliga a un papeleo que él no tiene por
  qué hacer. Y lo que falta no es el botón de publicar: es **saber qué contar
  cada semana**. Eso sí está en los datos.
  `node instagram.js` (21 días por defecto) escribe **`instagram.html`**: un
  post por fiesta y uno por pueblo-y-día con programa cargado, cada uno con su
  foto, su texto en los tres idiomas, sus etiquetas y su crédito. Se copia y se
  publica a mano. Lo que hace única a esta cuenta es lo mismo que hace única a
  la web: **el calendario de los 31 municipios**, que no lo publica nadie más.
  Las reglas de la casa, aquí también:
  · **No se inventa nada.** El texto se arma con nombre, pueblo, día, hora,
    sitio y la nota, y si no hay nota dice menos.
  · **El nombre de la fiesta no se traduce**, que es como lo va a ver escrito
    en el cartel de la plaza. Se traduce lo que ES. Y **verbena y romería se
    quedan en español** con media frase que las explique.
  · **La nota del catálogo solo va en español.** Está escrita a mano y en el
    motor la traduce el modelo; aquí no hay modelo, y pasarla por una tabla
    sería reescribirla. Así que se queda en español **y la página lo avisa**,
    que si no el texto bueno se pierde sin que nadie se entere. Son 6 de 10
    en las tres semanas de prueba.
  · **La foto lleva su crédito**: de las 47, 33 son de Commons con autor y
    licencia, y eso va en el pie del post.
  Y la trampa que se vio a la primera, que es una vieja conocida un piso más
  abajo: la primera versión elegía «el sitio de más peso del municipio» y a la
  **Fiesta del Cristo de La Laguna le puso una foto de Chinamada**, que es un
  caserío de Anaga. En un término que va del casco a Anaga y a Punta del
  Hidalgo, «del mismo municipio» no quiere decir «de al lado» — lo mismo que
  pasaba con el centroide de La Orotava. Ahora la foto se elige **por
  kilómetros desde donde es la fiesta**, con techo de 8 km, y **a partir de 3
  la página avisa** para que él decida. Con eso, el Cristo saca la Fundación
  Cristino de Vera, a 200 metros.
  La imagen se baja recortada a 1080 y cuadrada, **sin texto quemado dentro**:
  el texto va en el pie, donde se puede leer, copiar y traducir. Un cartel con
  las letras dentro no vale para tres idiomas.
  Lo publicado se marca en la página y **el navegador lo recuerda**, así que
  volver a abrirla no obliga a acordarse de por dónde iba.

- **Búsqueda web: decidido que NO, por ahora.** Rompería el sello de «todo
  sale del informe», que es lo que diferencia a Naira. Y nunca para
  alergias o celiaquía: ahí la respuesta correcta es el teléfono del sitio.

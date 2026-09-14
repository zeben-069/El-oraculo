# Qué vale con niños, y qué no — marcado, y ya metido

**Esto es un registro, no un formulario que rellenar.** Ya está aplicado; las
fichas de `datos/lugares.js` llevan lo que dice aquí. Se guarda porque las
anotaciones de debajo —por qué un museo vale o no con un crío— **no están en
ningún otro sitio**: en la ficha solo queda la marca.

Vino relleno contra la versión vieja del formulario, la de tres casillas, y con
18 fichas en `cuidado` «aprovechando que el motor lo lee como no es de niños y
no como peligro». Eso **no es lo que hace el motor**: `Con cuidado` es −6, −12
con aviso, y en playa o charco saca la ficha del día entero. Así que se aplicó
encima la regla de Zeben —«algún cuidado es por el aburrimiento, no porque sea
peligroso»— y las casillas se tradujeron al vocabulario nuevo:

· **14 `cuidado` → `se aburren`** (`ninos_visto`), que es lo que él quería
  decir: ni se premia ni se castiga, y deja de preguntarse.
· **1 se queda en `cuidado`**, el Charco de Isla Cangrejo, que su propia nota
  describe como peligro de verdad: muro de hormigón en zona de acantilados.
· **14 en `Sí`**, 8 de ellas además `divertido`.

Tres fichas no entran aquí porque él ya las había resuelto en su mensaje: el
**MUNA** (Sí + divertido), el **Auditorio** (Sí, «por fuera hay explanada para
correr») y la **Playa de Troche** (NO, y además ya estaba `cerrado`).

Y dos cosas del fichero que no caben en ninguna casilla, metidas aparte:
· El **Observatorio del Teide** tiene **edad mínima de 8 años**. No es
  aburrimiento ni peligro, es **acceso**: va como `seg_tipo:'acceso'` y sale por
  `ojo_para_llegar`. La ficha queda neutra, o sea que puede salir, avisando.
· El **Ecomuseo de El Tanque** estaba en Santiago del Teide, y el Cabildo le da
  la razón al fichero: testigo «San José de Los Llanos - Montaña Chinyero» a
  1.333 m. Cambiados `m`, `co` y el corredor.

Se metió con:

    node ninos.js meter ninos-marcado.md


# ─────────────  MUSEOS  ─────────────

## San Cristóbal de La Laguna  (6)

- **Casa Museo Cayetano Gómez Felipe** · _Museo_
  > La casa de un coleccionista lagunero, con todo lo que reunió durante su vida tal como él lo dejó.
  - [ ] Sí   [x] se aburren   [ ] cuidado   [ ] NO   · y además: [ ] divertido
  · Casa abarrotada de piezas frágiles y visita guiada. Nada que tocar.

- **Museo LM Arte Colección** · _Museo_
  > Colección privada de arte canario abierta al público en el casco de La Laguna.
  - [ ] Sí   [x] se aburren   [ ] cuidado   [ ] NO   · y además: [ ] divertido

- **Fundación Cristino de Vera** · _Museo_
  > Dedicada al pintor tinerfeño, con su obra permanente en una casa del casco de La Laguna.
  - [ ] Sí   [x] se aburren   [ ] cuidado   [ ] NO   · y además: [ ] divertido

- **Museo de Antropología de Tenerife** · _Museo_
  > Dedicado a la cultura tradicional de la isla: los oficios, la casa, la fiesta y el trabajo del campo.
  - [x] Sí   [ ] se aburren   [ ] cuidado   [ ] NO   · y además: [ ] divertido
  · Casa de Carta, en Valle de Guerra: casona con patios, carros y aperos, sitio
    para andar, y programa propio de actividades para familias. Gratis viernes y
    sábados desde las 14:00.

- **Museo de Arte Sacro Santa Clara** · _Museo_
  > En el antiguo convento de clarisas, con piezas religiosas y el coro donde vivían las monjas de clausura.
  - [ ] Sí   [x] se aburren   [ ] cuidado   [ ] NO   · y además: [ ] divertido

- **Museo de Historia y Antropología (Casa Lercaro)** · _Museo_
  > Ocupa una casa señorial del siglo XVI y cuenta cómo se formó la sociedad canaria tras la conquista.
  - [x] Sí   [ ] se aburren   [ ] cuidado   [ ] NO   · y además: [ ] divertido
  · La casa en sí (patios, escaleras, cocina) aguanta bien con niños, y el museo
    programa talleres vacacionales de 3 a 12 años. No es interactivo de módulos.

## Santa Cruz de Tenerife  (7)

- **MUNA (Naturaleza y Arqueología)** · _Museo_
  > Guarda momias guanches conservadas de forma natural por la sequedad de los barrancos, envueltas en pieles de cabra cosidas usando agujas de hueso anim
  - [ ] Sí   [ ] se aburren   [ ] cuidado   [ ] NO   · y además: [ ] divertido
  · Ya estaba marcado. Es el referente: momias, volcanes, esqueletos de ballena.
    Gratis viernes y sábados de tarde; menores de 8 siempre gratis.

- **Auditorio de Tenerife** · _Museo_
  > Las miles de teselas de cerámica blanca que cubren el edificio fueron colocadas a mano para reflejar la luz del sol imitando la espuma del mar.
  - [ ] Sí   [ ] se aburren   [ ] cuidado   [ ] NO   · y además: [ ] divertido
  · Ojo: esto no es un museo, es un auditorio con visitas guiadas. Por fuera
    impresiona; por dentro, una visita guiada de sala y tramoya no engancha a un
    crío pequeño. (Aparte tiene programación infantil propia, pero eso es
    espectáculo con entrada, no visita.)

- **Antigua Estación de Tren** · _Museo_
  > Conserva la estructura original del único tranvía a vapor que tuvo la isla a principios del siglo XX y que fue desmantelado porque los camiones result
  - [x] Sí   [ ] se aburren   [ ] cuidado   [ ] NO   · y además: [ ] divertido
  · Corto y con trenes de por medio, que siempre suma. Poco más que ver.

- **Museo de Bellas Artes** · _Museo_
  > Pintura y escultura desde el siglo XVII, con obras canarias y flamencas, en pleno centro de la ciudad.
  - [ ] Sí   [x] se aburren   [ ] cuidado   [ ] NO   · y además: [ ] divertido

- **Castillo de San Cristóbal** · _Museo_
  > Los restos del castillo que defendía la bahía, conservados bajo la plaza de España y visitables por debajo.
  - [x] Sí   [ ] se aburren   [ ] cuidado   [ ] NO   · y además: [x] divertido
  · Bajar por debajo de la plaza de España a ver un castillo enterrado es
    exactamente lo de «mirar con la boca abierta». Gratis, media hora, en el
    centro y a cubierto.

- **Espacio Cultural El Tanque** · _Museo_
  > Un antiguo depósito de petróleo convertido en sala de exposiciones. El espacio en sí ya merece la visita.
  - [x] Sí   [ ] se aburren   [ ] cuidado   [ ] NO   · y además: [ ] divertido
  · El depósito vacío con el eco impresiona. Pero solo abre cuando hay
    exposición montada: conviene comprobar antes de meterlo en un plan.

- **TEA Tenerife Espacio de las Artes** · _Museo_
  > Edificio de Herzog & de Meuron que reúne arte contemporáneo, la fototeca insular y la biblioteca pública, abierta hasta muy tarde.
  - [x] Sí   [ ] se aburren   [ ] cuidado   [ ] NO   · y además: [x] divertido
  · El «divertido» no es por el arte contemporáneo: es por el **MiniTEA**, una
    sala hecha para los pequeños, con talleres infantiles y de familia
    programados todo el año. Sin eso sería un cuidado.

## La Orotava  (5)

- **Observatorio del Teide (Izaña)** · _Museo_
  > Su altitud de 2.400 metros y el mar de nubes bloquean la contaminación lumínica urbana, haciéndolo uno de los tres mejores cielos del planeta para est
  - [ ] Sí   [x] se aburren   [ ] cuidado   [ ] NO   · y además: [ ] divertido
  · La visita guiada tiene **edad mínima de 8 años**, dura 90 minutos y está a
    2.400 m. Con niños de 8 para arriba es de lo mejor que hay en la isla
    (taller de astrofísica, se entra en un telescopio, se mira el Sol); con
    niños pequeños, no entran. Por eso «cuidado» y no «Sí».

- **Museo y Parque Etnográfico de Pinolere** · _Museo_
  > Museo Etnográfico, inaugurado en 2002 en cuyas instalaciones se recrea la cultura popular, la historia y las costumbres de esta zona de medianías del
  - [x] Sí   [ ] se aburren   [ ] cuidado   [ ] NO   · y además: [x] divertido
  · Al aire libre, con casas de paja reconstruidas y demostraciones de oficios
    (cestería, trabajo del campo). Es visita escolar de toda la vida y se nota:
    está montado para que un crío ande, mire y toque.

- **Centro de Visitantes Telesforo Bravo** · _Museo_
  > Rinde homenaje al geólogo canario que descubrió que el Valle de La Orotava no era un cráter inmenso, sino el rastro de un deslizamiento de tierra que
  - [x] Sí   [ ] se aburren   [ ] cuidado   [ ] NO   · y además: [x] divertido
  · Exposición **interactiva** que sube de la costa a la cumbre, más un jardín
    de flora autóctona alrededor. Gratis, en La Orotava (no arriba), y es la
    mejor manera de explicarle a un niño de dónde sale el Teide.

- **Museo de Artesanía Iberoamericana** · _Museo_
  > Reúne artesanía de España y América y muestra cómo viajaron las técnicas de un lado a otro del Atlántico.
  - [ ] Sí   [x] se aburren   [ ] cuidado   [ ] NO   · y además: [ ] divertido

- **El Tesoro de la Concepción** · _Museo_
  > La orfebrería y los ornamentos que la iglesia de la Concepción ha ido guardando durante siglos.
  - [ ] Sí   [x] se aburren   [ ] cuidado   [ ] NO   · y además: [ ] divertido

## El Tanque  (1)   ← corregido, estaba en Santiago del Teide

- **Ecomuseo de El Tanque** · _Museo_
  > El Ecomuseo de El Tanque acoge una exposición sobre la vida en el Partido de Abajo, nombre que se le daba antiguamente a este lugar, mediante paneles
  - [x] Sí   [ ] se aburren   [ ] cuidado   [ ] NO   · y además: [x] divertido
  · Nueve salas con audiovisuales y **realidad virtual y aumentada** para meterte
    en las faenas del campo de antes. Es, con diferencia, el museo etnográfico
    más tecnológico de la isla, y eso con niños funciona. En la carretera
    TF-82, camino de San José de Los Llanos, con el Teide de fondo.

## Adeje  (1)

- **Casa Fuerte de Adeje** · _Museo_
  > Los restos de la fortaleza desde la que la familia Ponte controlaba el comercio del azúcar en el sur.
  - [ ] Sí   [x] se aburren   [ ] cuidado   [ ] NO   · y además: [ ] divertido
  · Son restos, con acceso limitado. Se ve en cinco minutos y no da para más.

## Arona  (1)

- **Casa La Bodega** · _Museo_
  > Casa tradicional del sur convertida en museo, con los aperos y la forma de vida de antes.
  - [ ] Sí   [x] se aburren   [ ] cuidado   [ ] NO   · y además: [ ] divertido
  · Casa pequeña, de uso municipal, sin actividad pensada para niños.

## El Sauzal  (1)

- **Casa del Vino** · _Museo / bodega_
  > Ocupa una hacienda agrícola del siglo XVII donde todavía se conserva el lagar original de tea usado para prensar la uva a mano.
  - [x] Sí   [ ] se aburren   [ ] cuidado   [ ] NO   · y además: [ ] divertido
  · El museo del vino no les dice nada, pero la hacienda sí: patios, era,
    mirador al Teide y espacio exterior de sobra. Funciona como parada de
    familia, no como museo.

## Garachico  (1)

- **Espacio de Arte la Casa de Piedra** · _Museo_
  > El Espacio Casa de Piedra es lugar de encuentro, de foros y seminarios de artistas, que tendrán en este espacio un autentico vivero para la creación,
  - [ ] Sí   [x] se aburren   [ ] cuidado   [ ] NO   · y además: [ ] divertido

## Granadilla de Abona  (1)

- **Museo de Historia de Granadilla** · _Museo_
  > Cuenta la historia del sur cuando aún era tierra de secano, antes del agua y del turismo.
  - [ ] Sí   [x] se aburren   [ ] cuidado   [ ] NO   · y además: [ ] divertido

## Icod de los Vinos  (1)

- **Museum Malvasía** · _Museo / bodega_
  > Dedicado al vino malvasía, el que se bebía en Europa desde el siglo XVI y que Shakespeare llegó a mencionar.
  - [ ] Sí   [x] se aburren   [ ] cuidado   [ ] NO   · y además: [ ] divertido
  · Es bodega con degustación más que museo. Los niños entran, pero el plan es
    de adultos de principio a fin.

## Puerto de la Cruz  (1)

- **Museo de Arte Contemporáneo Eduardo Westerdahl** · _Museo_
  > Fundado por el crítico que trajo el surrealismo a Canarias, con obra de artistas de la vanguardia insular.
  - [ ] Sí   [x] se aburren   [ ] cuidado   [ ] NO   · y además: [ ] divertido

## Tegueste  (1)

- **Centro de Interpretación museo etnográfico Casa de los Zamorano** · _Museo_
  > Casa de principios del s.XX, que desde el año 2014 se convirtió en el Centro de Interpretación Casa Los Zamorano donde se está llevando a cabo un proy
  - [ ] Sí   [x] se aburren   [ ] cuidado   [ ] NO   · y además: [ ] divertido
  · Pequeño y con horario irregular. Mejor no colgar un plan de familia de él.

## Vilaflor de Chasna  (1)

- **Museo Etnográfico Juan Évora** · _Museo_
  > La casa en la que vivió Juan Évora, último habitante de Las Cañadas del Teide, ha sido rehabilitada convirtiéndose en un punto de información y pequeñ
  - [x] Sí   [ ] se aburren   [ ] cuidado   [ ] NO   · y además: [ ] divertido
  · Parada corta y gratis subiendo al Teide: la casa de piedra de verdad del
    último pastor que vivió en Las Cañadas. Diez minutos que se aguantan bien.


# ─────────────  NO SON MUSEOS  ─────────────

## Santiago del Teide  (1) · **Charco**

- **Charco de Isla Cangrejo** · _Charco_
  > A diferencia de las piscinas naturales, su muro de contención de hormigón fue construido por los vecinos para poder nadar en una zona de acantilados d
  - [ ] Sí   [ ] se aburren   [x] cuidado   [ ] NO   · y además: [ ] divertido
  · Este es el «cuidado» literal del enunciado: muro de hormigón en zona de
    acantilados, con el mar abierto justo al lado. Se puede ir con niños, pero
    encima de ellos.

## San Cristóbal de La Laguna  (1) · **Playa**

- **Playa de Troche** · _Playa_
  > Paraje virgen y asilado compuesta de piedras y callados en su totalidad.
  - [ ] Sí   [ ] se aburren   [ ] cuidado   [ ] NO   · y además: [ ] divertido
  · Callaos, acceso incómodo y sin servicios. No es playa de llevar críos.

## La Orotava  (1) · **Jardín**

- **Jardín Botánico de El Portillo** · _Jardín_
  - [x] Sí   [ ] se aburren   [ ] cuidado   [ ] NO   · y además: [x] divertido
  · Cuatro hectáreas con más del 75 % de las especies del Parque Nacional,
    senderos anchos y llanos (pasan carritos), gratis y abierto todo el año.
    De abril a junio, en flor, es otra cosa.

## Güímar  (1) · **Parque etnográfico**

- **Pirámides de Güímar** · _Parque etnográfico_
  > Seis construcciones escalonadas de piedra volcánica cuyo origen se discute desde que Thor Heyerdahl las estudió en los años noventa.
  - [x] Sí   [ ] se aburren   [ ] cuidado   [ ] NO   · y además: [x] divertido
  · Todo al aire libre: senderos, jardines, las réplicas de las balsas de
    Heyerdahl, sala de exposiciones, zona de picnic a la sombra y cafetería.
    De una hora a dos y media, y está adaptado. Es el plan de familia más
    redondo de esta lista entera.

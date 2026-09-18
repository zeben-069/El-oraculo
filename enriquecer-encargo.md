# Miradores y áreas recreativas — lo que falta

Esto es un **encargo para otro** (Claude en Cowork, por ejemplo): la lista
de las 102 fichas de Naira que son un mirador o un área recreativa, con lo
que ya sabemos de cada una y los huecos. **Se rellena solo lo que se sepa de
verdad.** Lo que quede en blanco se queda como está, y eso está bien: una
ficha a medias es mejor que una ficha inventada.

## Las reglas, que son la mitad del encargo

**1 · No se inventa nada.** Si no se sabe si un mirador tiene barandilla, se
deja en blanco. Naira presume de que todo lo que dice sale de su ficha, y una
frase inventada se la cree el turista, va, y no lo reconoce.

**2 · Tiene que ser de ESE sitio exacto.** Hay dos «Montaña Negra» en la isla y
tres «Museo Etnográfico». El nombre solo no basta: cada ficha trae abajo su
municipio y sus coordenadas para no confundirla.

**3 · Coordenadas, paradas de guagua y fotos: NO.** No se piden y no se
aceptan. Los puntos salen de OpenStreetMap por su propia página, las paradas
del GTFS de TITSA y las fotos de Commons con su autor. Un par de grados
decimales escritos de memoria mueve el día entero al sitio equivocado.

**4 · Cuidado con `ninos:"Con cuidado"`, que es una penalización de
SEGURIDAD.** No significa «aquí un crío se aburre»: le resta puntos por riesgo
y en una playa o un charco saca la ficha del día. Si el sitio simplemente no
tiene nada que hacer para un niño, **se deja en blanco**.

**5 · Y `seg` no es siempre un peligro.** Es el campo de «hay algo que decir», y
`seg_tipo` dice de qué clase:

| `seg_tipo` | qué es | ejemplo |
|---|---|---|
| `peligro` | de verdad peligroso | «el borde no tiene barandilla y cae a pico» |
| `acceso` | cómo se llega | «los últimos 800 m son pista de tierra» |
| `precaucion` | se va igual, pero con niños hay que estar encima | «el murete es bajo» |
| `nota` | no avisa de nada, solo está bien saberlo | «hay cafetería al lado» |

Sin `seg_tipo` se trata como **peligro**, que es lo prudente. Poner `peligro`
donde no lo hay hace que Naira avise de algo que no pasa.

**6 · Se escribe en español.** Naira traduce al contarlo; las notas del catálogo
viven en español y se traducen al vuelo, nunca por plantilla.

## Cómo se devuelve

Un JSON con una lista de objetos. **El `n` tiene que ser el nombre exacto** tal
y como sale en esta lista, que es por donde se empareja. Solo se ponen los
campos que se sepan; lo demás se omite.

```json
[
  {
    "n": "Mirador de Parque Las Mesas",
    "tipo": "Área recreativa",
    "dur": 120,
    "fx": "Parque grande sobre la ciudad, con merendero, zona de juegos y el mirador al fondo.",
    "ninos": "Sí",
    "flex": 1
  },
  {
    "n": "Mirador de Chipeque",
    "carretera": "dura",
    "carretera_nota": "Se sube por la TF-24, de curvas cerradas.",
    "seg": "El borde no tiene barandilla.",
    "seg_tipo": "precaucion"
  }
]
```

Campos que se aceptan, y nada más:

- **`fx`** — Qué se ve o qué hay. Una o dos frases, de quien ha estado.
- **`tipo`** — SOLO si la ficha está mal clasificada (p.ej. es un parque donde se pasa el rato, no un mirador).
- **`dur`** — Minutos que se está allí de verdad.
- **`ninos`** — «Sí» / «Con cuidado» / «NO».
- **`carretera`** — «dura» si se llega por carretera de curvas.
- **`carretera_nota`** — Media frase que lo explique.
- **`seg`** — Lo que hay que saber, en una frase.
- **`seg_tipo`** — «peligro» / «acceso» / «precaucion» / «nota».
- **`res`** — 1 si hace falta permiso o reserva.
- **`res_texto`** — Qué permiso y dónde se pide.
- **`flex`** — 1 si el sitio vale a cualquier hora del día.

Se devuelve con `node enriquecer.js ese-fichero.json` (ensayo) y luego `meter`.

---

## Adeje (5)

### Boca del Paso (ruta Ifonche)
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · vale a cualquier hora · carretera de curvas
- *qué se ve:* Collado rocoso en el sendero PR-TF 71, entre Ifonche y La Quinta, con el Teide y las cumbres del sur al fondo.
- *nota:* Paso rocoso con el Teide y las cumbres del sur al fondo
- *aviso (acceso):* Solo se llega a pie, por sendero desde Ifonche o desde La Quinta.
- **falta:** **con niños**
- <sub>Adeje · 28.1490, -16.7430 (posición aproximada — NO la corrijas aquí)</sub>

### Cueva del Marqués y El Bailadero de las Brujas
- **ya tiene:** tipo: Mirador · dura 180 min · franja: mañana · niños: Con cuidado · con permiso
- *qué se ve:* Tramo interior del Barranco del Infierno, en el sendero de 6,5 km ida y vuelta que acaba en una cascada de unos 80 m.
- *nota:* Interior del Barranco del Infierno: paredes de roca y cascada
- *aviso (acceso):* Se cierra con lluvia o viento por riesgo de desprendimientos, y no se admite a niños muy pequeños.
- <sub>Adeje · 28.1260, -16.7310 (posición aproximada — NO la corrijas aquí)</sub>

### Mirador de Adeje (Barranco del Infierno)
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · vale a cualquier hora
- *qué se ve:* En lo alto del casco de Adeje, junto a la entrada del Barranco del Infierno, con la costa y, en días claros, La Gomera.
- *nota:* Boca del Barranco del Infierno y el casco de Adeje
- *aviso (nota):* Al lado está el restaurante Otelo.
- **falta:** **con niños**
- <sub>Adeje · 28.1220, -16.7270</sub>

### Mirador de Fañabé
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer
- *qué se ve:* Mirador sin señalizar en lo alto de Fañabé (calle Alemania), con la costa de Adeje a los pies.
- *nota:* Costa Adeje, Las Américas y las antiguas fincas de plataneras
- **falta:** **con niños**
- <sub>Adeje · 28.0850, -16.7345 (posición aproximada — NO la corrijas aquí)</sub>

### Mirador de Taucho
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · carretera de curvas
- *qué se ve:* Despegue de parapente a unos 850 m, con el Barranco del Infierno, Ifonche y la Montaña de Guaza a la vista.
- *nota:* Barranco, costa y mar; punto de despegue de parapente
- *aviso (acceso):* Desde donde se deja el coche hay unos 15 minutos a pie hasta el despegue.
- **falta:** **con niños**
- <sub>Adeje · 28.1185, -16.7460 (posición aproximada — NO la corrijas aquí)</sub>

## Arafo (4)

### Área Recreativa Los Frailes
- **ya tiene:** tipo: Área recreativa · dura 70 min · franja: mañana · niños: Sí · carretera de curvas
- *qué se ve:* Pinar con jaras a unos 900 m sobre el Valle de Güímar, con mesas, fogones y zona infantil; no tiene aseos y el agua no es potable.
- *aviso (acceso):* Cerrada temporalmente por seguridad y obras según Tenerife ON (septiembre de 2026); comprobar antes de ir.
- **falta:** **¿hacen falta los fogales? ¿se pide permiso?**
- <sub>Arafo · 28.3547, -16.4382</sub>

### Mirador de Chimague
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · niños: Sí
- *qué se ve:* Mirador en Parque Natural de Corona Forestal.
- <sub>Arafo · 28.3732, -16.4596</sub>

### Mirador de La Crucita (Choza de Pedro Gil)
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · vale a cualquier hora · carretera de curvas
- *qué se ve:* En la cumbre dorsal, a casi 2.000 m junto a la TF-24: la Caldera de Pedro Gil y el Valle de Güímar a un lado, el de La Orotava al otro y, a veces, doble mar de nubes.
- *nota:* La Caldera de Pedro Gil, los volcanes de la erupción de 1705, el valle de Güímar y Gran Canaria
- *aviso (nota):* Suele hacer viento fuerte y frío incluso en verano.
- **falta:** **con niños**
- <sub>Arafo · 28.3480, -16.4090 (posición aproximada — NO la corrijas aquí)</sub>

### Mirador de Montaña Colorada
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · vale a cualquier hora · niños: Sí · carretera de curvas
- *qué se ve:* Mirador con barandilla y paneles sobre Montaña Bermeja y las laderas de Arafo, rodeado de pinar, con aparcamiento amplio.
- *nota:* Montaña Bermeja, las laderas de Arafo y el pinar de la Corona Forestal
- <sub>Arafo · 28.3780, -16.4458</sub>

## Arico (2)

### Área Recreativa El Contador
- **ya tiene:** tipo: Área recreativa · dura 70 min · franja: mañana · niños: Sí · carretera de curvas
- *qué se ve:* Pinar a 1.200 m con mesas, fogones, zona infantil y zona de acampada al lado; aseos solo fines de semana y festivos (10:00-17:30).
- *aviso (nota):* Abre solo fines de semana y festivos; fogones de uso libre solo para cocinar (del 1 de junio al 30 de septiembre, no después de las 20:00), sin barbacoas portátiles; el fuego se prohíbe en alertas por riesgo de incendio y los grupos organizados necesitan autorización en Tenerife ON.
- **falta:** **¿hacen falta los fogales? ¿se pide permiso?**
- <sub>Arico · 28.2082, -16.5390</sub>

### Casa Forestal de El Contador
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · vale a cualquier hora · carretera de curvas
- *nota:* Costa sur de Tenerife vista desde el pinar
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>Arico · 28.1900, -16.5500 (posición aproximada — NO la corrijas aquí)</sub>

## Arona (3)

### Montaña Chica
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer
- *nota:* Bahía de Los Cristianos y Costa de Las Américas
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>Arona · 28.0525, -16.7220 (posición aproximada — NO la corrijas aquí)</sub>

### Montaña de Guaza
- **ya tiene:** tipo: Mirador · dura 150 min · franja: atardecer
- *qué se ve:* Montaña de unos 430 m sobre Los Cristianos; desde arriba se ve la costa sur, de Costa del Silencio a Las Américas.
- *nota:* Acantilados con búnkeres de la Guerra Civil, de Costa del Silencio a Los Cristianos
- *aviso (acceso):* Se sube a pie por un sendero rocoso y empinado, sin sombra: de 2 a 3,5 horas ida y vuelta desde Los Cristianos.
- **falta:** **con niños**
- <sub>Arona · 28.0330, -16.6980 (posición aproximada — NO la corrijas aquí)</sub>

### Roque del Conde
- **ya tiene:** tipo: Mirador · dura 180 min · franja: atardecer · vale a cualquier hora · carretera de curvas
- *qué se ve:* Cima plana de unos 1.000 m con antiguas terrazas de cereal y vista de la costa de Granadilla, San Miguel y Arona.
- *nota:* Cima con vista de 360°: sur de Tenerife y, en días claros, Gran Canaria
- *aviso (acceso):* Se sube a pie desde Vento (Arona) por un sendero de dificultad media con casi 500 m de desnivel.
- **falta:** **con niños**
- <sub>Arona · 28.0930, -16.6980 (posición aproximada — NO la corrijas aquí)</sub>

## Buenavista del Norte (5)

### Mirador Altos de Baracán
- **ya tiene:** tipo: Mirador · dura 25 min · franja: mañana · carretera de curvas
- *qué se ve:* Esta cresta natural divide la isla en dos climas tan opuestos que puedes ver el monte verde empapado de niebla a un lado y la ladera desértica seca al otro.
- **falta:** **con niños**
- <sub>Buenavista del Norte · 28.3245, -16.8500</sub>

### Mirador de Buenavista
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer
- *nota:* Costa rocosa y salvaje junto al pueblo, con piscinas naturales
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>Buenavista del Norte · 28.3590, -16.8600 (posición aproximada — NO la corrijas aquí)</sub>

### Mirador de La Cruz de Hilda (Morro de la Galera)
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · carretera de curvas
- *qué se ve:* El caserío de Masca y sus riscos, de la Fortaleza a los Llanos de Guergue; abajo hay un restaurante y un panel interpretativo.
- *nota:* El barranco y caserío de Masca desde 780 m, con La Gomera y La Palma al fondo
- **falta:** **con niños**
- <sub>Buenavista del Norte · 28.3133, -16.8459</sub>

### Mirador de Masca
- **ya tiene:** tipo: Mirador · dura 25 min · franja: mañana · carretera de curvas
- *qué se ve:* Desde aquí se ve el caserío metido en el fondo del barranco y, con el día claro, La Gomera enfrente.
- *nota:* Reseñas insisten: carretera muy estrecha, no apta para quien no conduzca con soltura. Ir temprano o el aparcamiento está lleno.
- *aviso (acceso):* Carretera de curvas cerradas
- **falta:** **con niños**
- <sub>Buenavista del Norte · 28.3060, -16.8404</sub>

### Mirador de Punta de Teno (y La Monja)
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · carretera de curvas
- *qué se ve:* El faro de Teno en el extremo noroeste de la isla, con los acantilados de Los Gigantes al fondo.
- *nota:* Extremo noroeste de la isla, el faro y los acantilados de Los Gigantes al fondo — de los mejores atardeceres de Tenerife
- *aviso (acceso):* Coches particulares, bicis y peatones no pueden pasar por la TF-445: se va en la guagua lanzadera desde Buenavista (10-19 h en invierno, 8-20 h en verano) o en taxi, y la carretera se cierra con mal tiempo.
- **falta:** **con niños**
- <sub>Buenavista del Norte · 28.3436, -16.9227</sub>

## Candelaria (3)

### Mirador de Barranco Hondo
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer
- *qué se ve:* Se ve la costa de Candelaria y, en días claros, hasta Gran Canaria.
- **falta:** **con niños**
- <sub>Candelaria · 28.3931, -16.3757</sub>

### Mirador de Chivisaya
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · vale a cualquier hora · niños: Sí · carretera de curvas
- *qué se ve:* El Valle de Güímar con sus cultivos e invernaderos y tres espacios protegidos: el Malpaís de Güímar, las Siete Lomas y la Corona Forestal; aparcamiento, panel y acceso adaptado.
- *nota:* El Valle de Güímar con sus invernaderos, el Malpaís y Gran Canaria al fondo
- <sub>Candelaria · 28.3717, -16.4275</sub>

### Mirador de El Picacho (Barranco Hondo)
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · vale a cualquier hora · niños: Sí · carretera de curvas
- *qué se ve:* Mirador de 360° sobre el valle, la costa y Gran Canaria, renovado con barandilla de forja, rampa, mesas de picnic y dos zonas para cocinar.
- *nota:* El caserío de Barranco Hondo desde otro punto — renovado en 2024-2025
- *aviso (acceso):* Es distinto del Mirador de Barranco Hondo que ya se tenía fichado, aunque están en la misma zona
- <sub>Candelaria · 28.3580, -16.3890 (posición aproximada — NO la corrijas aquí)</sub>

## El Rosario (1)

### Mirador de Radazul
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer
- *qué se ve:* Sobre la marina de Radazul, con la costa este de la isla abriéndose hacia el sur.
- *nota:* Sobre el puerto deportivo, buena hora para el atardecer.
- **falta:** **con niños**
- <sub>El Rosario · 28.4025, -16.3223</sub>

## El Sauzal (2)

### Área Recreativa Las Calderetas
- **ya tiene:** tipo: Área recreativa · dura 70 min · franja: mañana · niños: Sí
- *qué se ve:* Monteverde a 1.000 m sobre El Sauzal, con mesas, fogones, zona infantil y aparcamiento; aseos solo en horario de vigilante.
- *aviso (nota):* Fogones de uso libre solo para cocinar (del 1 de junio al 30 de septiembre, no después de las 20:00), sin barbacoas portátiles; el fuego se prohíbe en alertas por riesgo de incendio y los grupos organizados necesitan autorización en Tenerife ON.
- **falta:** **¿hacen falta los fogales? ¿se pide permiso?**
- <sub>El Sauzal · 28.4469, -16.4118</sub>

### Mirador La Garañona
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · niños: Sí
- *qué se ve:* Jardín con bancos y cafetería, a un minuto de la autopista. De los más cómodos de la isla.
- *nota:* Aparcamiento libre para unos 40 coches.
- <sub>El Sauzal · 28.4822, -16.4345</sub>

## El Tanque (4)

### Área Recreativa San José de los Llanos
- **ya tiene:** tipo: Área recreativa · dura 70 min · franja: mañana · niños: Sí
- *qué se ve:* Pinar a más de 1.000 m con mesas, fogones, aseos adaptados, zona infantil y zona de acampada; de aquí salen varios senderos.
- *aviso (nota):* Fogones de uso libre solo para cocinar (del 1 de junio al 30 de septiembre, no después de las 20:00), sin barbacoas portátiles; el fuego se prohíbe en alertas por riesgo de incendio y los grupos organizados necesitan autorización en Tenerife ON.
- **falta:** **¿hacen falta los fogales? ¿se pide permiso?**
- <sub>El Tanque · 28.3276, -16.7838</sub>

### Mirador de Garachico (San Juan del Reparo)
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer
- *qué se ve:* Desde arriba se ve entero el pueblo y la colada de lava que lo cambió para siempre.
- *nota:* Tiene aparcamiento y cafetería. Buena parada de paso, no destino.
- **falta:** **con niños**
- <sub>El Tanque · 28.3621, -16.7636</sub>

### Mirador de Lomo Molino
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · vale a cualquier hora · niños: Sí
- *qué se ve:* La bahía de Caleta de Interián, el Roque de Garachico y la Isla Baja, con el Teide y La Palma en días claros; aparcamiento, paneles y acceso adaptado.
- *nota:* Bahía de Caleta de Interián, el Roque de Garachico y, en días claros, La Palma
- <sub>El Tanque · 28.3627, -16.7900 (posición aproximada — NO la corrijas aquí)</sub>

### Mirador El Lagarito
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer
- *qué se ve:* Un mirador tranquilo de la Isla Baja, con la costa norte a los pies.
- *nota:* Vista de Garachico desde arriba, con el Teide detrás si está despejado.
- **falta:** **con niños**
- <sub>El Tanque · 28.3656, -16.7664</sub>

## Garachico (2)

### Mirador El Emigrante
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer
- *qué se ve:* Vista sobre los tejados de Garachico, su bahía y el Roque, desde la TF-42 un poco por encima del pueblo.
- *nota:* El puerto histórico y la costa de lava negra de la erupción de 1706
- **falta:** **con niños**
- <sub>Garachico · 28.3725, -16.7701</sub>

### Mirador El Guincho
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · niños: Sí
- *qué se ve:* Vistas de la costa de Garachico y del Roque, con el pueblo abajo.
- *nota:* Aparcamiento gratis. Hay que bajar las terrazas para ver lo bueno.
- <sub>Garachico · 28.3733, -16.7455</sub>

## Granadilla de Abona (2)

### Mirador de Chiñama
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · vale a cualquier hora
- *qué se ve:* Desde Charco del Pino se ve la costa sureste, del aeropuerto Reina Sofía a Montaña Roja, con los aviones despegando.
- *nota:* Uno de los rincones menos conocidos del sur: Granadilla, El Médano y Montaña Roja
- *aviso (nota):* Suele soplar viento fuerte.
- **falta:** **con niños**
- <sub>Granadilla de Abona · 28.1077, -16.5945</sub>

### Montaña Roja (El Médano)
- **ya tiene:** tipo: Mirador · dura 90 min · franja: atardecer
- *qué se ve:* Cono volcánico de 171 m en la reserva natural; desde la cima se ve de Punta de Rasca al Teide, con La Tejita y El Médano a los pies.
- *nota:* Cono volcánico y reserva natural sobre las playas de El Médano
- *aviso (acceso):* Se sube a pie desde El Médano: 1,2 km y unos 145 m de desnivel, con viento fuerte arriba.
- **falta:** **con niños**
- <sub>Granadilla de Abona · 28.0350, -16.5480 (posición aproximada — NO la corrijas aquí)</sub>

## Guía de Isora (3)

### Área Recreativa Chío
- **ya tiene:** tipo: Área recreativa · dura 70 min · franja: mañana · niños: Sí · carretera de curvas
- *qué se ve:* Pinar a 1.600 m con vistas al Teide y Pico Viejo; mesas, fogones, aseos con duchas (10:00-17:00), zona infantil y zona de acampada.
- *aviso (nota):* Fogones de uso libre solo para cocinar (del 1 de junio al 30 de septiembre, no después de las 20:00), sin barbacoas portátiles; el fuego se prohíbe en alertas por riesgo de incendio y los grupos organizados necesitan autorización en Tenerife ON.
- **falta:** **¿hacen falta los fogales? ¿se pide permiso?**
- <sub>Guía de Isora · 28.2667, -16.7471</sub>

### Mirador de Chirche
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · carretera de curvas
- *qué se ve:* Las medianías y la costa de Guía de Isora, con los caseríos de Chirche y Aripe y la Montaña de Tejina.
- *nota:* Terrazas agrícolas de medianía y el océano en una sola panorámica
- *aviso (nota):* Al lado está el restaurante Mirador de Chirche.
- **falta:** **con niños**
- <sub>Guía de Isora · 28.2213, -16.7595</sub>

### Mirador de Sámara / Juan Évora (Narices del Teide)
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · vale a cualquier hora · carretera de curvas
- *nota:* Terrazas de Sámara y, más arriba, la formación rocosa Narices del Teide
- *aviso (acceso):* El tramo final es más pista que carretera; evitar de noche
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>Guía de Isora · 28.2666, -16.7260 (posición aproximada — NO la corrijas aquí)</sub>

## Güímar (4)

### Mirador de Don Martín
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · carretera de curvas
- *qué se ve:* Edificio-mirador de 1954 en lo alto de la Ladera de Güímar, con el valle, la cordillera dorsal y Anaga a la vista.
- *nota:* Panorámica clásica del Valle de Güímar y Agache, construida en 1954
- *aviso (acceso):* El edificio sigue cerrado al público desde hace décadas.
- **falta:** **con niños**
- <sub>Güímar · 28.2945, -16.4031</sub>

### Mirador de La Marrera (Pájara)
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · vale a cualquier hora · carretera de curvas
- *qué se ve:* El Valle de Güímar y Agache, del Puertito a Anaga y Gran Canaria en días claros, junto a la escultura «Al luchador» (2019).
- *nota:* El valle de Güímar y Agache, junto a la escultura «Al luchador»
- *aviso (precaucion):* No hay aparcamiento formal y está en una curva en cuesta con coches y ciclistas rápidos.
- **falta:** **con niños**
- <sub>Güímar · 28.3160, -16.3930 (posición aproximada — NO la corrijas aquí)</sub>

### Mirador de Malpaís (El Socorro)
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer
- *qué se ve:* Coladas de lava con tabaibas y cardones de la reserva del Malpaís de Güímar, con Montaña Grande detrás.
- *nota:* La costa lávica del Malpaís de Güímar
- **falta:** **con niños**
- <sub>Güímar · 28.3100, -16.3650 (posición aproximada — NO la corrijas aquí)</sub>

### Mirador Morras del Corcho
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer
- *qué se ve:* Este mirador esta a las faldas de Montaña Grande y ofrece inigualables vistas del malpaís, cubierto de tabaibas y cardones, con el océano al…
- **falta:** **con niños**
- <sub>Güímar · 28.3128, -16.3710</sub>

## Icod de los Vinos (3)

### Área Recreativa El Lagar
- **ya tiene:** tipo: Área recreativa · dura 70 min · franja: mañana · niños: Sí · carretera de curvas
- *qué se ve:* Pinar con monteverde a más de 1.000 m, con pinos marcados por antiguos aprovechamientos; mesas, fogones, aseos, zona infantil y acampada.
- *aviso (nota):* Fogones de uso libre solo para cocinar (del 1 de junio al 30 de septiembre, no después de las 20:00), sin barbacoas portátiles; el fuego se prohíbe en alertas por riesgo de incendio y los grupos organizados necesitan autorización en Tenerife ON.
- **falta:** **¿hacen falta los fogales? ¿se pide permiso?**
- <sub>Icod de los Vinos · 28.3424, -16.6539</sub>

### Área Recreativa Las Hayas
- **ya tiene:** tipo: Área recreativa · dura 70 min · franja: mañana · niños: Sí · carretera de curvas
- *qué se ve:* Pinar y monteverde a unos 1.000 m sobre las coladas de Roques Blancos, con mesas, fogones, aseos, zona infantil y acampada.
- *aviso (nota):* Fogones de uso libre solo para cocinar (del 1 de junio al 30 de septiembre, no después de las 20:00), sin barbacoas portátiles; el fuego se prohíbe en alertas por riesgo de incendio y los grupos organizados necesitan autorización en Tenerife ON.
- **falta:** **¿hacen falta los fogales? ¿se pide permiso?**
- <sub>Icod de los Vinos · 28.3346, -16.6775</sub>

### Entorno del Drago Milenario
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · vale a cualquier hora
- *nota:* Vista urbana del pueblo y el Teide desde la plaza del parque del Drago
- *aviso (nota):* El drago de cerca se ve dentro del Parque del Drago, que es de pago (abre de 9 a 20 h en verano y de 9 a 18 h en invierno).
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>Icod de los Vinos · 28.3661, -16.7189 (posición aproximada — NO la corrijas aquí)</sub>

## La Matanza de Acentejo (1)

### Mirador de la Vica
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · carretera de curvas
- *qué se ve:* A 910 m en el Paisaje Protegido de Las Lagunetas, con el Valle de La Orotava, el Teide y La Palma en días claros; salida de senderos.
- *nota:* El litoral de Acentejo
- *aviso (nota):* Los alisios dejan a menudo nubes que tapan la vista.
- **falta:** **con niños**
- <sub>La Matanza de Acentejo · 28.4398, -16.4306 (posición aproximada — NO la corrijas aquí)</sub>

## La Orotava (9)

### Área Recreativa Ramón Caminero
- **ya tiene:** tipo: Área recreativa · dura 70 min · franja: mañana · niños: Sí · carretera de curvas
- *qué se ve:* Pinar a más de 1.500 m junto a la TF-21, a menudo por encima del mar de nubes; mesas, fogones, aseos en horario de vigilante y zona de acampada.
- *aviso (nota):* Fogones de uso libre solo para cocinar (del 1 de junio al 30 de septiembre, no después de las 20:00), sin barbacoas portátiles; el fuego se prohíbe en alertas por riesgo de incendio y los grupos organizados necesitan autorización en Tenerife ON.
- **falta:** **¿hacen falta los fogales? ¿se pide permiso?**
- <sub>La Orotava · 28.3298, -16.5328</sub>

### Mirador Cuesta de La Perdoma
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · carretera de curvas
- *qué se ve:* A 425 m en la carretera La Orotava–Los Realejos (TF-324), sobre huertas, frutales y viñas de zona de vino.
- *nota:* Zona vitivinícola camino a Los Realejos
- **falta:** **con niños**
- <sub>La Orotava · 28.3778, -16.5522</sub>

### Mirador de El Bollullo
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · carretera de curvas
- *qué se ve:* Las playas de arena negra de El Bollullo, Los Patos y El Ancón entre acantilados, con el Puerto de la Cruz al fondo.
- *nota:* Las playas de El Bollullo, Los Patos y El Ancón entre acantilados
- *aviso (acceso):* TF-176, muy cerrada y estrecha
- **falta:** **con niños**
- <sub>La Orotava · 28.4170, -16.5190 (posición aproximada — NO la corrijas aquí)</sub>

### Mirador de La Ruleta
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · niños: Sí
- *qué se ve:* A 2.135 m, frente al Parador: el Llano de Ucanca, los Roques de García y La Catedral, con el Teide detrás.
- *nota:* El más visitado del Parque Nacional: Roques de García y el Llano de Ucanca
- *aviso (nota):* Desde aquí sale un sendero adaptado hasta los Roques de García.
- <sub>La Orotava · 28.2230, -16.6311</sub>

### Mirador de Mataznos
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · vale a cualquier hora · carretera de curvas
- *qué se ve:* A 1.248 m en la TF-21: el Valle de La Orotava, el Teide y La Palma, y a menudo el mar de nubes; aparcamiento, paneles y zona de descanso.
- *nota:* Valle central y posible mar de nubes (TF-21, 1.248 m)
- *aviso (nota):* Aquí empieza la pista de Mataznos, 7-8 km a pie o en bici hasta Chanajiga.
- **falta:** **con niños**
- <sub>La Orotava · 28.3497, -16.5252</sub>

### Mirador de Pino Alto
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · vale a cualquier hora
- *qué se ve:* Panorámica del valle a 575 m, junto a la plaza de la iglesia de Pino Alto; rara vez hay mucha gente.
- *nota:* Panorámica del valle, poco frecuentado (TF-21, 575 m)
- **falta:** **con niños**
- <sub>La Orotava · 28.3865, -16.5030 (posición aproximada — NO la corrijas aquí)</sub>

### Mirador Rosa de Piedra
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · vale a cualquier hora · carretera de curvas
- *qué se ve:* Dos zonas: una con el Teide y La Palma al oeste, y otra con una formación volcánica en forma de rosa, a la que se pasa por debajo de la carretera.
- *nota:* Parada panorámica intermedia subiendo a Las Cañadas por la TF-21
- *aviso (acceso):* Sin coordenada exacta publicada; ubicación estimada sobre la propia carretera
- **falta:** **con niños**
- <sub>La Orotava · 28.3300, -16.5500 (posición aproximada — NO la corrijas aquí)</sub>

### Mirador Vista a La Palma
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · carretera de curvas
- *qué se ve:* A unos 1.350 m en la TF-21 (km 20), con el monte delante y La Palma y la Caldera de Taburiente en el horizonte si está despejado.
- *nota:* La isla de La Palma al noroeste en días claros (TF-21, 1.350 m)
- **falta:** **con niños**
- <sub>La Orotava · 28.3440, -16.5310 (posición aproximada — NO la corrijas aquí)</sub>

### Plaza-Mirador de Benijos
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · vale a cualquier hora · niños: Sí · carretera de curvas
- *qué se ve:* Plaza del barrio a 910 m con el valle y las huertas de papas de medianías, y zona de juegos infantiles.
- *nota:* Huertas y el valle desde este barrio agrícola (910 m)
- <sub>La Orotava · 28.3632, -16.5461</sub>

## La Victoria de Acentejo (3)

### Área Recreativa Hoya del Abade
- **ya tiene:** tipo: Área recreativa · dura 70 min · franja: mañana · niños: Sí · carretera de curvas
- *qué se ve:* Pinar húmedo a 1.000 m con mesas, fogones y zona infantil; no tiene aseos y el agua no es potable.
- *aviso (acceso):* Cerrada temporalmente desde el incendio del verano de 2023, según Tenerife ON.
- **falta:** **¿hacen falta los fogales? ¿se pide permiso?**
- <sub>La Victoria de Acentejo · 28.4153, -16.4430</sub>

### Mirador de la Sabina
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · carretera de curvas
- *qué se ve:* En lo alto del acantilado, sobre la costa de Acentejo, con el Teide al fondo.
- *nota:* Acantilado sobre la Costa de Acentejo protegida
- **falta:** **con niños**
- <sub>La Victoria de Acentejo · 28.4590, -16.4560 (posición aproximada — NO la corrijas aquí)</sub>

### Mirador de Ortuño
- **ya tiene:** tipo: Mirador · dura 25 min · franja: mañana · niños: Sí · carretera de curvas
- *qué se ve:* Las primeras vistas del Parque Nacional y la costa noroeste, a veces con La Palma y el mar de nubes; aparcamiento, paneles y acceso adaptado.
- *nota:* Primera vista del Teide subiendo por la Corona Forestal, a veces con La Palma y mar de nubes (TF-24, km 19)
- <sub>La Victoria de Acentejo · 28.4056, -16.4239</sub>

## Los Realejos (5)

### Área Recreativa Chanajiga
- **ya tiene:** tipo: Área recreativa · dura 70 min · franja: mañana · niños: Sí · carretera de curvas
- *qué se ve:* Una de las mejores muestras de monteverde de la isla, a 1.184 m y a menudo con niebla; mesas, fogones, aseos adaptados, área infantil y zona para caballos.
- *aviso (nota):* Fogones de uso libre solo para cocinar (del 1 de junio al 30 de septiembre, no después de las 20:00), sin barbacoas portátiles; el fuego se prohíbe en alertas por riesgo de incendio y los grupos organizados necesitan autorización en Tenerife ON.
- **falta:** **¿hacen falta los fogales? ¿se pide permiso?**
- <sub>Los Realejos · 28.3441, -16.5848</sub>

### Mirador de El Lance
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · niños: Sí · carretera de curvas
- *qué se ve:* El Valle de La Orotava entero, de La Orotava al Puerto de la Cruz y Los Realejos, con la estatua de bronce del mencey Bentor y cafetería con terraza.
- *nota:* El mismo balcón que La Corona, subiendo a Icod el Alto
- <sub>Los Realejos · 28.3800, -16.5980 (posición aproximada — NO la corrijas aquí)</sub>

### Mirador de La Corona
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer
- *qué se ve:* A 750 metros de altura, el calor retenido por las terrazas de plataneras del valle empuja corrientes de aire caliente hacia arriba que permiten volar en parapente durante horas.
- **falta:** **con niños**
- <sub>Los Realejos · 28.3690, -16.5920</sub>

### Mirador de La Grimona
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · carretera de curvas
- *qué se ve:* Acantilados de Punta del Guindaste y bancales colgados sobre el mar, de Acentejo a la Isla Baja, con la playa del Socorro y el Puerto de la Cruz a lo lejos.
- *nota:* Acantilados de Punta del Guindaste y la costa hasta Isla Baja (tras un túnel de la TF-42)
- **falta:** **con niños**
- <sub>Los Realejos · 28.3928, -16.6088</sub>

### Mirador de San Pedro
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · vale a cualquier hora · niños: Sí
- *qué se ve:* Costa norte y Rambla de Castro: palmeral, plataneras, la Hacienda de los Castro y el elevador de agua de La Gordejuela; hay restaurante-cafetería.
- *nota:* Paisaje Protegido de Rambla de Castro, palmeral y costa (TF-5, km 41)
- <sub>Los Realejos · 28.3958, -16.5940</sub>

## Los Silos (1)

### Mirador Punta del Fraile
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer
- *qué se ve:* Acantilado sobre las playas de Las Arenas y El Fraile, con la costa de Buenavista a Los Silos.
- *nota:* Acantilado sobre las playas de Las Arenas y El Fraile, de arena volcánica
- *aviso (acceso):* Está en la TF-445 hacia Punta de Teno, con acceso restringido a coches particulares: comprobar antes si se puede llegar en coche.
- **falta:** **con niños**
- <sub>Los Silos · 28.3670, -16.8500 (posición aproximada — NO la corrijas aquí)</sub>

## Puerto de la Cruz (2)

### Mirador de La Paz
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer
- *qué se ve:* Al borde de los acantilados de Martiánez: la playa, el complejo Costa Martiánez y la costa del valle; la vista inspiró un relato de Agatha Christie.
- *nota:* Playa Martiánez, el Lago y el Puerto desde el acantilado — inspiró un relato de Agatha Christie
- **falta:** **con niños**
- <sub>Puerto de la Cruz · 28.4155, -16.5399</sub>

### Mirador de San Telmo
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer
- *qué se ve:* Paseo junto a la ermita de San Telmo (hacia 1780), con la playa, Costa Martiánez y las olas rompiendo en las rocas; hay charcos naturales y restos de la batería de San Telmo.
- *nota:* Junto a la ermita de San Telmo, sobre el paseo marítimo
- **falta:** **con niños**
- <sub>Puerto de la Cruz · 28.4166, -16.5486 (posición aproximada — NO la corrijas aquí)</sub>

## San Cristóbal de La Laguna (7)

### Mirador Cruz del Carmen
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · niños: Sí
- *qué se ve:* A 920 m, casi siempre entre nubes. Al lado está el Centro de Interpretación de Anaga (922 63 35 76, 9:30-15:00), donde dan mapas y consejo de senderos.
- *nota:* Aparcamiento pequeño y la policía lo cierra cuando se llena.
- <sub>San Cristóbal de La Laguna · 28.5303, -16.2805</sub>

### Mirador de Aguaide
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · niños: Con cuidado · carretera de curvas
- *qué se ve:* Acantilado de unos 500 m sobre el mar, con Punta del Hidalgo y los Roques de Anaga; se llega en 10-15 minutos a pie desde la plaza de Chinamada.
- *nota:* Roque de los Dos Hermanos, Punta del Hidalgo y Chinamada desde un acantilado de más de 500 m
- *aviso (peligro):* Apenas hay protección en el borde, la caída al mar es de unos 500 m y suele hacer viento fuerte.
- <sub>San Cristóbal de La Laguna · 28.5648, -16.2960</sub>

### Mirador de Jardina
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · niños: Sí
- *qué se ve:* Varias reseñas lo prefieren al de Cruz del Carmen. Se ve hasta el Teide.
- *nota:* Sitio de carretera, aparcan cuatro coches.
- <sub>San Cristóbal de La Laguna · 28.5241, -16.2881</sub>

### Mirador de San Mateo (Roque de los Dos Hermanos)
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer
- *qué se ve:* Vista del Roque de los Dos Hermanos en Punta del Hidalgo; al lado está la oficina de información turística.
- *nota:* El emblemático Roque de los Dos Hermanos, en Punta del Hidalgo
- **falta:** **con niños**
- <sub>San Cristóbal de La Laguna · 28.5652, -16.3219 (posición aproximada — NO la corrijas aquí)</sub>

### Mirador de San Roque
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer
- *qué se ve:* La vega lagunera y el casco histórico; un panel con código QR abre una app de realidad aumentada que señala lo que se ve, con audio en varios idiomas.
- *nota:* La vega lagunera y el casco histórico — primer mirador «inmersivo» con realidad aumentada
- **falta:** **con niños**
- <sub>San Cristóbal de La Laguna · 28.4875, -16.3160 (posición aproximada — NO la corrijas aquí)</sub>

### Mirador del Escobón
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · vale a cualquier hora · carretera de curvas
- *nota:* Laurisilva de Anaga entre Cruz del Carmen y El Batán
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>San Cristóbal de La Laguna · 28.5470, -16.3200 (posición aproximada — NO la corrijas aquí)</sub>

### Mirador Punta del Roque
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer
- *nota:* Costa brava de Anaga y piscinas naturales, en el paseo de Bajamar
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>San Cristóbal de La Laguna · 28.5566, -16.3406 (posición aproximada — NO la corrijas aquí)</sub>

## San Juan de la Rambla (3)

### Área Recreativa La Tahona
- **ya tiene:** tipo: Área recreativa · dura 70 min · franja: mañana · niños: Sí · carretera de curvas
- *qué se ve:* Pinar denso y sombrío con faya, brezo y acebiño a unos 1.100 m, con mesas, fogones, aseos y zona infantil.
- *aviso (nota):* Fogones de uso libre solo para cocinar (del 1 de junio al 30 de septiembre, no después de las 20:00), sin barbacoas portátiles; el fuego se prohíbe en alertas por riesgo de incendio y los grupos organizados necesitan autorización en Tenerife ON.
- **falta:** **¿hacen falta los fogales? ¿se pide permiso?**
- <sub>San Juan de la Rambla · 28.3516, -16.6302</sub>

### Mirador de El Mazapé
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · vale a cualquier hora
- *nota:* Barrio de La Vera: costa norte, Barranco de Ruiz e Icod El Alto
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>San Juan de la Rambla · 28.3926, -16.6469</sub>

### Mirador de la Playa de Los Roques
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer
- *qué se ve:* Mirador en la calle La Malaya, en el casco histórico, sobre la playa de Los Roques.
- *nota:* Roques volcánicos emergiendo del Atlántico junto al pueblo
- *aviso (acceso):* En obras desde agosto de 2026 (unos dos meses) para cambiar la barandilla y reparar suelo y muro.
- **falta:** **con niños**
- <sub>San Juan de la Rambla · 28.3930, -16.6960 (posición aproximada — NO la corrijas aquí)</sub>

## San Miguel de Abona (3)

### Mirador de la Centinela
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · niños: Sí · carretera de curvas
- *qué se ve:* De San Miguel al Roque del Conde, con Montaña Roja, Montaña de Guaza y el Malpaís de Rasca; restaurante-cafetería, paneles y acceso adaptado.
- *nota:* Costa suroeste, Los Cristianos–Las Américas y el Teide de fondo
- <sub>San Miguel de Abona · 28.0670, -16.6640 (posición aproximada — NO la corrijas aquí)</sub>

### Mirador El Frontón
- **ya tiene:** tipo: Mirador · dura 25 min · franja: mañana · carretera de curvas
- *nota:* Medianías altas camino a Vilaflor: Montañas de Tilena y cumbres
- *aviso (acceso):* Mejor de madrugada si hay mar de nubes
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>San Miguel de Abona · 28.2400, -16.6500 (posición aproximada — NO la corrijas aquí)</sub>

### Monumento Natural de Montaña Amarilla
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · vale a cualquier hora
- *qué se ve:* Montaña volcánica junto al mar al final del paseo costero desde Las Galletas, con escaleras entre acantilados y charcos naturales.
- *nota:* Cono volcánico sobre el mar, junto a Costa del Silencio
- **falta:** **con niños**
- <sub>San Miguel de Abona · 28.0140, -16.6520 (posición aproximada — NO la corrijas aquí)</sub>

## Santa Cruz de Tenerife (10)

### Mirador de Amogoje
- **ya tiene:** tipo: Mirador · dura 35 min · franja: mañana · carretera de curvas
- *qué se ve:* Vistas del macizo y de los caseríos de Anaga desde la cumbre.
- **falta:** **con niños**
- <sub>Santa Cruz de Tenerife · 28.5583, -16.2056</sub>

### Mirador de El Bailadero
- **ya tiene:** tipo: Mirador · dura 35 min · franja: mañana · niños: Sí · carretera de curvas
- *qué se ve:* El cruce de Anaga: desde aquí sale la carretera a Taganana y se ven las dos vertientes a la vez.
- <sub>Santa Cruz de Tenerife · 28.5492, -16.2069</sub>

### Mirador de La Alegría
- **ya tiene:** tipo: Mirador · dura 35 min · franja: atardecer
- *qué se ve:* Vistas de la ciudad y del mar desde la ladera.
- **falta:** **con niños**
- <sub>Santa Cruz de Tenerife · 28.4832, -16.2416</sub>

### Mirador de La Chamuscada
- **ya tiene:** tipo: Mirador · dura 35 min · franja: mañana · carretera de curvas
- *qué se ve:* En plena cumbre de Anaga, con el monte de laurisilva a los dos lados.
- **falta:** **con niños**
- <sub>Santa Cruz de Tenerife · 28.5392, -16.2192</sub>

### Mirador de Las Teresitas, Las Gaviotas y Los Órganos
- **ya tiene:** tipo: Mirador · dura 30 min · franja: atardecer
- *qué se ve:* Desde la carretera de Igueste, con Las Teresitas entera abajo, Las Gaviotas al lado y los acantilados de Los Órganos al fondo.
- **falta:** **con niños**
- <sub>Santa Cruz de Tenerife · 28.5121, -16.1791</sub>

### Mirador de Los Campitos
- **ya tiene:** tipo: Mirador · dura 35 min · franja: atardecer · niños: Sí
- *qué se ve:* Santa Cruz a los pies, con Anaga a la izquierda, los muelles, Las Torres y el Auditorio y, en días claros, el Malpaís de Güímar; aparcamiento, paneles y acceso adaptado.
- <sub>Santa Cruz de Tenerife · 28.4754, -16.2606</sub>

### Mirador de Parque Las Mesas
- **ya tiene:** tipo: Área recreativa · dura 120 min · franja: atardecer · vale a cualquier hora · niños: Sí
- *qué se ve:* Parque forestal sobre Santa Cruz, reabierto en 2022, con merenderos, fogones, aseos y bebederos, y el mirador sobre la capital.
- *aviso (nota):* Abre de 8:00 a 19:00 (noviembre-abril) y hasta las 21:00 (mayo-octubre); los fogones solo de 10:00 a 17:00 en invierno y hasta las 19:00 en verano.
- **falta:** **¿hacen falta los fogales? ¿se pide permiso?**
- <sub>Santa Cruz de Tenerife · 28.4837, -16.2701</sub>

### Mirador de Roque Negro
- **ya tiene:** tipo: Mirador · dura 35 min · franja: mañana · carretera de curvas
- *qué se ve:* El caserío metido en el barranco, con el roque de piedra oscura enfrente.
- **falta:** **con niños**
- <sub>Santa Cruz de Tenerife · 28.5434, -16.2471</sub>

### Mirador de Vistabella
- **ya tiene:** tipo: Mirador · dura 35 min · franja: atardecer
- *qué se ve:* Desde el barrio alto de la capital se ve la ciudad entera y la bahía.
- **falta:** **con niños**
- <sub>Santa Cruz de Tenerife · 28.4651, -16.2822</sub>

### Mirador Pico del Inglés
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · vale a cualquier hora
- *qué se ve:* El mejor de Anaga sin caminar, según reseñas. Mejor por la mañana: por la tarde entran las nubes.
- *nota:* Aparcamiento en bucle de un solo sentido.
- **falta:** **con niños**
- <sub>Santa Cruz de Tenerife · 28.5330, -16.2640</sub>

## Santa Úrsula (5)

### Área Recreativa Lagunetilla Chica
- **ya tiene:** tipo: Área recreativa · dura 70 min · franja: mañana · niños: Sí · carretera de curvas
- *qué se ve:* Área pequeña a 1.200 m en la dorsal de Pinolere, con vistas al Valle de La Orotava; mesas, fogones y zona infantil, aseos solo fines de semana y festivos.
- *aviso (nota):* Fogones de uso libre solo para cocinar (del 1 de junio al 30 de septiembre, no después de las 20:00), sin barbacoas portátiles; el fuego se prohíbe en alertas por riesgo de incendio y los grupos organizados necesitan autorización en Tenerife ON.
- **falta:** **¿hacen falta los fogales? ¿se pide permiso?**
- <sub>Santa Úrsula · 28.3938, -16.4825</sub>

### Mirador de Chipeque
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · niños: Sí
- *qué se ve:* A 1.700 metros, es de los mejores sitios para ver el mar de nubes cubriendo el valle con el Teide detrás.
- *nota:* El mirador del mar de nubes con el Teide enfrente. 4,8 de nota con 4.618 reseñas: de lo mejor valorado de la isla.
- <sub>Santa Úrsula · 28.3740, -16.4638</sub>

### Mirador de Humboldt
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · niños: Sí
- *qué se ve:* El punto desde el que el naturalista alemán se quedó impresionado con el valle de La Orotava en 1799.
- *nota:* Sitio pelado con aparcamiento. Parada de autobuses de excursión.
- <sub>Santa Úrsula · 28.4078, -16.5072</sub>

### Mirador de La Quinta
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · niños: Con cuidado
- *qué se ve:* Búnker de 1942 sobre los acantilados de la Costa de Acentejo, a unos 170 m sobre el mar, con la costa norte hasta el Puerto de la Cruz.
- *nota:* Antiguo búnker reconvertido en mirador, con vistas hacia Puerto de la Cruz
- *aviso (peligro):* El búnker está abandonado y el camino va junto al borde del acantilado; justo antes hay un mirador más tranquilo.
- <sub>Santa Úrsula · 28.4370, -16.4930 (posición aproximada — NO la corrijas aquí)</sub>

### Mirador del Negro
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer
- *qué se ve:* En la urbanización La Mancha, con la costa de El Ancón y el Paisaje Protegido de la Costa de Acentejo.
- *nota:* Costa norte y el Paisaje Protegido de la Costa de Acentejo, en la urb. La Mancha
- **falta:** **con niños**
- <sub>Santa Úrsula · 28.4390, -16.4960 (posición aproximada — NO la corrijas aquí)</sub>

## Santiago del Teide (4)

### Mirador Archipenque
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · niños: Sí · carretera de curvas
- *qué se ve:* Los acantilados de Los Gigantes, Puerto de Santiago y su puerto deportivo, La Gomera y el faro de Teno; aparcamiento, panel y acceso adaptado.
- *nota:* El más visitado de la zona: Acantilados de Los Gigantes y Puerto de Santiago
- <sub>Santiago del Teide · 28.2403, -16.8371</sub>

### Mirador de Cherfe
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · carretera de curvas
- *qué se ve:* Vista de 360° a 1.100 m: el Teide, Pico Viejo y el valle de Santiago a un lado, y el barranco de Masca con La Gomera y La Palma al otro.
- *nota:* Barranco de Masca, el valle de Santiago y La Gomera
- *aviso (nota):* Suele haber una furgoneta de comida y el viento sopla fuerte.
- **falta:** **con niños**
- <sub>Santiago del Teide · 28.2900, -16.8200 (posición aproximada — NO la corrijas aquí)</sub>

### Mirador de los Poleos
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · carretera de curvas
- *qué se ve:* Coladas de lava de Boca Cangrejo entre pinar, con La Gomera, La Palma y El Hierro en el horizonte; de aquí sale un sendero corto hacia Boca Cangrejo y el Chinyero.
- *nota:* Coladas de lava, pinar y La Gomera/La Palma entre el mar de nubes
- *aviso (nota):* El aparcamiento es pequeño y no se debe parar fuera de las zonas habilitadas.
- **falta:** **con niños**
- <sub>Santiago del Teide · 28.3000, -16.7800 (posición aproximada — NO la corrijas aquí)</sub>

### Mirador de Valle de Arriba
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · vale a cualquier hora · carretera de curvas
- *qué se ve:* Una de las vistas más completas del valle de Santiago, con Valle de Arriba y el pueblo abajo, el macizo de Teno y el Teide y Pico Viejo detrás.
- *nota:* Valle de Santiago, el macizo de Teno y el Teide de fondo
- **falta:** **con niños**
- <sub>Santiago del Teide · 28.2800, -16.7900 (posición aproximada — NO la corrijas aquí)</sub>

## Tacoronte (1)

### Mirador de los 500 Escalones
- **ya tiene:** tipo: Mirador · dura 70 min · franja: atardecer · vale a cualquier hora
- *qué se ve:* Mirador escondido sobre la costa de Acentejo y la playa de La Garañona, con el Teide en días claros; se aparca en la calle La Jara (urb. Jardín del Sol).
- *nota:* Mirador oculto sobre un acantilado de 150 m: costa de Acentejo y el Teide
- *aviso (precaucion):* Unos 20 minutos de bajada por escaleras irregulares que resbalan con humedad, y 30-40 minutos de vuelta.
- **falta:** **con niños**
- <sub>Tacoronte · 28.4901, -16.4271</sub>

## Tegueste (2)

### Área Recreativa La Quebrada
- **ya tiene:** tipo: Área recreativa · dura 70 min · franja: mañana · niños: Sí
- *qué se ve:* Área pequeña en la laurisilva de Anaga, a unos 900 m, con mesas, fogones, aseos y zona infantil.
- *aviso (nota):* Fogones de uso libre solo para cocinar (del 1 de junio al 30 de septiembre, no después de las 20:00), sin barbacoas portátiles; el fuego se prohíbe en alertas por riesgo de incendio y los grupos organizados necesitan autorización en Tenerife ON.
- **falta:** **¿hacen falta los fogales? ¿se pide permiso?**
- <sub>Tegueste · 28.5321, -16.3007</sub>

### Mirador de Zapata
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · vale a cualquier hora · carretera de curvas
- *nota:* Pinar de medianía hacia la costa norte y Anaga
- *aviso (acceso):* Tegueste apenas tiene miradores turísticos propios de renombre
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>Tegueste · 28.5302, -16.2955</sub>

## Vilaflor de Chasna (3)

### Área Recreativa Las Lajas
- **ya tiene:** tipo: Área recreativa · dura 70 min · franja: mañana · niños: Sí
- *qué se ve:* Pinar a más de 1.500 m junto a la TF-21, con mesas, fogones, zona infantil y zona de acampada; aseos solo fines de semana y festivos.
- *aviso (nota):* Fogones de uso libre solo para cocinar (del 1 de junio al 30 de septiembre, no después de las 20:00), sin barbacoas portátiles; el fuego se prohíbe en alertas por riesgo de incendio y los grupos organizados necesitan autorización en Tenerife ON.
- **falta:** **¿hacen falta los fogales? ¿se pide permiso?**
- <sub>Vilaflor de Chasna · 28.1903, -16.6662</sub>

### Ermita de San Roque (Vilaflor)
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · vale a cualquier hora
- *qué se ve:* Ermita del siglo XVII en un cerro sobre Vilaflor, con bancos junto a la entrada y vista del pueblo y del sur.
- *nota:* Cerro sobre el pueblo, con el casco de Vilaflor y el sur de la isla
- **falta:** **con niños**
- <sub>Vilaflor de Chasna · 28.1540, -16.6360 (posición aproximada — NO la corrijas aquí)</sub>

### Mirador de los Escurriales
- **ya tiene:** tipo: Mirador · dura 300 min · franja: atardecer · vale a cualquier hora · carretera de curvas
- *qué se ve:* Conos claros de lava erosionada del Paisaje Lunar, entre el pinar.
- *nota:* Conos de toba volcánica del Paisaje Lunar
- *aviso (acceso):* No se llega en coche: solo a pie por el sendero circular PR-TF 72 desde Vilaflor (13 km, unas 5 horas y unos 850 m de desnivel).
- **falta:** **con niños**
- <sub>Vilaflor de Chasna · 28.1750, -16.6650 (posición aproximada — NO la corrijas aquí)</sub>

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
- *nota:* Paso rocoso con el Teide y las cumbres del sur al fondo
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>Adeje · 28.1490, -16.7430 (posición aproximada — NO la corrijas aquí)</sub>

### Cueva del Marqués y El Bailadero de las Brujas
- **ya tiene:** tipo: Mirador · dura 25 min · franja: mañana
- *nota:* Interior del Barranco del Infierno: paredes de roca y cascada
- *aviso (acceso):* Se llega a pie por sendero de la reserva (entrada de pago)
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>Adeje · 28.1260, -16.7310 (posición aproximada — NO la corrijas aquí)</sub>

### Mirador de Adeje (Barranco del Infierno)
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · vale a cualquier hora
- *nota:* Boca del Barranco del Infierno y el casco de Adeje
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>Adeje · 28.1220, -16.7270</sub>

### Mirador de Fañabé
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer
- *nota:* Costa Adeje, Las Américas y las antiguas fincas de plataneras
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>Adeje · 28.0850, -16.7345 (posición aproximada — NO la corrijas aquí)</sub>

### Mirador de Taucho
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · carretera de curvas
- *nota:* Barranco, costa y mar; punto de despegue de parapente
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>Adeje · 28.1185, -16.7460 (posición aproximada — NO la corrijas aquí)</sub>

## Arafo (4)

### Área Recreativa Los Frailes
- **ya tiene:** tipo: Área recreativa · dura 70 min · franja: mañana · niños: Sí
- *qué se ve:* Zona recreativa del Cabildo en Parque Natural de Corona Forestal, con mesas y sitio para pasar el día.
- **falta:** **¿hacen falta los fogales? ¿se pide permiso?**
- <sub>Arafo · 28.3547, -16.4382</sub>

### Mirador de Chimague
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · niños: Sí
- *qué se ve:* Mirador en Parque Natural de Corona Forestal.
- <sub>Arafo · 28.3732, -16.4596</sub>

### Mirador de La Crucita (Choza de Pedro Gil)
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · vale a cualquier hora · carretera de curvas
- *nota:* La Caldera de Pedro Gil, los volcanes de la erupción de 1705, el valle de Güímar y Gran Canaria
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>Arafo · 28.3480, -16.4090 (posición aproximada — NO la corrijas aquí)</sub>

### Mirador de Montaña Colorada
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · vale a cualquier hora · carretera de curvas
- *nota:* Montaña Bermeja, las laderas de Arafo y el pinar de la Corona Forestal
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>Arafo · 28.3780, -16.4458</sub>

## Arico (2)

### Área Recreativa El Contador
- **ya tiene:** tipo: Área recreativa · dura 70 min · franja: mañana · niños: Sí
- *qué se ve:* Zona recreativa del Cabildo en Parque Natural de Corona Forestal, con mesas y sitio para pasar el día.
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
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer
- *nota:* Acantilados con búnkeres de la Guerra Civil, de Costa del Silencio a Los Cristianos
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>Arona · 28.0330, -16.6980 (posición aproximada — NO la corrijas aquí)</sub>

### Roque del Conde
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · vale a cualquier hora · carretera de curvas
- *nota:* Cima con vista de 360°: sur de Tenerife y, en días claros, Gran Canaria
- *aviso (acceso):* La cima se corona a pie; la pista de acceso al inicio de la ruta sí tiene curvas
- **falta:** **qué se ve / qué hay** · **con niños**
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
- *nota:* El barranco y caserío de Masca desde 780 m, con La Gomera y La Palma al fondo
- **falta:** **qué se ve / qué hay** · **con niños**
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
- *nota:* Extremo noroeste de la isla, el faro y los acantilados de Los Gigantes al fondo — de los mejores atardeceres de Tenerife
- *aviso (acceso):* TF-445 con acceso limitado a coche particular en temporada alta (bus/taxi/bici)
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>Buenavista del Norte · 28.3436, -16.9227</sub>

## Candelaria (3)

### Mirador de Barranco Hondo
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer
- *qué se ve:* Se ve la costa de Candelaria y, en días claros, hasta Gran Canaria.
- **falta:** **con niños**
- <sub>Candelaria · 28.3931, -16.3757</sub>

### Mirador de Chivisaya
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · vale a cualquier hora · carretera de curvas
- *nota:* El Valle de Güímar con sus invernaderos, el Malpaís y Gran Canaria al fondo
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>Candelaria · 28.3717, -16.4275</sub>

### Mirador de El Picacho (Barranco Hondo)
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · vale a cualquier hora · carretera de curvas
- *nota:* El caserío de Barranco Hondo desde otro punto — renovado en 2024-2025
- *aviso (acceso):* Es distinto del Mirador de Barranco Hondo que ya se tenía fichado, aunque están en la misma zona
- **falta:** **qué se ve / qué hay** · **con niños**
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
- *qué se ve:* Zona recreativa del Cabildo en Paisaje Protegido de Las Lagunetas, con mesas y sitio para pasar el día.
- **falta:** **¿hacen falta los fogales? ¿se pide permiso?**
- <sub>El Sauzal · 28.4469, -16.4118</sub>

### Mirador La Garañona
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer
- *qué se ve:* Jardín con bancos y cafetería, a un minuto de la autopista. De los más cómodos de la isla.
- *nota:* Aparcamiento libre para unos 40 coches.
- **falta:** **con niños**
- <sub>El Sauzal · 28.4822, -16.4345</sub>

## El Tanque (4)

### Área Recreativa San José de los Llanos
- **ya tiene:** tipo: Área recreativa · dura 70 min · franja: mañana · niños: Sí
- *qué se ve:* Zona recreativa del Cabildo en Reserva Natural Especial del Chinyero, con mesas y sitio para pasar el día.
- **falta:** **¿hacen falta los fogales? ¿se pide permiso?**
- <sub>El Tanque · 28.3276, -16.7838</sub>

### Mirador de Garachico (San Juan del Reparo)
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer
- *qué se ve:* Desde arriba se ve entero el pueblo y la colada de lava que lo cambió para siempre.
- *nota:* Tiene aparcamiento y cafetería. Buena parada de paso, no destino.
- **falta:** **con niños**
- <sub>El Tanque · 28.3621, -16.7636</sub>

### Mirador de Lomo Molino
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · vale a cualquier hora
- *nota:* Bahía de Caleta de Interián, el Roque de Garachico y, en días claros, La Palma
- **falta:** **qué se ve / qué hay** · **con niños**
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
- *nota:* El puerto histórico y la costa de lava negra de la erupción de 1706
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>Garachico · 28.3725, -16.7701</sub>

### Mirador El Guincho
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer
- *qué se ve:* Vistas de la costa de Garachico y del Roque, con el pueblo abajo.
- *nota:* Aparcamiento gratis. Hay que bajar las terrazas para ver lo bueno.
- **falta:** **con niños**
- <sub>Garachico · 28.3733, -16.7455</sub>

## Granadilla de Abona (2)

### Mirador de Chiñama
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · vale a cualquier hora
- *nota:* Uno de los rincones menos conocidos del sur: Granadilla, El Médano y Montaña Roja
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>Granadilla de Abona · 28.1077, -16.5945</sub>

### Montaña Roja (El Médano)
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer
- *nota:* Cono volcánico y reserva natural sobre las playas de El Médano
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>Granadilla de Abona · 28.0350, -16.5480 (posición aproximada — NO la corrijas aquí)</sub>

## Guía de Isora (3)

### Área Recreativa Chío
- **ya tiene:** tipo: Área recreativa · dura 70 min · franja: mañana · niños: Sí
- *qué se ve:* Zona recreativa del Cabildo en Parque Natural de Corona Forestal, con mesas y sitio para pasar el día.
- **falta:** **¿hacen falta los fogales? ¿se pide permiso?**
- <sub>Guía de Isora · 28.2667, -16.7471</sub>

### Mirador de Chirche
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · carretera de curvas
- *nota:* Terrazas agrícolas de medianía y el océano en una sola panorámica
- **falta:** **qué se ve / qué hay** · **con niños**
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
- *nota:* Panorámica clásica del Valle de Güímar y Agache, construida en 1954
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>Güímar · 28.2945, -16.4031</sub>

### Mirador de La Marrera (Pájara)
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · vale a cualquier hora · carretera de curvas
- *nota:* El valle de Güímar y Agache, junto a la escultura «Al luchador»
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>Güímar · 28.3160, -16.3930 (posición aproximada — NO la corrijas aquí)</sub>

### Mirador de Malpaís (El Socorro)
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer
- *nota:* La costa lávica del Malpaís de Güímar
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>Güímar · 28.3100, -16.3650 (posición aproximada — NO la corrijas aquí)</sub>

### Mirador Morras del Corcho
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer
- *qué se ve:* Este mirador esta a las faldas de Montaña Grande y ofrece inigualables vistas del malpaís, cubierto de tabaibas y cardones, con el océano al…
- **falta:** **con niños**
- <sub>Güímar · 28.3128, -16.3710</sub>

## Icod de los Vinos (3)

### Área Recreativa El Lagar
- **ya tiene:** tipo: Área recreativa · dura 70 min · franja: mañana · niños: Sí
- *qué se ve:* Zona recreativa del Cabildo en Parque Natural de Corona Forestal, con mesas y sitio para pasar el día.
- **falta:** **¿hacen falta los fogales? ¿se pide permiso?**
- <sub>Icod de los Vinos · 28.3424, -16.6539</sub>

### Área Recreativa Las Hayas
- **ya tiene:** tipo: Área recreativa · dura 70 min · franja: mañana · niños: Sí
- *qué se ve:* Zona recreativa del Cabildo en Parque Natural de Corona Forestal, con mesas y sitio para pasar el día.
- **falta:** **¿hacen falta los fogales? ¿se pide permiso?**
- <sub>Icod de los Vinos · 28.3346, -16.6775</sub>

### Entorno del Drago Milenario
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · vale a cualquier hora
- *nota:* Vista urbana del pueblo y el Teide desde la plaza del parque del Drago
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>Icod de los Vinos · 28.3661, -16.7189 (posición aproximada — NO la corrijas aquí)</sub>

## La Matanza de Acentejo (1)

### Mirador de la Vica
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · carretera de curvas
- *nota:* El litoral de Acentejo
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>La Matanza de Acentejo · 28.4398, -16.4306 (posición aproximada — NO la corrijas aquí)</sub>

## La Orotava (9)

### Área Recreativa Ramón Caminero
- **ya tiene:** tipo: Área recreativa · dura 70 min · franja: mañana · niños: Sí
- *qué se ve:* Zona recreativa del Cabildo en Parque Natural de Corona Forestal, con mesas y sitio para pasar el día.
- **falta:** **¿hacen falta los fogales? ¿se pide permiso?**
- <sub>La Orotava · 28.3298, -16.5328</sub>

### Mirador Cuesta de La Perdoma
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · carretera de curvas
- *nota:* Zona vitivinícola camino a Los Realejos
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>La Orotava · 28.3778, -16.5522</sub>

### Mirador de El Bollullo
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · carretera de curvas
- *nota:* Las playas de El Bollullo, Los Patos y El Ancón entre acantilados
- *aviso (acceso):* TF-176, muy cerrada y estrecha
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>La Orotava · 28.4170, -16.5190 (posición aproximada — NO la corrijas aquí)</sub>

### Mirador de La Ruleta
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer
- *nota:* El más visitado del Parque Nacional: Roques de García y el Llano de Ucanca
- *aviso (acceso):* Carretera de alta montaña pero ancha y asfaltada, junto al Parador
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>La Orotava · 28.2230, -16.6311</sub>

### Mirador de Mataznos
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · vale a cualquier hora · carretera de curvas
- *nota:* Valle central y posible mar de nubes (TF-21, 1.248 m)
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>La Orotava · 28.3497, -16.5252</sub>

### Mirador de Pino Alto
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · vale a cualquier hora
- *nota:* Panorámica del valle, poco frecuentado (TF-21, 575 m)
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>La Orotava · 28.3865, -16.5030 (posición aproximada — NO la corrijas aquí)</sub>

### Mirador Rosa de Piedra
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · vale a cualquier hora · carretera de curvas
- *nota:* Parada panorámica intermedia subiendo a Las Cañadas por la TF-21
- *aviso (acceso):* Sin coordenada exacta publicada; ubicación estimada sobre la propia carretera
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>La Orotava · 28.3300, -16.5500 (posición aproximada — NO la corrijas aquí)</sub>

### Mirador Vista a La Palma
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · carretera de curvas
- *nota:* La isla de La Palma al noroeste en días claros (TF-21, 1.350 m)
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>La Orotava · 28.3440, -16.5310 (posición aproximada — NO la corrijas aquí)</sub>

### Plaza-Mirador de Benijos
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · vale a cualquier hora · carretera de curvas
- *nota:* Huertas y el valle desde este barrio agrícola (910 m)
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>La Orotava · 28.3632, -16.5461</sub>

## La Victoria de Acentejo (3)

### Área Recreativa Hoya del Abade
- **ya tiene:** tipo: Área recreativa · dura 70 min · franja: mañana · niños: Sí
- *qué se ve:* Zona recreativa del Cabildo en Paisaje Protegido de Las Lagunetas, con mesas y sitio para pasar el día.
- **falta:** **¿hacen falta los fogales? ¿se pide permiso?**
- <sub>La Victoria de Acentejo · 28.4153, -16.4430</sub>

### Mirador de la Sabina
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · carretera de curvas
- *nota:* Acantilado sobre la Costa de Acentejo protegida
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>La Victoria de Acentejo · 28.4590, -16.4560 (posición aproximada — NO la corrijas aquí)</sub>

### Mirador de Ortuño
- **ya tiene:** tipo: Mirador · dura 25 min · franja: mañana · carretera de curvas
- *nota:* Primera vista del Teide subiendo por la Corona Forestal, a veces con La Palma y mar de nubes (TF-24, km 19)
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>La Victoria de Acentejo · 28.4056, -16.4239</sub>

## Los Realejos (5)

### Área Recreativa Chanajiga
- **ya tiene:** tipo: Área recreativa · dura 70 min · franja: mañana · niños: Sí
- *qué se ve:* Zona recreativa del Cabildo en Parque Natural de Corona Forestal, con mesas y sitio para pasar el día.
- **falta:** **¿hacen falta los fogales? ¿se pide permiso?**
- <sub>Los Realejos · 28.3441, -16.5848</sub>

### Mirador de El Lance
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · carretera de curvas
- *nota:* El mismo balcón que La Corona, subiendo a Icod el Alto
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>Los Realejos · 28.3800, -16.5980 (posición aproximada — NO la corrijas aquí)</sub>

### Mirador de La Corona
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer
- *qué se ve:* A 750 metros de altura, el calor retenido por las terrazas de plataneras del valle empuja corrientes de aire caliente hacia arriba que permiten volar en parapente durante horas.
- **falta:** **con niños**
- <sub>Los Realejos · 28.3690, -16.5920</sub>

### Mirador de La Grimona
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · carretera de curvas
- *nota:* Acantilados de Punta del Guindaste y la costa hasta Isla Baja (tras un túnel de la TF-42)
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>Los Realejos · 28.3928, -16.6088</sub>

### Mirador de San Pedro
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · vale a cualquier hora
- *nota:* Paisaje Protegido de Rambla de Castro, palmeral y costa (TF-5, km 41)
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>Los Realejos · 28.3958, -16.5940</sub>

## Los Silos (1)

### Mirador Punta del Fraile
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer
- *nota:* Acantilado sobre las playas de Las Arenas y El Fraile, de arena volcánica
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>Los Silos · 28.3670, -16.8500 (posición aproximada — NO la corrijas aquí)</sub>

## Puerto de la Cruz (2)

### Mirador de La Paz
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer
- *nota:* Playa Martiánez, el Lago y el Puerto desde el acantilado — inspiró un relato de Agatha Christie
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>Puerto de la Cruz · 28.4155, -16.5399</sub>

### Mirador de San Telmo
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer
- *nota:* Junto a la ermita de San Telmo, sobre el paseo marítimo
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>Puerto de la Cruz · 28.4166, -16.5486 (posición aproximada — NO la corrijas aquí)</sub>

## San Cristóbal de La Laguna (7)

### Mirador Cruz del Carmen
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer
- *qué se ve:* A 920 m, casi siempre entre nubes. Al lado está el Centro de Interpretación de Anaga (922 63 35 76, 9:30-15:00), donde dan mapas y consejo de senderos.
- *nota:* Aparcamiento pequeño y la policía lo cierra cuando se llena.
- **falta:** **con niños**
- <sub>San Cristóbal de La Laguna · 28.5303, -16.2805</sub>

### Mirador de Aguaide
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · carretera de curvas
- *nota:* Roque de los Dos Hermanos, Punta del Hidalgo y Chinamada desde un acantilado de más de 500 m
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>San Cristóbal de La Laguna · 28.5648, -16.2960</sub>

### Mirador de Jardina
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer
- *qué se ve:* Varias reseñas lo prefieren al de Cruz del Carmen. Se ve hasta el Teide.
- *nota:* Sitio de carretera, aparcan cuatro coches.
- **falta:** **con niños**
- <sub>San Cristóbal de La Laguna · 28.5241, -16.2881</sub>

### Mirador de San Mateo (Roque de los Dos Hermanos)
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer
- *nota:* El emblemático Roque de los Dos Hermanos, en Punta del Hidalgo
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>San Cristóbal de La Laguna · 28.5652, -16.3219 (posición aproximada — NO la corrijas aquí)</sub>

### Mirador de San Roque
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer
- *nota:* La vega lagunera y el casco histórico — primer mirador «inmersivo» con realidad aumentada
- **falta:** **qué se ve / qué hay** · **con niños**
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
- **ya tiene:** tipo: Área recreativa · dura 70 min · franja: mañana · niños: Sí
- *qué se ve:* Zona recreativa del Cabildo en Parque Natural de Corona Forestal, con mesas y sitio para pasar el día.
- **falta:** **¿hacen falta los fogales? ¿se pide permiso?**
- <sub>San Juan de la Rambla · 28.3516, -16.6302</sub>

### Mirador de El Mazapé
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · vale a cualquier hora
- *nota:* Barrio de La Vera: costa norte, Barranco de Ruiz e Icod El Alto
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>San Juan de la Rambla · 28.3926, -16.6469</sub>

### Mirador de la Playa de Los Roques
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer
- *nota:* Roques volcánicos emergiendo del Atlántico junto al pueblo
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>San Juan de la Rambla · 28.3930, -16.6960 (posición aproximada — NO la corrijas aquí)</sub>

## San Miguel de Abona (3)

### Mirador de la Centinela
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · carretera de curvas
- *nota:* Costa suroeste, Los Cristianos–Las Américas y el Teide de fondo
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>San Miguel de Abona · 28.0670, -16.6640 (posición aproximada — NO la corrijas aquí)</sub>

### Mirador El Frontón
- **ya tiene:** tipo: Mirador · dura 25 min · franja: mañana · carretera de curvas
- *nota:* Medianías altas camino a Vilaflor: Montañas de Tilena y cumbres
- *aviso (acceso):* Mejor de madrugada si hay mar de nubes
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>San Miguel de Abona · 28.2400, -16.6500 (posición aproximada — NO la corrijas aquí)</sub>

### Monumento Natural de Montaña Amarilla
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · vale a cualquier hora
- *nota:* Cono volcánico sobre el mar, junto a Costa del Silencio
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>San Miguel de Abona · 28.0140, -16.6520 (posición aproximada — NO la corrijas aquí)</sub>

## Santa Cruz de Tenerife (10)

### Mirador de Amogoje
- **ya tiene:** tipo: Mirador · dura 35 min · franja: mañana · carretera de curvas
- *qué se ve:* Vistas del macizo y de los caseríos de Anaga desde la cumbre.
- **falta:** **con niños**
- <sub>Santa Cruz de Tenerife · 28.5583, -16.2056</sub>

### Mirador de El Bailadero
- **ya tiene:** tipo: Mirador · dura 35 min · franja: mañana · carretera de curvas
- *qué se ve:* El cruce de Anaga: desde aquí sale la carretera a Taganana y se ven las dos vertientes a la vez.
- **falta:** **con niños**
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
- **ya tiene:** tipo: Mirador · dura 35 min · franja: atardecer
- *qué se ve:* Sobre Santa Cruz, con la ciudad a los pies y el puerto al fondo.
- **falta:** **con niños**
- <sub>Santa Cruz de Tenerife · 28.4754, -16.2606</sub>

### Mirador de Parque Las Mesas
- **ya tiene:** tipo: Mirador · dura 35 min · franja: atardecer
- *qué se ve:* Uno de los mejores sitios para ver la capital de un vistazo, con La Laguna detrás.
- **falta:** **con niños**
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
- **ya tiene:** tipo: Área recreativa · dura 70 min · franja: mañana · niños: Sí
- *qué se ve:* Zona recreativa del Cabildo en Paisaje Protegido de Las Lagunetas, con mesas y sitio para pasar el día.
- **falta:** **¿hacen falta los fogales? ¿se pide permiso?**
- <sub>Santa Úrsula · 28.3938, -16.4825</sub>

### Mirador de Chipeque
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer
- *qué se ve:* A 1.700 metros, es de los mejores sitios para ver el mar de nubes cubriendo el valle con el Teide detrás.
- *nota:* El mirador del mar de nubes con el Teide enfrente. 4,8 de nota con 4.618 reseñas: de lo mejor valorado de la isla.
- **falta:** **con niños**
- <sub>Santa Úrsula · 28.3740, -16.4638</sub>

### Mirador de Humboldt
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer
- *qué se ve:* El punto desde el que el naturalista alemán se quedó impresionado con el valle de La Orotava en 1799.
- *nota:* Sitio pelado con aparcamiento. Parada de autobuses de excursión.
- **falta:** **con niños**
- <sub>Santa Úrsula · 28.4078, -16.5072</sub>

### Mirador de La Quinta
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer
- *nota:* Antiguo búnker reconvertido en mirador, con vistas hacia Puerto de la Cruz
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>Santa Úrsula · 28.4370, -16.4930 (posición aproximada — NO la corrijas aquí)</sub>

### Mirador del Negro
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer
- *nota:* Costa norte y el Paisaje Protegido de la Costa de Acentejo, en la urb. La Mancha
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>Santa Úrsula · 28.4390, -16.4960 (posición aproximada — NO la corrijas aquí)</sub>

## Santiago del Teide (4)

### Mirador Archipenque
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · carretera de curvas
- *nota:* El más visitado de la zona: Acantilados de Los Gigantes y Puerto de Santiago
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>Santiago del Teide · 28.2403, -16.8371</sub>

### Mirador de Cherfe
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · carretera de curvas
- *nota:* Barranco de Masca, el valle de Santiago y La Gomera
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>Santiago del Teide · 28.2900, -16.8200 (posición aproximada — NO la corrijas aquí)</sub>

### Mirador de los Poleos
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · carretera de curvas
- *nota:* Coladas de lava, pinar y La Gomera/La Palma entre el mar de nubes
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>Santiago del Teide · 28.3000, -16.7800 (posición aproximada — NO la corrijas aquí)</sub>

### Mirador de Valle de Arriba
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · vale a cualquier hora · carretera de curvas
- *nota:* Valle de Santiago, el macizo de Teno y el Teide de fondo
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>Santiago del Teide · 28.2800, -16.7900 (posición aproximada — NO la corrijas aquí)</sub>

## Tacoronte (1)

### Mirador de los 500 Escalones
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · vale a cualquier hora
- *nota:* Mirador oculto sobre un acantilado de 150 m: costa de Acentejo y el Teide
- *aviso (acceso):* En coche se llega bien; luego hay que bajar 500 escalones a pie
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>Tacoronte · 28.4901, -16.4271</sub>

## Tegueste (2)

### Área Recreativa La Quebrada
- **ya tiene:** tipo: Área recreativa · dura 70 min · franja: mañana · niños: Sí
- *qué se ve:* Zona recreativa del Cabildo en Parque Rural de Anaga, con mesas y sitio para pasar el día.
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
- *qué se ve:* Zona recreativa del Cabildo en Parque Natural de Corona Forestal, con mesas y sitio para pasar el día.
- **falta:** **¿hacen falta los fogales? ¿se pide permiso?**
- <sub>Vilaflor de Chasna · 28.1903, -16.6662</sub>

### Ermita de San Roque (Vilaflor)
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · vale a cualquier hora
- *nota:* Cerro sobre el pueblo, con el casco de Vilaflor y el sur de la isla
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>Vilaflor de Chasna · 28.1540, -16.6360 (posición aproximada — NO la corrijas aquí)</sub>

### Mirador de los Escurriales
- **ya tiene:** tipo: Mirador · dura 25 min · franja: atardecer · vale a cualquier hora · carretera de curvas
- *nota:* Conos de toba volcánica del Paisaje Lunar
- **falta:** **qué se ve / qué hay** · **con niños**
- <sub>Vilaflor de Chasna · 28.1750, -16.6650 (posición aproximada — NO la corrijas aquí)</sub>

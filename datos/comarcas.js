/* COMARCAS — el mapa de la primera pregunta.

   POR QUÉ EXISTE. La primera pregunta eran seis fotos de franja: bonitas y
   mudas. Una foto de monteverde no le dice a quien acaba de aterrizar DÓNDE
   está Anaga, y ese es justo el trabajo de la primera pregunta. Zeben mandó un
   mapa de comarcas de Tenerife y encajó: los 31 municipios que trae son
   **exactamente** los 31 de `BASES`, nombre por nombre, así que no hubo que
   cuadrar nada.

   LO QUE HAY QUE ENTENDER ANTES DE TOCARLO
   · **Esto NO es el corredor.** El motor agrupa por `c` —nueve corredores
     hechos para calcular tiempos de viaje— y esto agrupa por comarca, que son
     seis y son las de la isla. Norte se reparte entre tres comarcas de aquí.
     Son dos ejes distintos y los dos valen; lo que no se puede es confundirlos.
   · **El dibujo es una silueta esquemática**, calibrada sobre puntos de costa
     reales pero NO sobre la linde municipal oficial. Vale para elegir, que es
     un diagrama. **No puede usarse nunca para decidir de qué municipio es un
     punto**: eso es el error del que costó un día escapar con las paradas de
     guagua.
   · **Anaga y la cumbre van APARTE, y no pintados.** No son municipios: Anaga
     es un macizo que comparten Santa Cruz y La Laguna, y la cumbre es la parte
     de arriba de cuatro pueblos. Dibujarles una frontera sería inventarla. Van
     debajo del mapa, con su cartel. Y hacen falta: con la lista solo de
     municipios, los 40 sitios de Anaga se quedaban sin puerta, porque Taganana
     está a 12,6 km del casco de La Laguna y el ancla busca a 6.
   · Repasado el catálogo entero, **solo cinco grupos no son un municipio** y
     los cinco son Anaga y la costa de Bajamar. En el resto de la isla la
     comarca y el pueblo son lo mismo.
   · **El aviso no es un adorno.** Quien pulsa Vilaflor, La Laguna o Santa Cruz
     tiene media comarca lejos del casco, y el motor no se la va a ofrecer. Se
     le dice, con los kilómetros, y con un botón para saltar al otro cartel. Es
     la regla de `lo_hay_pero_lejos_del_pueblo` adelantada al momento en que
     todavía se puede cambiar de idea.
     Los sitios del aviso se nombran por su FICHA, no con la distancia escrita:
     los kilómetros los mide el motor contra `BASES` al pintarlo, que es el
     mismo punto con el que ancla el día. Si mañana se mueve una ficha, el
     aviso se mueve con ella. */
const COMARCAS={
 "sur": {
  "rot": "Sur",
  "rot_en": "South",
  "rot_de": "Süden",
  "mun": [
   "Arico",
   "Granadilla de Abona",
   "Vilaflor de Chasna",
   "San Miguel de Abona",
   "Arona",
   "Adeje",
   "Guía de Isora",
   "Santiago del Teide"
  ]
 },
 "metropolitana": {
  "rot": "Área Metropolitana",
  "rot_en": "Metropolitan Area",
  "rot_de": "Metropolregion",
  "corto": "Metropolitana",
  "mun": [
   "Santa Cruz de Tenerife",
   "San Cristóbal de La Laguna",
   "Tegueste",
   "El Rosario"
  ]
 },
 "icoden-daute": {
  "rot": "Icoden-Daute",
  "mun": [
   "San Juan de la Rambla",
   "La Guancha",
   "Icod de los Vinos",
   "Garachico",
   "El Tanque",
   "Los Silos",
   "Buenavista del Norte"
  ]
 },
 "guimar": {
  "rot": "Valle de Güímar",
  "rot_en": "Güímar Valley",
  "rot_de": "Güímar-Tal",
  "corto": "Güímar",
  "mun": [
   "Candelaria",
   "Arafo",
   "Güímar",
   "Fasnia"
  ]
 },
 "orotava": {
  "rot": "Valle de La Orotava",
  "rot_en": "La Orotava Valley",
  "rot_de": "Orotava-Tal",
  "corto": "La Orotava",
  "mun": [
   "La Orotava",
   "Puerto de la Cruz",
   "Los Realejos"
  ]
 },
 "acentejo": {
  "rot": "Acentejo",
  "mun": [
   "Tacoronte",
   "El Sauzal",
   "La Matanza de Acentejo",
   "La Victoria de Acentejo",
   "Santa Úrsula"
  ]
 }
};

/* Los dos que no son un municipio: no van pintados en el mapa, van debajo. */
const SUELTOS={
 "anaga": {
  "rot": "Anaga",
  "f": "img/comarcas/anaga.jpg",
  "lema": "Los caseríos y el monteverde",
  "lema_en": "The hamlets and the laurel forest",
  "lema_de": "Die Weiler und der Lorbeerwald",
  "co": "^Anaga"
 },
 "cumbre": {
  "rot": "Cumbre y Teide",
  "rot_en": "The summit and Teide",
  "rot_de": "Gipfel und Teide",
  "f": "img/comarcas/cumbre.jpg",
  "lema": "El volcán y el paisaje lunar",
  "lema_en": "The volcano and the lunar landscape",
  "lema_de": "Der Vulkan und die Mondlandschaft",
  "corr": "Cumbre"
 }
};

/* Qué se queda en el otro cartel, por ficha. Los km los mide el motor. */
const AVISO_CARTEL={
 "Vilaflor de Chasna": {
  "ir": "cumbre",
  "cerca": [
   "Paisaje Lunar de Vilaflor"
  ],
  "lejos": [
   "Teleférico del Teide",
   "Roques de García",
   "Montaña de Guajara"
  ]
 },
 "San Cristóbal de La Laguna": {
  "ir": "anaga",
  "lejos": [
   "Taganana",
   "Benijo",
   "Chinamada"
  ]
 },
 "Santa Cruz de Tenerife": {
  "ir": "anaga",
  "lejos": [
   "Playa de Las Teresitas",
   "Playa de Benijo"
  ]
 }
};

/* La silueta. Cada comarca va dos veces: el relleno y una banda de toque
   transparente de 44 unidades, porque Acentejo es tan fina que sin ella no
   se puede pulsar con el dedo. Se pintan de mayor a menor área, así que la
   fina queda encima y gana el toque. */
const MAPA_SVG="<svg class=\"lienzoMapa\" viewBox=\"0 0 1000 818\" aria-hidden=\"true\" focusable=\"false\"> <g class=\"comarca\" data-comarca=\"sur\"> <path class=\"relleno\" id=\"sur\" d=\"M607.5 495.6L597.7 530.2L607.5 562L595.3 598L558.7 640.9L516.1 689.4L485.6 736.4L474.7 758.5L461.3 773.8L424.7 772.4L369.9 797.3L290 812.2L278.5 794.5L259 747.5L234.6 714.3L220 682.4L168.8 629.8L140.8 592.5L110.3 564.8L99.3 523.3L104.2 477.6L93.2 447.2L144.4 443L205.4 440.3L290.7 447.2L348.5 437.1L382 470.7L412.5 454.1L473.4 412.6L510 433.3L546.5 461L607.5 495.6Z\"/> <path class=\"toque\" d=\"M607.5 495.6L597.7 530.2L607.5 562L595.3 598L558.7 640.9L516.1 689.4L485.6 736.4L474.7 758.5L461.3 773.8L424.7 772.4L369.9 797.3L290 812.2L278.5 794.5L259 747.5L234.6 714.3L220 682.4L168.8 629.8L140.8 592.5L110.3 564.8L99.3 523.3L104.2 477.6L93.2 447.2L144.4 443L205.4 440.3L290.7 447.2L348.5 437.1L382 470.7L412.5 454.1L473.4 412.6L510 433.3L546.5 461L607.5 495.6Z\"/> </g> <g class=\"comarca\" data-comarca=\"metropolitana\"> <path class=\"relleno\" id=\"metropolitana\" d=\"M656.2 94.3L680.6 68L711.1 41.7L739.7 15.7L772 22.3L814.6 33.4L851.2 29.2L881.6 22.3L918.2 12.6L951.1 12.6L976.9 18.9L966.9 41.7L949.9 76.3L914.6 88.1L899.9 109.5L875.6 131.7L841.4 160.7L790.3 193.9L750 235.4L714.7 274.2L656.2 263.1L595.3 246.5L637.9 152.4L656.2 94.3ZM988.3 6L994 9.6L990.1 12.9Z\"/> <path class=\"toque\" d=\"M656.2 94.3L680.6 68L711.1 41.7L739.7 15.7L772 22.3L814.6 33.4L851.2 29.2L881.6 22.3L918.2 12.6L951.1 12.6L976.9 18.9L966.9 41.7L949.9 76.3L914.6 88.1L899.9 109.5L875.6 131.7L841.4 160.7L790.3 193.9L750 235.4L714.7 274.2L656.2 263.1L595.3 246.5L637.9 152.4L656.2 94.3ZM988.3 6L994 9.6L990.1 12.9Z\"/> </g> <g class=\"comarca\" data-comarca=\"icoden-daute\"> <path class=\"relleno\" id=\"icoden-daute\" d=\"M93.2 447.2L77.4 412.6L59.1 380.8L34.8 357.2L6 338.4L25 321.2L43.3 309.5L68.9 295.6L88.4 293.3L120.1 299.1L140.8 297L168.8 301.9L200.5 292.9L224.9 283.9L250.4 274.2L284.6 265.9L315 262.4L378.4 265.9L366.2 322.6L357.7 378L348.5 437.1L290.7 447.2L205.4 440.3L144.4 443L93.2 447.2ZM201.9 284.2L206.8 286.4L203.2 289.1Z\"/> <path class=\"toque\" d=\"M93.2 447.2L77.4 412.6L59.1 380.8L34.8 357.2L6 338.4L25 321.2L43.3 309.5L68.9 295.6L88.4 293.3L120.1 299.1L140.8 297L168.8 301.9L200.5 292.9L224.9 283.9L250.4 274.2L284.6 265.9L315 262.4L378.4 265.9L366.2 322.6L357.7 378L348.5 437.1L290.7 447.2L205.4 440.3L144.4 443L93.2 447.2ZM201.9 284.2L206.8 286.4L203.2 289.1Z\"/> </g> <g class=\"comarca\" data-comarca=\"guimar\"> <path class=\"relleno\" id=\"guimar\" d=\"M714.7 274.2L697.6 301.9L684.2 325.4L690.3 360L687.9 393.2L662.3 426.4L634.3 459.6L607.5 495.6L546.5 461L510 433.3L473.4 412.6L485.6 364.1L497.8 315.7L522.2 295L552.6 274.2L595.3 246.5L656.2 263.1L714.7 274.2Z\"/> <path class=\"toque\" d=\"M714.7 274.2L697.6 301.9L684.2 325.4L690.3 360L687.9 393.2L662.3 426.4L634.3 459.6L607.5 495.6L546.5 461L510 433.3L473.4 412.6L485.6 364.1L497.8 315.7L522.2 295L552.6 274.2L595.3 246.5L656.2 263.1L714.7 274.2Z\"/> </g> <g class=\"comarca\" data-comarca=\"orotava\"> <path class=\"relleno\" id=\"orotava\" d=\"M378.4 265.9L406.4 256.2L436.9 242.4L463.7 233.4L488.1 234.8L510 218.8L503.9 267.3L497.8 315.7L485.6 364.1L473.4 412.6L412.5 454.1L382 470.7L348.5 437.1L357.7 378L366.2 322.6L378.4 265.9Z\"/> <path class=\"toque\" d=\"M378.4 265.9L406.4 256.2L436.9 242.4L463.7 233.4L488.1 234.8L510 218.8L503.9 267.3L497.8 315.7L485.6 364.1L473.4 412.6L412.5 454.1L382 470.7L348.5 437.1L357.7 378L366.2 322.6L378.4 265.9Z\"/> </g> <g class=\"comarca\" data-comarca=\"acentejo\"> <path class=\"relleno\" id=\"acentejo\" d=\"M510 218.8L534.4 193.9L558.7 170.4L595.3 146.9L624.5 116.4L656.2 94.3L637.9 152.4L595.3 246.5L552.6 274.2L522.2 295L497.8 315.7L503.9 267.3L510 218.8Z\"/> <path class=\"toque\" d=\"M510 218.8L534.4 193.9L558.7 170.4L595.3 146.9L624.5 116.4L656.2 94.3L637.9 152.4L595.3 246.5L552.6 274.2L522.2 295L497.8 315.7L503.9 267.3L510 218.8Z\"/> </g> <path class=\"lindes\" d=\"M378.4 265.9L366.2 322.6L357.7 378L348.5 437.1M510 218.8L503.9 267.3L497.8 315.7M656.2 94.3L637.9 152.4L595.3 246.5M714.7 274.2L656.2 263.1L595.3 246.5M595.3 246.5L552.6 274.2L522.2 295L497.8 315.7M497.8 315.7L485.6 364.1L473.4 412.6M607.5 495.6L546.5 461L510 433.3L473.4 412.6M473.4 412.6L412.5 454.1L382 470.7L348.5 437.1M348.5 437.1L290.7 447.2L205.4 440.3L144.4 443L93.2 447.2\"/> <path class=\"costa\" d=\"M6 338.4L25 321.2L43.3 309.5L68.9 295.6L88.4 293.3L120.1 299.1L140.8 297L168.8 301.9L200.5 292.9L224.9 283.9L250.4 274.2L284.6 265.9L315 262.4L378.4 265.9L406.4 256.2L436.9 242.4L463.7 233.4L488.1 234.8L510 218.8L534.4 193.9L558.7 170.4L595.3 146.9L624.5 116.4L656.2 94.3L680.6 68L711.1 41.7L739.7 15.7L772 22.3L814.6 33.4L851.2 29.2L881.6 22.3L918.2 12.6L951.1 12.6L976.9 18.9L966.9 41.7L949.9 76.3L914.6 88.1L899.9 109.5L875.6 131.7L841.4 160.7L790.3 193.9L750 235.4L714.7 274.2L697.6 301.9L684.2 325.4L690.3 360L687.9 393.2L662.3 426.4L634.3 459.6L607.5 495.6L597.7 530.2L607.5 562L595.3 598L558.7 640.9L516.1 689.4L485.6 736.4L474.7 758.5L461.3 773.8L424.7 772.4L369.9 797.3L290 812.2L278.5 794.5L259 747.5L234.6 714.3L220 682.4L168.8 629.8L140.8 592.5L110.3 564.8L99.3 523.3L104.2 477.6L93.2 447.2L77.4 412.6L59.1 380.8L34.8 357.2ZM988.3 6L994 9.6L990.1 12.9ZM201.9 284.2L206.8 286.4L203.2 289.1Z\"/> </svg>";

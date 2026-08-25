/* ESTAMPA — La estampa de cada municipio: la ruta de su foto y su lema.
   Salió de index.html al partirlo: era una línea de cientos de kilobytes
   dentro del mismo fichero que el motor y el CSS. Se carga con su propio
   <script> antes que el motor, así que la constante está disponible igual
   que cuando vivía dentro. */
const ESTAMPA={
  "Adeje": {"f":"img/estampas/adeje.jpg", "lema":"Playa y sol del suroeste", "lema_en":"Beach and sun in the south-west", "lema_de":"Strand und Sonne im Südwesten"},
  "Arafo": {"f":"img/estampas/arafo.jpg", "lema":"El pueblo de la música", "lema_en":"The town of music", "lema_de":"Das Dorf der Musik"},
  "Arico": {"f":"img/estampas/arico.jpg", "lema":"El muelle de Tajao", "lema_en":"The little harbour of Tajao", "lema_de":"Der kleine Hafen von Tajao"},
  "Arona": {"f":"img/estampas/arona.jpg", "lema":"Playa y ambiente", "lema_en":"Beach and buzz", "lema_de":"Strand und Leben"},
  "Buenavista del Norte": {"f":"img/estampas/buenavista-del-norte.jpg", "lema":"Teno y el faro", "lema_en":"Teno and the lighthouse", "lema_de":"Teno und der Leuchtturm"},
  "Candelaria": {"f":"img/estampas/candelaria.jpg", "lema":"La basílica y los menceyes", "lema_en":"The basilica and the menceyes", "lema_de":"Die Basilika und die Menceyes"},
  "El Rosario": {"f":"img/estampas/el-rosario.jpg", "lema":"Monteverde camino del Teide", "lema_en":"Laurel forest on the way to Teide", "lema_de":"Lorbeerwald auf dem Weg zum Teide"},
  "El Sauzal": {"f":"img/estampas/el-sauzal.jpg", "lema":"Los Lavaderos y el mirador", "lema_en":"Los Lavaderos and the viewpoint", "lema_de":"Los Lavaderos und der Aussichtspunkt"},
  "El Tanque": {"f":"img/estampas/el-tanque.jpg", "lema":"El pueblo en alto", "lema_en":"The town up high", "lema_de":"Das Dorf in der Höhe"},
  "Fasnia": {"f":"img/estampas/fasnia.jpg", "lema":"Los Roques y la costa", "lema_en":"Los Roques and the coast", "lema_de":"Los Roques und die Küste"},
  "Garachico": {"f":"img/estampas/garachico.jpg", "lema":"El Caletón y el Roque", "lema_en":"El Caletón and the Roque", "lema_de":"El Caletón und der Roque"},
  "Granadilla de Abona": {"f":"img/estampas/granadilla-de-abona.jpg", "lema":"El Médano y el viento", "lema_en":"El Médano and the wind", "lema_de":"El Médano und der Wind"},
  "Guía de Isora": {"f":"img/estampas/guia-de-isora.jpg", "lema":"Alcalá y los puertitos", "lema_en":"Alcalá and the little harbours", "lema_de":"Alcalá und die kleinen Häfen"},
  "Güímar": {"f":"img/estampas/guimar.jpg", "lema":"Las pirámides y el valle", "lema_en":"The pyramids and the valley", "lema_de":"Die Pyramiden und das Tal"},
  "Icod de los Vinos": {"f":"img/estampas/icod-de-los-vinos.jpg", "lema":"El Drago Milenario", "lema_en":"The thousand-year-old dragon tree", "lema_de":"Der tausendjährige Drachenbaum"},
  "La Guancha": {"f":"img/estampas/la-guancha.jpg", "lema":"Charcos entre plataneras", "lema_en":"Rock pools among banana groves", "lema_de":"Naturbecken zwischen Bananenplantagen"},
  "La Matanza de Acentejo": {"f":"img/estampas/la-matanza-de-acentejo.jpg", "lema":"Viñedos y vendimia", "lema_en":"Vineyards and harvest", "lema_de":"Weinberge und Lese"},
  "La Orotava": {"f":"img/estampas/la-orotava.jpg", "lema":"Tradición y balcones de tea", "lema_en":"Tradition and tea-wood balconies", "lema_de":"Tradition und Balkone aus Tea-Holz"},
  "La Victoria de Acentejo": {"f":"img/estampas/la-victoria-de-acentejo.jpg", "lema":"Bodegas y buena mesa", "lema_en":"Wineries and good eating", "lema_de":"Weingüter und gutes Essen"},
  "Los Realejos": {"f":"img/estampas/los-realejos.jpg", "lema":"Naturaleza y aventura", "lema_en":"Nature and adventure", "lema_de":"Natur und Abenteuer"},
  "Los Silos": {"f":"img/estampas/los-silos.jpg", "lema":"El esqueleto de la ballena", "lema_en":"The whale skeleton", "lema_de":"Das Walskelett"},
  "Puerto de la Cruz": {"f":"img/estampas/puerto-de-la-cruz.jpg", "lema":"Martiánez y el paseo", "lema_en":"Martiánez and the promenade", "lema_de":"Martiánez und die Promenade"},
  "San Cristóbal de La Laguna": {"f":"img/estampas/san-cristobal-de-la-laguna.jpg", "lema":"Casco Patrimonio de la Humanidad", "lema_en":"A World Heritage old town", "lema_de":"Altstadt des Weltkulturerbes"},
  "San Juan de la Rambla": {"f":"img/estampas/san-juan-de-la-rambla.jpg", "lema":"El Charco de La Laja", "lema_en":"El Charco de La Laja", "lema_de":"El Charco de La Laja"},
  "San Miguel de Abona": {"f":"img/estampas/san-miguel-de-abona.jpg", "lema":"El castillo y las medianías", "lema_en":"The castle and the midlands", "lema_de":"Die Burg und das Hinterland"},
  "Santa Cruz de Tenerife": {"f":"img/estampas/santa-cruz-de-tenerife.jpg", "lema":"La capital y su bahía", "lema_en":"The capital and its bay", "lema_de":"Die Hauptstadt und ihre Bucht"},
  "Santa Úrsula": {"f":"img/estampas/santa-ursula.jpg", "lema":"La Giganta y el valle", "lema_en":"La Giganta and the valley", "lema_de":"La Giganta und das Tal"},
  "Santiago del Teide": {"f":"img/estampas/santiago-del-teide.jpg", "lema":"Los Gigantes y los delfines", "lema_en":"Los Gigantes and the dolphins", "lema_de":"Los Gigantes und die Delfine"},
  "Tacoronte": {"f":"img/estampas/tacoronte.jpg", "lema":"Tierra de viñedos", "lema_en":"Land of vineyards", "lema_de":"Land der Weinberge"},
  "Tegueste": {"f":"img/estampas/tegueste.jpg", "lema":"Romería y carretas", "lema_en":"Pilgrimage and ox carts", "lema_de":"Wallfahrt und Ochsenkarren"},
  "Vilaflor de Chasna": {"f":"img/estampas/vilaflor-de-chasna.jpg", "lema":"El Paisaje Lunar y el pinar", "lema_en":"The Lunar Landscape and the pine forest", "lema_de":"Die Mondlandschaft und der Kiefernwald"}
};

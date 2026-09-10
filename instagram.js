/* instagram.js — saca de los datos el contenido de la semana para la cuenta
   de Naira, y lo deja en una página que se abre en casa.

   POR QUÉ ESTO Y NO UN ROBOT QUE PUBLIQUE. Publicar solo se puede —Instagram
   lo permite con cuenta de empresa, una app en Meta y un token—, pero eso es
   darle permiso de publicar a un programa en la cuenta de Zeben, y encima
   obliga a un papeleo que él no tiene por qué hacer. Y hay algo más: una
   cuenta que publica sola se nota. Aquí lo que falta no es el botón de
   publicar: es **saber qué contar cada semana**, y eso sí está en los datos.

   LO QUE HACE ESTA CUENTA ÚNICA. Naira tiene el calendario de fiestas de los
   31 municipios: 138 fichas con pueblo, hora y sitio, y 300 actos de programa
   con su hora y su plaza. Eso no lo publica nadie más de la isla, y es lo que
   convierte una cuenta de fotos bonitas en una cuenta a la que se vuelve.
   Así que el contenido sale del calendario, no de la inspiración.

   LAS REGLAS DE LA CASA, AQUÍ TAMBIÉN:
   · **No se inventa nada.** El texto se arma con lo que trae la ficha —nombre,
     pueblo, día, hora, sitio y la nota— y si no hay nota, se dice menos. Nunca
     se cuenta lo que pasa en una fiesta que no esté escrito en el dato.
   · **El nombre de la fiesta no se traduce**, que es como lo va a ver escrito
     en el cartel de la plaza. Se traduce lo que ES, no cómo se llama.
   · **Verbena, romería y guachinche se quedan en español**, con media frase
     que las explique: no tienen traducción buena.
   · **La foto lleva su crédito.** De las 47 fichas con foto, 33 son de
     Wikimedia Commons con autor y licencia, y eso va en el pie del post. Las
     14 suyas no citan a nadie porque son suyas.

       node instagram.js          los próximos 21 días
       node instagram.js 30       los próximos 30
*/
const fs=require('fs'), path=require('path');
const RAIZ=__dirname;
const c=require(path.join(RAIZ,'banco.js'));
const {LUGARES,EVENTOS,ACTOS,BASES}=c;

/* ESTAMPA no lo exporta banco.js: se lee de su fichero, que es un literal. */
function estampas(){
  const t=fs.readFileSync(path.join(RAIZ,'datos','estampas.js'),'utf8');
  const i=t.indexOf('{');
  return JSON.parse(t.slice(i, t.lastIndexOf('}')+1));
}
const ESTAMPA=estampas();

const DIAS=+(process.argv[2]||21);
const hoy=new Date().toISOString().slice(0,10);
const limite=(()=>{const d=new Date(hoy+'T12:00:00'); d.setDate(d.getDate()+DIAS);
  return d.toISOString().slice(0,10);})();

/* ── de qué va la fiesta, por el nombre ──
   Las mismas reglas que `iconoFiesta()` en el motor: etiquetar 138 fiestas a
   mano es trabajo que no se hace nunca y se pudre al añadir más. Aquí el
   icono además manda el hashtag y la frase que explica de qué va, que es lo
   único que se traduce del nombre. */
const TIPOS=[
  {i:'🐂', re:/romer[íi]a|carreta|arrastre|traída del agua/i, et:'romeria',
   es:'una romería: carretas, ropa de mago y comida por el camino',
   en:'a romería — the island’s pilgrimage-parade, with ox carts, traditional dress and food shared along the way',
   de:'eine romería — der Wallfahrtsumzug der Insel, mit Ochsenkarren, Tracht und Essen am Wegesrand'},
  {i:'🎆', re:/fuego|pirotecni|traca|quema|pandorga/i, et:'fuegos',
   es:'fuegos artificiales', en:'fireworks', de:'ein Feuerwerk'},
  {i:'⛪', re:/procesi[óo]n|bajada|subida|traslado|embarcaci[óo]n|ofrenda|v[íi]a crucis|peregrinaci[óo]n|misa/i, et:'procesion',
   es:'una procesión', en:'a procession', de:'eine Prozession'},
  {i:'🎶', re:/verbena|baile|orquesta|concierto|festival|actuaci[óo]n|m[úu]sica|banda|parranda|humor|gala|pregón/i, et:'verbena',
   es:'música en la calle', en:'music in the street',
   de:'Musik auf der Straße'},
  {i:'🧺', re:/feria|mercadillo|mercado|muestra|exposici[óo]n|artesan|vendimia/i, et:'feria',
   es:'una feria', en:'a fair', de:'ein Markt'},
  {i:'🤼', re:/lucha canaria|juegos tradicionales|regata|carrera/i, et:'luchacanaria',
   es:'deporte de aquí', en:'local sport', de:'einheimischer Sport'},
];
const deQueVa=n=>TIPOS.find(t=>t.re.test(n||''))||
  {i:'🪘', et:'fiesta', es:'fiesta de pueblo', en:'a village fiesta', de:'ein Dorffest'};

/* La verbena es la palabra que más falta le hace al que viene de fuera. */
const VERBENA=/verbena/i;

const MESES=['enero','febrero','marzo','abril','mayo','junio','julio','agosto',
  'septiembre','octubre','noviembre','diciembre'];
const MESES_EN=['January','February','March','April','May','June','July','August',
  'September','October','November','December'];
const MESES_DE=['Januar','Februar','März','April','Mai','Juni','Juli','August',
  'September','Oktober','November','Dezember'];
const DIAS_ES=['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
const DIAS_EN=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const DIAS_DE=['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'];
function fecha(iso,idi){
  const d=new Date(iso+'T12:00:00'), n=d.getDate(), m=d.getMonth(), s=d.getDay();
  if(idi==='en') return DIAS_EN[s]+' '+n+' '+MESES_EN[m];
  if(idi==='de') return DIAS_DE[s]+', '+n+'. '+MESES_DE[m];
  return DIAS_ES[s]+' '+n+' de '+MESES[m];
}

/* ── qué foto le toca a esta fiesta ──
   Por orden: la del sitio donde ES la fiesta; si no, la del sitio con foto
   MÁS CERCANO a donde es; si no, la estampa del municipio.

   Ojo con el segundo escalón, que la primera versión lo hizo mal y se vio a
   la primera: a la Fiesta del Cristo de La Laguna le puso **Chinamada**, que
   es un caserío de Anaga. Pasó por coger «el sitio de más peso del municipio»,
   y La Laguna va del casco a Anaga y a Punta del Hidalgo. Es la misma trampa
   que ya está apuntada con el centroide de La Orotava, un piso más abajo: en
   un término grande, «del mismo municipio» no quiere decir «de al lado».
   Se mide en kilómetros desde el punto de la fiesta, y si la fiesta no tiene
   punto, desde el centro urbano de `BASES`. Y hay un techo: **a más de 8 km
   no vale**, que una foto que no es de donde se va no es una foto del sitio,
   es una foto bonita — y esa es justo la cuenta que no queremos. */
const km=(a,b,x,y)=>{const R=6371,t=Math.PI/180;const dl=(x-a)*t,dg=(y-b)*t;
  const h=Math.sin(dl/2)**2+Math.cos(a*t)*Math.cos(x*t)*Math.sin(dg/2)**2;
  return 2*R*Math.asin(Math.sqrt(h));};
const TECHO_FOTO=8;

function fotoDe(e){
  if(e.lu){
    const l=LUGARES.find(x=>x.n===e.lu&&x.foto);
    if(l) return {f:l.foto, de:l.n, credito:l.credito||null, propia:!l.credito, d:0};
  }
  /* desde dónde se mide: el punto de la fiesta, o el casco de su pueblo */
  let orig=(e.la!=null)?{la:e.la,lo:e.lo}:null;
  if(!orig && e.lu){ const l=LUGARES.find(x=>x.n===e.lu&&x.la!=null); if(l) orig={la:l.la,lo:l.lo}; }
  if(!orig){ const b=Object.values(BASES).find(x=>x.m===e.m); if(b) orig={la:b.la,lo:b.lo}; }

  const conFoto=LUGARES.filter(l=>l.foto&&l.la!=null);
  if(orig&&conFoto.length){
    const cerca=conFoto.map(l=>({l,d:km(orig.la,orig.lo,l.la,l.lo)}))
      .filter(x=>x.d<=TECHO_FOTO)
      .sort((a,b)=>a.d-b.d)[0];
    if(cerca) return {f:cerca.l.foto, de:cerca.l.n, credito:cerca.l.credito||null,
      propia:!cerca.l.credito, d:Math.round(cerca.d*10)/10,
      otroPueblo:cerca.l.m!==e.m?cerca.l.m:null};
  }
  const es=ESTAMPA[e.m];
  if(es) return {f:es.f, de:'Estampa de '+e.m, credito:null, propia:true, estampa:true};
  return null;
}

/* ── el texto ──
   Se arma con lo que trae la ficha y nada más. Si la fiesta no tiene nota, el
   post dice menos: es preferible a rellenar con una frase de folleto. */
function textos(e){
  const t=deQueVa(e.n);
  const hora=e.h?e.h:null;
  const donde=e.lu||null;
  const nota=(e.no||'').replace(/\s+/g,' ').trim();
  /* La nota del catálogo casi siempre dice DÓNDE es («En Plaza Ramón Arocha»).
     Si ya se dice el sitio por `lu`, repetirlo queda tonto. */
  const notaVale=nota && !(donde && nota.toLowerCase().includes(donde.toLowerCase().slice(0,12)));

  const pie=(idi)=>{
    const l=[];
    l.push('');
    l.push({es:'📍 '+e.m, en:'📍 '+e.m, de:'📍 '+e.m}[idi]);
    if(hora) l.push({es:'🕐 '+hora, en:'🕐 '+hora, de:'🕐 '+hora}[idi]);
    return l.join('\n');
  };

  const es=[
    t.i+' '+e.n,
    '',
    fecha(e.f,'es').replace(/^./,x=>x.toUpperCase())+' en '+e.m+
      (donde?', en '+donde:'')+(hora?', a las '+hora:'')+'.',
    notaVale?nota.replace(/\.?$/,'.'):'',
  ].filter(Boolean).join('\n')+pie('es');

  const en=[
    t.i+' '+e.n,
    '',
    'On '+fecha(e.f,'en')+' in '+e.m+
      (donde?', at '+donde:'')+(hora?', at '+hora:'')+'.',
    'It is '+t.en+'.',
    VERBENA.test(e.n)?'A verbena is the open-air night dance every town here throws in its fiestas.':'',
  ].filter(Boolean).join('\n')+pie('en');

  const de=[
    t.i+' '+e.n,
    '',
    'Am '+fecha(e.f,'de')+' in '+e.m+
      (donde?', bei '+donde:'')+(hora?', um '+hora+' Uhr':'')+'.',
    'Es ist '+t.de+'.',
    VERBENA.test(e.n)?'Eine verbena ist der Tanzabend unter freiem Himmel, den hier jedes Dorf bei seinen Fiestas feiert.':'',
  ].filter(Boolean).join('\n')+pie('de');

  /* La nota del catálogo está escrita a mano y en español, y es lo mejor que
     trae la ficha —«La feria de artesanía más importante de Canarias»—. En el
     motor la traduce el modelo; aquí no hay modelo, y pasarla por una tabla
     sería reescribirla, que es la regla de siempre con los porqués del
     Cabildo. Así que se queda en el post en español y **la página avisa**: el
     texto bueno no se pierde por el camino sin que nadie se entere. */
  return {es,en,de, nota:notaVale?nota:null};
}

/* Las etiquetas salen del dato —pueblo y tipo—, no de una lista de moda. */
function etiquetas(e){
  const t=deQueVa(e.n);
  const pueblo=String(e.m).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')
    .replace(/[^a-z0-9]/g,'');
  return ['#tenerife','#'+pueblo,'#'+t.et,'#fiestasdetenerife','#islascanarias',
          '#canarias','#quehacerentenerife'];
}

/* ── los actos: «qué hay esta semana en tu pueblo» ──
   Un programa de fiestas trae cuarenta actos con su hora y su plaza. Eso no
   es un post por acto: es UN post por pueblo y día grande, con la lista. */
function porPrograma(desde,hasta){
  const dentro=(ACTOS||[]).filter(a=>a.f>=desde&&a.f<=hasta);
  const por={};
  dentro.forEach(a=>{ const k=a.m+'|'+a.f; (por[k]=por[k]||[]).push(a); });
  return Object.entries(por)
    .filter(([,l])=>l.length>=3)          /* con menos de tres no es un programa */
    .map(([k,l])=>{
      const [m,f]=k.split('|');
      l.sort((x,y)=>String(x.h||'').localeCompare(String(y.h||'')));
      const fiestas=[...new Set(l.map(a=>a.fi).filter(Boolean))];
      return {tipo:'programa', m, f, actos:l,
        fiesta:fiestas.length===1?fiestas[0]:null};
    })
    .sort((a,b)=>a.f.localeCompare(b.f)||b.actos.length-a.actos.length);
}

function main(){
  const fiestas=EVENTOS.filter(e=>e.f>=hoy&&e.f<=limite)
    .sort((a,b)=>a.f.localeCompare(b.f));
  /* Una misma fiesta está fichada en 2026 y 2027: dentro del rango solo puede
     caer una, pero si alguna vez cayeran las dos, se queda la primera. */
  const vistas=new Set();
  const posts=[];
  fiestas.forEach(e=>{
    const k=e.n+'|'+e.m; if(vistas.has(k)) return; vistas.add(k);
    const foto=fotoDe(e);
    const tx=textos(e);
    posts.push({tipo:'fiesta', f:e.f, m:e.m, n:e.n, h:e.h||null, lu:e.lu||null,
      icono:deQueVa(e.n).i, foto, textos:tx, etiquetas:etiquetas(e),
      notaSoloEs:tx.nota||null, fuente:e.of||null});
  });

  const programas=porPrograma(hoy,limite).map(p=>{
    const foto=fotoDe({m:p.m,lu:null});
    return Object.assign(p,{foto, icono:'🗓️',
      etiquetas:etiquetas({m:p.m,n:p.fiesta||'fiesta'})});
  });

  console.log('Del '+hoy+' al '+limite+' ('+DIAS+' días)\n');
  console.log('  fiestas con post          : '+posts.length);
  console.log('  días de programa cargado  : '+programas.length);
  const sinFoto=posts.filter(p=>!p.foto).length;
  const conEstampa=posts.filter(p=>p.foto&&p.foto.estampa).length;
  const conCredito=posts.filter(p=>p.foto&&p.foto.credito).length;
  console.log('  con foto de un sitio      : '+(posts.length-sinFoto-conEstampa)+
              '   (de esas, '+conCredito+' llevan crédito de Commons)');
  console.log('  con la estampa del pueblo : '+conEstampa);
  if(sinFoto) console.log('  SIN NADA que enseñar      : '+sinFoto);
  const lejos=posts.filter(p=>p.foto&&p.foto.d>3);
  if(lejos.length){
    console.log('\n  Fotos que quedan lejos de donde es la fiesta (mira si valen):');
    lejos.forEach(p=>console.log('    '+p.foto.d+' km  '+p.n.slice(0,42)+
      '  →  '+p.foto.de+(p.foto.otroPueblo?' ('+p.foto.otroPueblo+')':'')));
  }
  const notas=posts.filter(p=>p.notaSoloEs).length;
  if(notas) console.log('\n  '+notas+' posts llevan una nota buena que SOLO va en español.');

  const plantilla=fs.readFileSync(path.join(RAIZ,'plantilla-instagram.html'),'utf8');
  const H='/*POSTS*'+'/[]';
  if(plantilla.split(H).length!==2) throw new Error('la plantilla no trae el hueco');
  fs.writeFileSync(path.join(RAIZ,'instagram.html'),
    plantilla.replace(H,JSON.stringify(posts.concat(programas))));
  console.log('\nEscrito instagram.html — se abre en el navegador de casa.');
  console.log('Cada post trae su foto, el texto en los tres idiomas y su crédito.');
  console.log('Se copia el que se quiera y se publica a mano: nada sale solo.');
}

main();

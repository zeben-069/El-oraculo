/* fusionar.js — quita sitios repetidos del catálogo, juntando lo bueno de cada uno.
   ------------------------------------------------------------------
   Zeben vio que Garachico tenía TRES cascos históricos y La Laguna dos.
   Un casco histórico es el núcleo del pueblo por donde se pasea: hay uno.
   Los repetidos vinieron de importar de varias fuentes —el registro del
   Cabildo, el de Bienes de Interés Cultural y la redacción propia— cada
   una con su nombre para lo mismo: «Casco histórico de Garachico»,
   «Conjunto Histórico Villa y Puerto de Garachico» y «Casco de Garachico».

   Duelen de tres maneras: el turista los ve dos veces en la lista de
   sitios, el motor puede meter los dos en el mismo día creyendo que son
   paradas distintas, y las fotos se hacen por duplicado.

   No se borra sin más: se JUNTAN. De cada grupo sale una ficha con el
   nombre más claro, el peso mayor, la mejor descripción, la foto si
   alguna la tiene y la parada de guagua más cercana de todas.

       node fusionar.js            dice qué haría, sin tocar nada
       node fusionar.js hazlo      lo hace                            */
const fs=require('fs');
require('./banco.js');

const FICHERO='datos/lugares.js';

/* Los grupos, decididos a mano mirando las fichas una por una: el primero
   es el que se queda (y da el nombre), los demás se funden en él. Esto NO
   se detecta solo: «Montaña Grande» y «Circular Montaña Grande» están a
   450 m y son cosas distintas —un volcán y el sendero que lo rodea—. */
const GRUPOS=[
  {queda:'Casco histórico de Garachico',
   funde:['Conjunto Histórico Villa y Puerto de Garachico','Casco de Garachico'],
   porque:'tres fichas del mismo casco, a 340 m entre ellas'},
  {queda:'Casco histórico de La Laguna',
   funde:['San Cristóbal de La Laguna (Casco)'],
   porque:'a 30 m una de otra'},
  {queda:'Casco histórico de Puerto de la Cruz',
   funde:['El Puerto de la Cruz'],
   porque:'el mismo conjunto histórico con dos nombres'},
  {queda:'Chinamada',
   funde:['Caserío de Chinamada'],
   porque:'el caserío de las casas-cueva, dos veces'},
  {queda:'Ermita de San Diego del Monte',
   funde:['Ermita de San Diego'],
   porque:'la misma ermita, con y sin el «del Monte»'},
  {queda:'Playa de Diego Hernández',
   funde:['Playa de Diego Hernández o Playa Blanca'],
   porque:'la misma playa con sus dos nombres'},
  {queda:'Paisaje Lunar de Vilaflor',
   funde:['Paisaje Lunar'],
   porque:'lo mismo, y la ficha corta no traía ni descripción'},
  {queda:'Casa del Vino',
   funde:['Casa del Vino (El Sauzal)'],
   porque:'la misma hacienda del XVII'},
  {queda:'Mirador Pico del Inglés',
   funde:['Pico del Inglés'],
   porque:'el mirador y el «volcán» son el mismo sitio, a 110 m'}
];

/* Cómo se resuelve cada campo cuando las dos fichas lo traen. */
/* El peso sí sube al mayor: si una fuente lo tiene por más importante, lo es.
   Pero la DURACIÓN no: juntando el mirador del Pico del Inglés con la ficha
   que lo tenía por «volcán» salían 120 minutos en un mirador, y en un
   mirador se está veinticinco. La duración se queda la de la ficha que
   manda, que es la que describe lo que de verdad se hace allí. */
const MAYOR=['w'];
const MENOR=['bus'];                     /* gana la parada más cercana */
const LARGO=['fx','no','desc','nota'];   /* gana el texto más largo, que dice más */

function fundir(base,otros){
  const f=Object.assign({},base);
  otros.forEach(o=>{
    Object.keys(o).forEach(k=>{
      if(k==='n') return;                                  /* el nombre no se toca */
      if(f[k]==null||f[k]===''){ f[k]=o[k]; return; }      /* lo que falta, se rellena */
      if(MAYOR.includes(k)&&+o[k]>+f[k]) f[k]=o[k];
      if(MENOR.includes(k)&&+o[k]<+f[k]){ f[k]=o[k]; if(o.bus_parada) f.bus_parada=o.bus_parada; }
      if(LARGO.includes(k)&&String(o[k]).length>String(f[k]).length) f[k]=o[k];
      /* la foto: si la base no tiene y el otro sí, se queda la del otro
         CON SU CRÉDITO, que separarlos sería publicar sin citar */
      if(k==='foto'&&!base.foto){ f.foto=o.foto; f.credito=o.credito; }
    });
  });
  return f;
}

const texto=fs.readFileSync(FICHERO,'utf8');
const cabecera=texto.slice(0,texto.indexOf('const LUGARES='));
const arr=eval(texto.slice(texto.indexOf('['),texto.lastIndexOf(']')+1));

/* ── SEGUNDA LIMPIEZA: descripciones que no son del sitio ──────────────
   Al importar los puntos de interés del Cabildo, la descripción de un ÁRBOL
   MONUMENTAL cercano se pegó a la ficha del sitio de al lado. Se nota por el
   campo sub_of: dice «Árbol monumental» en fichas que son una iglesia, un
   sendero o un mirador. El resultado: el Mirador Pico del Inglés contaba que
   «está ramificado desde la base y el tronco principal está muerto».
   Y no es un detalle: `desc` viaja al informe como `que_es`, y el prompt
   manda contarlo como la historia oficial del sitio. O sea que Naira lo
   estaba diciendo. Se quita: sin descripción, la regla de la casa es
   callarse, no rellenar a ojo. */
function descAjena(l){
  return l.sub_of==='Árbol monumental' && !/Árbol/.test(l.tipo||'');
}

const fuera=new Set(); const cambios=[]; const fotosHuérfanas=[];
GRUPOS.forEach(g=>{
  const base=arr.find(l=>l.n===g.queda);
  if(!base){ console.log('OJO: no encuentro «'+g.queda+'»'); return; }
  const otros=g.funde.map(n=>arr.find(l=>l.n===n)).filter(Boolean);
  if(!otros.length){ console.log('· «'+g.queda+'» ya estaba limpio'); return; }
  const antes=JSON.stringify(base);
  const nueva=fundir(base,otros);
  Object.keys(base).forEach(k=>delete base[k]);
  Object.assign(base,nueva);
  otros.forEach(o=>{ fuera.add(o.n);
    /* la imagen de la ficha que desaparece ya no la usa nadie */
    if(o.foto&&o.foto!==base.foto) fotosHuérfanas.push(o.foto); });
  cambios.push({g,base,otros,antes,despues:JSON.stringify(base)});
});

console.log('=== LO QUE SE JUNTA ===');
cambios.forEach(({g,base,otros})=>{
  console.log('\n· '+g.queda+'   ('+g.porque+')');
  otros.forEach(o=>console.log('    se funde: '+o.n));
  console.log('    queda: w'+base.w+' · dur '+base.dur+' · guagua a '+base.bus+' m'+
              (base.foto?' · con foto':'')+
              (base.fx?'\n    fx: '+base.fx.slice(0,88):''));
});
const ajenas=arr.filter(descAjena);
console.log('\n=== DESCRIPCIONES QUE NO SON DEL SITIO ===');
console.log(ajenas.length+' fichas traen la descripción de un árbol monumental de al lado.');
ajenas.forEach(l=>console.log('   '+(l.tipo||'').padEnd(17)+l.n.padEnd(46)+
  '«'+String(l.desc||'').slice(0,52)+'…»'));
console.log('   → se les quita desc, desc_of y sub_of: sin descripción, Naira se calla.');

console.log('\nfichas antes: '+arr.length+'  ·  se van: '+fuera.size+'  ·  quedan: '+(arr.length-fuera.size));
if(fotosHuérfanas.length) console.log('imágenes que se quedan sin dueño: '+fotosHuérfanas.join(', '));

if(process.argv[2]!=='hazlo'){
  console.log('\n(esto era el ensayo · «node fusionar.js hazlo» para hacerlo de verdad)');
  process.exit(0);
}

ajenas.forEach(l=>{ delete l.desc; delete l.desc_of; delete l.sub_of; });
const limpio=arr.filter(l=>!fuera.has(l.n));
fs.writeFileSync(FICHERO,cabecera+'const LUGARES='+JSON.stringify(limpio)+';\n');
fotosHuérfanas.forEach(f=>{ try{ fs.unlinkSync(f); console.log('borrada '+f); }catch(e){} });
console.log('\nhecho: '+limpio.length+' sitios. Pasa ahora: node lote.js');

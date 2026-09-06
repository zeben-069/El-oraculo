/* eventos.js — el puente entre «lo que hay esta semana» y EVENTOS.
   ------------------------------------------------------------------
   Zeben tiene un aviso semanal que le llega con la agenda cultural de la
   isla. Esa información ya existe; lo que faltaba era meterla en Naira sin
   tener que escribir código. Desde aquí no puedo ir a buscarla —la red del
   contenedor está cerrada— pero da igual: la parte difícil (encontrarla) ya
   está hecha, y la fácil (pasarla a fichas) es esto.

       node eventos.js pegar             arma pegar-eventos.html
       node eventos.js fiestas.json      mete las que vengan marcadas
       node eventos.js programa.json     lo mismo, pero si el fichero dice que
                                         es un programa se va solo a los ACTOS
       node eventos.js actos p.json "Fiestas del Cristo"   a la fuerza

   La página trocea el texto y propone; quien decide es él. Nada entra sin
   que alguien lo haya mirado: en un correo, «Romería de Benijos» puede ser
   una fiesta de verdad o la frase de un tip gastronómico. */
const fs=require('fs');
const c=require('./banco.js');
const {BASES}=c;

const EVENTOS=(()=>{ const t=fs.readFileSync('datos/eventos.js','utf8');
  return eval(t+';EVENTOS'); })();

const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')
  .replace(/[^a-z0-9]+/g,' ').trim();

/* Limpieza del nombre. Los programas se copian de una web y el troceo deja
   restos: la hora delante («20:30 – Cine al aire libre»), la cabecera del día
   pegada al primer acto («Lunes, 31 de agosto (En el salón de actos)18:30 –
   Exposición…») y alguna línea que no es un acto sino un rótulo de la página
   («Horario y calendarios»). La hora ya viaja en su campo, así que repetirla
   en el nombre solo estorba. */
const NO_ES_ACTO=/^(horario|calendario|programa|entradas|tags?|info|categor|lugar|municipio|d[ií]a del se[ñn]or)\b/i;
function limpiaNombre(n){
  var t=String(n||'').trim();
  /* la cabecera del día pegada delante, con o sin paréntesis del sitio */
  t=t.replace(/^(lunes|martes|mi[ée]rcoles|jueves|viernes|s[áa]bado|domingo)[^0-9]{0,80}?\d{1,2}\s+de\s+[a-záéíóú]+\s*(\([^)]*\))?\s*/i,'');
  /* la hora delante, en cualquiera de sus formas */
  t=t.replace(/^\d{1,2}[:.]\d{2}\s*(–|-|—|a las)?\s*(\d{1,2}[:.]\d{2})?\s*(–|-|—)?\s*/,'');
  t=t.replace(/^[–—-]\s*/,'').trim();
  if(t) t=t[0].toUpperCase()+t.slice(1);
  return t;
}

/* la franja sale de la hora: el motor la usa para colocar la fiesta en el día */
function franjaDe(h){
  if(!h) return 'tarde';
  const n=+String(h).slice(0,2);
  return n<12?'mañana':n<15?'mediodía':n<19?'tarde':n<22?'atardecer':'noche';
}

function pagina(){
  const munis=[...new Set(Object.values(BASES).map(b=>b.m).filter(Boolean))].sort();
  /* los que ya hay, para avisar de repetidos: solo fecha y nombre, que es
     lo único que la página necesita comparar */
  const ya=EVENTOS.map(e=>({f:e.f,n:e.n}));

  const plantilla=fs.readFileSync('plantilla-eventos.html','utf8');
  const H_M='/*MUNIS*'+'/[]', H_Y='/*YA*'+'/[]';
  if(plantilla.split(H_M).length!==2||plantilla.split(H_Y).length!==2)
    throw new Error('la plantilla no trae los huecos');
  fs.writeFileSync('pegar-eventos.html',
    plantilla.replace(H_M,JSON.stringify(munis)).replace(H_Y,JSON.stringify(ya)));
  console.log('escrito pegar-eventos.html');
  console.log('   '+munis.length+' municipios, '+ya.length+' fiestas ya fichadas para avisar de repetidas.');
  console.log('Se abre en el navegador, se pega el correo, se pulsa «Sacar las fiestas»,');
  console.log('se corrige lo que haga falta y se baja: node eventos.js ese-fichero.json');
  console.log('(el fichero dice ya si son fiestas sueltas o el programa de unas fiestas)');
}

function meter(fichero){
  const datos=JSON.parse(fs.readFileSync(fichero,'utf8'));
  /* La página ya dice de qué va lo que se pegó. Un programa de fiestas no
     entra como cuarenta fiestas: se va derecho a los actos. */
  if(datos.tipo==='actos') return meterActos(fichero,datos.fiesta||process.argv[3]);
  const lista=datos.fiestas||datos;
  if(!Array.isArray(lista)||!lista.length) return console.log('no hay fiestas en '+fichero);

  const nuevas=[], fuera=[];
  lista.forEach(x=>{
    if(!x.f||!x.n||!x.m){ fuera.push((x.n||'(sin nombre)')+' → le falta fecha, nombre o municipio'); return; }
    if(!/^\d{4}-\d{2}-\d{2}$/.test(x.f)){ fuera.push(x.n+' → fecha rara: '+x.f); return; }
    const base=Object.values(BASES).find(b=>b.m===x.m)||BASES[x.m];
    if(!base){ fuera.push(x.n+' → municipio desconocido: '+x.m); return; }
    /* Repetida: mismo día y mismo nombre, sí; pero también la MISMA fiesta
       con otra fecha a menos de dos semanas, que es lo que pasó con la
       Romería de Benijos —fichada el 7 y el correo la daba el 13—. Esa no se
       mete: hay que decidir cuál de las dos fechas es la buena. */
    const dias=(a,b)=>Math.round(Math.abs(new Date(a+'T12:00:00')-new Date(b+'T12:00:00'))/864e5);
    const rep=EVENTOS.find(e=>norm(e.n)===norm(limpiaNombre(x.n))&&e.f===x.f);
    if(rep){ fuera.push(x.n+' → ya estaba ese día'); return; }
    /* Ojo: el aviso de «la misma fiesta con otra fecha» vale para una agenda
       semanal, pero NO dentro del programa de unas fiestas. El Cristo de La
       Laguna tiene «Domingo de Feria Infantil» tres domingos seguidos y los
       tres son de verdad. Se compara contra lo que YA había, no contra lo que
       entra en este mismo fichero. */
    const cerca=EVENTOS.find(e=>norm(e.n)===norm(limpiaNombre(x.n))&&dias(e.f,x.f)<=14);
    if(cerca){ fuera.push(limpiaNombre(x.n)+' → ya está fichada el '+cerca.f+' ('+dias(cerca.f,x.f)+
      ' días). Decide cuál es la buena y corrige esa, no metas otra.'); return; }

    const nombre=limpiaNombre(x.n);
    if(!nombre||nombre.length<4||NO_ES_ACTO.test(nombre)){
      fuera.push((x.n||'?').slice(0,50)+' → no parece un acto, es un rótulo de la página'); return; }
    const f={f:x.f, n:nombre, m:x.m, c:base.corr, fr:franjaDe(x.h)};
    if(x.h) f.h=x.h;
    if(x.no) f.no=x.no;
    f.of=datos.fuente||'Agenda semanal, repasada a mano';
    /* Sin hora confirmada, el motor y el prompt ya saben decir que la
       publica el ayuntamiento unos días antes. Se marca para no dar por
       buena una hora que nadie ha confirmado. */
    if(!x.h) f.sh=1;
    nuevas.push(f);
  });

  if(!nuevas.length){
    console.log('no entra ninguna.');
    fuera.forEach(x=>console.log('   · '+x));
    return;
  }
  const FICHERO='datos/eventos.js';
  let txt=fs.readFileSync(FICHERO,'utf8');
  const cierre=txt.lastIndexOf(']');
  if(cierre<0) throw new Error('no encuentro el final de EVENTOS en '+FICHERO);
  const coma=txt.slice(0,cierre).trimEnd().endsWith(',')?'':',';
  txt=txt.slice(0,cierre)+coma+'\n'+nuevas.map(f=>JSON.stringify(f)).join(',\n')+'\n'+txt.slice(cierre);
  fs.writeFileSync(FICHERO,txt);

  console.log(nuevas.length+' fiestas nuevas:');
  nuevas.sort((a,b)=>a.f<b.f?-1:1).forEach(f=>
    console.log('   ✓ '+f.f+'  '+(f.h||'—————').padEnd(6)+f.m.padEnd(26)+f.n.slice(0,48)));
  if(fuera.length){ console.log('\nfuera ('+fuera.length+'):');
    fuera.forEach(x=>console.log('   · '+x)); }
  console.log('\nComprueba ahora:');
  console.log('   node -e "const c=require(\'./banco.js\'); console.log(\'ok\')"');
  console.log('   node lote.js');
}


/* ══ LOS ACTOS DE UN PROGRAMA DE FIESTAS ═══════════════════════════════
   Una fiesta de EVENTOS es una línea: «Fiesta del Santísimo Cristo, La
   Laguna, 14 de septiembre». Pero unas fiestas de pueblo duran tres semanas
   y traen un programa con cuarenta actos, y ahí está lo que le sirve al
   turista: el domingo hay feria infantil en la Plaza del Cristo y el viernes
   hay verbena. Eso no cabe en EVENTOS —serían cuarenta fiestas en La Laguna
   la misma semana y la agenda quedaría inservible—, así que los actos van
   en su propio fichero, colgando del día y del municipio.

   Zeben baja los programas de la agenda cultural y los pega en la misma
   página que las fiestas. De aquí salen ya con dos cosas puestas:

   · a quién le sirve el acto (`q`), sacada DEL NOMBRE, como los iconos de
     fiesta. Con niños interesa el cine al aire libre y los castillos de
     agua; a dos adultos, la verbena y los fuegos. Lo que no se sabe
     clasificar se queda SIN etiqueta y no se le ofrece a nadie: de 72 actos
     de tres programas, la mitad. Preferimos callarnos que colocarle un
     torneo de dominó a una familia con niños diciendo que es para ellos.
   · dónde es (`lu`), que casi siempre viene pegado al final del nombre
     («… Plaza del Cristo.»). Sin eso no se le puede decir «date un saltito
     a la plaza», que es justo lo que hace útil el dato.               */

/* Restos de la página web que se cuelan al copiar el programa. */
const RESTOS_WEB=/\s*(Entradas[A-Za-zÁ-úñ ]*|Ocasiones\s?especiales|Horario\s?y\s?calendarios|Tags?:.*)\s*$/i;

/* Un programa pegado de una web trae varios actos en la misma línea:
   «Fiesta del agua con castillos de agua.19:30 – Gala de la Reina Infantil».
   Se parte por la hora que va seguida de raya, que es como los separa la
   página. Ojo: «de 10:00 a 14:00» no lleva raya detrás y no parte nada. */
function troceaActos(nombre,horaBase){
  const t=String(nombre||'').trim();
  const re=/(\d{1,2})[:.](\d{2})\s*[–—-]\s+/g;
  const cortes=[]; let m;
  while((m=re.exec(t))) cortes.push({i:m.index,fin:re.lastIndex,h:m[1].padStart(2,'0')+':'+m[2]});
  if(!cortes.length) return [{n:t,h:horaBase||null}];
  const trozos=[];
  const cabeza=t.slice(0,cortes[0].i).trim();
  if(cabeza) trozos.push({n:cabeza,h:horaBase||null});
  cortes.forEach((c,k)=>{
    const hasta=k+1<cortes.length?cortes[k+1].i:t.length;
    trozos.push({n:t.slice(c.fin,hasta).trim(),h:c.h});
  });
  return trozos.filter(x=>x.n);
}

/* El sitio va casi siempre al final, detrás de un punto. Se saca solo si es
   corto y suena a sitio: si detrás del punto viene la lista de grupos que
   tocan, no es un sitio y el nombre se queda entero. */
const LUGAR_INI=/\.\s+((?:Plaza|Plazoleta|Calle|C\/|Real Santuario|Santuario|Iglesia|Ermita|Catedral|Casco hist|Pabell|Sala|Sal[óo]n|Casa|Anexo|Camino|Parque|Avda|Avenida|Teatro|Auditorio|Orfe[óo]n|Recinto|Explanada|Muelle|Playa|Polideportivo|Campo|Estadio|Centro|Rambla|Alameda|Mercado)[\s\S]*)$/;
function sacaLugar(n){
  const m=LUGAR_INI.exec(n);
  if(!m) return {n:n,lu:null};
  const lu=m[1].replace(/\.\s*$/,'').trim();
  if(lu.length>45||lu.split(/\s+/).length>6) return {n:n,lu:null};
  return {n:n.slice(0,m.index).trim(),lu:lu};
}

/* Para quién es el acto, sacado del nombre. Primero se mira lo de niños:
   una «Gala de elección de la Reina Infantil» es una gala, sí, pero lo que
   manda ahí es el infantil. */
const ACTO_NINOS=/infantil|para (los |l@s )?ni[ñn]os|familiar|para toda la familia|actividades? infantil|pinta ?caras|hinchable|colchoneta|castillo de agua|fiesta de la espuma|globoflexia|payaso|t[íi]teres|marionet|cuentacuentos|taller(es)? infantil|juegos (infantiles|tradicionales|populares)|cine (al aire libre|de verano|en la calle)|circo|cabalgata|mascota|parque acu[áa]tico|espuma|guiñol|magia/i;
const ACTO_NOCHE=/verbena|megaverbena|orquesta|gran baile|baile (del|de|tardeo)|tardeo|\bdj\b|concierto|drag|humor|rock|festival|fuegos artificiales|fuegos del|fuegos de la|pirotecni|gala|noche de|cata de vinos|romer[íi]a|bailable|parranda/i;
function clasificaActo(n){
  const t=String(n||'');
  if(ACTO_NINOS.test(t)) return 'ninos';
  if(ACTO_NOCHE.test(t)) return 'noche';
  return null;                     /* lo que no se sabe, no se ofrece */
}

function meterActos(fichero,fiesta){
  const datos=JSON.parse(fs.readFileSync(fichero,'utf8'));
  const lista=datos.fiestas||datos.actos||datos;
  if(!Array.isArray(lista)||!lista.length) return console.log('no hay actos en '+fichero);
  const nombreFiesta=fiesta||datos.fiesta||null;

  const FICHERO='datos/actos.js';
  const ACTOS=fs.existsSync(FICHERO)
    ? (()=>{ const t=fs.readFileSync(FICHERO,'utf8'); return eval(t+';ACTOS'); })() : [];

  const nuevos=[], fuera=[], ojo=[];
  const muniPrograma={};
  lista.forEach(x=>{ if(x.m) muniPrograma[x.m]=(muniPrograma[x.m]||0)+1; });
  const muniMandon=Object.keys(muniPrograma).sort((a,b)=>muniPrograma[b]-muniPrograma[a])[0];

  lista.forEach(x=>{
    if(!x.f||!x.n||!x.m){ fuera.push((x.n||'(sin nombre)')+' → le falta fecha, nombre o municipio'); return; }
    if(!/^\d{4}-\d{2}-\d{2}$/.test(x.f)){ fuera.push(x.n+' → fecha rara: '+x.f); return; }
    const base=Object.values(BASES).find(b=>b.m===x.m)||BASES[x.m];
    if(!base){ fuera.push(x.n+' → municipio desconocido: '+x.m); return; }
    /* Un acto de otro municipio dentro del programa casi siempre es un error
       de la web de donde se copió, pero NO se corrige solo: puede que el
       ayuntamiento lleve de verdad un acto a otro pueblo. Se avisa y entra
       donde dice el fichero; que decida quien vive aquí. */
    if(muniMandon&&x.m!==muniMandon) ojo.push(x.m+' en un programa de '+muniMandon+': '+String(x.n).slice(0,60));

    troceaActos(String(x.n).replace(RESTOS_WEB,''),x.h).forEach(t=>{
      let n=limpiaNombre(t.n).replace(RESTOS_WEB,'').replace(/\s*\.\s*$/,'').trim();
      if(!n||n.length<4||NO_ES_ACTO.test(n)){
        fuera.push((t.n||'?').slice(0,50)+' → no parece un acto'); return; }
      const s=sacaLugar(n); n=s.n.replace(/\s*\.\s*$/,'').trim();
      if(n.length<4){ fuera.push((t.n||'?').slice(0,50)+' → se queda en nada al limpiarlo'); return; }
      if(ACTOS.concat(nuevos).some(a=>a.f===x.f&&a.m===x.m&&norm(a.n)===norm(n))){
        fuera.push(n.slice(0,50)+' → ya estaba ese día'); return; }
      const a={f:x.f,n:n,m:x.m,c:base.corr,fr:franjaDe(t.h)};
      if(t.h) a.h=t.h;
      const lu=s.lu||x.no||null;
      if(lu) a.lu=lu;
      const q=clasificaActo(n);
      if(q) a.q=q;
      if(nombreFiesta) a.fi=nombreFiesta;
      a.of=datos.fuente||'Programa de fiestas, repasado a mano';
      nuevos.push(a);
    });
  });

  if(!nuevos.length){
    console.log('no entra ninguno.');
    fuera.forEach(x=>console.log('   · '+x));
    return;
  }
  const cabecera='/* ACTOS — los actos sueltos de un programa de fiestas.\n'+
    '   No son fiestas: cuelgan de una que ya está en EVENTOS. `q` dice a quién\n'+
    '   le sirve cada uno («ninos» / «noche»), y lo que no se sabe clasificar se\n'+
    '   queda sin `q` y no se le ofrece a nadie. Se meten con:\n'+
    '       node eventos.js actos programa.json "Nombre de las fiestas"      */\n';
  const todos=ACTOS.concat(nuevos).sort((a,b)=>a.f<b.f?-1:a.f>b.f?1:(a.h||'')<(b.h||'')?-1:1);
  fs.writeFileSync(FICHERO,cabecera+'const ACTOS='+
    JSON.stringify(todos,null,0).replace(/\},\{/g,'},\n{')+';\n');

  const cuenta={ninos:0,noche:0,sin:0};
  nuevos.forEach(a=>cuenta[a.q||'sin']++);
  console.log(nuevos.length+' actos nuevos ('+cuenta.ninos+' para niños, '+cuenta.noche+
    ' de noche, '+cuenta.sin+' sin clasificar, que no se le ofrecen a nadie):');
  nuevos.forEach(a=>console.log('   '+(a.q==='ninos'?'🧒':a.q==='noche'?'🎶':'· ')+' '+a.f+'  '+
    (a.h||'—————').padEnd(6)+a.n.slice(0,54).padEnd(56)+(a.lu||'')));
  if(ojo.length){ console.log('\nOJO, míralo tú ('+ojo.length+'):');
    ojo.forEach(x=>console.log('   ⚠ '+x)); }
  if(fuera.length){ console.log('\nfuera ('+fuera.length+'):');
    fuera.forEach(x=>console.log('   · '+x)); }
  console.log('\nEn total quedan '+todos.length+' actos. Comprueba ahora:');
  console.log('   node -e "const c=require(\'./banco.js\'); console.log(\'ok\')"');
  console.log('   node lote.js');
}

const arg=process.argv[2];
if(!arg||arg==='pegar') pagina();
else if(arg==='actos') meterActos(process.argv[3],process.argv[4]);
else meter(arg);

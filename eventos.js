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
       node eventos.js en-el-programa   lo que está en las dos tablas (lista, no borra)
       node eventos.js sitios           arma sitios-fiestas.html: dónde es cada fiesta

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
  if(datos.tipo==='sitios') return meterSitios(fichero);
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
const ACTO_NINOS=/infantil|para (los |l@s )?ni[ñn]os|familiar|para toda la familia|actividades? infantil|pinta ?caras|hinchable|colchoneta|castillo de agua|fiesta de la espuma|globoflexia|payaso|t[íi]teres|marionet|cuentacuentos|taller(es)? infantil|juegos (infantiles|tradicionales|populares)|cine (al aire libre|de verano|en la calle)|circo|cabalgata|mascota|parque acu[áa]tico|espuma|gui[ñn]ol/i;
const ACTO_NOCHE=/verbena|megaverbena|orquesta|gran baile|baile (del|de|tardeo)|tardeo|\bdj\b|concierto|drag|noche de humor|humorista|rock|festival|fuegos artificiales|fuegos del|fuegos de la|pirotecni|gala|noche de|cata de vinos|romer[íi]a|bailable|parranda/i;
/* ── Y hay palabras que no dicen para quién es: lo dice la HORA ──
   Las reglas de arriba se escribieron con 300 actos y ahora hay 648, y el
   vocabulario nuevo trae cosas que valen para los dos: un pasacalle, una
   feria, una actuación. Poner esas en una caja fija se equivoca seguro —el
   «Pasacalle La Leyenda del Pirata Moreque» es a las once de la mañana y es
   de niños; el de la comparsa Bella Mariana, a las cinco y media, también;
   una fiesta de la cerveza a las nueve de la noche, no—. Así que decide la
   hora, que es la misma regla que ya usa el motor para las franjas: **de día
   a los niños, de noche a dos adultos**.
   Ojo con lo que esto significa, porque el campo es EXCLUYENTE: lo que se
   marca `ninos` no lo ven dos adultos y al revés. Una feria de las cinco de
   la tarde deja de ofrecerse a una pareja. Por eso la lista de lo que cambia
   se enseña entera y la corrige quien vive aquí. */
const ACTO_SEGUN_HORA=/^(pasacalles?|feria (del|de la|de los|popular|de artesan|de animales)|fiesta (de la|del) (cerveza|agua|espuma|sombrero)|m[úu]sica en vivo|actuaci[óo]n (de|del)|domingo salser|actividades salseras|tenderete|[IVXL]* ?encuentro (de|anual) (habaneras|solistas|parranderos|tocadores)|zumba|sortija|yincana|gincana)/i;
const CORTE_NOCHE='18:00';
/* Y hay palabras que mandan por encima de la hora: si el acto es una misa, un
   torneo o un pleno, da igual a qué hora sea. Esto está aquí porque la primera
   versión de la regla no lo tenía y coló «Misa cantada, recorrido procesional
   y actuación del Grupo Folklórico» como acto para niños, y un «Almuerzo de
   convivencia con la actuación de…» también. El fallo era buscar «actuación»
   en cualquier parte del nombre: ahora la regla va **anclada al principio**,
   porque lo que importa es lo que el acto ES, no lo que menciona de pasada. */
const NO_ES_PARA_NADIE=/eucarist|misa|rosario|procesi|solemne|novena|triduo|salve|ofrenda|vigilia|confesion|veneraci|bendici|repique|torneo|campeonato|partido|pleno|asamblea|presentaci[óo]n del libro|entrega de (trofeos|premios)|almuerzo de convivencia/i;

function clasificaActo(n,h){
  const t=String(n||'');
  /* El orden importa, y me costó dos vueltas. El guardián va SOLO delante de
     la regla de la hora, no delante de todo: puesto arriba se llevaba por
     delante 21 actos que ya estaban bien clasificados —«Gran Baile de Fin de
     Fiestas con las orquestas Sabrosa, Guaracha… y entrega de trofeos» dejaba
     de ofrecerse por el «entrega de trofeos» del final, y una «Procesión… y
     fuegos artificiales» de las nueve de la noche también—. Las reglas
     explícitas saben lo que dicen; el guardián solo está para que la hora no
     se invente lo que no sabe. */
  if(ACTO_NINOS.test(t)) return 'ninos';
  if(ACTO_NOCHE.test(t)) return 'noche';
  if(ACTO_SEGUN_HORA.test(t) && !NO_ES_PARA_NADIE.test(t)){
    if(!h) return null;            /* sin hora no se puede decidir: se calla */
    return (h>=CORTE_NOCHE||h<'06:00') ? 'noche' : 'ninos';
  }
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
      const q=clasificaActo(n,t.h);
      if(q) a.q=q;
      /* Un fichero puede traer VARIOS programas a la vez —la agenda de una
         isla entera trae los de quince pueblos—, así que cada fila puede decir
         de qué fiestas es. Si no lo dice, manda el nombre del fichero. */
      const fi=x.fiesta||nombreFiesta;
      if(fi) a.fi=fi;
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

function reclasificar(){
  /* Las reglas de `q` van a seguir mejorando —cada programa nuevo enseña un
     caso—, y los actos ya fichados se quedarían con la clasificación vieja.
     Esto los repasa con las reglas de hoy y dice qué cambia. */
  const F='datos/actos.js';
  const txt=fs.readFileSync(F,'utf8');
  const A=eval(txt+';ACTOS');
  const cambios=[];
  A.forEach(a=>{ const antes=a.q||null, ahora=clasificaActo(a.n,a.h);
    if(antes!==ahora){ cambios.push({n:a.n,m:a.m,antes,ahora});
      if(ahora) a.q=ahora; else delete a.q; } });
  if(!cambios.length) return console.log('nada que cambiar: los '+A.length+' actos ya están con las reglas de hoy.');
  const cab=txt.slice(0,txt.indexOf('const ACTOS='));
  fs.writeFileSync(F,cab+'const ACTOS='+JSON.stringify(A,null,0).replace(/\},\{/g,'},\n{')+';\n');
  console.log(cambios.length+' actos cambian de clasificación:');
  cambios.forEach(c=>console.log('   '+String(c.antes||'—').padEnd(6)+'→ '+String(c.ahora||'—').padEnd(6)+' '+c.n.slice(0,58)));
  const q={ninos:0,noche:0,sin:0}; A.forEach(a=>q[a.q||'sin']++);
  console.log('\nQuedan: '+q.ninos+' para niños, '+q.noche+' de noche, '+q.sin+' sin clasificar.');
}

/* Actos repetidos: pasa en cuanto entran dos fuentes.
   ------------------------------------------------------------------
   El mismo acto contado por dos sitios no se llama igual: «Cine al aire libre:
   Lilo y Stitch (2025)» y «Cine al aire libre: Lilo y Stitch», «Grabación del
   programa En Otra Clave de RTVC» y «… (RTVC)». Mismo pueblo, mismo día, misma
   hora: es el mismo acto, y ofrecerlo dos veces en el mismo plan queda fatal.

   Se juntan, no se borra uno a ciegas: gana el que trae el sitio (`lu`), que es
   lo que hace útil el dato, y lo que le falte se rellena con el otro.

       node eventos.js duplicados         dice qué juntaría, sin tocar nada
       node eventos.js duplicados hazlo   lo hace                            */
function duplicados(hazlo){
  const F='datos/actos.js';
  const txt=fs.readFileSync(F,'utf8');
  const A=eval(txt+';ACTOS');
  /* mismo pueblo, mismo día, misma hora y el nombre que empieza igual: los
     dos primeros son datos duros, el tercero es lo que cambia entre fuentes */
  const clave=a=>a.m+'|'+a.f+'|'+(a.h||'');
  const cab=n=>norm(n).slice(0,24);
  const fuera=new Set(), juntados=[];
  A.forEach((a,i)=>{
    if(fuera.has(i)) return;
    A.forEach((b,j)=>{
      if(j<=i||fuera.has(j)) return;
      if(clave(a)!==clave(b)) return;
      if(cab(a.n)!==cab(b.n)) return;
      /* gana el que trae el sitio; si empatan, el nombre más largo, que dice más */
      const ganaA=(!!a.lu&&!b.lu)||(!!a.lu===!!b.lu&&a.n.length>=b.n.length);
      const g=ganaA?a:b, p=ganaA?b:a;
      Object.keys(p).forEach(k=>{ if(g[k]==null||g[k]==='') g[k]=p[k]; });
      fuera.add(ganaA?j:i);
      juntados.push({queda:g.n,cae:p.n,m:g.m,f:g.f,h:g.h||''});
    });
  });
  console.log('=== ACTOS REPETIDOS ===');
  if(!juntados.length) return console.log('ninguno: los '+A.length+' actos son distintos entre sí.');
  juntados.forEach(x=>console.log('\n· '+x.m+' · '+x.f+' '+x.h+
    '\n    queda: '+x.queda.slice(0,66)+'\n    cae:   '+x.cae.slice(0,66)));
  const limpio=A.filter((a,i)=>!fuera.has(i));
  console.log('\nactos antes: '+A.length+'  ·  se van: '+fuera.size+'  ·  quedan: '+limpio.length);
  if(!hazlo) return console.log('\n(esto era el ensayo · «node eventos.js duplicados hazlo» para hacerlo)');
  fs.writeFileSync(F,txt.slice(0,txt.indexOf('const ACTOS='))+'const ACTOS='+
    JSON.stringify(limpio,null,0).replace(/\},\{/g,'},\n{')+';\n');
  console.log('\nhecho. Pasa ahora: node lote.js');
}

/* Fiestas repetidas: la genérica sin hora y la concreta con hora.
   ------------------------------------------------------------------
   Zeben lo vio en la web: «Bajada de la Virgen del Socorro» (sin hora) y
   «Bajada del Socorro» (a las 07:00, y diciendo de dónde a dónde). Es la
   misma, contada por dos fuentes: la guía general de fiestas de los 31
   municipios puso la genérica, y la ficha buena vino después con hora y sitio.
   Manda la que tiene hora — eso lo dijo él, y tiene razón: una fiesta con hora
   es un dato, y sin hora es un titular.

   Solo se juntan las del MISMO día y mismo pueblo cuyos nombres comparten las
   palabras que importan. Las que están a uno o dos días con el mismo nombre NO
   se tocan: ahí no hay forma de saber cuál es la fecha buena, y eso lo dice
   quien vive allí.

       node eventos.js repetidas         dice qué juntaría, sin tocar nada
       node eventos.js repetidas hazlo   lo hace                            */
function repetidas(hazlo){
  const F='datos/eventos.js';
  const txt=fs.readFileSync(F,'utf8');
  const E=eval(txt+';EVENTOS');
  const pal=s=>new Set(norm(s).split(' ').filter(w=>w.length>3));
  const dias=(a,b)=>Math.round(Math.abs(new Date(a+'T12:00:00')-new Date(b+'T12:00:00'))/864e5);
  const parecidos=(a,b)=>{ const A=pal(a.n),B=pal(b.n);
    const c=[...A].filter(w=>B.has(w)).length, m=Math.min(A.size,B.size);
    return !!m&&c/m>=0.5; };

  const fuera=new Set(), juntadas=[], dudosas=[];
  E.forEach((a,i)=>E.forEach((b,j)=>{
    if(j<=i||fuera.has(i)||fuera.has(j)||a.m!==b.m||!parecidos(a,b)) return;
    if(a.f===b.f){
      /* misma fiesta el mismo día: manda la que trae hora */
      if(!!a.h===!!b.h) return;                 /* las dos con hora son dos actos */
      const g=a.h?a:b, p=a.h?b:a;
      /* Lo que falta se rellena, y en los textos gana el más largo: la ficha
         genérica traía «De las más antiguas de Canarias. Bajan la virgen desde
         San Pedro hasta la ermita de la costa» y la buena, un «En De San Pedro
         al caserío del Socorro» que ni está bien escrito. */
      const LARGO=['no','d','ma'];
      Object.keys(p).forEach(k=>{
        if(g[k]==null||g[k]==='') { g[k]=p[k]; return; }
        if(LARGO.includes(k)&&String(p[k]).length>String(g[k]).length) g[k]=p[k];
      });
      fuera.add(a.h?j:i);
      juntadas.push({m:g.m,f:g.f,h:g.h,queda:g.n,cae:p.n});
    }else if(dias(a.f,b.f)<=3&&norm(a.n)===norm(b.n)){
      /* el mismo nombre en dos fechas: no se elige solo */
      dudosas.push({m:a.m,n:a.n,f1:a.f,f2:b.f,d:dias(a.f,b.f)});
    }
  }));

  console.log('=== LA GENÉRICA Y LA QUE TRAE HORA ===');
  if(!juntadas.length) console.log('ninguna.');
  juntadas.forEach(x=>console.log('\n· '+x.m+' · '+x.f+
    '\n    queda: '+x.queda+'  ('+x.h+')'+'\n    cae:   '+x.cae+'  (sin hora)'));

  console.log('\n=== MISMO NOMBRE, DOS FECHAS · ESTO NO LO DECIDO YO ===');
  if(!dudosas.length) console.log('ninguna.');
  dudosas.forEach(x=>console.log('   ⚠ '+x.m.padEnd(24)+x.n.slice(0,40).padEnd(42)+
    x.f1+'  vs  '+x.f2+'   ('+x.d+' días)'));
  if(dudosas.length) console.log('   → una de las dos fechas está mal. Lo sabe quien vive allí.');

  console.log('\nfiestas antes: '+E.length+'  ·  se van: '+fuera.size+'  ·  quedan: '+(E.length-fuera.size));
  if(!hazlo) return console.log('\n(esto era el ensayo · «node eventos.js repetidas hazlo» para hacerlo)');
  const limpio=E.filter((e,i)=>!fuera.has(i));
  fs.writeFileSync(F,txt.slice(0,txt.indexOf('const EVENTOS='))+'const EVENTOS='+
    JSON.stringify(limpio,null,0).replace(/\},\{/g,'},\n{')+';\n');
  console.log('\nhecho: '+limpio.length+' fiestas. Pasa ahora: node lote.js');
}

/* ── LA MISMA COSA EN LAS DOS TABLAS ──────────────────────────────────
   Los Fuegos del Cristo están en EVENTOS («Fuegos del Cristo y Noche de las
   Pandorgas», 23:00) y en ACTOS («Fuegos del Risco», 23:00). Son la misma
   cosa por dos fuentes, y lo decidió Zeben: **manda la de ACTOS**, que es lo
   que pone el programa que cuelga el ayuntamiento.
   Mismo municipio, mismo día y misma hora los encuentra — el criterio de
   `duplicados`. Pero ESO NO BASTA PARA BORRAR, y por poco me lo llevo por
   delante: el mismo barrido caza «Romería de Los Abrigos» contra «Romería
   Barquera de San Blasito», que coinciden en pueblo, día y hora y pueden ser
   la misma cosa o dos actos seguidos de la misma romería — y esa fecha la
   había corregido él a mano. Así que esto CANTA Y ESPERA, como el repaso de
   fechas: se listan, y se borra la que se nombre.
       node eventos.js en-el-programa                    las lista
       node eventos.js en-el-programa "Fuegos del Cristo y Noche de las Pandorgas"
   El nombre se borra en TODOS los años que colisionen: las fiestas están
   fichadas dos veces, 2026 y 2027. */
function enElPrograma(quitar){
  const F='datos/eventos.js', txt=fs.readFileSync(F,'utf8');
  const E=eval(txt+';EVENTOS');
  const A=(()=>{ try{ return eval(fs.readFileSync('datos/actos.js','utf8')+';ACTOS'); }
                 catch(e){ return []; } })();
  if(!A.length) return console.log('no hay ACTOS cargados: nada que cruzar.');
  /* sin hora no se toca: una fiesta sin hora es un titular, no una cita, y
     puede ser justo la fiesta grande de la que cuelga el acto */
  const choques=[];
  E.forEach((e,i)=>{
    if(!e.h) return;
    const a=A.find(x=>x.m===e.m&&x.f===e.f&&x.h===e.h);
    if(a) choques.push({i,e,a});
  });
  if(!choques.length) return console.log('nada coincide en pueblo, día y hora entre EVENTOS y ACTOS.');
  const nombres=[...new Set(choques.map(x=>x.e.n))];
  if(!quitar){
    nombres.forEach(n=>{
      const suyos=choques.filter(x=>x.e.n===n);
      console.log('· '+n);
      suyos.forEach(x=>console.log('    '+x.e.f+' '+x.e.h+' '+x.e.m+
        '   ↔ ACTOS: '+x.a.n+(x.a.lu?' ('+x.a.lu+')':'')));
    });
    console.log('\n'+choques.length+' coincidencia'+(choques.length>1?'s':'')+
      ' de '+nombres.length+' fiesta'+(nombres.length>1?'s':'')+'.');
    console.log('Coincidir en pueblo, día y hora NO quiere decir que sean lo mismo:');
    console.log('puede ser un acto de esa misma fiesta. Lo dice quien vive allí.');
    console.log('Para quitar una:  node eventos.js en-el-programa "el nombre exacto"');
    return;
  }
  const fuera=new Set(choques.filter(x=>x.e.n===quitar).map(x=>x.i));
  if(!fuera.size){
    console.log('«'+quitar+'» no coincide con ningún acto. Las que sí:');
    nombres.forEach(n=>console.log('  · '+n));
    return;
  }
  choques.filter(x=>fuera.has(x.i)).forEach(x=>
    console.log('se va: '+x.e.f+' '+x.e.n+' ('+x.e.m+') — lo cuenta «'+x.a.n+'»'));
  const limpio=E.filter((e,i)=>!fuera.has(i));
  fs.writeFileSync(F,txt.slice(0,txt.indexOf('const EVENTOS='))+'const EVENTOS='+
    JSON.stringify(limpio,null,0).replace(/\},\{/g,'},\n{')+';\n');
  console.log('\nhecho: de '+E.length+' a '+limpio.length+' fiestas. Pasa ahora: node lote.js');
}

/* ── DÓNDE ES CADA FIESTA ─────────────────────────────────────────────
   Una fiesta de EVENTOS solo sabe su MUNICIPIO, así que el motor arma el día
   en el casco del pueblo. Zeben: «no es lo mismo las fiestas de La Jaca en
   Arico que la fiesta del pueblo de Arico; una es en la playa y la otra en el
   casco histórico, entonces se pueden crear cosas diferentes aunque sean en
   el mismo municipio». Con el casco para las dos, salía el mismo día.
   Sacar el sitio del nombre a la brava NO vale: probado sobre las 138, salían
   22 y una de cada cinco caía mal —«Romería de San Miguel» se iba al Castillo
   de San Miguel, que está en Aldea Blanca, y «Romería de Benijos» a un
   sendero—. Y una coordenada mala mueve el día entero. Así que la corazonada
   se enseña y la decide él, como con los miradores.
       node eventos.js sitios              arma sitios-fiestas.html
       node eventos.js sitios-fiestas.json coloca las que haya marcado
   Se colocan por NOMBRE y municipio, no por fecha: cada fiesta está fichada
   dos veces (2026 y 2027) y así se hace la mitad del trabajo. */
const LUGARES=c.LUGARES;
const GENERICO=/^(gran(des)? )?(fiestas?|romer[ií]a|bajada|subida|procesi[óo]n|verbena|feria|baile|noche|d[ií]a|exaltaci[óo]n|caminata|ofrenda|rito|arrastre|exhibici[óo]n|exposici[óo]n|concierto|pregón|pregon|festival)\b[^a-záéíóúñ]*(de |del |de la |de los |de las |a |en |al )?/i;
function corazonada(e){
  const enMuni=LUGARES.filter(l=>l.m===e.m&&l.la!=null);
  if(!enMuni.length) return null;
  const cands=[e.n.replace(GENERICO,'').trim()];
  /* «Nuestra Señora de la Luz en el Conjunto Histórico»: el sitio va detrás del «en» */
  const m=e.n.match(/\ben (el |la |los |las )?([A-ZÁÉÍÓÚÑ][^,·—]{3,})$/);
  if(m) cands.push(m[2]);
  for(const cnd of cands){
    const q=norm(cnd); if(q.length<4) continue;
    const hit=enMuni.find(l=>norm(l.n)===q)
           || enMuni.find(l=>norm(l.n).includes(q))
           || enMuni.find(l=>q.includes(norm(l.n))&&norm(l.n).length>=5);
    if(hit) return hit.n;
  }
  return null;
}
function paginaSitios(){
  const km=c.km;
  /* solo las que aún no tienen sitio: lo ya colocado no se vuelve a preguntar */
  const pend=EVENTOS.filter(e=>e.la==null);
  const vistas={}, fiestas=[];
  pend.forEach((e,i)=>{
    const k=e.m+'|'+e.n; if(vistas[k]) return; vistas[k]=1;   /* 2026 y 2027 son la misma */
    fiestas.push({id:'f'+i,n:e.n,m:e.m,f:e.f,h:e.h||null,pista:corazonada(e)});
  });
  const sitios={};
  [...new Set(fiestas.map(f=>f.m))].forEach(m=>{
    const b=Object.values(BASES).find(x=>x.m===m);
    sitios[m]=LUGARES.filter(l=>l.m===m&&l.la!=null)
      .map(l=>({n:l.n,t:(l.tipo||'sitio').toLowerCase(),
                d:(b&&b.la!=null)?+km(b.la,b.lo,l.la,l.lo).toFixed(1):0}))
      .sort((x,y)=>x.d-y.d);
  });
  const plantilla=fs.readFileSync('plantilla-sitios.html','utf8');
  const H_F='/*FIESTAS*'+'/[]', H_S='/*SITIOS*'+'/{}';
  if(plantilla.split(H_F).length!==2||plantilla.split(H_S).length!==2)
    throw new Error('la plantilla no trae los huecos');
  fs.writeFileSync('sitios-fiestas.html',
    plantilla.replace(H_F,JSON.stringify(fiestas)).replace(H_S,JSON.stringify(sitios)));
  const conPista=fiestas.filter(f=>f.pista).length;
  console.log('escrito sitios-fiestas.html');
  console.log('   '+fiestas.length+' fiestas sin sitio (de '+EVENTOS.length+' fichas: 2026 y 2027 son la misma),');
  console.log('   en '+Object.keys(sitios).length+' municipios, con '+conPista+' corazonadas por el nombre.');
  console.log('Se abre en el navegador, se colocan las que NO son en el casco y se baja:');
  console.log('   node eventos.js sitios-fiestas.json');
}
function meterSitios(fichero){
  const datos=JSON.parse(fs.readFileSync(fichero,'utf8'));
  const lista=datos.sitios||[];
  if(!lista.length) return console.log('no hay sitios marcados en '+fichero);
  const F='datos/eventos.js', txt=fs.readFileSync(F,'utf8');
  const E=eval(txt+';EVENTOS');
  let tocadas=0; const fuera=[];
  lista.forEach(x=>{
    const l=LUGARES.find(y=>y.n===x.lugar&&y.m===x.m&&y.la!=null);
    if(!l){ fuera.push(x.n+' → no encuentro «'+x.lugar+'» en '+x.m); return; }
    /* todas las fichas de esa fiesta en ese pueblo: 2026 y 2027 */
    const suyas=E.filter(e=>e.n===x.n&&e.m===x.m);
    if(!suyas.length){ fuera.push(x.n+' → ya no está en EVENTOS'); return; }
    suyas.forEach(e=>{ e.la=l.la; e.lo=l.lo; e.lu=l.n; tocadas++; });
    const b=Object.values(BASES).find(y=>y.m===x.m);
    console.log('· '+x.n+' ('+x.m+') → '+l.n+
      (b&&b.la!=null?', a '+c.km(b.la,b.lo,l.la,l.lo).toFixed(1)+' km del casco':'')+
      '   ×'+suyas.length);
  });
  if(fuera.length){ console.log('\nno entran:'); fuera.forEach(x=>console.log('  · '+x)); }
  if(!tocadas) return;
  fs.writeFileSync(F,txt.slice(0,txt.indexOf('const EVENTOS='))+'const EVENTOS='+
    JSON.stringify(E,null,0).replace(/\},\{/g,'},\n{')+';\n');
  console.log('\nhecho: '+tocadas+' fichas con sitio propio. Pasa ahora: node lote.js');
}

const arg=process.argv[2];
if(!arg||arg==='pegar') pagina();
else if(arg==='actos') meterActos(process.argv[3],process.argv[4]);
else if(arg==='reclasificar') reclasificar();
else if(arg==='duplicados') duplicados(process.argv[3]==='hazlo');
else if(arg==='repetidas') repetidas(process.argv[3]==='hazlo');
else if(arg==='en-el-programa') enElPrograma(process.argv[3]);
else if(arg==='sitios') paginaSitios();
else meter(arg);

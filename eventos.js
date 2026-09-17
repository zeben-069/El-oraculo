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
const ACTO_NINOS=/infantil|para (los |l@s )?ni[ñn]os|familiar|para toda la familia|fiesta de la familia|fiesta del agua|castillos? acu[áa]tic|actividades? infantil|pinta ?caras|hinchable|colchoneta|castillo de agua|fiesta de la espuma|globoflexia|payaso|t[íi]teres|marionet|cuentacuentos|taller(es)? infantil|juegos (infantiles|tradicionales|populares)|cine (al aire libre|de verano|en la calle)|circo|cabalgata|mascota|parque acu[áa]tico|espuma|gui[ñn]ol/i;
const ACTO_NOCHE=/verbena|megaverbena|orquesta|gran baile|baile (del|de|tardeo)|tardeo|\bdj\b|concierto|drag|noche de humor|humorista|rock|festival|fuegos artificiales|fuegos del|fuegos de la|pirotecni|gala|noche de|cata de vinos|romer[íi]a|bailable|parranda/i;
/* ── Y lo que sale a la calle lo ve el pueblo entero, niños incluidos ──
   Zeben, mirando un plan suyo de familia el 14 de septiembre: «hoy tienes los
   horarios de los fuegos; si le comentas que hay fiesta, puedes ofrecer
   después del cafelito de por la tarde recordarles que hoy a las 23:00 hay
   fuegos artificiales muy bonitos en La Laguna». Y tenía razón: ese día La
   Laguna tiene los Fuegos del Risco a las 23:00 y **una familia no los veía**,
   porque `q` es excluyente y los fuegos están marcados `noche`.
   La regla de la casa para los niños es «lee el enunciado». Pues el enunciado
   de unos fuegos dice exactamente lo que son, y en esta isla a los fuegos va
   todo el mundo con los críos en hombros. Lo mismo una romería: carretas,
   trajes y gente por la calle a mediodía — estaba marcada `noche` y por eso
   tampoco la veía una familia.
   Así que `q` gana un tercer valor, **`todos`**: pasa a los dos públicos. Es
   deliberadamente CORTO —fuegos, pirotecnia y romería— porque cada palabra que
   se meta aquí se le está ofreciendo a un niño: una misa cantada o un torneo
   de envite siguen siendo solo de los adultos. Son 26 actos de 689. */
const ACTO_DE_TODOS=/fuegos artificiales|fuegos del|fuegos de la|fuegos de |pirot[eé]cni|pirotecnia|romer[íi]a/i;
/* ── Y hay palabras que no dicen para quién es: lo dice la HORA ──
   Las reglas de arriba se escribieron con 300 actos y ahora hay 648, y el
   vocabulario nuevo trae cosas que valen para los dos: un pasacalle, una
   feria, una actuación. Poner esas en una caja fija se equivoca seguro —el
   «Pasacalle La Leyenda del Pirata Moreque» es a las once de la mañana y es
   de niños; el de la comparsa Bella Mariana, a las cinco y media, también;
   una fiesta de la cerveza a las nueve de la noche, no—. Así que decide la
   hora, que es la misma regla que ya usa el motor para las franjas: **de día
   a los niños, de noche a dos adultos**.
   ── Y esto cambió el 11 de septiembre, por orden de Zeben ──
   Antes `q` era una caja excluyente con dos lados y la hora repartía: de día a
   los niños, de noche a dos adultos. El efecto era que una feria de artesanía
   de las once dejaba de ofrecérsele a una pareja. Él lo cortó de raíz: «para
   los adultos muestra todas las fiestas, porque a lo mejor hay una procesión y
   eso le puede interesar a mucha gente; para niños lee el enunciado». Así que
   ahora `q` dice UNA sola cosa: **si el nombre dice que es para niños**. Eso, y
   solo eso, se ofrece en un plan con niños; todo lo demás —la procesión, la
   misa cantada, el torneo de dominó— va al plan de dos adultos.
   Por eso la regla de la hora ya no marca `ninos`: un pasacalle de las once no
   dice en su nombre que sea de niños, y marcarlo así lo escondía de la pareja.
   Sigue marcando `noche` porque eso describe el acto y no le quita nada a
   nadie. */
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
  /* delante de `noche` a propósito: los fuegos casan con las dos y lo que hay
     que decir de ellos es que los ve todo el pueblo, no que son de noche */
  if(ACTO_DE_TODOS.test(t)) return 'todos';
  if(ACTO_NOCHE.test(t)) return 'noche';
  if(ACTO_SEGUN_HORA.test(t) && !NO_ES_PARA_NADIE.test(t) && h && (h>=CORTE_NOCHE||h<'06:00'))
    return 'noche';
  return null;                     /* ni de niños ni de noche: va con los adultos */
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
/* Cuál de los dos se queda: EL MÁS COMPLETO.
   Lo dijo Zeben al ver la lista de los que se parecen: «quédate con los que
   más datos tengo y estén más completos, seguro que se mezcló con los que metí
   yo a mano». Así que no manda la fuente ni el orden, mandan los datos: primero
   cuántos campos trae lleno —el sitio, la hora, la fiesta de la que cuelga, la
   clasificación—, con el sitio pesando doble porque es el que hace útil al
   acto, y si empatan, el nombre más largo, que es el que cuenta más. */
function riqueza(a){
  let n=0;
  Object.keys(a).forEach(k=>{ if(a[k]!=null&&a[k]!=='') n++; });
  if(a.lu) n++;                    /* el sitio vale por dos */
  return n;
}
function ganador(a,b){
  const ra=riqueza(a), rb=riqueza(b);
  if(ra!==rb) return ra>rb;
  return String(a.n||'').length>=String(b.n||'').length;
}

function duplicados(hazlo,flojo){
  const F='datos/actos.js';
  const txt=fs.readFileSync(F,'utf8');
  const A=eval(txt+';ACTOS');
  /* mismo pueblo, mismo día, misma hora y el nombre que empieza igual: los
     dos primeros son datos duros, el tercero es lo que cambia entre fuentes.
     Ojo con el tercero, que se quedaba corto: comparaba los 24 primeros
     caracteres EXACTOS, así que «Diana floreada» y «Diana floreada por las
     calles» —el mismo pasacalle contado por dos fuentes, mismo pueblo, mismo
     día y misma hora— no casaban, porque uno tiene 13 caracteres y el otro 22.
     Salió a la vista al agrupar el calendario por sitio: los dos aparecían
     seguidos bajo «Los Abrigos» a las nueve de la mañana. Ahora lo que vale es
     que uno EMPIECE por el otro, con doce caracteres de mínimo para que un
     nombre corto no se coma a otro. Coincidir en pueblo, día y hora ya es una
     atadura fuerte; aun así esto **lista y espera**, como siempre.

     Y la de los 24 primeros caracteres a secas SE FUE, que daba por buena una
     cabecera compartida sin mirar lo que venía detrás. En Benijos el 14 de
     septiembre hay DOS exhibiciones de fuegos a las seis —«de Pirotécnica
     Tanausú, patrocinada por los vecinos de la zona» y «…patrocinada por la
     comisión de fiestas»—, y sus veinticuatro primeros caracteres son
     «Exhibición de fuegos arti»: puro encabezado. La regla se comía una de las
     dos SOLA, sin preguntar. Medido sobre los 792 actos antes de quitarla:
     cazaba **una sola pareja en todo el catálogo y era justo esa**, y todo lo
     de verdad lo caza la de prefijo —las dos reglas no coincidían ni una vez—.
     El caso para el que se escribió, «Diana floreada» contra «Diana floreada
     por las calles», lo cubre la de prefijo entera.
     Lo que comparten cabecera y luego se separan no se pierde: cae en la lista
     de los que SE PARECEN, que es donde ya vivían las dos ferias de Los
     Realejos, y ahí lo mira alguien. Es la regla de la casa: mismo pueblo,
     mismo día y misma hora NO quiere decir que sean lo mismo. */
  const clave=a=>a.m+'|'+a.f+'|'+(a.h||'');
  const MIN=12;
  const mismoNombre=(x,y)=>{
    const a=norm(x), b=norm(y);
    const [c,l]=a.length<=b.length?[a,b]:[b,a];
    return c.length>=MIN&&l.indexOf(c)===0;
  };
  /* Y con `flojo`, además, los que solo SE PARECEN: mismo pueblo, mismo día,
     misma hora y el nombre compartiendo casi todas las palabras. Esto estuvo
     un tiempo solo listando, porque la regla de la casa dice que coincidir en
     pueblo, día y hora no quiere decir que sean lo mismo. Lo abrió Zeben:
     «si son los mismos eventos quédate con el más completo, seguro que se
     mezcló con los que metí yo a mano». Sigue exigiendo HORA: sin ella, dos
     actos del mismo día no tienen nada que los ate. */
  /* Y «parecerse» no es compartir palabras: es que UNO ESTÉ DENTRO DEL OTRO.
     Con el porcentaje a secas se juntaban «Feria de Artesanía, hasta las
     18:00» y «Feria del Motor, hasta las 18:00» —dos ferias distintas a la
     misma hora—, porque de tres palabras compartían dos y el 67% pasaba. Son
     justo el caso que avisa la regla de la casa: mismo pueblo, mismo día y
     misma hora no quiere decir que sean lo mismo.
     Exigiendo que todas las palabras de uno estén en el otro, esa pareja se
     cae —«artesanía» no está en el otro y «motor» tampoco— y siguen entrando
     las de verdad: «Gran Baile con Nueva Ilusión» está entero dentro de «Gran
     Baile con el grupo Nueva Ilusión». Se paga un precio: «Subida de Ntra.
     Sra. de Abona» no entra en «Subida de Nuestra Señora de Abona», porque la
     abreviatura es otra palabra. Esa se queda en la lista para mirarla. */
  const unoDentroDelOtro=(x,y)=>{
    const px=palabrasDe(x), py=palabrasDe(y);
    const [c,g]=px.size<=py.size?[px,py]:[py,px];
    if(c.size<2) return false;
    let dentro=true; c.forEach(w=>{ if(!g.has(w)) dentro=false; });
    return dentro;
  };
  const fuera=new Set(), juntados=[];
  A.forEach((a,i)=>{
    if(fuera.has(i)) return;
    A.forEach((b,j)=>{
      if(j<=i||fuera.has(j)) return;
      if(clave(a)!==clave(b)) return;
      let como='empieza igual';
      if(!mismoNombre(a.n,b.n)){
        if(!flojo||!a.h||!unoDentroDelOtro(a.n,b.n)) return;
        como='se parecen';
      }
      const ganaA=ganador(a,b);
      const g=ganaA?a:b, p=ganaA?b:a;
      Object.keys(p).forEach(k=>{ if(g[k]==null||g[k]==='') g[k]=p[k]; });
      /* El nombre que se queda es el del ganador, así que la clasificación
         tiene que volver a salir de ÉL: rellenar campos vacíos podía haberle
         pegado el `q` del que cae, que se sacó de otro nombre. */
      const q=clasificaActo(g.n,g.h);
      if(q) g.q=q; else delete g.q;
      fuera.add(ganaA?j:i);
      juntados.push({queda:g.n,cae:p.n,m:g.m,f:g.f,h:g.h||'',como:como});
    });
  });
  console.log('=== ACTOS REPETIDOS ==='+(flojo?'  (también los que se parecen)':''));
  /* Aunque no se junte ninguno hay que enseñar los que SE PARECEN: si no, el
     día que el catálogo esté limpio de repetidos exactos, las parejas dudosas
     desaparecían del informe sin que nadie las hubiera mirado. */
  if(!juntados.length){
    console.log('ninguno: los '+A.length+' actos son distintos entre sí.');
    return sospechosos(A);
  }
  juntados.forEach(x=>console.log('\n· '+x.m+' · '+x.f+' '+x.h+'   ['+x.como+']'+
    '\n    queda: '+x.queda.slice(0,74)+'\n    cae:   '+x.cae.slice(0,74)));
  const limpio=A.filter((a,i)=>!fuera.has(i));
  console.log('\nactos antes: '+A.length+'  ·  se van: '+fuera.size+'  ·  quedan: '+limpio.length);
  sospechosos(limpio);
  if(!hazlo) return console.log('\n(esto era el ensayo · «node eventos.js '+
    (flojo?'parecidos':'duplicados')+' hazlo» para hacerlo)');
  fs.writeFileSync(F,txt.slice(0,txt.indexOf('const ACTOS='))+'const ACTOS='+
    JSON.stringify(limpio,null,0).replace(/\},\{/g,'},\n{')+';\n');
  console.log('\nhecho. Pasa ahora: node lote.js');
}

/* ── Y las que quedan, se resuelven marcando el fichero ──
   `actos-parecidos.md` sale con una casilla en cada acto de cada pareja. Las
   que la regla no sabe separar —«Misa en honor a la Virgen del Rosario y
   procesión…» contra «Santa Misa en honor a la Virgen del Rosario, cantada por
   el Grupo La Diata, y procesión…»— las mira quien vive allí, marca la que
   sobra con una equis y esto la quita:

       node eventos.js parecidos actos-parecidos.md

   Se busca por NOMBRE exacto, no por número de línea: así el fichero se puede
   reordenar o recortar y sigue valiendo. Lo que no se encuentre se canta, que
   una marca que no hace nada es peor que ninguna. */
function quitarMarcados(fichero){
  const F='datos/actos.js';
  const txt=fs.readFileSync(F,'utf8');
  const A=eval(txt+';ACTOS');
  const md=fs.readFileSync(fichero,'utf8');
  /* «  - [x] Nombre del acto  · _sitio_» — el sitio va detrás del · y no
     forma parte del nombre. Y se lee con el DÍA Y EL PUEBLO de la cabecera
     «## 2026-09-12 · Los Realejos» encima: por el nombre a secas no vale, que
     «Santa misa y procesión» está tres veces en el fichero y quitar «las dos
     primeras que aparezcan» habría borrado la de otro día. */
  /* Y la TERCERA casilla de cada pareja —«son dos actos distintos»— no quita
     nada: apunta `repe_visto` en los DOS para que esa pareja no se vuelva a
     preguntar. Se sabe cuáles son porque van justo encima, bajo el mismo
     `- \`HH:MM\`` de la pareja; por eso se lleva la cuenta de los dos últimos
     nombres leídos y un bullet de hora los reinicia. */
  const marcados=[], distintas=[]; let dia=null, muni=null, ult=[];
  md.split('\n').forEach(l=>{
    const cab=l.match(/^##\s*(\d{4}-\d{2}-\d{2})\s*·\s*(.+?)\s*$/);
    if(cab){ dia=cab[1]; muni=cab[2]; ult=[]; return; }
    if(/^\s*-\s*`/.test(l)){ ult=[]; return; }
    const linea=l.match(/^\s*-\s*\[([ xX])\]\s*(.+)$/);
    if(!linea) return;
    const puesta=linea[1].toLowerCase()==='x';
    const txt=linea[2].split(/\s+·\s+_/)[0].trim();
    if(/^\*\*son dos actos distintos\*\*/.test(txt)){
      if(puesta&&ult.length===2) distintas.push({m:muni,f:dia,n:ult.slice()});
      return;
    }
    ult.push(txt); if(ult.length>2) ult.shift();
    if(puesta) marcados.push({n:txt, f:dia, m:muni});
  });
  if(!marcados.length&&!distintas.length) return console.log('no hay ninguna casilla marcada en '+fichero+
    '.\nMarca con una equis —[x]— el acto que sobra de cada pareja, o la\n'+
    'tercera casilla si son dos actos distintos de verdad.');
  const fuera=new Set(), sinEncontrar=[];
  marcados.forEach(x=>{
    const i=A.findIndex((a,k)=>!fuera.has(k)&&a.n===x.n&&
      (!x.f||a.f===x.f)&&(!x.m||a.m===x.m));
    if(i<0) sinEncontrar.push(x.n); else fuera.add(i);
  });
  console.log('=== MARCADOS EN '+fichero+' ===');
  marcados.forEach(x=>console.log('   '+(sinEncontrar.indexOf(x.n)<0?'fuera: ':'NO ESTÁ: ')+
    (x.f||'?')+' · '+x.n.slice(0,62)));
  if(sinEncontrar.length) console.log('\nOjo: '+sinEncontrar.length+
    ' no se encontraron por su nombre. Puede que ya se hubieran quitado.');
  if(distintas.length){
    let n=0;
    distintas.forEach(d=>d.n.forEach(nom=>{
      const a=A.find(x=>x.n===nom&&x.f===d.f&&x.m===d.m);
      if(a&&!a.repe_visto){ a.repe_visto=1; n++; }
    }));
    console.log('\n=== YA MIRADAS, SON DOS DISTINTAS · '+distintas.length+
      (distintas.length===1?' pareja':' parejas')+' ===');
    distintas.forEach(d=>console.log('   · '+d.f+' · '+d.m+'\n       '+
      d.n[0].slice(0,62)+'\n       '+d.n[1].slice(0,62)));
    console.log('\nmarcadas: '+n+' actos con repe_visto. No se vuelven a preguntar.');
  }
  const limpio=A.filter((a,i)=>!fuera.has(i));
  console.log('\nactos antes: '+A.length+'  ·  se van: '+fuera.size+'  ·  quedan: '+limpio.length);
  fs.writeFileSync(F,txt.slice(0,txt.indexOf('const ACTOS='))+'const ACTOS='+
    JSON.stringify(limpio,null,0).replace(/\},\{/g,'},\n{')+';\n');
  console.log('hecho. Pasa ahora: node lote.js');
}

/* ── Y los que se PARECEN, que esos no se tocan ──
   El de arriba junta cuando está seguro: un nombre que empieza por el otro.
   Pero dos fuentes cuentan el mismo acto con palabras distintas —«Gran Baile
   con Nueva Ilusión» y «Gran Baile con el grupo Nueva Ilusión», «Procesión
   diurna…» y «Procesión diurna desde la iglesia hasta el muelle…»— y ahí ya no
   hay manera de saberlo desde aquí. La regla de la casa lo dice bien claro:
   coincidir en pueblo, día y hora NO quiere decir que sean lo mismo; pueden ser
   dos actos seguidos de la misma romería. Así que esto **solo los enseña** —ni
   con `hazlo` los toca— y decide quien vive allí. */
function sospechosos(A){
  const clave=a=>a.m+'|'+a.f+'|'+(a.h||'');
  const palabras=palabrasDe;
  const pares=[];
  A.forEach((a,i)=>A.forEach((b,j)=>{
    if(j<=i||clave(a)!==clave(b)||!a.h) return;
    const x=palabras(a.n), y=palabras(b.n);
    if(x.size<2||y.size<2) return;
    let comun=0; x.forEach(w=>{ if(y.has(w)) comun++; });
    const parecido=comun/Math.min(x.size,y.size);
    /* Y si LOS DOS llevan `repe_visto`, la pareja ya se miró y son distintos:
       no se vuelve a preguntar. Hace falta porque esta lista se escribe entera
       en cada pasada, así que una pareja legítima —las dos ferias de Los
       Realejos del 26, que son de verdad dos— volvía a salir como pregunta
       abierta cada vez que entraba un artefacto nuevo. Preguntar dos veces lo
       ya contestado es hacerle perder el tiempo a quien vive allí, que es la
       misma lección que dejaron los municipios del Cabildo.
       Se exigen LOS DOS a propósito: si mañana entra un acto nuevo que choca
       con uno ya visto, esa pareja es otra y tiene que salir. */
    if(a.repe_visto&&b.repe_visto) return;
    if(parecido>=0.6) pares.push({a,b,parecido});
  }));
  if(!pares.length) return;
  console.log('\n=== Y ESTOS SE PARECEN · míralos tú, aquí no se tocan ===');
  console.log('Mismo pueblo, mismo día y misma hora, y el nombre se parece.');
  console.log('Pueden ser el mismo acto contado por dos fuentes, o dos actos');
  console.log('seguidos de la misma fiesta. Si sobra uno, se quita a mano.');
  pares.sort((p,q)=>String(p.a.f+p.a.h).localeCompare(String(q.a.f+q.a.h)));
  /* Se recorta a 70 para que quepa, PERO si los dos cortes salen iguales no
     se recorta: dos líneas idénticas en pantalla no dejan elegir cuál sobra, y
     esa es la única razón por la que esta lista existe. Pasa cuando lo que los
     separa va al final —los dos fuegos de Benijos solo se distinguen en quién
     los paga, y eso está en el carácter noventa—. */
  const corta=(a,b)=>a.slice(0,70)===b.slice(0,70)?[a,b]:[a.slice(0,70),b.slice(0,70)];
  pares.slice(0,12).forEach(x=>{
    const [na,nb]=corta(x.a.n,x.b.n);
    console.log('\n· '+x.a.m+' · '+x.a.f+' '+x.a.h+'   ('+Math.round(x.parecido*100)+'% de palabras en común)'+
      '\n    '+na+'\n    '+nb);});
  console.log('\nson '+pares.length+(pares.length===1?' pareja.':' parejas.'));
  /* Y en un fichero, que doce en pantalla no son setenta y cinco y esto lo
     tiene que mirar alguien con calma. Es el mismo camino de
     `actos-reclasificados.md`: la lista se le pasa y él dice cuál sobra. */
  const porDia={};
  pares.forEach(x=>{ const k=x.a.f+' · '+x.a.m; (porDia[k]=porDia[k]||[]).push(x); });
  let md='# Actos que se parecen\n\n'+
    'Mismo pueblo, mismo día y misma hora, y el nombre comparte casi todas las\n'+
    'palabras. Casi seguro es **el mismo acto contado por dos fuentes** —el\n'+
    'programa que pegaste a mano y el artefacto de Cowork—, pero también pueden\n'+
    'ser **dos actos seguidos de la misma fiesta**, y eso desde aquí no se sabe.\n'+
    'Por eso no se ha tocado ninguno.\n\n'+
    'Marca el que sobre de cada pareja y se quita. Y si son **dos actos\n'+
    'distintos de verdad**, marca la tercera casilla y no se vuelve a\n'+
    'preguntar por esa pareja.\n\n'+
    'Son **'+pares.length+(pares.length===1?' pareja**.\n':' parejas**.\n');
  Object.keys(porDia).sort().forEach(k=>{
    md+='\n## '+k+'\n';
    porDia[k].forEach(x=>{ md+='\n- `'+(x.a.h||'')+'`  ('+Math.round(x.parecido*100)+'%)\n'+
      '  - [ ] '+x.a.n+(x.a.lu?'  · _'+x.a.lu+'_':'')+'\n'+
      '  - [ ] '+x.b.n+(x.b.lu?'  · _'+x.b.lu+'_':'')+'\n'+
      '  - [ ] **son dos actos distintos** · no preguntar más\n'; });
  });
  fs.writeFileSync('actos-parecidos.md',md);
  console.log('\nla lista entera está en actos-parecidos.md');
}
const palabrasDe=n=>new Set(norm2(n).split(' ').filter(w=>w.length>3));
const norm2=n=>String(n).normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  .toLowerCase().replace(/[^a-z0-9ñ ]/g,' ').replace(/\s+/g,' ').trim();

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

/* ── LOS QUE SE ESCAPABAN POR LA HORA ───────────────────────────────────
   Zeben, probándolo: «rígete 100% a lo que dice el artefacto sobre el sitio,
   porque tienes dos que no ponen sitio y en el artefacto sí lo pone».
   Medido: de los 571 actos hay **22 sin sitio y los 22 vienen de la agenda
   semanal pegada a mano**; los 389 del artefacto traen sitio el 100%. O sea
   que él tiene razón en el fondo: donde falta el dato es porque entró por la
   otra puerta.
   Y había un punto ciego que lo tapaba: `duplicados()` y `sospechosos()`
   comparan con la clave `pueblo|día|HORA`, y **la hora es justo en lo que las
   dos fuentes no coinciden** — la Cabalgata de La Orotava es «21:00» en la
   agenda y «20:00» en el artefacto, la Fiesta del agua «19:30» y «11:00». Al
   exigirla, los repetidos que de verdad importan eran invisibles.
   Esta pasada quita la hora de la clave, y para no abrir la puerta a juntar
   dos actos legítimos del mismo día pone tres ataduras en su lugar:
   · **Fuentes distintas.** Dentro de un mismo programa repetir es normal —hay
     tres domingos de feria infantil— y dos misas el mismo día en el mismo
     pueblo son dos misas. Esto solo mira agenda-contra-artefacto.
   · **Un nombre entero dentro del otro**, la misma regla de `parecidos`, no un
     porcentaje: «Feria de Artesanía» y «Feria del Motor» comparten dos de tres
     palabras y son dos ferias.
   · **Tres palabras de mínimo**, una más que `parecidos`, porque sin la hora
     la atadura es más floja y «Santa misa» no puede bastar.
   Y gana el del artefacto por la regla de siempre —`ganador()` cuenta el sitio
   doble—, así que **la hora que queda es la suya**, que es lo que él pidió. */
function cruzadas(hazlo){
  const F='datos/actos.js';
  const txt=fs.readFileSync(F,'utf8');
  const A=eval(txt+';ACTOS');
  /* «La otra fuente» no es solo el artefacto: hay TRES puertas y dos traen
     sitio —el artefacto y los programas recogidos de lagenda—. La que no lo
     trae es una sola, la agenda semanal pegada a mano, así que la regla se
     escribe por ahí: agenda contra cualquier otra. Escribirlo al revés dejaba
     fuera la Fiesta del agua de La Orotava, cuyo gemelo bueno viene de los
     programas y no del artefacto. */
  const deAgenda=a=>/agenda semanal/i.test(a.of||'');
  const dentro=(x,y)=>{
    const a1=norm(x), b1=norm(y);
    const [corto,largo]=a1.length<=b1.length?[a1,b1]:[b1,a1];
    /* Un nombre que es PREFIJO exacto del otro con doce caracteres ya es la
       atadura fuerte de `duplicados` —«Cabalgata de las Fiestas» dentro de
       «Cabalgata de las Fiestas con Reinas y Damas…»—, y ahí no hacen falta
       tres palabras: un pueblo no hace dos cabalgatas el mismo día. */
    if(corto.length>=12&&largo.indexOf(corto)===0) return true;
    const px=palabrasDe(x), py=palabrasDe(y);
    const [c,g]=px.size<=py.size?[px,py]:[py,px];
    if(c.size<3) return false;
    let ok=true; c.forEach(w=>{ if(!g.has(w)) ok=false; });
    return ok;
  };
  const fuera=new Set(), juntados=[];
  A.forEach((a,i)=>{
    if(fuera.has(i)) return;
    A.forEach((b,j)=>{
      if(j<=i||fuera.has(j)) return;
      if(a.m!==b.m||a.f!==b.f) return;
      if(a.h&&b.h&&a.h===b.h) return;        /* esos ya los coge `parecidos` */
      if(deAgenda(a)===deAgenda(b)) return;   /* una de agenda y otra no */
      if(!dentro(a.n,b.n)) return;
      const ganaA=ganador(a,b);
      const g=ganaA?a:b, p=ganaA?b:a;
      Object.keys(p).forEach(k=>{ if(g[k]==null||g[k]==='') g[k]=p[k]; });
      const q=clasificaActo(g.n,g.h);
      if(q) g.q=q; else delete g.q;
      fuera.add(ganaA?j:i);
      juntados.push({queda:g,cae:p});
    });
  });
  console.log('=== EL MISMO ACTO POR DOS FUENTES, CON HORAS DISTINTAS ===');
  if(!juntados.length) return console.log('ninguno.');
  juntados.forEach(x=>console.log('\n· '+x.queda.m+' · '+x.queda.f+
    '\n    queda: '+(x.queda.h||'--')+'  '+x.queda.n.slice(0,68)+
    '\n           → '+(x.queda.lu||'(sin sitio)')+
    '\n    cae:   '+(x.cae.h||'--')+'  '+x.cae.n.slice(0,68)));
  const limpio=A.filter((a,i)=>!fuera.has(i));
  console.log('\nactos antes: '+A.length+'  ·  se van: '+fuera.size+'  ·  quedan: '+limpio.length);
  if(!hazlo) return console.log('\nesto es un ensayo. «node eventos.js cruzadas hazlo» para hacerlo.');
  fs.writeFileSync(F,txt.slice(0,txt.indexOf('const ACTOS='))+'const ACTOS='+
    JSON.stringify(limpio,null,0).replace(/\},\{/g,'},\n{')+';\n');
  console.log('hecho. Pasa ahora: node lote.js');
}

/* ── EL ARTEFACTO MANDA EN EL SITIO ─────────────────────────────────────
   Zeben: «rígete 100% a lo que dice el artefacto sobre el sitio, porque tienes
   dos que no ponen sitio y en el artefacto sí lo pone», y mandó el enlace.
   Tenía razón y mi primera respuesta estaba mal: busqué el gemelo **dentro de
   nuestros propios actos** —o sea, una fila repetida— y no dentro del artefacto.
   Abierto el artefacto, sus **538 actos traen sitio el 100%** y los 19 que
   nosotros teníamos mudos están ahí, con el suyo. El «Desfile de la Pandorga y
   los Caballitos de Fuego» es «Casco histórico de La Laguna», tal cual él decía.
   Lo que pasó: esos 19 entraron por la agenda semanal, y cuando llegó el
   artefacto el cortafuegos de repetidos los vio con el mismo nombre y se quedó
   con el que ya estaba — que era el que NO trae sitio.

       node eventos.js artefacto artefacto.html          ensayo
       node eventos.js artefacto artefacto.html hazlo    lo mete

   Tres reglas, y la tercera es la que costó:
   · **Se emparejan por municipio y día**, y dentro por nombre: igual, o con el
     80% de las palabras del más corto dentro del otro. El municipio se compara
     sin acentos ni artículos y quitando «Villa de», que el artefacto escribe
     «Villa de Arico» y nosotros «Arico».
   · **Si no tenemos sitio, se coge el suyo.** Sin discusión: es el dato que
     falta y él lo tiene.
   · **Y si los dos tienen sitio, gana EL QUE AFINA AL OTRO.** Medido sobre los
     568: 40 no coinciden, pero **32 son solo el municipio pegado detrás** —«El
     Tablado» contra «El Tablado, Güímar»—, que no es una discrepancia. De los 8
     que quedan, en 3 el nuestro es más fino —«Plaza de Los Abrigos» contra «Los
     Abrigos, Granadilla de Abona»— y en 2 lo es el suyo —«Playa de El Tablado»
     contra «El Tablado»—. Coger el del artefacto a ciegas habría EMPEORADO
     tres. Así que: quitado el municipio, si uno contiene al otro gana el que
     contiene; si no se parecen en nada, se deja el nuestro y se canta.
   Ojo con el corredor: en `BASES` el campo se llama **`corr`**, no `c`. Aquí
   ponía `b.c`, así que TODOS los actos que entraron por el artefacto se
   guardaron con `c:null` —122 de ellos—. Hoy no lo lee nadie (la cercanía de
   un acto se mide en kilómetros, no por corredor), pero era un campo mudo
   esperando a que alguien se fiara de él. */
function delArtefacto(fichero,hazlo){
  const F='datos/actos.js';
  const txt=fs.readFileSync(F,'utf8');
  const A=eval(txt+';ACTOS');
  const html=fs.readFileSync(fichero,'utf8');
  const i=html.indexOf('const EV = ['), j=html.indexOf('\n];',i);
  if(i<0||j<0) return console.log('en '+fichero+' no está el «const EV = [» del artefacto.');
  const EV=eval(html.slice(i+11,j+2));
  const muni=m=>norm(m).replace(/^(villa de|ciudad de|san cristobal de )/,'').replace(/^(la|el|los|las) /,'').trim();
  const pal=s=>new Set(norm(s).split(' ').filter(w=>w.length>3));
  const casa=(a,e)=>{
    if(muni(a.m)!==muni(e.m)||a.f!==e.d) return false;
    if(norm(a.n)===norm(e.t)) return true;
    const pa=pal(a.n), pb=pal(e.t);
    const [ch,g]=pa.size<=pb.size?[pa,pb]:[pb,pa];
    if(ch.size<2) return false;
    let n=0; ch.forEach(w=>{ if(g.has(w)) n++; });
    return n/ch.size>=0.8;
  };
  /* el sitio del artefacto sin el municipio de detrás, para poder comparar */
  const pelado=(p,m)=>norm(p).replace(new RegExp('[ ,]+'+muni(m)+'$'),'')
    .replace(/[ ,]+(de abona|del norte|de la rambla|de chasna|de tenerife|de isora)$/,'').trim();

  const puestos=[], cambiados=[], dudosos=[];
  A.forEach(a=>{
    const e=EV.find(x=>casa(a,x)); if(!e||!e.p) return;
    if(!a.lu||!String(a.lu).trim()){ a.lu=e.p; puestos.push({a,e}); return; }
    const mio=norm(a.lu), suyo=pelado(e.p,e.m);
    if(mio===suyo||mio.indexOf(suyo)>=0) return;      /* el nuestro afina: se queda */
    if(norm(e.p).indexOf(mio)>=0){ const antes=a.lu; a.lu=e.p; cambiados.push({a,antes,e}); return; }
    dudosos.push({a,e});
  });
  /* Y los que el artefacto tiene y nosotros no */
  const nuevos=EV.filter(e=>!A.some(a=>casa(a,e))).map(e=>{
    const b=Object.values(BASES).find(x=>muni(x.m)===muni(e.m));
    const o={f:e.d,n:e.t,m:(b&&b.m)||e.m,c:(b&&b.corr)||null,fr:franjaDe(e.h),
      h:e.h||'',lu:e.p,fi:e.f,of:'Artefacto «Fiestas de Tenerife» de Cowork · lagenda.org'};
    const q=clasificaActo(o.n,o.h); if(q) o.q=q;
    if(!o.h) delete o.h;
    return o;
  });

  console.log('=== EL SITIO, SEGÚN EL ARTEFACTO ===');
  console.log('\nactos del artefacto: '+EV.length+'  ·  de los nuestros: '+A.length);
  console.log('\nSITIO QUE FALTABA, puesto: '+puestos.length);
  puestos.forEach(x=>console.log('   · '+x.a.f+' '+(x.a.h||'--')+'  '+x.a.n.slice(0,44)+'  →  '+x.a.lu));
  console.log('\nSITIO AFINADO por el artefacto: '+cambiados.length);
  cambiados.forEach(x=>console.log('   · '+x.a.n.slice(0,44)+'\n       '+x.antes+'  →  '+x.a.lu));
  console.log('\nNO CUADRAN, y se deja el nuestro: '+dudosos.length);
  dudosos.forEach(x=>console.log('   · '+x.a.f+' '+x.a.n.slice(0,42)+
    '\n       nuestro:   '+x.a.lu+'\n       artefacto: '+x.e.p));
  console.log('\nACTOS QUE NO TENÍAMOS: '+nuevos.length);
  nuevos.forEach(o=>console.log('   · '+o.f+' '+(o.h||'--')+'  '+o.m+' · '+o.n.slice(0,46)+'  →  '+o.lu));
  /* Y el aviso que faltaba, que costó tres gemelos.
     ------------------------------------------------------------------
     El emparejado de arriba es por NOMBRE (el 80% de las palabras del más
     corto). El artefacto reescribe los actos entre una versión y la
     siguiente —«Solemne eucaristía y ceremonia del Descendimiento» pasó a
     «Solemne celebración eucarística y ceremonia del Descendimiento»—, y
     con eso baja del 80% y entra como acto nuevo: el mismo acto, dos veces,
     el mismo día y a la misma hora. Pasó con tres en la pasada del 13 de
     septiembre y se colaron enteros al catálogo.
     Aquí NO se decide nada —dos actos seguidos de la misma fiesta también
     comparten pueblo, día y hora, que es la regla de la casa de siempre—:
     se cantan y se manda a `parecidos`, que es quien escribe la lista con
     sus casillas para que la mire quien vive allí. */
  const gemelos=[];
  nuevos.forEach(o=>{ if(!o.h) return;
    A.forEach(a=>{ if(a.m!==o.m||a.f!==o.f||a.h!==o.h) return;
      const x=palabrasDe(a.n), y=palabrasDe(o.n);
      if(x.size<2||y.size<2) return;
      let c=0; x.forEach(w=>{ if(y.has(w)) c++; });
      const parecido=c/Math.min(x.size,y.size);
      if(parecido>=0.6) gemelos.push({a,o,parecido});
    });
  });
  console.log('\nOJO · DE LOS QUE ENTRAN, CAEN ENCIMA DE UNO NUESTRO: '+gemelos.length+
    (gemelos.length?'   (mismo pueblo, día y hora, y el nombre se parece)':''));
  gemelos.forEach(x=>console.log('   · '+x.o.f+' '+x.o.h+'  '+x.o.m+'   ('+Math.round(x.parecido*100)+'%)'+
    '\n       nuestro:   '+x.a.n.slice(0,66)+'\n       artefacto: '+x.o.n.slice(0,66)));
  const total=A.concat(nuevos);
  console.log('\nactos antes: '+A.length+'  ·  entran: '+nuevos.length+'  ·  quedan: '+total.length);
  if(!hazlo) return console.log('\nesto es un ensayo. «node eventos.js artefacto '+fichero+' hazlo» para hacerlo.');
  total.sort((a,b)=>a.f<b.f?-1:a.f>b.f?1:(a.h||'')<(b.h||'')?-1:1);
  fs.writeFileSync(F,txt.slice(0,txt.indexOf('const ACTOS='))+'const ACTOS='+
    JSON.stringify(total,null,0).replace(/\},\{/g,'},\n{')+';\n');
  console.log('hecho. Pasa ahora: node eventos.js parecidos  ·  y luego node lote.js');
}


/* ===== EL MISMO PROGRAMA CON DOS RÓTULOS ==============================
   El campo `fi` es cómo se llama la fiesta de la que cuelga el acto, y cada
   fuente lo escribe a su manera: la agenda pone «De la Luz», el artefacto
   «De la Luz (Los Silos)» y un programa pegado a mano «Fiestas de Nuestra
   Señora de La Luz». Los tres son la misma fiesta del mismo pueblo.

   Eso no era invisible: la cabecera del día **solo nombra la fiesta si TODOS
   los actos del pueblo son de la misma** —regla que existe porque en La Laguna
   coinciden el Cristo y San Mateo de Punta del Hidalgo, y decir una como si
   fuera todo es contar mal—. Con el rótulo partido, un día entero de la misma
   fiesta parecía tener dos y la cabecera se callaba el nombre. Medido sobre el
   calendario cargado: **12 días-pueblo de 176** se quedaban sin decir de qué
   fiesta eran, teniéndolo.

   Cómo se junta, y lo que NO hace:
   · **Solo dentro del mismo municipio.** «De la Luz» está en Los Silos, en La
     Orotava y en Tacoronte, y son tres fiestas distintas de tres pueblos.
   · **Y solo si uno CONTIENE al otro** una vez quitado el paréntesis del
     municipio y el «Fiestas de / Nuestra Señora de» de delante. Es la misma
     atadura de `parecidos` y por la misma razón: compartir palabras no basta
     —«De la Luz» y «De los Dolores» comparten dos—.
   · **Gana el que dice más, PERO sin el paréntesis del municipio**, que ese lo
     pusimos nosotros para desambiguar y en pantalla sobra — el porqué está
     abajo, junto al código que lo hace. Lo demás del nombre no se toca.
   · No toca ningún otro campo, y sin `hazlo` no escribe nada. */
function rotulos(hazlo){
  const F='datos/actos.js';
  const A=eval(fs.readFileSync(F,'utf8')+';ACTOS');
  const pela=s=>norm(String(s||'').replace(/\s*\([^)]*\)\s*/g,' '))
    .replace(/^fiestas? (de |del )?/,'').replace(/^(de |del |de la |de los |de las )/,'')
    .replace(/^(nuestra senora de |ntra sra de |santisimo |santisima |san |santa )/,'')
    .replace(/\s+/g,' ').trim();
  const porMuni={};
  A.forEach(a=>{ if(!a.fi) return; (porMuni[a.m]=porMuni[a.m]||new Set()).add(a.fi); });
  const cambios=[];
  Object.keys(porMuni).forEach(m=>{
    const fis=[...porMuni[m]];
    const usado=new Set();
    fis.forEach((x,i)=>fis.forEach((y,j)=>{
      if(j<=i||usado.has(x)||usado.has(y)) return;
      const px=pela(x), py=pela(y);
      if(!px||!py) return;
      const [c,l]=px.length<=py.length?[px,py]:[py,px];
      if(c.length<4||l.indexOf(c)!==0) return;          /* uno dentro del otro */
      /* Y el que gana es el más completo SIN el paréntesis del municipio, que
         ese lo pusimos nosotros para desambiguar y en pantalla sobra: `fi`
         siempre se enseña debajo del pueblo —`actosPorPueblo()` agrupa por `m`
         y el informe manda `de_las_fiestas` junto al municipio—, así que «De la
         Luz (Los Silos)» dice dos veces lo mismo. Lo que NO se toca es el resto
         del nombre: «Fiestas de El Tablado» y «El Tablado» se quedan como los
         publica quien los publica, y gana el que dice más. Reescribir el nombre
         de una fiesta es justo lo que esta casa no hace. */
      const sinMuni=t=>String(t).replace(new RegExp('\\s*\\(\\s*'+
        m.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\s*\\)\\s*','i'),'').trim();
      const cx=sinMuni(x), cy=sinMuni(y);
      const gana=cx.length>=cy.length?cx:cy, pierde=gana===x?y:x;
      usado.add(pierde);
      cambios.push({m:m,gana:gana,pierde:pierde,
        cuantos:A.filter(a=>a.m===m&&a.fi===pierde).length});
    }));
  });
  if(!cambios.length){ console.log('ningún programa con dos rótulos.'); return; }
  console.log('\n=== EL MISMO PROGRAMA CON DOS RÓTULOS ===');
  cambios.forEach(c=>console.log('   · '+c.m+'\n       queda: '+c.gana+
    '\n       se une: '+c.pierde+'   ('+c.cuantos+' actos)'));
  const n=cambios.reduce((s,c)=>s+c.cuantos,0);
  console.log('\nactos que cambian de rótulo: '+n+'  ·  programas: '+
    (new Set(A.filter(a=>a.fi).map(a=>a.m+'|'+a.fi)).size)+' → '+
    (new Set(A.filter(a=>a.fi).map(a=>a.m+'|'+a.fi)).size-cambios.length));
  if(!hazlo){ console.log('\nesto era el ensayo · «node eventos.js rotulos hazlo» para hacerlo'); return; }
  cambios.forEach(c=>A.forEach(a=>{ if(a.m===c.m&&a.fi===c.pierde) a.fi=c.gana; }));
  fs.writeFileSync(F,'const ACTOS='+
    JSON.stringify(A,null,0).replace(/\},\{/g,'},\n{')+';\n');
  console.log('hecho. Pasa ahora: node lote.js');
}

const arg=process.argv[2];
if(!arg||arg==='pegar') pagina();
else if(arg==='actos') meterActos(process.argv[3],process.argv[4]);
else if(arg==='reclasificar') reclasificar();
else if(arg==='duplicados') duplicados(process.argv[3]==='hazlo',false);
else if(arg==='parecidos'){
  const x=process.argv[3];
  if(x&&x!=='hazlo') quitarMarcados(x); else duplicados(x==='hazlo',true);
}
else if(arg==='artefacto') delArtefacto(process.argv[3],process.argv[4]==='hazlo');
else if(arg==='cruzadas') cruzadas(process.argv[3]==='hazlo');
else if(arg==='rotulos') rotulos(process.argv[3]==='hazlo');
else if(arg==='repetidas') repetidas(process.argv[3]==='hazlo');
else if(arg==='en-el-programa') enElPrograma(process.argv[3]);
else if(arg==='sitios') paginaSitios();
else meter(arg);

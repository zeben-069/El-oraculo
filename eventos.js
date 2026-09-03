/* eventos.js — el puente entre «lo que hay esta semana» y EVENTOS.
   ------------------------------------------------------------------
   Zeben tiene un aviso semanal que le llega con la agenda cultural de la
   isla. Esa información ya existe; lo que faltaba era meterla en Naira sin
   tener que escribir código. Desde aquí no puedo ir a buscarla —la red del
   contenedor está cerrada— pero da igual: la parte difícil (encontrarla) ya
   está hecha, y la fácil (pasarla a fichas) es esto.

       node eventos.js pegar            arma pegar-eventos.html
       node eventos.js fiestas.json     mete las que vengan marcadas

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
  console.log('se corrige lo que haga falta y se baja: node eventos.js fiestas.json');
}

function meter(fichero){
  const datos=JSON.parse(fs.readFileSync(fichero,'utf8'));
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
    const rep=EVENTOS.find(e=>norm(e.n)===norm(x.n)&&e.f===x.f);
    if(rep){ fuera.push(x.n+' → ya estaba ese día'); return; }
    const cerca=EVENTOS.find(e=>norm(e.n)===norm(x.n)&&dias(e.f,x.f)<=14);
    if(cerca){ fuera.push(x.n+' → ya está fichada el '+cerca.f+' ('+dias(cerca.f,x.f)+
      ' días). Decide cuál es la buena y corrige esa, no metas otra.'); return; }

    const f={f:x.f, n:x.n, m:x.m, c:base.corr, fr:franjaDe(x.h)};
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

const arg=process.argv[2];
if(!arg||arg==='pegar') pagina();
else meter(arg);

/* guaguas.js — le pone a cada ficha su parada de guagua más cercana.

   POR QUÉ EXISTE, Y POR QUÉ TARDE. El fichero de paradas del Cabildo
   —3.872 paradas con `latitud` y `longitud`— ya se había usado una vez, para
   calcular el campo `bus` de los sitios que había entonces. Lo que no se hizo
   fue **guardar el camino**: aquí quedó escrito que «las paradas de TITSA solo
   se guardaron como nombre y metros desde cada ficha, no como coordenadas», y
   con eso por delante, cada ficha nueva que entraba —los 63 miradores del
   artefacto, los caseríos, los 76 restaurantes del registro— se quedaba **sin
   `bus`**. Eran 102 sitios y 117 restaurantes, y sin `bus` el motor no sabe
   ofrecérselos a quien va en guagua.

   La lección: **una importación que no deja herramienta se pudre**. El dato
   estaba, el cálculo era una resta de distancias, y aun así el catálogo se fue
   llenando de huecos porque nadie podía repetirlo sin volver a empezar.

       node guaguas.js          ensayo: dice a cuántas fichas les falta
       node guaguas.js meter    se lo escribe a las que no lo tienen
       node guaguas.js lineas /ruta/al/gtfs          ensayo de las líneas
       node guaguas.js lineas /ruta/al/gtfs meter    las escribe

   LAS LÍNEAS QUE PARAN AHÍ, que es lo que faltaba para que un plan sin coche
   hablara de guaguas de verdad. Zeben: «pongo en guagua y no se habla para
   nada de las guaguas». Llevaba razón a medias y la mitad que tenía razón es
   la que importa: el plan SÍ decía la parada —«la tienen al lado, se llama
   MENCEY BENCOMO»— pero **no decía qué coger**, que es lo único que de verdad
   hace falta para moverse. Un nombre de parada sin línea no te lleva a ningún
   sitio.
   El dato estaba en casa desde el 12 de septiembre y sin usar: el GTFS de
   TITSA cruza `stop_times` con `trips` y `routes` y da, para cada una de sus
   3.896 paradas, **qué líneas paran ahí**. Son 1.333.553 pasos leídos.
   El cruce se hace **por NOMBRE de parada**, no por la más cercana: el nombre
   es el que ya está escrito en la ficha y el que el turista va a leer en el
   poste. Buscando la más cercana cuadraban 618 de 640 y las 22 restantes se
   habrían llevado las líneas **de otra parada** —la ficha de Benijo dice
   «BENIJO» y la del GTFS más cercana es «ALMÁCIGA», a 1,1 km—. Y eso es
   justo lo que esta casa no hace: antes ninguna línea que una equivocada.

   Nunca pisa un `bus` que ya esté puesto: los que hay salieron del mismo
   fichero y unos cuantos vienen de fusionar fichas repetidas, donde se guardó
   a propósito la parada más cercana de todo el grupo.
*/
const fs=require('fs'), path=require('path');
const RAIZ=__dirname;
const CSV=process.env.PARADAS_CSV
  || path.join(process.env.HOME||'/root','.claude/uploads/d12fe7d2-3cd7-56f7-b5e5-acbcdf312218/c9c733fa-paradasdeguagua.csv');

function leerCSV(txt){
  if(txt.charCodeAt(0)===0xFEFF) txt=txt.slice(1);
  return txt.split('\n').slice(1).map(l=>l.trim()).filter(Boolean).map(l=>{
    const f=l.split(',');
    return {id:f[0], n:f[1], la:+f[2], lo:+f[3]};
  }).filter(p=>p.n && !isNaN(p.la) && !isNaN(p.lo));
}

const c=require(path.join(RAIZ,'banco.js'));
const km=(a,b,x,y)=>{const R=6371,t=Math.PI/180;const dl=(x-a)*t,dg=(y-b)*t;
  const h=Math.sin(dl/2)**2+Math.cos(a*t)*Math.cos(x*t)*Math.sin(dg/2)**2;
  return 2*R*Math.asin(Math.sqrt(h));};

/* ── LAS LÍNEAS DE CADA PARADA, DESDE EL GTFS ────────────────────────── */
function leeGtfs(G){
  const lee=f=>fs.readFileSync(path.join(G,f),'utf8').replace(/^\uFEFF/,'').trim().split('\n');
  const col=l=>l.split(',');
  const sl=lee('stops.txt'), sh=col(sl[0]);
  const iId=sh.indexOf('stop_id'), iNo=sh.indexOf('stop_name');
  const STOP={};
  sl.slice(1).forEach(l=>{const c=col(l); if(c.length>iNo) STOP[c[iId]]={n:c[iNo],lineas:new Set()};});
  const rl=lee('routes.txt'), rh=col(rl[0]);
  const rId=rh.indexOf('route_id'), rSn=rh.indexOf('route_short_name');
  const ROUTE={}; rl.slice(1).forEach(l=>{const c=col(l); if(c.length>rSn) ROUTE[c[rId]]=c[rSn];});
  const tl=lee('trips.txt'), th=col(tl[0]);
  const tR=th.indexOf('route_id'), tT=th.indexOf('trip_id');
  const TRIP={}; tl.slice(1).forEach(l=>{const c=col(l); if(c.length>tT) TRIP[c[tT]]=ROUTE[c[tR]];});
  const stl=lee('stop_times.txt'), sth=col(stl[0]);
  const sT=sth.indexOf('trip_id'), sS=sth.indexOf('stop_id');
  let pasos=0;
  stl.slice(1).forEach(l=>{const c=col(l); if(c.length<=Math.max(sT,sS))return;
    const li=TRIP[c[sT]], st=STOP[c[sS]];
    if(li&&st){ st.lineas.add(li); pasos++; }});
  return {STOP,pasos,rutas:Object.keys(ROUTE).length};
}
const norm=t=>String(t||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  .toUpperCase().replace(/[^A-Z0-9]/g,'');
/* Las líneas se ordenan como números cuando lo son: «5, 14, 101» y no
   «101, 14, 5», que es lo que sale ordenando texto. */
const ordenLineas=(a,b)=>{const x=parseInt(a,10),y=parseInt(b,10);
  return (isNaN(x)||isNaN(y))?String(a).localeCompare(String(b)):x-y;};

function lineas(){
  const G=process.argv[3];
  if(!G||!fs.existsSync(path.join(G,'stops.txt'))){
    console.log('Pásame la carpeta del GTFS descomprimido:\n'+
      '  node guaguas.js lineas /ruta/al/gtfs [meter]');
    process.exit(1);
  }
  const {STOP,pasos,rutas}=leeGtfs(G);
  console.log('GTFS: '+Object.keys(STOP).length+' paradas · '+rutas+' líneas · '+
    pasos.toLocaleString('es')+' pasos leídos\n');
  /* Una misma parada puede estar varias veces en el GTFS (los dos sentidos
     llevan su propio `stop_id`), así que las líneas de un nombre son la UNIÓN
     de todas las que lo llevan: al turista le da igual el poste, quiere saber
     qué pasa por ahí. */
  const porNombre={};
  Object.values(STOP).forEach(s=>{
    const k=norm(s.n); if(!k) return;
    (porNombre[k]=porNombre[k]||new Set());
    s.lineas.forEach(x=>porNombre[k].add(x));
  });
  const faltan=[]; let yaTienen=0, sinCasar=[];
  [['Sitios',c.LUGARES],['Restaurantes',c.REST]].forEach(([que,lista])=>{
    lista.forEach(l=>{
      if(!l.bus_parada) return;
      if(l.bus_lineas){ yaTienen++; return; }
      const set=porNombre[norm(l.bus_parada)];
      if(!set||!set.size){ sinCasar.push(que+' · '+l.n+' ('+l.bus_parada+')'); return; }
      faltan.push({que,n:l.n,lineas:[...set].sort(ordenLineas)});
    });
  });
  console.log('Fichas a las que se les puede poner la línea: '+faltan.length);
  console.log('  ya la tenían: '+yaTienen);
  console.log('  su parada no aparece con ese nombre en el GTFS: '+sinCasar.length);
  sinCasar.slice(0,8).forEach(x=>console.log('     '+x));
  const cuantas=faltan.map(f=>f.lineas.length).sort((a,b)=>a-b);
  if(cuantas.length) console.log('  líneas por parada: mediana '+cuantas[Math.floor(cuantas.length/2)]+
    ' · máx '+cuantas[cuantas.length-1]);
  console.log('\nejemplos:');
  faltan.slice(0,6).forEach(f=>console.log('   '+f.n.slice(0,36).padEnd(37)+f.lineas.slice(0,8).join(', ')));
  if(process.argv[4]!=='meter'){
    console.log('\n(ensayo — «node guaguas.js lineas '+G+' meter» las escribe)'); return;
  }
  meterLineas(faltan);
}

function meterLineas(faltan){
  const F={Sitios:path.join(RAIZ,'datos','lugares.js'), Restaurantes:path.join(RAIZ,'datos','restaurantes.js')};
  const txt={}; Object.entries(F).forEach(([k,v])=>txt[k]=fs.readFileSync(v,'utf8'));
  let puestas=0, perdidas=[];
  faltan.forEach(f=>{
    const t=txt[f.que];
    const esc=f.n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    const re=new RegExp('(\\{[^{}]*?["\']?n["\']?:\\s*["\']'+esc+'["\'][^{}]*?)\\}');
    const m=t.match(re);
    if(!m){ perdidas.push(f.que+' · '+f.n); return; }
    if(/\bbus_lineas\s*:/.test(m[1])) return;
    txt[f.que]=t.replace(re, m[1]+',bus_lineas:'+JSON.stringify(f.lineas)+'}');
    puestas++;
  });
  Object.entries(F).forEach(([k,v])=>fs.writeFileSync(v,txt[k]));
  console.log('\nEscritas '+puestas+' listas de líneas.');
  if(perdidas.length){
    console.log('No se encontró la ficha de '+perdidas.length+':');
    perdidas.slice(0,10).forEach(x=>console.log('   '+x));
  }
}

function main(){
  if(process.argv[2]==='lineas') return lineas();
  if(!fs.existsSync(CSV)){
    console.log('No encuentro las paradas:\n  '+CSV+
      '\nPásalas por PARADAS_CSV=/ruta/al.csv node guaguas.js');
    process.exit(1);
  }
  const P=leerCSV(fs.readFileSync(CSV,'utf8'));
  console.log('Paradas de guagua con coordenada: '+P.length+'\n');

  const masCerca=(la,lo)=>{
    let mejor=null, d=1e9;
    for(const p of P){ const x=km(la,lo,p.la,p.lo); if(x<d){ d=x; mejor=p; } }
    return {parada:mejor, metros:Math.round(d*1000)};
  };

  /* Primero, comprobar que el método da lo mismo que lo que ya está fichado:
     si no cuadra, es que la fuente cambió y no se puede seguir. */
  const conBus=c.LUGARES.filter(l=>l.bus!=null&&l.la!=null);
  let cuadran=0;
  conBus.forEach(l=>{ if(Math.abs(masCerca(l.la,l.lo).metros-l.bus)<=30) cuadran++; });
  console.log('Comprobación: de '+conBus.length+' sitios que YA tienen parada, '+
    cuadran+' dan el mismo número recalculando ('+Math.round(cuadran*100/conBus.length)+'%).');
  console.log('Los que no, casi todos salen de fusionar fichas repetidas, que se quedó');
  console.log('con la parada más cercana de todo el grupo. No se tocan.\n');

  const faltan=[];
  const barrer=(lista,que)=>{
    const sin=lista.filter(x=>x.bus==null&&x.la!=null);
    sin.forEach(x=>{
      const r=masCerca(x.la,x.lo);
      faltan.push({que, n:x.n, bus:r.metros, parada:r.parada.n});
    });
    const sinPos=lista.filter(x=>x.la==null).length;
    console.log(que+': '+sin.length+' sin parada'+(sinPos?' (y '+sinPos+' sin coordenada, que no se pueden medir)':''));
  };
  barrer(c.LUGARES,'Sitios');
  barrer(c.REST,'Restaurantes');

  const lejos=faltan.filter(f=>f.bus>1500);
  console.log('\nDe los '+faltan.length+', '+lejos.length+' quedan a más de 1,5 km de la parada.');
  console.log('Eso no es un fallo: son senderos y paisajes de monte. El informe lo dice');
  console.log('en `guagua_mas_cercana` y quien va sin coche lo ve antes de ir.\n');
  faltan.slice(0,10).forEach(f=>console.log('  '+f.que.slice(0,4)+' · '+f.n.slice(0,38).padEnd(38)+' '+String(f.bus).padStart(5)+' m  '+f.parada));
  if(faltan.length>10) console.log('  … y '+(faltan.length-10)+' más');

  if(process.argv[2]!=='meter'){ console.log('\n(ensayo — no se ha tocado nada; «node guaguas.js meter» las escribe)'); return; }
  meter(faltan);
}

/* Se escribe ficha a ficha buscando su nombre en el fichero, que es como
   trabajan las otras herramientas de aquí: los datos son literales de
   JavaScript escritos a mano y reescribir el fichero entero perdería los
   comentarios y el orden. */
function meter(faltan){
  const F={Sitios:path.join(RAIZ,'datos','lugares.js'), Restaurantes:path.join(RAIZ,'datos','restaurantes.js')};
  const txt={}; Object.entries(F).forEach(([k,v])=>txt[k]=fs.readFileSync(v,'utf8'));
  let puestas=0, perdidas=[];
  faltan.forEach(f=>{
    let t=txt[f.que];
    /* el nombre puede venir con comillas dobles o simples según de qué
       importación salió la ficha */
    const esc=f.n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    /* La clave puede ir entrecomillada o no según de qué importación salió la
       ficha: los datos viejos son JSON («"n":"…"») y los nuevos literales de
       JavaScript («n:"…"»). Sin contemplar las dos, esto encontraba 76 de 215
       y se callaba las otras 139. */
    const re=new RegExp('(\\{[^{}]*?["\']?n["\']?:\\s*["\']'+esc+'["\'][^{}]*?)\\}');
    const m=t.match(re);
    if(!m){ perdidas.push(f.que+' · '+f.n); return; }
    if(/\bbus\s*:/.test(m[1])){ return; }
    txt[f.que]=t.replace(re, m[1]+',bus:'+f.bus+',bus_parada:'+JSON.stringify(f.parada)+'}');
    puestas++;
  });
  Object.entries(F).forEach(([k,v])=>fs.writeFileSync(v,txt[k]));
  console.log('\nEscritas '+puestas+' paradas.');
  if(perdidas.length){
    console.log('No se encontró la ficha de '+perdidas.length+' (el nombre no casa en el fichero):');
    perdidas.slice(0,10).forEach(x=>console.log('   '+x));
  }
}

main();

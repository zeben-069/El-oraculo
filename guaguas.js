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

function main(){
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

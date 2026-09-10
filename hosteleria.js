/* hosteleria.js — mete en REST lo que falta, sacándolo del registro de
   establecimientos del Cabildo.

   POR QUÉ EXISTE. El catálogo de restaurantes son 318 fichas escritas a mano,
   con su horario, su nota y su valoración. Está bien donde hay, pero tenía
   cuatro agujeros grandes —Granadilla, San Miguel, Adeje y Arona no tenían NI
   UNO a menos de dos kilómetros de su casco— y eso salía en los planes como la
   bandera COMIDA-LEJOS. Llegamos a escribir en CLAUDE.md que San Miguel «no
   tiene ni un restaurante fichado en todo el término», que era verdad del
   catálogo y mentira de la isla: el registro trae 120 sitios de comer allí.

   Y LA TRAMPA QUE COSTÓ EL AGUJERO. Hay DOS ficheros del registro y no son lo
   mismo. El de «establecimientos» (13.678 filas) trae la calle y no el punto,
   y de ahí salieron las 43 fichas con `pos_aprox` que ya están dentro. El de
   «locales de hostelería» (9.652 filas) trae `latitud` y `longitud` de verdad,
   y teléfono. Ese segundo es el que llena los agujeros y el que lee esto.

   QUÉ NO HACE. No vuelca las 4.159 fichas de comer que trae: eso sería
   cambiar un catálogo escrito a mano por un listín. Rellena SOLO donde falta,
   medido contra los puntos donde el motor arma el día —los 31 cascos y el
   sitio de cada fiesta— y hasta un mínimo, no más.

   Y NO SE INVENTA EL HORARIO. El registro dice que el sitio tiene licencia,
   no a qué hora abre. Así que la ficha entra con el mismo aparejo que ya
   usaban las del otro registro: `h` diciendo que el horario no está
   confirmado, el teléfono delante y `ojo` explicándolo. El motor las ordena
   detrás solas, sin tocarle nada: manda `nota_g` y estas no tienen, así que
   solo salen donde no hay una ficha buena cerca, que es justo para lo que se
   meten.

       node hosteleria.js          ensayo: dice qué entraría y dónde
       node hosteleria.js meter    lo escribe en datos/restaurantes.js
*/
const fs=require('fs'), path=require('path');
const RAIZ=__dirname;
const CSV=process.env.REGISTRO_CSV
  || path.join(process.env.HOME||'/root','.claude/uploads/d12fe7d2-3cd7-56f7-b5e5-acbcdf312218/ce5be659-localesdehosteleriayrestauracionentenerife.csv');

/* ── el csv viene con BOM y con comillas ── */
function leerCSV(txt){
  if(txt.charCodeAt(0)===0xFEFF) txt=txt.slice(1);
  const filas=[]; let campo='', fila=[], q=false;
  for(let i=0;i<txt.length;i++){
    const ch=txt[i];
    if(q){ if(ch==='"'){ if(txt[i+1]==='"'){campo+='"';i++;} else q=false; } else campo+=ch; }
    else if(ch==='"') q=true;
    else if(ch===','){ fila.push(campo); campo=''; }
    else if(ch==='\n'){ fila.push(campo); filas.push(fila); fila=[]; campo=''; }
    else if(ch!=='\r') campo+=ch;
  }
  if(campo.length||fila.length){ fila.push(campo); filas.push(fila); }
  const cab=filas.shift().map(s=>s.trim());
  return filas.filter(f=>f.length>1).map(f=>{const o={};cab.forEach((k,i)=>o[k]=(f[i]||'').trim());return o;});
}

const c=require(path.join(RAIZ,'banco.js'));
const {REST,BASES,LUGARES,EVENTOS}=c;
const km=(a,b,x,y)=>{const R=6371,t=Math.PI/180;const dl=(x-a)*t,dg=(y-b)*t;
  const h=Math.sin(dl/2)**2+Math.cos(a*t)*Math.cos(x*t)*Math.sin(dg/2)**2;
  return 2*R*Math.asin(Math.sqrt(h));};
const norm=s=>(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]/g,'');

/* ── el municipio del registro no se escribe como el nuestro ──
   Vienen «San Miguel», «Güimar», «La Laguna», «La Matanza». Se comparan sin
   acentos ni artículos contra los 31 que ya existen, que es lo que funcionó
   con el registro de hostelería y con el padrón. */
const desnudo=s=>norm(s).replace(/^(la|el|los|las)/,'');
const MUNIS=Object.values(BASES);
function muniDe(nombre){
  const d=desnudo(nombre);
  let m=MUNIS.find(b=>desnudo(b.m)===d);
  if(m) return m;
  m=MUNIS.find(b=>desnudo(b.m).startsWith(d)||d.startsWith(desnudo(b.m)));
  return m||null;
}

/* ── el corredor sale del vecino fichado, no del municipio ──
   La misma razón que con los miradores: Santa Cruz es «Metropolitana» y hay
   fichas suyas que a efectos de tiempos de viaje son Anaga. */
const conPos=REST.filter(r=>r.la!=null).concat(LUGARES.filter(l=>l.la!=null));
function corredorDe(la,lo){
  let mejor=null,dm=1e9;
  conPos.forEach(r=>{const d=km(la,lo,r.la,r.lo); if(d<dm){dm=d;mejor=r;}});
  return mejor?mejor.c:null;
}

/* ── de la actividad del registro a nuestro tipo ──
   El registro clasifica por licencia; nosotros por lo que se come. Lo que no
   se sepa traducir se queda en «Restaurante», que no afirma nada. */
const TIPOS=[
  [/guachinche/,'Guachinche'],
  [/tasca/,'Tasca'],
  [/meson/,'Mesón'],
  [/pizzeria/,'Pizzería'],
  [/bodega/,'Bodega'],
  [/asador|parrilla/,'Parrilla'],
  [/marisqueria/,'Marisco'],
  [/arepera/,'Venezolana'],
  [/hamburgues/,'Hamburguesas'],
];
const tipoDe=a=>{for(const[re,t]of TIPOS) if(re.test(a)) return t; return 'Restaurante';};

/* El teléfono viene de una hoja de cálculo y llega como número: «922770745.0».
   Se le quita la cola y se parte como los que ya están escritos a mano. */
function telDe(t){
  const d=String(t||'').replace(/\.0+$/,'').replace(/\D/g,'');
  if(d.length!==9) return null;
  return d.slice(0,3)+' '+d.slice(3,5)+' '+d.slice(5,7)+' '+d.slice(7);
}

const COMER=/restaurante|guachinche|tasca|meson|pizzeria|bodega|asador|marisqueria|arepera/;
const OBJETIVO=4;    /* cuántos sitios de comer se quiere ver junto a un punto */
const CERCA=2;       /* «junto a» son dos kilómetros: se va andando o casi */
const ALCANCE=3;     /* de dónde se puede traer lo que falta */

function main(){
  if(!fs.existsSync(CSV)){
    console.log('No encuentro el registro:\n  '+CSV+
      '\nPásalo por REGISTRO_CSV=/ruta/al.csv node hosteleria.js');
    process.exit(1);
  }
  const crudo=leerCSV(fs.readFileSync(CSV,'utf8'));
  const reg=crudo.filter(r=>COMER.test(r.actividad_tipo)&&r.latitud&&r.longitud
      && +r.latitud>27.9 && +r.latitud<28.65 && +r.longitud<-16.0 && +r.longitud>-16.95)
    .map(r=>({
      n:r.nombre.trim(), act:r.actividad_tipo, mu:r.municipio_nombre,
      la:+r.latitud, lo:+r.longitud, tel:telDe(r.telefono), web:r.web||null,
      dir:[r.tipo_via_descripcion,r.direccion_nombre_via,r.direccion_numero].filter(Boolean).join(' ').trim(),
      cuando:(r.fecha_actualizacion||r.fecha_creacion||'').slice(0,4)
    }));
  console.log('Registro con coordenadas: '+crudo.length+' locales, '+reg.length+' de comer.\n');

  /* ── los puntos donde el motor arma el día ──
     Los 31 cascos y el sitio de cada fiesta. Los sitios de fiesta importan
     tanto como los cascos: la Romería de Los Abrigos acaba en el muelle, a
     nueve kilómetros del casco de Granadilla. */
  const puntos=[];
  MUNIS.forEach(b=>puntos.push({q:'el casco de '+b.m, m:b.m, la:b.la, lo:b.lo}));
  const yaPunto=new Set();
  (EVENTOS||[]).forEach(e=>{
    if(e.la==null) return;
    const k=e.la.toFixed(3)+','+e.lo.toFixed(3);
    if(yaPunto.has(k)) return; yaPunto.add(k);
    puntos.push({q:e.n+' ('+e.m+')', m:e.m, la:e.la, lo:e.lo, fiesta:true});
  });

  const deComer=r=>r.la!=null && !r.remate && !/Helad|Dulcer/i.test(r.tipo||'');
  const nombresYa=new Set(REST.map(r=>norm(r.n)));
  const puestos=REST.filter(deComer);
  const elegidos=new Map();   /* clave → ficha, para no meter dos veces lo mismo */
  const porPunto=[];

  puntos.forEach(p=>{
    const tiene=puestos.filter(r=>km(p.la,p.lo,r.la,r.lo)<CERCA).length;
    if(tiene>=OBJETIVO) return;
    const faltan=OBJETIVO-tiene;
    const cand=reg.map(r=>({r,d:km(p.la,p.lo,r.la,r.lo)}))
      .filter(x=>x.d<ALCANCE)
      .filter(x=>!nombresYa.has(norm(x.r.n)))
      /* y tampoco si hay uno ya fichado en la misma esquina: mismo sitio
         escrito de otra manera. 60 metros es la puerta de al lado. */
      .filter(x=>!puestos.some(r=>km(r.la,r.lo,x.r.la,x.r.lo)<0.06))
      .sort((a,b)=>a.d-b.d);
    const metidos=[];
    for(const x of cand){
      if(metidos.length>=faltan) break;
      const k=norm(x.r.n)+'|'+x.r.la.toFixed(4)+','+x.r.lo.toFixed(4);
      if(!elegidos.has(k)) elegidos.set(k,x.r);
      metidos.push(x);
    }
    porPunto.push({p,tiene,metidos});
  });

  /* ── y no dos veces el mismo local con dos licencias ──
     Pasa de verdad: «Sarras», «Tasca La Zurrapa» y «Tasquita El Pimentón»
     están en Arico a veinte metros y comparten el 922 76 84 86, o sea que son
     la misma casa con tres licencias. El teléfono lo delata mejor que el
     nombre. Y un nombre que es solo el genérico —hay una ficha que se llama
     «Restaurante» a secas— no vale para nada: no se puede decir «coman en
     Restaurante». */
  const fichas=[]; const usados=[];
  const GENERICO=/^(restaurante|bar|cafeteria|cafetería|tasca|guachinche|pizzeria|pizzería|bodega|meson|mesón|kiosco|quiosco)$/i;
  [...elegidos.values()].forEach(r=>{
    if(GENERICO.test(r.n.trim())) return;
    if(usados.some(u=>norm(u.n)===norm(r.n)&&km(u.la,u.lo,r.la,r.lo)<0.3)) return;
    if(r.tel&&usados.some(u=>u.tel===r.tel&&km(u.la,u.lo,r.la,r.lo)<0.3)) return;
    usados.push(r);
    const b=muniDe(r.mu);
    const f={ n:r.n, m:b?b.m:r.mu, co:b?b.m:r.mu, c:corredorDe(r.la,r.lo)||(b?b.corr:null),
      tipo:tipoDe(r.act),
      /* No se afirma que abra: el registro no lo dice. */
      ab:[1,1,1,1,1,1,1],
      h:'Horario sin confirmar: llamen antes',
      la:+r.la.toFixed(5), lo:+r.lo.toFixed(5),
      ojo:'Del registro de locales del Cabildo: la dirección es '+(r.dir||'la que consta')+
          '. Horario sin confirmar'+(r.tel?'; llamen antes de ir':'')+'.',
      reg:'Sí', of:'Registro de locales de hostelería · Cabildo de Tenerife' };
    if(r.tel) f.tel=r.tel;
    if(r.web) f.web=r.web;
    fichas.push(f);
  });

  console.log('Puntos que se quedaban cortos: '+porPunto.length+' de '+puntos.length+'\n');
  porPunto.filter(x=>x.metidos.length).forEach(x=>{
    console.log('· '+x.p.q+(x.p.fiesta?'  [fiesta]':'')+
      ' — tenía '+x.tiene+' a menos de '+CERCA+' km');
    x.metidos.forEach(m=>console.log('    '+m.d.toFixed(2)+' km  '+m.r.n+
      '  ('+tipoDe(m.r.act)+(m.r.tel?', '+telDe(m.r.tel)||'':'')+')'));
  });
  const vacios=porPunto.filter(x=>!x.metidos.length);
  if(vacios.length) console.log('\nSe quedan cortos y el registro tampoco tiene nada a '+
    ALCANCE+' km: '+vacios.map(x=>x.p.q).join(', '));

  console.log('\nEntrarían '+fichas.length+' fichas nuevas.');
  const porMuni={}; fichas.forEach(f=>porMuni[f.m]=(porMuni[f.m]||0)+1);
  console.log(Object.entries(porMuni).sort((a,b)=>b[1]-a[1]).map(([k,v])=>k+' '+v).join(' · '));

  if(process.argv[2]!=='meter'){ console.log('\n(ensayo — no se ha tocado nada; «node hosteleria.js meter» las escribe)'); return; }
  meter(fichas);
}

function meter(fichas){
  const F=path.join(RAIZ,'datos','restaurantes.js');
  let txt=fs.readFileSync(F,'utf8');
  const fin=txt.lastIndexOf('];');
  if(fin<0){ console.log('No encuentro el final de REST en datos/restaurantes.js'); process.exit(1); }
  const linea=f=>'{'+Object.entries(f).map(([k,v])=>
     k+':'+(typeof v==='string'?JSON.stringify(v):Array.isArray(v)?'['+v.join(',')+']':v)).join(',')+'}';
  const bloque=',\n/* ── Del registro de locales de hostelería del Cabildo ──\n'+
    '   Rellenan los sitios donde el catálogo escrito a mano no llegaba: cascos\n'+
    '   y sitios de fiesta que se quedaban sin donde comer al lado. Traen punto\n'+
    '   y teléfono, pero NO horario: por eso `h` dice que se llame antes y el\n'+
    '   motor las ordena detrás solas, que no tienen valoración.\n'+
    '   Se meten con `node hosteleria.js meter`. */\n'+
    fichas.map(f=>linea(f)).join(',\n')+'\n';
  txt=txt.slice(0,fin)+bloque+txt.slice(fin);
  fs.writeFileSync(F,txt);
  console.log('\nEscritas '+fichas.length+' fichas en datos/restaurantes.js');
}

main();

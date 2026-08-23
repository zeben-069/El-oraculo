const c=require('./banco.js');
const {construir,S,km,BASES,LUGARES,REST}=c;
const casos=[
 ['Tegueste',true,false,'pareja',null],       ['Tegueste',false,true,'familia','agua'],
 ['Santa Cruz de Tenerife',true,false,'pareja',null], ['Santa Cruz de Tenerife',false,true,'familia',null],
 ['San Cristóbal de La Laguna',true,false,'pareja','cultura'],
 ['Adeje',true,true,'familia','agua'],        ['Adeje',false,false,'pareja',null],
 ['Arona',true,false,'grupo','agua'],         ['Puerto de la Cruz',false,true,'familia',null],
 ['Puerto de la Cruz',true,false,'pareja','naturaleza'],
 ['La Orotava',true,false,'pareja',null],     ['Garachico',true,true,'familia',null],
 ['Buenavista del Norte',true,false,'pareja','naturaleza'],
 ['Vilaflor de Chasna',true,false,'pareja',null], ['Candelaria',true,true,'familia',null],
 ['Güímar',true,false,'pareja',null],         ['Arico',true,false,'pareja',null],
 ['Icod de los Vinos',false,false,'pareja',null], ['Los Realejos',true,true,'familia','agua'],
 ['El Rosario',true,false,'pareja',null],     ['Tacoronte',true,false,'pareja',null],
 ['Santiago del Teide',true,false,'pareja','naturaleza'],
 ['Granadilla de Abona',true,false,'pareja',null], ['El Sauzal',false,false,'pareja',null],
];
const R=[];
/* La app guarda en S.gente el NÚMERO de personas (2, 4 o 6), no la etiqueta:
   así lo hace pGente() y así lo compara el aviso de aforo de los permisos. */
const CUANTOS={pareja:2,familia:4,grupo:6};
casos.forEach(([base,coche,ninos,gente,apetece])=>{
  Object.assign(S,{base,coche,ninos,gente:CUANTOS[gente],apetece,anclaElegida:null,comida:null,ahora:null,
    saltoComida:0,descartados:null,prefTipo:null,fecha:'2026-09-15',idioma:'es'});
  let r; try{ r=construir(); }catch(e){ R.push({base,coche,err:e.message.slice(0,60)}); return; }
  const b=r.brief, bs=BASES[base];
  const pts=(b.paradas||[]).map(p=>{const l=LUGARES.find(x=>x.n===p.nombre)||{};
    return {n:p.nombre,fr:p.franja,la:l.la,lo:l.lo,rec:!!l.recinto,car:l.carretera,
            d:l.la!=null?km(bs.la,bs.lo,l.la,l.lo):null};}).filter(x=>x.la!=null);
  // dispersion: distancia maxima entre dos paradas cualquiera
  let disp=0;
  for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++)
    disp=Math.max(disp,km(pts[i].la,pts[i].lo,pts[j].la,pts[j].lo));
  // salto maximo entre paradas consecutivas
  let salto=0;
  for(let i=1;i<pts.length;i++) salto=Math.max(salto,km(pts[i-1].la,pts[i-1].lo,pts[i].la,pts[i].lo));
  const rest=b.restaurante?REST.find(x=>x.n===b.restaurante.nombre):null;
  const prim=pts[0], ult=pts[pts.length-1];
  R.push({base,coche,ninos,
    n:pts.length,
    disp:+disp.toFixed(1), salto:+salto.toFixed(1),
    cierre: ult? +ult.d.toFixed(1):null,
    rest: rest? rest.n : null,
    desvio: (rest&&rest.la!=null&&prim)? +km(prim.la,prim.lo,rest.la,rest.lo).toFixed(1):null,
    recinto: pts.some(p=>p.rec),
    duraNoche: pts.some(p=>p.car==='dura'&&(p.fr==='atardecer'||p.fr==='noche')),
  });
});
console.log('base                       coche par disp salto cierre desvío  restaurante');
R.forEach(x=>{
  if(x.err) return console.log(x.base+' ERROR '+x.err);
  const flag=[];
  if(x.disp>25) flag.push('DISPERSO');
  if(x.salto>18) flag.push('SALTO');
  if(x.cierre>12) flag.push('CIERRE-LEJOS');
  if(x.desvio>8) flag.push('COMIDA-LEJOS');
  if(x.recinto) flag.push('RECINTO');
  if(x.duraNoche) flag.push('CURVAS-NOCHE');
  console.log(x.base.slice(0,25).padEnd(26)+(x.coche?' sí ':' no ')+String(x.n).padStart(3)+
    String(x.disp).padStart(6)+String(x.salto).padStart(6)+String(x.cierre).padStart(7)+
    String(x.desvio==null?'—':x.desvio).padStart(7)+'  '+String(x.rest||'—').slice(0,22).padEnd(23)+flag.join(' '));
});
const n=R.filter(x=>!x.err).length;
console.log('\n=== RESUMEN de '+n+' planes ===');
const cnt=(f)=>R.filter(x=>!x.err&&f(x)).length;
console.log('  dispersión > 25 km      : '+cnt(x=>x.disp>25));
console.log('  salto entre paradas >18 : '+cnt(x=>x.salto>18));
console.log('  cierra a más de 12 km   : '+cnt(x=>x.cierre>12));
console.log('  comida a más de 8 km    : '+cnt(x=>x.desvio>8));
console.log('  recinto como parada     : '+cnt(x=>x.recinto));
console.log('  curvas de noche         : '+cnt(x=>x.duraNoche));
console.log('  sin restaurante         : '+cnt(x=>!x.rest));
console.log('  menos de 3 paradas      : '+cnt(x=>x.n<3));
const ds=R.filter(x=>!x.err).map(x=>x.disp).sort((a,b)=>a-b);
console.log('  dispersión mediana      : '+ds[Math.floor(ds.length/2)]+' km  (máx '+ds[ds.length-1]+')');

/* ── ANCLAS · cuando el sitio lo elige el turista ──────────────────────
   La tabla de arriba nunca pone ancla, y el ancla va por un camino aparte:
   construir() mete esa parada antes del bucle. Un fallo ahí no lo ve nada
   de lo anterior — así se coló un ReferenceError que dejaba muda la
   pantalla al pedir un sitio concreto y reventaba la escapada entera. */
const anclas=[];
/* el sitio de más peso de cada municipio, sacado de los datos y no escrito a
   mano, para que esto no se pudra cuando cambie el catálogo */
['Adeje','Santa Cruz de Tenerife','San Cristóbal de La Laguna','Puerto de la Cruz',
 'Garachico','Vilaflor de Chasna','Candelaria','Icod de los Vinos'].forEach(muni=>{
  const l=LUGARES.filter(x=>(x.co||x.m)===muni&&!x.cerrado&&x.la!=null&&!x.recinto)
                 .sort((a,b)=>((b.w||1)-(a.w||1))||a.n.localeCompare(b.n,'es'))[0];
  if(l&&BASES[muni]) anclas.push([muni,l.n,2]);
});
/* un recinto pedido a propósito: se excluyen como parada normal, pero si lo
   piden por su nombre tiene que ir, que para eso lo han pedido */
(function(){
  const r=LUGARES.filter(l=>l.recinto&&!l.cerrado&&BASES[l.co||l.m])
                 .sort((a,b)=>a.n.localeCompare(b.n,'es'))[0];
  if(r) anclas.push([r.co||r.m,r.n,4]);
})();
/* y los sitios con permiso y tope de personas, con un grupo de seis, que es
   lo que dispara el aviso de aforo */
LUGARES.filter(l=>l.res&&l.res_max!=null&&BASES[l.m]).slice(0,3)
       .forEach(l=>anclas.push([l.m,l.n,6]));

console.log('\n=== ANCLAS · el sitio lo elige el turista ===');
console.log('base                       personas  par  ¿va?  ancla');
let revientan=0, sinAncla=0;
anclas.forEach(([base,ancla,gente])=>{
  Object.assign(S,{base,coche:true,ninos:false,gente,apetece:null,anclaElegida:ancla,
    comida:null,ahora:null,saltoComida:0,descartados:null,prefTipo:null,
    fecha:'2026-09-15',idioma:'es'});
  let b; try{ b=construir().brief; }
  catch(e){ revientan++;
    return console.log(base.slice(0,25).padEnd(26)+'  REVIENTA: '+e.message.slice(0,44)+'  '+ancla.slice(0,30)); }
  const ps=b.paradas||[], va=ps.some(p=>p.nombre===ancla);
  if(!va) sinAncla++;
  console.log(base.slice(0,25).padEnd(26)+String(gente).padStart(6)+String(ps.length).padStart(6)+
    (va?'   sí  ':'   NO  ')+'  '+ancla.slice(0,38));
});
S.anclaElegida=null;
console.log('  planes con ancla        : '+anclas.length);
console.log('  REVIENTAN               : '+revientan);
console.log('  el ancla no sale        : '+sinAncla);

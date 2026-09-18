/* afluencia.js — dice a qué hora y qué días se llena un área recreativa.

   DE DÓNDE VIENE. Zeben mandó el conjunto «afluencia de áreas recreativas»
   del Cabildo con una corazonada: «no sé para qué nos puede servir esto, con
   decir si vas al merendero por ejemplo de Las Mesas en Los Campitos vaya
   temprano porque se llena… Tenerife está llena de turismo y a todos los
   sitios que vas, si no vas temprano, están llenos».

   LO QUE EL DATO SOSTIENE, Y LO QUE NO. Medido sobre las 5.195 filas de 2026
   (enero a agosto, 38 sitios de 20 municipios):
   · **El finde es de verdad.** El domingo entran 14.266 coches en el conjunto
     y el miércoles 2.258: **×6,3**. Por sitio llega a ×8 —Las Raíces, 75
     coches un domingo contra 9 un miércoles—.
   · **La hora también.** Un domingo, el **85% de los coches ha entrado a las
     14:00**, y las dos horas de 13:00 a 14:59 se llevan el 79%. O sea que
     «vaya temprano» es un consejo con número detrás: antes de la una está
     medio vacío.
   · **«Se llena» NO se sostiene, y por eso no se dice.** No hay techo a la
     vista: cada sitio toca su máximo **un solo día de ~200**. El dato dice
     que hay muchos más coches, no que no quepan. Naira dice lo que se puede
     medir: «el finde a mediodía esto se pone de coches», no «no va a entrar».
   · **Y el merendero que él nombró no está.** En las 5.195 filas no hay ni
     una de Santa Cruz: son las 38 áreas del monte del Cabildo. Las Mesas y
     Los Campitos son municipales, y de esas no hay dato. No se inventa.

       node afluencia.js /ruta/al/afluencia.csv          ensayo, no toca nada
       node afluencia.js /ruta/al/afluencia.csv meter    lo escribe en las fichas

   CÓMO CRUZA. Va de la FICHA al dato, no al revés: para cada `LUGAR` busca
   las áreas de afluencia a menos de 500 m y **suma** las que caigan ahí. Hay
   que sumarlas porque el Cabildo apunta «CHIO» y «CHIO A.R.» por separado y
   son el mismo aparcamiento. Al revés —del dato a la ficha más cercana— dos
   registros del mismo sitio se pisarían el uno al otro.

   QUÉ ENTRA Y QUÉ SE QUEDA FUERA. Tres umbrales, y los tres existen para no
   decir una tontería con cara de dato:
   · **15 coches de media un día de finde.** Por debajo, «se pone de coches»
     es mentira: La Tahona tiene cuatro. Cuatro coches no llenan nada.
   · **El doble que entre semana.** Si el finde no se nota, no hay nada que
     avisar — Llano de los Viejos va ×1,9 y se queda fuera.
   · **8 días de finde medidos.** Una media de dos domingos no es una media.

   EL CAMPO. `lleno:{x,h,n}` — cuántas veces más que entre semana, desde qué
   hora, y cuántos coches un día de finde. La hora es la primera en la que ya
   ha entrado el 25% del día: es el momento en que empieza a llenarse, no el
   pico. El pico llega una hora después y entonces ya no hay sitio bueno.
*/
const fs=require('fs'), path=require('path');
const RAIZ=__dirname;
const c=require(path.join(RAIZ,'banco.js'));

/* Los ficheros del Cabildo vienen con BOM y con comas dentro de comillas
   («"Campamento, Aula, Centro"»), así que no vale partir por comas a secas. */
function leerCSV(txt){
  if(txt.charCodeAt(0)===0xFEFF) txt=txt.slice(1);
  const fila=l=>{const o=[];let q=false,c='';
    for(let i=0;i<l.length;i++){const ch=l[i];
      if(q){ if(ch==='"'){ if(l[i+1]==='"'){c+='"';i++;} else q=false; } else c+=ch; }
      else { if(ch==='"') q=true; else if(ch===','){o.push(c);c='';} else c+=ch; } }
    o.push(c); return o;};
  const L=txt.trim().split(/\r?\n/), cab=fila(L[0]);
  return L.slice(1).map(l=>{const f=fila(l),o={};cab.forEach((k,i)=>o[k]=f[i]);return o;});
}

const km=(a,b,x,y)=>{const R=6371,t=Math.PI/180;const dl=(x-a)*t,dg=(y-b)*t;
  const h=Math.sin(dl/2)**2+Math.cos(a*t)*Math.cos(x*t)*Math.sin(dg/2)**2;
  return 2*R*Math.asin(Math.sqrt(h));};

/* LA CERCANÍA SOLA NO VALE, y eso ya costó un día con las paradas de guagua.
   A 500 m del Llano de los Viejos hay un mirador y un laurel monumental, y a
   500 m de Lagunetilla Chica hay dos pinos con nombre: ninguno es el área
   recreativa y en ninguno se llena el aparcamiento. Así que además de estar
   cerca, la ficha tiene que SER el sitio: o es de tipo «Área recreativa», o su
   nombre lleva dentro el topónimo del área —el sendero que arranca de ella
   comparte el mismo aparcamiento y ese sí—. Con eso se cae el Barranco de
   Toledo, que está a 90 m de Lomo la Jara y es otra cosa. */
const GENERICO=/^(LAS?|LOS?|EL|DE|DEL|A\.?R\.?|ZR|CAMP\.?|AULA|SN|SAN)$/;
const palabras=t=>String(t||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  .toUpperCase().split(/[^A-Z0-9]+/).filter(Boolean);
function esElSitio(l,a){
  if(l.tipo==='Área recreativa') return true;
  const n=new Set(palabras(l.n));
  return palabras(a.n).some(w=>w.length>=4&&!GENERICO.test(w)&&n.has(w));
}

const RADIO=0.5;      /* km de la ficha al área del Cabildo */
const MIN_FINDE=15;   /* coches de media un día de finde */
const MIN_X=2;        /* veces más que entre semana */
const MIN_DIAS=8;     /* días de finde medidos */

function main(){
  const CSV=process.argv[2];
  if(!CSV||!fs.existsSync(CSV)){
    console.log('Pásame el csv de afluencia del Cabildo:\n'+
      '  node afluencia.js /ruta/al/afluencia-de-areas-recreativas-2026.csv [meter]');
    process.exit(1);
  }
  const R=leerCSV(fs.readFileSync(CSV,'utf8'));
  /* Solo «Area Recreativa» y solo coches: una zona de acampada no se visita
     de paso y una tienda de campaña no ocupa aparcamiento. */
  const AR=R.filter(r=>r.tipo_actividad==='Area Recreativa'&&r.unidad==='TURISMO'
    &&r.latitud&&r.longitud&&r.fecha_inicio);
  console.log(R.length+' filas · '+AR.length+' de área recreativa con coches · '+
    new Set(AR.map(r=>r.zona+'|'+r.toponimia)).size+' sitios\n');

  /* Cada área del Cabildo, con sus coches por día y por hora */
  const areas={};
  AR.forEach(r=>{
    const k=r.zona+'|'+r.toponimia;
    const a=areas[k]||(areas[k]={z:r.zona,n:r.toponimia,la:+r.latitud,lo:+r.longitud,
      dias:{}, hFinde:{}});
    const dia=r.fecha_inicio.slice(0,10), n=+r.cantidad||0;
    const finde=[0,6].includes(new Date(dia+'T12:00:00Z').getUTCDay());
    a.dias[dia]=a.dias[dia]||{finde,n:0}; a.dias[dia].n+=n;
    if(finde){ const h=+r.fecha_inicio.slice(11,13); a.hFinde[h]=(a.hFinde[h]||0)+n; }
  });

  /* De la FICHA al dato, sumando las áreas que caigan dentro del radio */
  const filas=[];
  c.LUGARES.forEach(l=>{
    if(l.la==null||l.lo==null||l.pos_aprox) return;
    const cerca=Object.values(areas).filter(a=>km(l.la,l.lo,a.la,a.lo)<=RADIO&&esElSitio(l,a));
    if(!cerca.length) return;
    const dias={}, hF={};
    cerca.forEach(a=>{
      Object.entries(a.dias).forEach(([d,v])=>{
        dias[d]=dias[d]||{finde:v.finde,n:0}; dias[d].n+=v.n;});
      Object.entries(a.hFinde).forEach(([h,v])=>hF[h]=(hF[h]||0)+v);
    });
    const F=Object.values(dias).filter(d=>d.finde), S=Object.values(dias).filter(d=>!d.finde);
    if(F.length<MIN_DIAS||!S.length) return;
    const mF=F.reduce((a,b)=>a+b.n,0)/F.length, mS=S.reduce((a,b)=>a+b.n,0)/S.length;
    const x=mS>0?mF/mS:0;
    /* la hora en la que ya ha entrado el cuarto del día: ahí empieza a llenarse */
    const horas=Object.keys(hF).map(Number).sort((a,b)=>a-b);
    const tot=horas.reduce((a,h)=>a+hF[h],0); let ac=0, hora=null;
    for(const h of horas){ ac+=hF[h]; if(ac/tot>=0.25){ hora=h; break; } }
    filas.push({l, nombres:cerca.map(a=>a.n).join(' + '), finde:Math.round(mF),
      semana:Math.round(mS), x:+x.toFixed(1), hora, dias:F.length+S.length,
      vale: mF>=MIN_FINDE && x>=MIN_X && hora!=null});
  });

  filas.sort((a,b)=>b.finde-a.finde);
  console.log('ficha del catálogo                                   finde  semana    ×   desde');
  filas.forEach(f=>console.log(
    (f.vale?'✓ ':'· ')+f.l.n.slice(0,48).padEnd(50)+
    String(f.finde).padStart(5)+String(f.semana).padStart(8)+
    ('×'+f.x).padStart(6)+(f.hora!=null?String(f.hora).padStart(2,'0')+':00':'  —').padStart(8)+
    '   ['+f.nombres+']'));
  const buenas=filas.filter(f=>f.vale);
  console.log('\n'+buenas.length+' fichas con afluencia que decir, de '+filas.length+' que cruzan.');
  const fuera=filas.filter(f=>!f.vale);
  if(fuera.length) console.log('Las otras '+fuera.length+' no llegan al umbral: '+
    fuera.map(f=>f.l.n).join(', ')+'.');

  if(process.argv[3]==='meter') meter(buenas);
  else console.log('\n(ensayo — no se ha tocado nada; añade «meter» para escribirlo)');
}

/* Se escribe con una expresión regular sobre el fichero, como el resto de
   herramientas: volcar el objeto entero perdería los comentarios y el orden. */
function meter(buenas){
  const F=path.join(RAIZ,'datos','lugares.js');
  let t=fs.readFileSync(F,'utf8');
  let puestas=0, perdidas=[];
  buenas.forEach(f=>{
    const esc=f.l.n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    const re=new RegExp('(\\{[^{}]*?["\']?n["\']?:\\s*["\']'+esc+'["\'][^{}]*?)\\}');
    const m=t.match(re);
    if(!m){ perdidas.push(f.l.n); return; }
    /* Se pisa el que hubiera: esto se recalcula cada vez que el Cabildo
       publique otro año, y el número viejo dejaría de ser cierto. */
    let cuerpo=m[1].replace(/,lleno:\{[^{}]*\}/,'');
    t=t.replace(re, cuerpo+',lleno:{x:'+f.x+',h:'+f.hora+',n:'+f.finde+'}}');
    puestas++;
  });
  fs.writeFileSync(F,t);
  console.log('\nEscritas '+puestas+' fichas.');
  if(perdidas.length) console.log('No se encontró la ficha de: '+perdidas.join(', '));
}

main();

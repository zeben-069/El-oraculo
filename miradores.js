/* miradores.js — para engordar el catálogo de miradores sin inventarse nada.
   ------------------------------------------------------------------
   El «regalo de camino» (de_camino_al_primer_sitio) solo sale en el 12% de
   los planes, y no es por la lógica: es que el catálogo tiene 25 miradores
   en toda la isla. Con más fichas, el regalo sale casi todos los días.

   Desde el contenedor de trabajo no se puede entrar en webtenerife ni en
   datos.tenerife.es —la red está cerrada por política, contestan 403—, así
   que el trabajo lo hace el navegador de casa, igual que con las fotos:

       node miradores.js buscar        arma buscar-miradores.html
       node miradores.js miradores.json  mete los que vengan marcados

   La página le pregunta a OpenStreetMap por los puntos marcados como
   mirador. Lo que OSM no sabe —si el sitio vale de verdad, de qué municipio
   es, si se llega por una carretera que no es para ir de noche— lo pone
   quien vive aquí, marcándolo. Los datos de OSM son ODbL: cada ficha se
   lleva su origen y el número de nodo, que la licencia pide citarlo. */
const fs=require('fs');
const c=require('./banco.js');
const {LUGARES,BASES,km}=c;

const norm=s=>String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')
  .replace(/[^a-z0-9]+/g,' ').trim();

function pagina(){
  /* solo lo justo: los 31 centros para proponer municipio, y los miradores
     que ya hay para no ofrecer repetidos */
  const bases={};
  Object.keys(BASES).forEach(k=>{const b=BASES[k]; bases[b.m||k]={la:b.la,lo:b.lo,corr:b.corr};});
  const ya=LUGARES.filter(l=>l.tipo==='Mirador'&&l.la!=null).map(l=>({n:l.n,la:l.la,lo:l.lo}));

  const plantilla=fs.readFileSync('plantilla-miradores.html','utf8');
  /* los huecos son el comentario MÁS el valor: sustituyendo solo el
     comentario quedaría `{}` o `[]` pegado detrás y no compilaría */
  const H_BASES='/*BASES*'+'/{}', H_YA='/*YA*'+'/[]';
  if(plantilla.split(H_BASES).length!==2||plantilla.split(H_YA).length!==2)
    throw new Error('la plantilla no trae los huecos');
  fs.writeFileSync('buscar-miradores.html',
    plantilla.replace(H_BASES,JSON.stringify(bases))
             .replace(H_YA,JSON.stringify(ya)));
  console.log('escrito buscar-miradores.html');
  console.log('   '+Object.keys(bases).length+' municipios para proponer, '+
              ya.length+' miradores ya fichados para no repetir.');
  console.log('Se abre en el navegador, se pulsa «Buscar los miradores», se marcan los buenos');
  console.log('y se baja el fichero. Eso es lo que come: node miradores.js miradores.json');
}

function meter(fichero){
  const datos=JSON.parse(fs.readFileSync(fichero,'utf8'));
  const lista=datos.miradores||datos;
  if(!Array.isArray(lista)||!lista.length) return console.log('no hay miradores en '+fichero);

  const FICHERO='datos/lugares.js';
  let txt=fs.readFileSync(FICHERO,'utf8');
  const nuevas=[]; const saltados=[];

  lista.forEach(m=>{
    if(!m.nombre||m.la==null||m.lo==null){ saltados.push('(sin nombre o sin coordenadas)'); return; }
    /* nunca dos veces: ni por nombre ni por estar a menos de 150 metros */
    const choca=LUGARES.find(l=>norm(l.n)===norm(m.nombre)||
      (l.la!=null&&km(l.la,l.lo,m.la,m.lo)<0.15&&l.tipo==='Mirador'));
    if(choca){ saltados.push(m.nombre+' → ya está como «'+choca.n+'»'); return; }
    const base=BASES[m.municipio]||Object.values(BASES).find(b=>b.m===m.municipio);
    if(!base){ saltados.push(m.nombre+' → municipio desconocido: '+m.municipio); return; }

    /* El corredor NO sale del municipio: Santa Cruz es «Metropolitana» y el
       Mirador de Taborno está en Anaga, que a efectos de tiempos de viaje no
       tiene nada que ver. Se saca del vecino fichado más cercano, que es un
       dato y no una suposición; si no hay ninguno cerca, el del municipio. */
    const vec=LUGARES.filter(l=>l.la!=null&&l.c)
      .map(l=>({c:l.c,d:km(l.la,l.lo,m.la,m.lo)}))
      .sort((a,b)=>a.d-b.d)[0];
    const corr=(vec&&vec.d<=5)?vec.c:base.corr;

    const f={n:m.nombre, m:base.m||m.municipio, c:corr,
      fr:m.franja||'atardecer', dur:25, tipo:'Mirador', v:1,
      la:m.la, lo:m.lo, w:2.5, et:['naturaleza'], co:base.m||m.municipio,
      of:m.fuente||'OpenStreetMap (ODbL)'};
    /* la línea que escribe Zeben es un dato suyo, y va donde van las notas */
    if(m.nota) f.no=m.nota;
    /* la carretera dura no es un adorno: el motor le quita 20 puntos al
       atardecer para no mandar a nadie a bajar de noche por ahí */
    if(m.carretera_dura){ f.carretera='dura';
      f.carretera_nota='Se llega por carretera estrecha y de muchas curvas. Mejor de día.'; }
    nuevas.push(f);
    if(vec&&vec.d<=5&&vec.c!==base.corr)
      console.log('   · '+m.nombre+': corredor '+vec.c+' (por el vecino a '+
                  vec.d.toFixed(1)+' km), no '+base.corr+' del municipio');
  });

  if(!nuevas.length){
    console.log('no entra ninguno.');
    saltados.forEach(x=>console.log('   · '+x));
    return;
  }
  /* se cuelgan al final del array, sin tocar ni una ficha de las que hay */
  const cierre=txt.lastIndexOf(']');
  if(cierre<0) throw new Error('no encuentro el final de LUGARES en '+FICHERO);
  const coma=txt.slice(0,cierre).trimEnd().endsWith(',')?'':',';
  txt=txt.slice(0,cierre)+coma+'\n'+nuevas.map(f=>JSON.stringify(f)).join(',\n')+'\n'+txt.slice(cierre);
  fs.writeFileSync(FICHERO,txt);

  console.log(nuevas.length+' miradores nuevos:');
  nuevas.forEach(f=>console.log('   ✓ '+f.n.padEnd(42)+f.m+(f.carretera?'  · carretera dura':'')));
  if(saltados.length){ console.log('\nfuera ('+saltados.length+'):');
    saltados.forEach(x=>console.log('   · '+x)); }
  console.log('\nComprueba ahora, en este orden:');
  console.log('   node -e "const c=require(\'./banco.js\'); console.log(c.LUGARES.length)"');
  console.log('   node lote.js');
}

const arg=process.argv[2];
if(!arg||arg==='buscar') pagina();
else meter(arg);

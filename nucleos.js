/* nucleos.js — para meter en el catálogo el caserío donde es la fiesta.
   ------------------------------------------------------------------
   Una fiesta puede llevar su sitio (`la`/`lo`), pero solo si ese sitio está
   en LUGARES. Y hay fiestas que son en un barrio o un caserío que no está:
   la Romería de Los Abrigos acaba en el muelle pesquero, a 9 km del casco de
   Granadilla y monte abajo, así que el día se armaba arriba y a comer abajo.
   Medido sobre toda la isla —agrupando los 318 restaurantes, que son los que
   marcan dónde hay pueblo, y mirando si hay algún LUGAR a menos de 2 km— el
   hueco es UNA esquina: Los Abrigos, Charco del Pino y Los Blanquitos.
   Bajamar, Punta del Hidalgo y San Andrés ya están cubiertos por sus fichas.

   Las coordenadas NO se inventan, y desde el contenedor no se puede entrar en
   OpenStreetMap (403 en el CONNECT), así que lo hace el navegador de casa,
   igual que con los miradores y las fotos:

       node nucleos.js buscar          arma buscar-nucleos.html
       node nucleos.js nucleos.json    mete los que vengan marcados

   La lista de qué buscar sale sola de las fiestas que aún no tienen sitio:
   el nombre del caserío está en el nombre de la fiesta. Lo que OSM no sabe
   —de qué municipio es, si es un casco o un caserío— lo pone quien vive
   aquí. OSM es ODbL: cada ficha se lleva su origen y el número de nodo. */
const fs=require('fs');
const c=require('./banco.js');
const {LUGARES,BASES,EVENTOS,km}=c;

const norm=s=>String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')
  .replace(/[^a-z0-9]+/g,' ').trim();

/* el caserío va en el nombre de la fiesta, detrás del genérico */
const GENERICO=/^(gran(des)? )?(fiestas?|romer[ií]a|bajada|subida|procesi[óo]n|verbena|feria|baile|noche|d[ií]a|exaltaci[óo]n|caminata|ofrenda|rito|arrastre|exhibici[óo]n|exposici[óo]n|concierto|pregón|pregon|festival)\b[^a-záéíóúñ]*(de |del |de la |de los |de las |a |en |al )?/i;

function pagina(){
  /* Qué buscar: lo que nombran las fiestas que aún no tienen sitio, quitando
     lo que ya está fichado con ese nombre. Un santo no es un caserío, así que
     se descarta lo que empieza por San/Santa/Virgen/Nuestra. */
  const SANTO=/^(san|santa|santo|virgen|nuestra|el se[ñn]or|cristo|corpus|carnaval)\b/i;
  /* Un nombre de sitio tiene FORMA: dos o tres palabras, todas con mayúscula
     salvo los artículos. Sin esto salían «El Salvador y exhibición
     pirotécnica» y «e inauguración de las Fiestas Patronales», que no son
     pueblos sino el resto del nombre de la fiesta. */
  const ARTICULO=/^(de|del|la|las|los|el|y|e)$/i;
  const pareceSitio=t=>{
    const p=t.split(/\s+/);
    if(p.length<1||p.length>3) return false;
    if(ARTICULO.test(p[0])&&p[0][0]!==p[0][0].toUpperCase()) return false;
    return p.every(x=>ARTICULO.test(x)||/^[A-ZÁÉÍÓÚÑ]/.test(x));
  };
  const cand=new Set();
  EVENTOS.filter(e=>e.la==null).forEach(e=>{
    const t=e.n.replace(GENERICO,'').split(/[·—:,(]/)[0].trim();
    if(t.length<4||SANTO.test(t)||!pareceSitio(t)) return;
    if(LUGARES.some(l=>norm(l.n)===norm(t))) return;
    cand.add(t);
  });
  const buscar=[...cand].sort();
  const bases={};
  Object.keys(BASES).forEach(k=>{const b=BASES[k]; bases[b.m||k]={la:b.la,lo:b.lo,corr:b.corr};});
  const ya=LUGARES.filter(l=>l.la!=null).map(l=>({n:l.n,la:l.la,lo:l.lo}));

  const plantilla=fs.readFileSync('plantilla-nucleos.html','utf8');
  const H_B='/*BUSCAR*'+'/[]', H_M='/*BASES*'+'/{}', H_Y='/*YA*'+'/[]';
  [H_B,H_M,H_Y].forEach(h=>{ if(plantilla.split(h).length!==2)
    throw new Error('la plantilla no trae el hueco '+h); });
  fs.writeFileSync('buscar-nucleos.html',
    plantilla.replace(H_B,JSON.stringify(buscar))
             .replace(H_M,JSON.stringify(bases))
             .replace(H_Y,JSON.stringify(ya)));
  console.log('escrito buscar-nucleos.html');
  console.log('   busca: '+(buscar.join(', ')||'(nada: todas las fiestas tienen sitio)'));
  console.log('   '+Object.keys(bases).length+' municipios para elegir, '+ya.length+' sitios ya fichados para no repetir.');
  console.log('Se abre en el navegador, se pulsa «Buscar estos pueblos», se marca el punto bueno');
  console.log('de cada uno con su municipio, y se baja: node nucleos.js nucleos.json');
}

/* Pesos y duración por tipo. Un caserío no es una visita de dos horas: se pasa
   por él, se ve la plaza y la iglesia y se sigue. Los mismos números que ya
   llevan los cascos y caseríos del catálogo. */
const PORTIPO={
  'Casco histórico':{dur:60,w:3,et:['cultura']},
  'Caserío'        :{dur:40,w:2,et:['cultura']},
  'Plaza'          :{dur:30,w:2,et:['cultura']},
  'Playa'          :{dur:90,w:3,et:['agua']},
  'Patrimonio'     :{dur:35,w:2,et:['cultura']}
};

function meter(fichero){
  const datos=JSON.parse(fs.readFileSync(fichero,'utf8'));
  const lista=datos.nucleos||datos;
  if(!Array.isArray(lista)||!lista.length) return console.log('no hay núcleos en '+fichero);

  const FICHERO='datos/lugares.js';
  let txt=fs.readFileSync(FICHERO,'utf8');
  const nuevas=[], saltados=[];

  lista.forEach(m=>{
    if(!m.nombre||m.la==null||m.lo==null){ saltados.push('(sin nombre o sin coordenadas)'); return; }
    /* nunca dos veces: ni por nombre ni por estar a menos de 150 metros */
    const choca=LUGARES.find(l=>norm(l.n)===norm(m.nombre)||
      (l.la!=null&&km(l.la,l.lo,m.la,m.lo)<0.15));
    if(choca){ saltados.push(m.nombre+' → ya está como «'+choca.n+'»'); return; }
    const base=BASES[m.municipio]||Object.values(BASES).find(b=>b.m===m.municipio);
    if(!base){ saltados.push(m.nombre+' → municipio desconocido: '+m.municipio); return; }
    const t=PORTIPO[m.tipo]?m.tipo:'Caserío';

    /* El corredor sale del vecino fichado más cercano, no del municipio: es la
       misma razón que con los miradores —Santa Cruz es «Metropolitana» y
       Taborno es Anaga—, y aquí más todavía, que estos están en la punta del
       término. Si no hay vecino a menos de 5 km, el del municipio. */
    const vec=LUGARES.filter(l=>l.la!=null&&l.c)
      .map(l=>({c:l.c,d:km(l.la,l.lo,m.la,m.lo)}))
      .sort((a,b)=>a.d-b.d)[0];
    const corr=(vec&&vec.d<=5)?vec.c:base.corr;
    const cfg=PORTIPO[t];

    const f={n:m.nombre, m:base.m||m.municipio, c:corr, fr:'tarde', dur:cfg.dur,
      tipo:t, v:1, la:m.la, lo:m.lo, w:cfg.w, et:cfg.et.slice(), flex:true,
      co:base.m||m.municipio, of:m.fuente||'OpenStreetMap (ODbL)'};
    if(m.nota) f.no=m.nota;
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
  const cierre=txt.lastIndexOf(']');
  if(cierre<0) throw new Error('no encuentro el final de LUGARES en '+FICHERO);
  const coma=txt.slice(0,cierre).trimEnd().endsWith(',')?'':',';
  txt=txt.slice(0,cierre)+coma+'\n'+nuevas.map(f=>JSON.stringify(f)).join(',\n')+'\n'+txt.slice(cierre);
  fs.writeFileSync(FICHERO,txt);

  console.log(nuevas.length+' núcleos nuevos:');
  nuevas.forEach(f=>console.log('   ✓ '+f.n.padEnd(30)+f.tipo.padEnd(18)+f.m));
  if(saltados.length){ console.log('\nfuera ('+saltados.length+'):');
    saltados.forEach(x=>console.log('   · '+x)); }
  console.log('\nComprueba ahora, en este orden:');
  console.log('   node -e "const c=require(\'./banco.js\'); console.log(c.LUGARES.length)"');
  console.log('   node lote.js');
  console.log('Y luego coloca las fiestas en ellos: node eventos.js sitios');
}

const arg=process.argv[2];
if(!arg||arg==='buscar') pagina();
else meter(arg);

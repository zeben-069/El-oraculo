/* matriz.js — rehace `datos/titsa-matriz.js` desde el GTFS oficial de TITSA.

   POR QUÉ EXISTE. La matriz de municipios salió una vez de los horarios de
   TITSA y **no quedó herramienta**, que es el mismo error que ya costó las
   215 fichas sin `bus` hasta que se escribió `guaguas.js`. Y encima guardaba
   UN solo número por par —la salida más tardía del día—, que en 234 de los
   850 pares laborables es una guagua de MADRUGADA. El motor la presentaba
   como «la última guagua»: a alguien sin coche eso lo deja tirado de noche.
   El apaño de entonces fue callar el número y decir que no lo sabíamos.
   Ahora sí se sabe: el GTFS trae los 49.373 viajes con su hora parada a
   parada, así que la última guagua de la TARDE se calcula, no se estima.

       node matriz.js [carpeta-gtfs]            ensayo: mide y compara, no escribe
       node matriz.js [carpeta-gtfs] escribir   reescribe datos/titsa-matriz.js

   La carpeta por defecto es `./gtfs` (o GTFS_DIR). Dentro tienen que estar
   `stops.txt`, `trips.txt`, `routes.txt`, `stop_times.txt` y
   `calendar_dates.txt` tal como los publica TITSA en Google Transit.

   LO QUE HAY QUE ENTENDER ANTES DE TOCARLO
   · **El municipio de una parada no viene en el dato.** Ni el GTFS ni el
     fichero de paradas del Cabildo lo traen: solo nombre y coordenada. Se
     saca de los puntos que ya tenemos fichados —los 644 sitios, los 394
     restaurantes y los 31 centros urbanos—, que es la misma regla que ya usan
     los miradores y la hostelería para el corredor.
     Pero **no del más cercano a secas**, y esto costó verlo: con el más
     cercano, la Cruz del Carmen y el Pico del Inglés se iban a **Tegueste**
     porque justo al lado hay dos senderos fichados ahí, y Guamasa también,
     por un guachinche. Y entonces salía «la última guagua de Tegueste a La
     Laguna es la 01:22», que es la de Guamasa: exactamente el número que deja
     a alguien tirado. Así que **votan los 7 más cercanos**, cada uno pesando
     1/(km+0,2). En la Cruz del Carmen son tres de La Laguna contra dos de
     Tegueste, y gana La Laguna, que es de quien es.
   · **La raya del búho está aquí, no en el motor.** Una salida a partir de la
     01:30 es el servicio de noche, y detrás lleva un agujero de seis horas.
     `ultima` es la última ANTES de esa raya —la que se puede planificar— y
     `buho` es la de madrugada, aparte y con su nombre.
   · **`dur` es la MEDIANA del día, no la del último viaje.** El último viaje
     es el más rápido que hay —sin tráfico y con menos paradas—, y de ahí
     salían «9 minutos» de La Orotava al Puerto.
   · **El viaje tiene que LLEVAR de un pueblo al otro, no cruzar la raya del
     término.** Esto no estaba y daba números absurdos: entre La Orotava y el
     Puerto de la Cruz salía «la última a la 01:27, un minuto de viaje» — una
     guagua saltando de la última parada de un término a la primera del otro.
     Cierto, y completamente inútil: quien duerme en el Puerto quiere la
     guagua que lo lleva al Puerto, no la que cruza la línea del mapa. La regla
     es que entre la parada donde suben y la parada donde bajan haya al menos
     el **60% de lo que separa los dos cascos**. Sale del propio dato y no hay
     que dibujar ninguna geografía a mano.
     Lo que NO vale es exigir que las paradas estén junto al casco: probado, y
     se caen 266 pares de golpe. La estación de Adeje es Costa Adeje, a cinco
     kilómetros del casco; la de Arona es Los Cristianos. El pueblo no siempre
     está donde para la guagua.
   · **El trasbordo se hace en la misma parada o en otra a 400 metros**, nunca
     «en el mismo municipio». Cambiar de guagua en Santa Cruz puede ser cruzar
     la ciudad: admitiendo el término entero salen enlaces de quince minutos
     que no existen. Pero exigir la parada exacta tampoco vale —se caían 74
     pares, entre ellos todo Arafo, porque la 121 acaba a doscientos metros de
     donde para la 711—, así que se admite lo que se anda en cinco minutos.
     El cambio pide entre 10 y 60 minutos de espera y solo se permite UNO, que
     es lo que ya guardaba la matriz vieja.
   · **Un día, un horario.** Para cada tipo de día se coge UNA fecha de
     verdad del calendario, no se mezclan varias: mezclar da un horario que
     no existe ningún día. Se elige la fecha de **viajes medianos** de su
     grupo —así ni el 25 de diciembre ni un puente mandan sobre los demás— y
     sale impresa para poder repetir la cuenta.
   · **«finde» son sábado y domingo juntos, y no tienen el mismo horario.**
     Eso lo decide el motor, no este fichero. Como no se puede prometer una
     guagua que el domingo no sale, del par sábado/domingo se guarda **lo más
     flojo**: la salida más temprana de las dos y los viajes del que menos
     ponga. Equivocarse por ahí les hace volver antes; al revés los deja
     tirados.
*/
const fs=require('fs'), path=require('path');
const RAIZ=__dirname;

const args=process.argv.slice(2);
const ESCRIBIR=args.includes('escribir');
const DIR=args.filter(a=>a!=='escribir')[0] || process.env.GTFS_DIR || path.join(RAIZ,'gtfs');

const RAYA=90+24*60;   /* 01:30 — de ahí en adelante es búho */
const PARTE=0.6;       /* el viaje tiene que cubrir esto del camino entre los dos cascos */
const VOTOS=7;         /* cuántos puntos fichados votan el municipio de una parada */
const CONOCIDO=1.2;    /* km: más lejos de todo lo fichado, la parada no vale de extremo */
const ESPERA=10;       /* lo menos que se tarda en cambiar de guagua, en minutos */
const MAXESPERA=60;    /* y lo más que se le puede pedir a nadie que espere */
const ANDANDO=0.4;     /* km que se admite andar de una parada a otra al cambiar */
const CAMBIOS=2;       /* cuántas veces se admite cambiar de guagua */
const CUESTA=20;       /* lo que «cuesta» cada cambio al elegir la mejor vuelta */

const c=require(path.join(RAIZ,'banco.js'));
const km=(a,b,x,y)=>{const R=6371,t=Math.PI/180;const dl=(x-a)*t,dg=(y-b)*t;
  const h=Math.sin(dl/2)**2+Math.cos(a*t)*Math.cos(x*t)*Math.sin(dg/2)**2;
  return 2*R*Math.asin(Math.sqrt(h));};

function leer(f){
  const p=path.join(DIR,f);
  if(!fs.existsSync(p)){
    console.log('No encuentro '+f+' en '+DIR+
      '\nDescomprime ahí el GTFS de TITSA, o pásame la carpeta:  node matriz.js /ruta/al/gtfs');
    process.exit(1);
  }
  let t=fs.readFileSync(p,'utf8');
  if(t.charCodeAt(0)===0xFEFF) t=t.slice(1);   /* los ficheros del Cabildo vienen con BOM */
  return t;
}
const filas=f=>leer(f).split('\n').slice(1);

/* ── 1 · el municipio de cada parada ───────────────────────────────────── */
function situarParadas(){
  const P=[];
  c.LUGARES.forEach(l=>{ if(l.la!=null) P.push({la:l.la,lo:l.lo,m:l.m}); });
  c.REST.forEach(r=>{ if(r.la!=null) P.push({la:r.la,lo:r.lo,m:r.m}); });
  Object.keys(c.BASES).forEach(k=>{ const b=c.BASES[k]; if(b.la!=null) P.push({la:b.la,lo:b.lo,m:b.m}); });

  const idDe={}, muni=[], nombre=[], extremo=[], LA=[], LO=[], d=[];
  for(const l of filas('stops.txt')){
    const f=l.trim().split(','); if(f.length<4) continue;
    const la=+f[2], lo=+f[3]; if(isNaN(la)||isNaN(lo)) continue;
    /* los 7 más cercanos, y que voten */
    const top=[];
    for(const p of P){
      const x=km(la,lo,p.la,p.lo);
      if(top.length<VOTOS){ top.push([x,p.m]); top.sort((a,b)=>a[0]-b[0]); }
      else if(x<top[VOTOS-1][0]){ top[VOTOS-1]=[x,p.m]; top.sort((a,b)=>a[0]-b[0]); }
    }
    const urna={};
    for(const [x,mm] of top) urna[mm]=(urna[mm]||0)+1/(x+0.2);
    let m=null, mayor=-1;
    for(const mm in urna) if(urna[mm]>mayor){ mayor=urna[mm]; m=mm; }
    const mejor=top[0][0];
    /* ¿hay algo fichado de ESE municipio cerca? si no, la parada no vale de extremo */
    let suyo=1e9;
    for(const [x,mm] of top) if(mm===m && x<suyo) suyo=x;
    extremo.push(suyo<=CONOCIDO);
    idDe[f[0]]=muni.length; muni.push(m); nombre.push(f[1]);
    LA.push(la); LO.push(lo);
    d.push(mejor);
  }
  /* Lo que un viaje tiene que cubrir para contar como «de A a B»: el 60% de
     lo que separa los dos cascos. Sale de `BASES`, que es el mismo centro
     urbano que usa el motor para anclar el día. */
  const falta={};
  const MU=[...new Set(muni)].filter(Boolean);
  for(const A of MU) for(const B of MU){
    if(A===B) continue;
    const a=c.BASES[A], b=c.BASES[B];
    falta[A+'|'+B] = (a&&b) ? PARTE*km(a.la,a.lo,b.la,b.lo) : 0;
  }
  /* las paradas de al lado: las que están a menos de 400 m, que es lo que se
     anda al cambiar de guagua. Con una rejilla de medio grado de minuto para
     no comparar 3.896 contra 3.896. */
  const N=muni.length, vecinas=new Array(N);
  const rej={}, PASO=0.01;                 /* ~1,1 km de lado */
  const celda=i=>Math.round(LA[i]/PASO)+'|'+Math.round(LO[i]/PASO);
  for(let i=0;i<N;i++) (rej[celda(i)]=rej[celda(i)]||[]).push(i);
  for(let i=0;i<N;i++){
    const v=[], ca=Math.round(LA[i]/PASO), co=Math.round(LO[i]/PASO);
    for(let a=-1;a<=1;a++) for(let b=-1;b<=1;b++)
      for(const j of (rej[(ca+a)+'|'+(co+b)]||[]))
        if(km(LA[i],LO[i],LA[j],LO[j])<=ANDANDO) v.push(j);
    vecinas[i]=v;
  }
  d.sort((a,b)=>a-b);
  return {idDe, muni, nombre, extremo, falta, vecinas, puntos:P.length, n:muni.length,
    extremos:extremo.filter(Boolean).length,
    dist:(i,j)=>km(LA[i],LO[i],LA[j],LO[j]),
    mediana:d[d.length>>1], p99:d[Math.floor(d.length*0.99)], lejos:d.filter(x=>x>3).length};
}

/* ── 2 · el calendario y los viajes ────────────────────────────────────── */
const iso=d=>d.slice(0,4)+'-'+d.slice(4,6)+'-'+d.slice(6,8);
/* Las horas del GTFS pasan de las 24: «25:10:00» es la una y diez de la
   madrugada, y pertenece al horario del día anterior. */
const min=h=>{const p=h.split(':'); return (+p[0])*60 + (+p[1]);};

function cargar(P){
  const porFecha={};
  for(const l of filas('calendar_dates.txt')){
    const f=l.trim().split(','); if(f.length<3||f[2]!=='1') continue;
    (porFecha[f[1]] = porFecha[f[1]] || new Set()).add(f[0]);
  }
  const LINEA={};
  for(const l of filas('routes.txt')){
    const f=l.trim().split(','); if(f.length>=4) LINEA[f[0]]=f[2];
  }
  const srvDe={}, lineaDe={};
  for(const l of filas('trips.txt')){
    const f=l.trim().split(','); if(f.length<3) continue;
    srvDe[f[2]]=f[1]; lineaDe[f[2]]=LINEA[f[0]]||f[0];
  }
  /* las paradas de cada viaje, ya en índices de parada */
  const VIAJE={};
  let actual=null, v=null;
  for(const l of filas('stop_times.txt')){
    const f=l.trim().split(','); if(f.length<5) continue;
    if(f[0]!==actual){ actual=f[0]; v=VIAJE[actual]={linea:lineaDe[actual], srv:srvDe[actual], s:[], a:[], d:[]}; }
    const s=P.idDe[f[3]]; if(s===undefined) continue;
    v.s.push(s); v.a.push(min(f[1])); v.d.push(min(f[2]));
  }
  return {porFecha, VIAJE};
}

/* ── 3 · un día concreto: los viajes que circulan ──────────────────────── */
function viajesDe(srvs, VIAJE){
  const L=[];
  for(const id in VIAJE){ const v=VIAJE[id]; if(srvs.has(v.srv) && v.s.length>1) L.push(v); }
  return L;
}

/* ── 4 · los pares con guagua DIRECTA ──────────────────────────────────── */
function directos(dia, P){
  const R={};
  for(const v of dia){
    const seq=v.s.map(s=>P.extremo[s]?P.muni[s]:null);
    const munis=[...new Set(seq)].filter(Boolean);
    if(munis.length<2) continue;
    const idx={}; seq.forEach((m,i)=>{ if(m) (idx[m]=idx[m]||[]).push(i); });
    for(const A of munis) for(const B of munis){
      if(A===B) continue;
      const lejos=P.falta[A+'|'+B]||0;
      /* la última parada de A desde la que todavía se llega a B habiendo
         hecho camino de verdad */
      let sal=-1, lle=-1;
      const ia=idx[A], ib=idx[B];
      for(let x=ia.length-1;x>=0 && sal<0;x--){
        for(const j of ib){
          if(j<=ia[x]) continue;
          if(P.dist(v.s[ia[x]], v.s[j])<lejos) continue;
          sal=ia[x]; lle=j; break;
        }
      }
      if(sal<0) continue;

      const k=A+'|'+B;
      const r=R[k] || (R[k]={n:0, ult:null, buho:null, durs:[]});
      r.n++;
      const x={dep:v.d[sal], arr:v.a[lle], linea:v.linea};
      r.durs.push(x.arr-x.dep);
      if(x.dep<RAYA){ if(!r.ult || x.dep>r.ult.dep) r.ult=x; }
      else          { if(!r.buho|| x.dep>r.buho.dep) r.buho=x; }
    }
  }
  return R;
}

/* ── 5 · los pares que necesitan CAMBIAR de guagua ──────────────────────
   Se busca hacia atrás desde el destino, que es como se contesta la pregunta
   de verdad: «¿a qué hora es lo más tarde que puedo salir de A y llegar a B?».
     · capa 0 — las salidas de cada parada de una guagua que llega SOLA a B.
     · capa k — las salidas desde las que, más adelante en ese mismo viaje,
       hay una parada donde se enlaza con algo de la capa k−1.
   Se admiten hasta DOS cambios. Uno solo no basta y se ve en el mapa: a
   Tegueste solo se llega por La Laguna, así que desde el Puerto o desde La
   Guancha hacen falta dos; con un cambio salían horas de la mañana —«la
   última guagua de La Guancha a Tegueste es la de las 06:44»— o el par
   desaparecía. Tres cambios no se ofrecen: eso ya no es volver a casa.
   De cada capa se guardan las salidas ordenadas por hora, que es lo que deja
   preguntar «¿sale algo entre 10 y 60 minutos después de que yo llegue?».  */
function conTrasbordo(dia, P, MUNIS){
  const N=P.n, fuera={};

  for(const B of MUNIS){
    /* capa 0: lo que llega solo */
    const capas=[new Array(N)];
    for(const v of dia){
      let vistoB=false;
      for(let i=v.s.length-1;i>=0;i--){
        const p=v.s[i];
        if(vistoB) (capas[0][p]=capas[0][p]||[]).push([v.d[i], v, i, -1, 0]);
        if(P.muni[p]===B && P.extremo[p]) vistoB=true;
      }
    }
    const ordena=c=>{ for(let p=0;p<N;p++) if(c[p]) c[p].sort((a,b)=>a[0]-b[0]); };
    ordena(capas[0]);

    /* ¿sale algo de esta parada —o de una a 400 m— entre 10 y 60 minutos
       después de llegar? Devuelve la más temprana que sirva. */
    const enlace=(capa,p,t)=>{
      let mejor=null;
      for(const q of P.vecinas[p]){
        const L=capa[q]; if(!L) continue;
        let lo=0, hi=L.length;
        while(lo<hi){ const m=(lo+hi)>>1; if(L[m][0]<t+ESPERA) lo=m+1; else hi=m; }
        if(lo<L.length && L[lo][0]<=t+MAXESPERA && (!mejor||L[lo][0]<mejor[0])) mejor=L[lo];
      }
      return mejor;
    };

    for(let k=1;k<=CAMBIOS;k++){
      const capa=new Array(N);
      for(const v of dia){
        let u=-1;
        for(let i=v.s.length-1;i>=0;i--){
          const p=v.s[i];
          if(u>=0) (capa[p]=capa[p]||[]).push([v.d[i], v, i, u, k]);
          if(!(P.muni[p]===B && P.extremo[p]) && enlace(capas[k-1], p, v.a[i])) u=i;
        }
      }
      ordena(capa);
      capas.push(capa);
    }

    /* de un billete a mano: se recorre el viaje y se van cogiendo enlaces */
    const arma=(e, lejos, subida)=>{
      const [dep, v, i, u, k]=e;
      if(k===0){
        let j=-1;
        for(let x=i+1;x<v.s.length;x++)
          if(P.muni[v.s[x]]===B && P.extremo[v.s[x]] && P.dist(subida, v.s[x])>=lejos){ j=x; break; }
        if(j<0) return null;
        return {dep, arr:v.a[j], lineas:[v.linea], via:[], paradas:[], esperas:[]};
      }
      const sig=enlace(capas[k-1], v.s[u], v.a[u]);
      if(!sig) return null;
      const resto=arma(sig, lejos, subida);
      if(!resto) return null;
      return {dep, arr:resto.arr, lineas:[v.linea].concat(resto.lineas),
        via:[P.muni[v.s[u]]].concat(resto.via),
        paradas:[P.nombre[v.s[u]]].concat(resto.paradas),
        esperas:[sig[0]-v.a[u]].concat(resto.esperas)};
    };

    for(const A of MUNIS){
      if(A===B) continue;
      const lejos=P.falta[A+'|'+B]||0;
      const suyas=[];
      for(let p=0;p<N;p++) if(P.muni[p]===A && P.extremo[p]) suyas.push(p);
      if(!suyas.length) continue;

      /* Todas las salidas posibles desde A, de mejor a peor. Y «mejor» no es
         «la más tardía» a secas: cada cambio de guagua cuesta 20 minutos en
         esta cuenta. Sin eso salían cosas como «la última de Candelaria a
         Güímar es la 01:15, cambiando en Barranco Hondo con 44 minutos de
         espera» habiendo una directa a la 01:00. Quince minutos más de tarde
         no valen un plantón de madrugada en un cruce. */
      const cands=[];
      for(const p of suyas) for(let k=0;k<=CAMBIOS;k++)
        for(const e of (capas[k][p]||[])) cands.push([e,p]);
      cands.sort((x,y)=> (y[0][0]-CUESTA*y[0][4]) - (x[0][0]-CUESTA*x[0][4]) || x[0][4]-y[0][4]);

      const buscar=antes=>{
        for(const [e,p] of cands){
          if(antes ? e[0]>=RAYA : e[0]<RAYA) continue;
          const r=arma(e, lejos, p);
          if(r) return r;
        }
        return null;
      };
      const ult=buscar(true), bh=buscar(false);
      if(ult||bh) fuera[A+'|'+B]={ult, buho:bh};
    }
  }
  return fuera;
}

const mediana=a=>{const b=a.slice().sort((x,y)=>x-y); return b[b.length>>1];};

/* De dos días del mismo grupo se queda LO MÁS FLOJO: la salida más temprana
   y los viajes del que menos ponga. Prometer de más deja gente tirada. */
function floja(a,b){
  if(!a) return b; if(!b) return a;
  const R={};
  for(const k in a){
    if(!b[k]) continue;              /* si un día no lo hace, no se promete */
    const x=a[k], y=b[k];
    const men=(p,q)=>(!p||!q) ? null : (p.dep<=q.dep ? p : q);
    R[k]={n:Math.min(x.n||0,y.n||0)||null, ult:men(x.ult,y.ult),
          buho:(!x.buho||!y.buho)?null:men(x.buho,y.buho),
          durs:((x.durs||[]).length<=(y.durs||[]).length?x.durs:y.durs)};
  }
  return R;
}

/* ── main ──────────────────────────────────────────────────────────────── */
function main(){
  console.log('GTFS: '+DIR+'\n');

  const P=situarParadas();
  console.log('Paradas situadas: '+P.n+' contra '+P.puntos+' puntos fichados.');
  console.log('  distancia al más cercano — mediana '+P.mediana.toFixed(2)+' km · p99 '+
    P.p99.toFixed(2)+' km · a más de 3 km: '+P.lejos);
  console.log('  paradas que valen de principio o final: '+P.extremos+
    ' (las otras solo para cambiar de guagua)');
  console.log('');

  const {porFecha, VIAJE}=cargar(P);
  console.log('Viajes en el GTFS: '+Object.keys(VIAJE).length);

  const viajesPorSrv={};
  for(const id in VIAJE) viajesPorSrv[VIAJE[id].srv]=(viajesPorSrv[VIAJE[id].srv]||0)+1;

  /* De los bordes del rango no se fía nadie: un GTFS empieza y acaba con
     servicios a medio cargar. Se quitan siete días por cada lado. */
  const todas=Object.keys(porFecha).sort();
  const dentro=todas.slice(7, todas.length-7);
  const grupo={laborable:[], sabado:[], domingo:[], festivo:[]};
  for(const f of dentro){
    const s=iso(f), dia=new Date(s+'T12:00:00').getDay();
    let v=0; porFecha[f].forEach(x=>v+=viajesPorSrv[x]||0);
    const g = c.esFestivo(s) ? 'festivo' : dia===6 ? 'sabado' : dia===0 ? 'domingo' : 'laborable';
    grupo[g].push({f, s, v});
  }
  const elegidas={};
  for(const g of ['laborable','sabado','domingo','festivo']){
    const a=grupo[g].slice().sort((x,y)=>x.v-y.v);
    if(!a.length){ console.log(g+': ninguna fecha de ese tipo en el rango'); continue; }
    elegidas[g]=a[a.length>>1];
    console.log(g.padEnd(10)+' '+a.length+' fechas · viajes de '+a[0].v+' a '+a[a.length-1].v+
      ' · se coge '+elegidas[g].s+' ('+elegidas[g].v+' viajes)');
  }
  console.log('');

  const MUNIS=[...new Set(P.muni)].filter(Boolean);
  const crudo={};
  for(const g in elegidas){
    const dia=viajesDe(porFecha[elegidas[g].f], VIAJE);
    let D=directos(dia, P);
    /* La búsqueda hacia atrás mira lo directo Y lo de un trasbordo, así que su
       respuesta nunca es peor. Y hay que hacerla SIEMPRE, no solo donde falta
       lo directo: un par con un único viaje directo a las 13:20 se quedaba con
       esa hora teniendo un enlace a las once de la noche. Es lo que pasaba con
       Arona → La Laguna. Lo que se conserva de la pasada directa son los
       viajes del día y la duración mediana, que la otra no sabe. */
    const T=conTrasbordo(dia, P, MUNIS);
    const R={};
    for(const k in T){
      const d=D[k];
      R[k]={n:d?d.n:null, durs:d?d.durs:[], ult:T[k].ult, buho:T[k].buho,
            /* la última DIRECTA, aparte: casi siempre es mejor consejo que una
               combinación que sale media hora más tarde y obliga a cambiar de
               guagua a la una y media de la mañana */
            directa:(d&&d.ult)||null};
    }
    D=R;
    crudo[g]=D;
    console.log(g.padEnd(10)+' '+dia.length+' viajes ese día · '+
      Object.keys(D).length+' pares');
  }
  console.log('');

  if(crudo.sabado&&crudo.domingo){
    const comunes=Object.keys(crudo.sabado).filter(k=>crudo.domingo[k]);
    const dif=comunes.filter(k=>{const a=crudo.sabado[k].ult,b=crudo.domingo[k].ult;
      return a&&b&&Math.abs(a.dep-b.dep)>30;}).length;
    const solo=Object.keys(crudo.sabado).filter(k=>!crudo.domingo[k]).length;
    console.log('Sábado y domingo: '+comunes.length+' pares en los dos, '+dif+
      ' con más de media hora de diferencia en la última, y '+solo+
      ' que el domingo no existen. De todos se guarda lo más flojo.\n');
  }

  const FIN={laborable:crudo.laborable, festivo:crudo.festivo,
             finde:floja(crudo.sabado, crudo.domingo)};

  const M={};
  let pares=0, conUlt=0, soloBuho=0, conBuho=0, tras=0, condir=0;
  for(const g of ['laborable','finde','festivo']){
    M[g]={};
    for(const k in FIN[g]){
      const r=FIN[g][k];
      if(!r.ult && !r.buho) continue;
      pares++;
      const base=r.ult||r.buho;
      const o={};
      if(r.ult){ conUlt++; o.ultima=r.ult.dep; o.llega=r.ult.arr; } else soloBuho++;
      o.linea=base.lineas[0];
      if(base.lineas.length>1){ tras++;
        o.lineas=base.lineas; o.via=base.via; o.paradas=base.paradas; o.esperas=base.esperas;
        o.cambios=base.lineas.length-1; }
      if(base.lineas.length>1 && r.directa && r.directa.dep<base.dep){
        condir++; o.directa=r.directa.dep; o.directa_llega=r.directa.arr; o.directa_linea=r.directa.linea; }
      if(r.buho){ conBuho++; o.buho=r.buho.dep; o.buho_linea=r.buho.lineas[0]; }
      o.dur = r.durs.length ? mediana(r.durs) : (r.ult?r.ult.arr-r.ult.dep:null);
      if(o.dur!=null && o.dur<0) o.dur=null;
      if(r.n) o.viajes=r.n;   /* con trasbordo no se cuentan: no es una línea, es una combinación */
      M[g][k]=o;
    }
  }
  console.log('Total '+pares+' pares · con última de tarde/noche: '+conUlt+
    ' · SOLO de madrugada: '+soloBuho+' · con búho además: '+conBuho+
    ' · con trasbordo: '+tras+' (y de esos, '+condir+' con una directa antes)');

  const vieja=cargarVieja();
  if(vieja) for(const g of ['laborable','finde','festivo']){
    const v=vieja[g]||{}, n=M[g]||{};
    const comunes=Object.keys(v).filter(k=>n[k]);
    let iguales=0;
    comunes.forEach(k=>{
      const b=n[k].buho!=null?n[k].buho:n[k].ultima;
      if(Math.abs(v[k].ultima-b)<=15) iguales++;
    });
    const buhos=Object.keys(v).filter(k=>v[k].ultima>=RAYA);
    const rescatados=buhos.filter(k=>n[k]&&n[k].ultima!=null);
    console.log('\n'+g+': vieja '+Object.keys(v).length+' pares, nueva '+Object.keys(n).length+
      '; '+comunes.length+' en las dos.');
    console.log('  la salida más tardía del día cuadra (±15 min) en '+iguales+'/'+comunes.length+
      ' ('+Math.round(iguales*100/comunes.length)+'%)');
    console.log('  la vieja daba MADRUGADA en '+buhos.length+' pares; ahora '+
      rescatados.length+' tienen su última de la tarde.');
    const perdidos=Object.keys(v).filter(k=>!n[k]);
    if(perdidos.length) console.log('  pares que se pierden: '+perdidos.length+
      ' — '+perdidos.slice(0,4).join(', ')+(perdidos.length>4?'…':''));
  }

  if(!ESCRIBIR){ console.log('\nEnsayo. Para escribirla:  node matriz.js '+DIR+' escribir'); return; }

  const cab='/* MATRIZ — La matriz de TITSA entre municipios, por tipo de día.\n'+
    '   La rehace `matriz.js` desde el GTFS oficial de TITSA. NO se edita a mano.\n'+
    '   Fechas de referencia: laborable '+elegidas.laborable.s+
      ', sábado '+(elegidas.sabado?elegidas.sabado.s:'—')+
      ', domingo '+(elegidas.domingo?elegidas.domingo.s:'—')+
      ', festivo '+(elegidas.festivo?elegidas.festivo.s:'—')+'.\n'+
    '   `ultima` es la última salida ANTES de la 01:30 —la que se puede\n'+
    '   planificar—; `buho` es la de madrugada, que es el servicio de noche y\n'+
    '   no vale como guagua de vuelta. `dur` es la mediana del día, no la del\n'+
    '   último viaje, que es el más rápido que hay. Minutos desde medianoche:\n'+
    '   pasan de 1440 cuando la salida es de madrugada. */\n';
  fs.writeFileSync(path.join(RAIZ,'datos/titsa-matriz.js'), cab+'const MATRIZ='+JSON.stringify(M)+';\n');
  console.log('\nEscrita datos/titsa-matriz.js ('+
    Math.round(fs.statSync(path.join(RAIZ,'datos/titsa-matriz.js')).size/1024)+' KB)');
}

function cargarVieja(){
  try{
    const t=fs.readFileSync(path.join(RAIZ,'datos/titsa-matriz.js'),'utf8');
    return JSON.parse(t.slice(t.indexOf('{', t.indexOf('MATRIZ')), t.lastIndexOf('}')+1));
  }catch(e){ return null; }
}

main();

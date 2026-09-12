/* municipios.js — cruza el municipio de cada ficha contra los itinerarios
   oficiales del Cabildo, y canta los que no cuadran.

   POR QUÉ EXISTE. Lo cazó Zeben mirando un aviso: «Teleférico del Teide,
   Roques de García y Montaña de Guajara NO PERTENECEN A VILAFLOR, pertenecen a
   LA OROTAVA». Y tenía razón. Lo grave no era el aviso: era que el campo `m`
   estaba mal en la ficha, y `m` decide de qué pueblo cuelga un sitio en TODAS
   partes —la cuadrícula del mapa, el ancla del día, el filtro de restaurantes,
   la estampa de respaldo—. Un municipio mal puesto es un fallo que se reparte.

   POR QUÉ NO SE PUEDE HACER CON UN RADIO. Lo primero que probé fue mirar a qué
   casco cae más cerca cada ficha, que es la regla que se usó con los miradores.
   Aquí NO sirve: las 21 fichas de la cumbre dan Vilaflor, porque Vilaflor es el
   pueblo más cercano a Las Cañadas desde el sur, y aun así media docena son de
   La Orotava. Es la trampa de siempre un piso más abajo: **la línea recta no
   sabe por dónde va la raya del término**.

   LO QUE SÍ SIRVE. `datos/senderos-tenerife.js` son los 225 itinerarios del
   Cabildo y traen `municipios` oficial. De cada uno se usan sus tres puntos
   —cabecera, medio y final— y **solo los que nombran UN municipio**: un
   itinerario de un solo término está entero dentro de ese término, así que
   cualquiera de sus puntos vale como testigo. Una ficha a cincuenta metros de
   uno de esos puntos está en ese municipio.

       node municipios.js              ensayo: la lista con su prueba
       node municipios.js 300          lo mismo, cambiando el radio en metros
       node municipios.js meter        escribe los de menos de 150 m
       node municipios.js meter 300    escribe los de menos de ese radio
       node municipios.js meter "Roques de García" "Pico Teide"
                                       escribe SOLO los que se nombren
       node municipios.js lista        escribe municipios-dudosos.md, con una
                                       casilla en cada uno, para que los mire
                                       quien vive allí
       node municipios.js meter municipios-dudosos.md
                                       escribe los que vengan marcados

   **No escribe nada sin que se lo pidan**, que es la regla de la casa con todo
   lo que toca el catálogo: lista y espera. Y el nombre de la ficha tiene que
   ser exacto, que hay pares como «Ermita de San Roque» y «Ermita de San Roque
   (Vilaflor)» y equivocarse ahí cambia la que no era.

   Y POR QUÉ HAY UN FICHERO CON CASILLAS. Porque esto no lo decide una medición:
   lo decide quien vive allí. El Cabildo acierta casi siempre, pero un punto a
   doscientos metros de la raya del término puede caer de los dos lados, y una
   ficha cambiada de pueblo mueve el día entero. Es el mismo camino que
   `actos-parecidos.md`: la herramienta agrupa, enseña la prueba y espera.
*/
const fs=require('fs'), path=require('path');
const RAIZ=__dirname;
const c=require(path.join(RAIZ,'banco.js'));
const {LUGARES,BASES,km}=c;

/* El Cabildo escribe «Vilaflor» y nosotros «Vilaflor de Chasna»; «OROTAVA (LA)»
   también aparece por ahí. Se compara sin acentos ni artículos, que es lo que
   ya funcionó con el padrón y con el registro de hostelería. */
const norm=s=>String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')
  .replace(/\b(de|del|la|las|los|el)\b/g,' ').replace(/[^a-z]/g,'');

function testigos(){
  const TF=new Function(fs.readFileSync(path.join(RAIZ,'datos/senderos-tenerife.js'),'utf8')
    +';return SENDEROS_TF;')();
  const oficial={}; Object.values(BASES).forEach(b=>oficial[norm(b.m)]=b.m);
  const P=[];
  let compartidos=0;
  TF.forEach(s=>{
    const ms=String(s.municipios||'').split('|').map(x=>x.trim()).filter(Boolean);
    /* Un itinerario que cruza dos términos no dice dónde está ninguno de sus
       puntos, así que no vale de testigo. Son los menos. */
    if(ms.length!==1){ compartidos++; return; }
    const m=oficial[norm(ms[0])]; if(!m) return;
    [[s.lat,s.lng],[s.lat_medio,s.lng_medio],[s.lat_fin,s.lng_fin]].forEach(([la,lo])=>{
      if(la!=null&&lo!=null) P.push({la:+la,lo:+lo,m,n:s.nombre});
    });
  });
  return {P, itinerarios:TF.length, compartidos};
}

function discrepancias(P){
  const R=[];
  LUGARES.filter(l=>l.la!=null).forEach(l=>{
    let d=1e9,q=null;
    for(const p of P){ const x=km(l.la,l.lo,p.la,p.lo); if(x<d){ d=x; q=p; } }
    if(q&&q.m!==l.m) R.push({n:l.n, dice:l.m, es:q.m, metros:Math.round(d*1000), por:q.n});
  });
  return R.sort((a,b)=>a.metros-b.metros);
}

function escribir(cambios){
  const f=path.join(RAIZ,'datos/lugares.js');
  let txt=fs.readFileSync(f,'utf8');
  const hechos=[], fallan=[];
  for(const x of cambios){
    /* Se busca la ficha por su nombre EXACTO y se cambia solo su `m`. Si el
       nombre sale dos veces, no se toca: cambiar la que no era es peor que
       dejarlo. */
    const nom=x.n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    const re=new RegExp('("n"\\s*:\\s*"'+nom+'"[^}]*?"m"\\s*:\\s*")([^"]+)(")','g');
    const cuantos=(txt.match(re)||[]).length;
    if(cuantos!==1){ fallan.push(x.n+' (sale '+cuantos+' veces con ese patrón)'); continue; }
    txt=txt.replace(re,'$1'+x.es+'$3');
    /* Y la comarca con él. `co` es lo que agrupa en el paso 2 y lo que mira
       `queApeteceEn` por detrás: dejarla en el municipio viejo haría que la
       ficha siguiera saliendo en el pueblo equivocado aunque `m` ya estuviera
       bien. Solo se mueve cuando `co` ERA el municipio: las comarcas que no son
       un municipio —«Anaga norte — Taganana y Benijo»— se quedan como están,
       que esas no dependen del término. */
    const reCo=new RegExp('("n"\\s*:\\s*"'+nom+'"[^}]*?"co"\\s*:\\s*")'+
      x.dice.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(")','g');
    if((txt.match(reCo)||[]).length===1){ txt=txt.replace(reCo,'$1'+x.es+'$2'); x.coTambien=true; }
    hechos.push(x);
  }
  if(hechos.length) fs.writeFileSync(f,txt);
  return {hechos,fallan};
}

/* La lista para que la mire él, agrupada por hacia dónde se mueve la ficha:
   los nidos —Anaga entero a Santa Cruz, las Cañadas a La Orotava— se leen de
   una vez y se marcan de una vez, que mirarlos sueltos y por orden de metros
   obliga a reconstruir el mapa en la cabeza treinta veces. */
function escribirLista(dentro,radio){
  const por={};
  dentro.forEach(x=>{ const k=x.dice+' → '+x.es; (por[k]=por[k]||[]).push(x); });
  const grupos=Object.entries(por).sort((a,b)=>b[1].length-a[1].length);
  let t='# Municipios en duda contra el Cabildo\n\n'+
    'Cada ficha dice un municipio y los itinerarios oficiales del Cabildo dicen\n'+
    'otro, con un punto suyo a menos de '+radio+' metros. **Marca con una equis\n'+
    'las que haya que cambiar** y luego:\n\n'+
    '    node municipios.js meter municipios-dudosos.md\n\n'+
    'Lo que no se marque se queda como está. Marcar de más es peor que no\n'+
    'marcar: un municipio mal puesto mueve el pueblo del que cuelga el sitio, el\n'+
    'ancla del día y la lista de restaurantes.\n\n';
  grupos.forEach(([k,xs])=>{
    t+='## '+k+'  ('+xs.length+')\n\n';
    xs.sort((a,b)=>a.metros-b.metros).forEach(x=>{
      t+='- [ ] **'+x.n+'** — a '+x.metros+' m del itinerario «'+x.por+'», que el\n'+
         '      Cabildo da entero en '+x.es+'\n';
    });
    t+='\n';
  });
  fs.writeFileSync(path.join(RAIZ,'municipios-dudosos.md'),t);
  return grupos.length;
}

/* Se leen los nombres marcados. La casilla vale con equis mayúscula o
   minúscula; el nombre va en negrita y es lo único que se busca. */
function leerLista(f){
  return fs.readFileSync(f,'utf8').split('\n')
    .filter(l=>/^-\s*\[[xX]\]/.test(l))
    .map(l=>(l.match(/\*\*(.+?)\*\*/)||[])[1]).filter(Boolean);
}

function main(){
  const args=process.argv.slice(2);
  const meter=args.includes('meter');
  const soloLista=args.includes('lista');
  let resto=args.filter(a=>a!=='meter'&&a!=='lista');
  let marcados=null;
  const md=resto.find(a=>/\.md$/.test(a));
  if(md){
    if(!fs.existsSync(md)){ console.log('No existe '+md); return; }
    marcados=leerLista(md);
    resto=resto.filter(a=>a!==md);
    if(!marcados.length){ console.log('En '+md+' no hay ninguna marcada. No se toca nada.'); return; }
  }
  const radio=resto.length&&/^\d+$/.test(resto[0]) ? +resto.shift()
    : (marcados?1e9:(meter?150:1000));
  const nombres=marcados||resto;

  const {P,itinerarios,compartidos}=testigos();
  console.log('Itinerarios del Cabildo: '+itinerarios+' · con UN municipio: '+
    (itinerarios-compartidos)+' · puntos testigo: '+P.length+'\n');

  const todas=discrepancias(P);
  const dentro=todas.filter(x=>x.metros<=radio);
  console.log('Fichas con coordenada: '+LUGARES.filter(l=>l.la!=null).length+
    ' · el Cabildo discrepa en '+todas.length+' · a menos de '+radio+' m: '+dentro.length+'\n');

  if(soloLista){
    const g=escribirLista(dentro,radio);
    console.log('municipios-dudosos.md · '+dentro.length+' fichas en '+g+' grupos.');
    console.log('Se marcan con una equis y se meten con:  node municipios.js meter municipios-dudosos.md');
    return;
  }
  const elegidas = nombres.length ? dentro.filter(x=>nombres.includes(x.n)) : dentro;
  if(nombres.length){
    const sin=nombres.filter(n=>!elegidas.some(x=>x.n===n));
    if(sin.length) console.log('Ojo, estas no salen en la lista: '+sin.join(', ')+'\n');
  }

  elegidas.forEach(x=>console.log('  '+String(x.metros).padStart(4)+' m  '+
    x.n.slice(0,38).padEnd(40)+x.dice+' → '+x.es+'\n'+' '.repeat(48)+'testigo: '+x.por));

  if(!meter){
    console.log('\nEnsayo: no se ha tocado nada. Para escribirlo:  node municipios.js meter '+radio);
    return;
  }
  const {hechos,fallan}=escribir(elegidas);
  console.log('\nCambiadas '+hechos.length+' fichas en datos/lugares.js'+
    ' (y la comarca en '+hechos.filter(x=>x.coTambien).length+')');
  if(fallan.length) console.log('SIN TOCAR (el nombre no es único): \n  '+fallan.join('\n  '));
}

main();

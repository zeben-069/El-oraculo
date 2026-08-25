/* fotos.js — para poner fotos a los sitios con el menor trabajo posible.
   ------------------------------------------------------------------
   La ficha de cada parada ya enseña algo: si el sitio no tiene foto,
   marco() pone una ortofoto aérea de GRAFCAN. Para una playa o un charco
   se defiende; para un museo o una iglesia es un tejado. Así que no hacen
   falta 589 fotos: hacen falta pocas y bien elegidas.

       node fotos.js                 la lista de qué fotografiar, por pueblo
       node fotos.js entrada/        mete las fotos de esa carpeta

   Al meterlas: recorta al cuadrado por el centro, deja 240 px, comprime,
   las guarda en img/sitios/ y le añade el campo "foto" a la ficha. Los
   ficheros se emparejan por el nombre, sin acentos ni mayúsculas, así que
   basta con llamarlos parecido al sitio: "drago milenario.jpg".
   Hace falta Playwright, el mismo que usa probar-web.js. */
const fs=require('fs'), path=require('path');
const c=require('./banco.js');
const {construir,S,LUGARES,BASES}=c;

const norm=s=>String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')
  .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
/* donde el aéreo no cuenta nada */
const AEREO_MAL=/Museo|Iglesia|Casco|Edificio|Escultura|Mercado|Bodega|Quesería|Castillo|Patrimonio|Plaza|Caserío|Transporte|Faro/;

function ranking(){
  const cuenta=new Map(); let planes=0;
  const fechas=['2026-10-06','2026-09-15','2026-11-08','2027-03-10'];
  Object.keys(BASES).forEach(base=>{
   [true,false].forEach(coche=>{
    [[2,false],[4,true],[6,false]].forEach(([gente,ninos])=>{
     [null,'agua','naturaleza','museos'].forEach((apetece,k)=>{
      Object.assign(S,{base,coche,ninos,gente,apetece,comida:null,anclaElegida:null,ahora:null,
        saltoComida:0,descartados:null,prefTipo:null,fecha:fechas[(planes+k)%fechas.length],
        idioma:'es',_yaVistos:null,_yaComido:null});
      let b; try{ b=construir().brief; }catch(e){ return; }
      planes++;
      (b.paradas||[]).forEach(p=>cuenta.set(p.nombre,(cuenta.get(p.nombre)||0)+1));
     });
    });
   });
  });
  return [...cuenta.entries()].sort((a,b)=>b[1]-a[1]);
}

function lista(){
  const orden=ranking();
  const falta=orden.map(([n,v])=>({l:LUGARES.find(x=>x.n===n)||{},n,v}))
    .filter(x=>x.l.n&&!x.l.foto);
  const prio=falta.filter(x=>AEREO_MAL.test(x.l.tipo||''));
  const porPueblo={};
  prio.slice(0,60).forEach(x=>{ (porPueblo[x.l.m]=porPueblo[x.l.m]||[]).push(x); });
  const lineas=[];
  lineas.push('# Fotos que más se notarían');
  lineas.push('');
  lineas.push('Sacado de un barrido de 744 planes. Estos son los sitios que MÁS salen');
  lineas.push('y en los que la foto aérea no cuenta nada (museos, iglesias, cascos).');
  lineas.push('Están agrupados por pueblo, para hacerlos de una tirada.');
  lineas.push('');
  lineas.push('Formato: llame al fichero como el sitio y suéltelo en una carpeta.');
  lineas.push('Luego: `node fotos.js esa-carpeta/`');
  lineas.push('');
  Object.keys(porPueblo).sort((a,b)=>porPueblo[b].length-porPueblo[a].length).forEach(m=>{
    lineas.push('## '+m+'  ('+porPueblo[m].length+')');
    porPueblo[m].forEach(x=>lineas.push('- [ ] '+x.n+'  · '+(x.l.tipo||'')+'  · sale en '+x.v+' planes'));
    lineas.push('');
  });
  fs.writeFileSync('fotos-pendientes.md',lineas.join('\n'));
  console.log('sitios que salen en algún plan y no tienen foto: '+falta.length);
  console.log('   de esos, con el aéreo inútil: '+prio.length);
  console.log('\nescrito fotos-pendientes.md con los 60 primeros, agrupados por pueblo.');
  console.log('Con las 40 primeras se arregla el 82% de esas paradas.');
}

async function meter(dir){
  const {chromium}=require('playwright');
  const ficheros=fs.readdirSync(dir).filter(f=>/\.(jpe?g|png|webp)$/i.test(f));
  if(!ficheros.length) return console.log('no hay imágenes en '+dir);
  fs.mkdirSync('img/sitios',{recursive:true});
  const nav=await chromium.launch(); const pag=await nav.newPage();
  let puestas=0; const sinPareja=[], ambiguos=[];
  let html=fs.readFileSync('index.html','utf8');
  /* Si vienen de Commons, cada foto trae autor y licencia: hay que citarlos,
     así que el crédito entra en la ficha junto a la foto. Las fotos propias
     no llevan crédito y no pasa nada. */
  let creditos={};
  const fc=path.join(dir,'creditos.json');
  if(fs.existsSync(fc)){ try{ creditos=JSON.parse(fs.readFileSync(fc,'utf8')); }catch(e){} }
  for(const f of ficheros){
    const clave=norm(path.basename(f).replace(/\.[a-z]+$/i,''));
    let cand=LUGARES.filter(l=>norm(l.n)===clave);
    if(!cand.length) cand=LUGARES.filter(l=>norm(l.n).includes(clave)||clave.includes(norm(l.n)));
    if(!cand.length){ sinPareja.push(f); continue; }
    if(cand.length>1){ ambiguos.push(f+' → '+cand.map(x=>x.n).join(' / ')); continue; }
    const l=cand[0], slug=norm(l.n);
    const b64='data:image/'+(/\.png$/i.test(f)?'png':'jpeg')+';base64,'+fs.readFileSync(path.join(dir,f)).toString('base64');
    const jpg=await pag.evaluate(async ([src,LADO])=>{
      const im=await new Promise(res=>{const i=new Image();i.onload=()=>res(i);i.src=src;});
      const lado=Math.min(im.width,im.height);
      const cv=document.createElement('canvas'); cv.width=LADO; cv.height=LADO;
      const x=cv.getContext('2d'); x.imageSmoothingQuality='high';
      x.drawImage(im,(im.width-lado)/2,(im.height-lado)/2,lado,lado,0,0,LADO,LADO);
      return cv.toDataURL('image/jpeg',0.82);
    },[b64,240]);
    fs.writeFileSync('img/sitios/'+slug+'.jpg',Buffer.from(jpg.split(',')[1],'base64'));
    /* se le añade el campo a la ficha, sin tocar nada más del fichero */
    const ancla='{"n":'+JSON.stringify(l.n)+',';
    if(html.split(ancla).length-1!==1){ console.log('OJO, no puedo situar la ficha de '+l.n); continue; }
    const cr=creditos[l.n];
    const campoCr=cr?'"credito":'+JSON.stringify((cr.autor||'')+' · '+(cr.licencia||'')+' · '+(cr.fuente||''))+',':'';
    html=html.replace(ancla, ancla+'"foto":"img/sitios/'+slug+'.jpg",'+campoCr);
    puestas++;
    console.log('  ✓ '+f.padEnd(38)+'→ '+l.n);
  }
  await nav.close();
  if(puestas){
    fs.writeFileSync('index.html',html);
    console.log('\n'+puestas+' fotos puestas. Pasa ahora: node lote.js');
  }
  if(sinPareja.length) console.log('\nsin pareja (renómbralos como el sitio): '+sinPareja.join(', '));
  if(ambiguos.length) console.log('\nambiguos (afina el nombre):\n   '+ambiguos.join('\n   '));
}

const arg=process.argv[2];
if(!arg) lista(); else meter(arg).catch(e=>{console.error(e.message);process.exit(1)});

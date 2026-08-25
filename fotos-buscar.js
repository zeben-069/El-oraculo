/* fotos-buscar.js — busca candidatas en Wikimedia Commons.
   ------------------------------------------------------------------
   ESTO SE EJECUTA EN TU MÁQUINA, no donde yo trabajo: desde ahí no tengo
   salida a internet. Solo necesita Node, sin instalar nada.

       node fotos-buscar.js            las 40 primeras de la lista
       node fotos-buscar.js 15         solo las 15 primeras

   Deja las fotos en entrada/ con el nombre del sitio, guarda quién es el
   autor y con qué licencia en entrada/creditos.json, y escribe revisar.html
   para que las mires todas de un vistazo. Borra las que no sean el sitio
   —que alguna se colará— y luego:

       node fotos.js entrada/

   OJO con la licencia: Commons es libre pero casi todo pide citar al autor.
   Por eso se guarda el crédito y la ficha lo enseña. Si una foto no trae
   autor claro, se descarta sola. */
const fs=require('fs'), path=require('path');
/* OJO: banco.js sustituye fetch por un tapón que siempre falla —el motor se
   prueba sin red a propósito—, así que hay que guardarse el de verdad ANTES
   de cargarlo. Sin esto, el buscador dice «sin red» en cada sitio. */
const fetchReal=globalThis.fetch.bind(globalThis);
const c=require('./banco.js');
const {construir,S,LUGARES,BASES}=c;
/* se puede apuntar a otra dirección para probar sin tocar Commons */
const API=process.env.COMMONS_API||'https://commons.wikimedia.org/w/api.php';
const UA='Naira/1.0 (guia de Tenerife; contacto: zeben069@gmail.com)';
const norm=s=>String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')
  .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const AEREO_MAL=/Museo|Iglesia|Casco|Edificio|Escultura|Mercado|Bodega|Quesería|Castillo|Patrimonio|Plaza|Caserío|Transporte|Faro/;

function pendientes(){
  const cuenta=new Map(); let n=0;
  const fechas=['2026-10-06','2026-09-15','2026-11-08','2027-03-10'];
  Object.keys(BASES).forEach(base=>{
   [true,false].forEach(coche=>{
    [[2,false],[4,true],[6,false]].forEach(([gente,ninos])=>{
     [null,'agua','naturaleza','museos'].forEach((apetece,k)=>{
      Object.assign(S,{base,coche,ninos,gente,apetece,comida:null,anclaElegida:null,ahora:null,
        saltoComida:0,descartados:null,prefTipo:null,fecha:fechas[(n+k)%fechas.length],
        idioma:'es',_yaVistos:null,_yaComido:null});
      let b; try{ b=construir().brief; }catch(e){ return; }
      n++;
      (b.paradas||[]).forEach(p=>cuenta.set(p.nombre,(cuenta.get(p.nombre)||0)+1));
     });});});});
  return [...cuenta.entries()].sort((a,b)=>b[1]-a[1])
    .map(([nom,v])=>({l:LUGARES.find(x=>x.n===nom)||{},v}))
    .filter(x=>x.l.n&&!x.l.foto&&AEREO_MAL.test(x.l.tipo||''));
}

const pide=async u=>{
  const r=await fetchReal(u,{headers:{'User-Agent':UA,'Accept':'application/json'}});
  if(!r.ok) throw new Error('la API contestó '+r.status);
  return r.json();
};

async function candidatas(lugar){
  /* se busca por nombre y municipio, y solo entre ficheros de imagen */
  const q=encodeURIComponent(lugar.n+' '+lugar.m+' Tenerife');
  const u=API+'?action=query&format=json&origin=*&generator=search&gsrnamespace=6'+
          '&gsrsearch='+q+'&gsrlimit=4&prop=imageinfo&iiprop=url|extmetadata'+
          '&iiurlwidth=800&iiextmetadatafilter=Artist|LicenseShortName|ImageDescription';
  const j=await pide(u);
  const paginas=(j.query&&j.query.pages)?Object.values(j.query.pages):[];
  return paginas.map(p=>{
    const ii=(p.imageinfo||[])[0]; if(!ii) return null;
    const m=ii.extmetadata||{};
    const autor=(m.Artist&&m.Artist.value||'').replace(/<[^>]*>/g,'').trim();
    const lic=(m.LicenseShortName&&m.LicenseShortName.value||'').trim();
    if(!autor||!lic) return null;              /* sin crédito claro, fuera */
    if(/^\s*$/.test(ii.thumburl||'')) return null;
    return {titulo:p.title, url:ii.thumburl||ii.url, pagina:ii.descriptionurl,
            autor, licencia:lic};
  }).filter(Boolean);
}

(async()=>{
  const cuantas=parseInt(process.argv[2]||'40',10);
  const lista=pendientes().slice(0,cuantas);
  fs.mkdirSync('entrada',{recursive:true});
  const creditos={}, filas=[]; let bajadas=0, sinNada=[];
  console.log('buscando candidatas para '+lista.length+' sitios…\n');
  for(const {l,v} of lista){
    let cand=[];
    try{ cand=await candidatas(l); }
    catch(e){ console.log('  ✗ '+l.n+' — '+e.message); continue; }
    if(!cand.length){ sinNada.push(l.n); console.log('  — '+l.n.slice(0,42).padEnd(44)+'sin candidatas con autor'); continue; }
    const elegida=cand[0];
    try{
      const r=await fetchReal(elegida.url,{headers:{'User-Agent':UA}});
      if(!r.ok) throw new Error('descarga '+r.status);
      const buf=Buffer.from(await r.arrayBuffer());
      const f='entrada/'+l.n.replace(/[\/\\:]/g,' ')+'.jpg';
      fs.writeFileSync(f,buf);
      creditos[l.n]={autor:elegida.autor,licencia:elegida.licencia,
                     fuente:'Wikimedia Commons',pagina:elegida.pagina};
      filas.push({n:l.n,f,v,autor:elegida.autor,lic:elegida.licencia,pagina:elegida.pagina});
      bajadas++;
      console.log('  ✓ '+l.n.slice(0,42).padEnd(44)+elegida.autor.slice(0,28)+'  ['+elegida.licencia+']');
    }catch(e){ console.log('  ✗ '+l.n+' — '+e.message); }
    await new Promise(r=>setTimeout(r,350));   /* sin agobiar a Commons */
  }
  fs.writeFileSync('entrada/creditos.json',JSON.stringify(creditos,null,1));
  const html='<!doctype html><meta charset="utf-8"><title>Revisar fotos</title>'+
    '<style>body{font-family:system-ui;background:#FBF5E9;color:#3E2B1C;margin:18px}'+
    'h1{font-size:20px}.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:14px}'+
    'figure{margin:0;background:#fff;border:1.5px solid #3E2B1C;border-radius:12px;overflow:hidden}'+
    'img{width:100%;height:170px;object-fit:cover;display:block}'+
    'figcaption{padding:8px 9px;font-size:12px;line-height:1.35}'+
    'b{display:block;font-size:13px}a{color:#A93B2B}</style>'+
    '<h1>'+bajadas+' fotos por revisar</h1><p>Si alguna no es el sitio, borra su fichero de <code>entrada/</code> y ya está. Luego: <code>node fotos.js entrada/</code></p><div class="g">'+
    filas.map(x=>'<figure><img src="'+x.f+'" loading="lazy"><figcaption><b>'+x.n+'</b>'+
      'sale en '+x.v+' planes<br>'+x.autor+' · '+x.lic+'<br><a href="'+x.pagina+'" target="_blank">ver en Commons</a>'+
      '<br><code>'+x.f+'</code></figcaption></figure>').join('')+'</div>';
  fs.writeFileSync('revisar.html',html);
  console.log('\n'+bajadas+' fotos en entrada/ · créditos en entrada/creditos.json');
  if(sinNada.length) console.log('sin candidata: '+sinNada.length+' ('+sinNada.slice(0,4).join(', ')+(sinNada.length>4?'…':'')+')');
  console.log('\nAbre revisar.html, borra las que no sean el sitio, y luego:  node fotos.js entrada/');
})();

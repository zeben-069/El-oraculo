const c=require('./banco.js');
const {construir,S,km,BASES}=c;
function probar(nombre,cfg){
  Object.assign(S,{base:null,coche:null,gente:null,anclaElegida:null,comida:null,
    apetece:null,ahora:null,ninos:false,saltoComida:0,descartados:null,prefTipo:null,
    fecha:'2026-09-15',idioma:'es'},cfg);
  let r;
  try{ r=construir(); }catch(e){ return console.log(nombre+' -> ERROR: '+e.message.slice(0,90)); }
  const b=r.brief;
  const base=BASES[S.base];
  console.log('\n### '+nombre);
  (b.paradas||[]).forEach(p=>{
    const l=c.LUGARES.find(x=>x.n===p.nombre)||{};
    const d=l.la!=null?km(base.la,base.lo,l.la,l.lo).toFixed(1)+' km':'—';
    console.log('   '+String(p.franja).padEnd(10)+String(d).padStart(8)+'  '+p.nombre.slice(0,42)+(l.recinto?'  [RECINTO]':''));
  });
  if(b.restaurante){
    const r2=c.REST.find(x=>x.n===b.restaurante.nombre)||{};
    const prim=(b.paradas||[]).map(p=>c.LUGARES.find(x=>x.n===p.nombre)).filter(x=>x&&x.la!=null)[0];
    const dv=prim&&r2.la!=null?km(prim.la,prim.lo,r2.la,r2.lo).toFixed(1)+' km de la 1ª parada':'—';
    console.log('   COMER              '+b.restaurante.nombre.slice(0,36)+'  ('+dv+')');
  } else console.log('   COMER              — ninguno');
  if(b.o_si_prefieren_un_recinto) console.log('   alternativa        '+b.o_si_prefieren_un_recinto.nombre);
}
probar('Tegueste · coche · niños · playa',{base:'Tegueste',coche:true,ninos:true,gente:4,apetece:'agua'});
probar('Tegueste · coche · sin niños',{base:'Tegueste',coche:true,gente:2});
probar('Tegueste · SIN coche',{base:'Tegueste',coche:false,gente:2});
probar('Adeje · coche · playa',{base:'Adeje',coche:true,gente:2,apetece:'agua'});
probar('Vilaflor · coche',{base:'Vilaflor de Chasna',coche:true,gente:2});

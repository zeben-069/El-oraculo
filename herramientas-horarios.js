/* ¿Dice el texto del horario lo mismo que el array de días abiertos?
   ab[] va con 0 = domingo, como getDay(). */
const c=require('./banco.js');
const DIA={dom:0,lun:1,mar:2,mie:3,jue:4,vie:5,sab:6};
const norm=s=>s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
function cerradosSegunTexto(h){
  const t=norm(h), fuera=new Set();
  const N={domingo:0,lunes:1,martes:2,miercoles:3,jueves:4,viernes:5,sabado:6};
  const L={l:1,m:2,x:3,j:4,v:5,s:6,d:0};
  const nom='(domingo|lunes|martes|miercoles|jueves|viernes|sabado)';
  /* rangos: «de miercoles a viernes cerrado», «cierra de martes a jueves» */
  const rango=new RegExp('(?:cierra\\s+)?de\\s+'+nom+'\\s+a\\s+'+nom+'[^.]{0,14}?cerrad|cierra\\s+de\\s+'+nom+'\\s+a\\s+'+nom,'g');
  let m;
  while((m=rango.exec(t))){
    const a=N[m[1]||m[3]], b=N[m[2]||m[4]];
    if(a==null||b==null) continue;
    for(let d=a;;d=(d+1)%7){ fuera.add(d); if(d===b) break; }
  }
  /* listas: «cierra martes, miercoles y jueves» */
  const lista=t.match(new RegExp('(?:cierra|cerrad[oa]s?)\\s+(?:los\\s+)?((?:'+nom+'(?:\\s*,\\s*|\\s+y\\s+)?)+)'));
  if(lista) (lista[1].match(new RegExp(nom,'g'))||[]).forEach(x=>fuera.add(N[x]));
  /* sueltos: «martes cerrado», «cerrado los lunes» */
  Object.entries(N).forEach(([n,i])=>{
    if(new RegExp('(cerrad[oa]s?\\s+(los\\s+)?'+n+'|'+n+'\\s+(y\\s+\\w+\\s+)?cerrad|cierra\\s+(los\\s+)?'+n+')').test(t)) fuera.add(i);
  });
  /* letras: «L y D cerrado» */
  const ml=t.match(/\b((?:[lmxjvsd]\s*(?:y|,|\/)\s*)*[lmxjvsd])\s*cerrad/);
  if(ml) (ml[1].match(/[lmxjvsd]/g)||[]).forEach(x=>fuera.add(L[x]));
  return fuera;
}
let revisados=0, choques=[];
c.REST.forEach(r=>{
  if(!r.h||!r.ab) return;
  const dice=cerradosSegunTexto(r.h);
  if(!dice.size) return;
  revisados++;
  const abiertosPeroDiceCerrado=[...dice].filter(i=>r.ab[i]);
  const cerradosSinDecirlo=r.ab.map((v,i)=>[v,i]).filter(([v,i])=>!v&&!dice.has(i)).map(([v,i])=>i);
  if(abiertosPeroDiceCerrado.length||cerradosSinDecirlo.length)
    choques.push({n:r.n,m:r.m,h:r.h,ab:r.ab.join(''),
      dice:[...dice].join(','),abre:abiertosPeroDiceCerrado.join(','),calla:cerradosSinDecirlo.join(',')});
});
console.log('restaurantes cuyo texto menciona días cerrados: '+revisados);
console.log('con contradicción entre el texto y los días: '+choques.length);
choques.slice(0,12).forEach(x=>{
  console.log('\n   '+x.n+'  ('+x.m+')');
  console.log('      texto : "'+x.h.slice(0,86)+'"');
  console.log('      ab    : '+x.ab+'   (0=dom)');
  if(x.abre) console.log('      DICE cerrado pero figura ABIERTO el día: '+x.abre);
  if(x.calla) console.log('      figura CERRADO y el texto no lo dice: '+x.calla);
});

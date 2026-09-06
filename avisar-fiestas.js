/* avisar-fiestas.js — el aviso de «búscate el programa, que ya llega».
   ------------------------------------------------------------------
   Las 148 fiestas del calendario se repiten casi en las mismas fechas todos
   los años, pero el PROGRAMA —los cuarenta actos: la feria infantil, la
   verbena, los fuegos— lo publica cada ayuntamiento unos días antes y hay que
   ir a buscarlo. Eso es lo que se olvida: llega el Cristo, la web tiene el
   programa colgado, y Naira sigue con la fiesta en una línea.

   Esto mira dos cosas y las cruza: qué fiestas vienen en los próximos días
   (EVENTOS) y de cuáles ya tenemos el programa cargado (ACTOS). Lo que falte,
   lo canta. Sin red, sin API, sin depender de que ninguna web siga viva.

       node avisar-fiestas.js            las de los próximos 21 días
       node avisar-fiestas.js 45         las de los próximos 45 días
       node avisar-fiestas.js --md       lo mismo, en markdown, para el aviso

   El aviso semanal por correo lo manda .github/workflows/aviso-fiestas.yml,
   que ejecuta esto y abre un asunto en GitHub si hay algo. GitHub le manda el
   correo a Zeben: eso es el «avísame a mí» sin montar un servidor.            */
const fs=require('fs');

const lee=(f,cte)=>{ try{ return eval(fs.readFileSync(f,'utf8')+';'+cte); }catch(e){ return []; } };
const EVENTOS=lee('datos/eventos.js','EVENTOS');
const ACTOS=lee('datos/actos.js','ACTOS');

const md=process.argv.includes('--md');
const dias=+(process.argv.find(a=>/^\d+$/.test(a))||21);

const hoy=new Date(); hoy.setHours(12,0,0,0);
const iso=d=>d.toISOString().slice(0,10);
const faltan=f=>Math.round((new Date(f+'T12:00:00')-hoy)/864e5);

/* Una fiesta tiene programa si hay actos de su municipio por esos días. El
   margen es ancho a propósito: unas fiestas de pueblo duran tres semanas y el
   día grande cae en medio, así que los actos de la víspera y de la semana de
   después cuentan igual. */
const MARGEN=12;
const tienePrograma=e=>ACTOS.some(a=>a.m===e.m&&Math.abs(faltan(a.f)-faltan(e.f))<=MARGEN);

/* Varias líneas de EVENTOS son la MISMA fiesta —«Fiesta del Santísimo Cristo»
   y «Fuegos del Cristo» caen el mismo día en el mismo pueblo—: se avisa una
   vez por pueblo y por semana, que si no el correo son treinta líneas. */
const grupos={};
EVENTOS.filter(e=>{const d=faltan(e.f); return d>=0&&d<=dias;})
  .filter(e=>!tienePrograma(e))
  .sort((a,b)=>a.f<b.f?-1:1)
  .forEach(e=>{
    const k=e.m+'·'+Math.floor(faltan(e.f)/7);
    if(!grupos[k]) grupos[k]={m:e.m,f:e.f,d:faltan(e.f),nombres:[],gorda:false};
    const g=grupos[k];
    if(g.nombres.length<3) g.nombres.push(e.n);
    if(e.d||e.ma==='Muy alta') g.gorda=true;
    if(e.f<g.f){ g.f=e.f; g.d=faltan(e.f); }
  });
const lista=Object.values(grupos).sort((a,b)=>a.d-b.d);

if(md){
  if(!lista.length) process.exit(0);        /* sin nada que decir, no se avisa */
  console.log('Estas fiestas llegan en menos de '+dias+' días y Naira **no tiene su programa**.');
  console.log('El programa es lo que le deja decir a una familia con niños dónde está la feria');
  console.log('infantil y a dos adultos dónde la verbena.\n');
  lista.forEach(g=>console.log('- '+(g.gorda?'**':'')+g.m+(g.gorda?'**':'')+
    ' · faltan '+g.d+' días ('+g.f+') — '+g.nombres.join('; ')));
  console.log('\nCómo se mete: se busca el programa en la web del ayuntamiento o en la agenda');
  console.log('cultural, se abre `pegar-eventos.html`, se elige arriba **«el programa de UNAS');
  console.log('fiestas»**, se pega el texto, se corrige lo que haga falta y se baja el fichero.');
  console.log('Ese fichero es el que entra con `node eventos.js programa.json`.');
}else{
  console.log('Fiestas en los próximos '+dias+' días SIN programa cargado:');
  if(!lista.length) console.log('   (ninguna · todo lo que viene lo tiene)');
  lista.forEach(g=>console.log('   '+(g.gorda?'★ ':'· ')+String(g.d).padStart(3)+
    ' días  '+g.f+'  '+g.m.padEnd(28)+g.nombres[0].slice(0,46)));
  console.log('\nActos cargados ahora mismo: '+ACTOS.length+
    ' de '+[...new Set(ACTOS.map(a=>a.m))].length+' municipios.');
}

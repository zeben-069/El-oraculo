/* vigilar-agenda.js — «¿hay algo nuevo en la agenda?», una vez por semana.
   ------------------------------------------------------------------
   Zeben pidió que alguien mirase lagenda.org y le avisara de las novedades de
   Tenerife. Desde el contenedor de trabajo no se puede —la red está cerrada,
   403 en el CONNECT—, pero la máquina de GitHub que ya manda el aviso de las
   fiestas sí tiene internet. Así que lo hace ella, una vez a la semana.

   Lo que hace y lo que NO hace, que la diferencia importa:

   · Lee las tres páginas de zona de Tenerife —norte, sur y metropolitano—,
     saca los enlaces de programación y se queda con el NÚMERO del final, que
     es lo único estable: los títulos y el diseño cambian, el id no.
   · Compara con los que ya se habían visto y canta SOLO los nuevos.
   · Y ahí se para. No mete nada en el catálogo. Lo que hay detrás de un
     enlace es texto de una web ajena, y eso no entra en Naira sin que alguien
     lo mire: el aviso dice DÓNDE mirar, y el programa se sigue pegando a mano
     en pegar-eventos.html. Es la misma regla de siempre.

   No guarda ningún fichero de estado: los ids vistos viajan dentro del propio
   asunto de GitHub, en un comentario oculto. Así la nota y su memoria son la
   misma cosa y el robot no tiene que escribir en el repositorio.

       node vigilar-agenda.js                      lista lo que hay
       node vigilar-agenda.js --vistos 43577,43292 solo lo nuevo, en markdown
       node vigilar-agenda.js --sembrar            apunta lo que hay hoy y calla

   Lo de --sembrar es para la primera vez: sin ello, el primer aviso serían
   los cien eventos que haya colgados ese día, y un correo así no se lee.  */

const ZONAS=[
  ['norte',        'https://lagenda.org/programacion/norte'],
  ['sur',          'https://lagenda.org/programacion/sur'],
  ['metropolitano','https://lagenda.org/programacion/metropolitano']
];
/* Una identificación honrada y un solo barrido por semana. Es la web de otro. */
const UA='NairaBot/1.0 (aviso semanal de fiestas de Tenerife; +https://github.com/zeben-069/El-oraculo)';

/* Lo que de verdad le interesa: fiestas de pueblo con programa. Lo demás
   —un concierto, una exposición— sale igual, pero detrás. */
/* Ojo con esto: «san-» y «santa-» estaban aquí y marcaban como fiesta el
   «Distrito Joven Santa Cruz», que es un ciclo de conciertos. Los nombres de
   pueblo salen en media isla. Las fiestas de San Miguel se cazan igual por el
   «fiesta» del propio nombre. */
const ES_FIESTA=/fiesta|romeri|verbena|patron|carmen|cristo|virgen|feria|corpus|carnaval|bajada|luchada|procesion/i;

const arg=n=>{const i=process.argv.indexOf(n);return i>0?process.argv[i+1]:null;};
const vistos=new Set(String(arg('--vistos')||'').split(/[^0-9]+/).filter(Boolean));
const soloNuevos=process.argv.includes('--vistos');
const sembrar=process.argv.includes('--sembrar');

/* El título sale del PROPIO ENLACE, no del texto del <a>. Probado contra la
   página de verdad: la mitad de los enlaces son una foto y no llevan texto, y
   de los que llevan, uno era el «info@lagenda.org» del pie. El trocito de URL
   —fiestas-de-el-socorro-2026-tegueste-septiembre— siempre está y siempre dice
   lo que es. */
const limpia=s=>String(s).replace(/<[^>]*>/g,' ').replace(/&[a-z]+;|&#\d+;/gi,' ')
  .replace(/\s+/g,' ').trim();
const deSlug=u=>{const s=limpia(decodeURIComponent(u.split('/').pop().replace(/-\d+$/,'')).replace(/-/g,' '));
  return s?s[0].toUpperCase()+s.slice(1):'(sin nombre)';};

async function lee(url){
  const r=await fetch(url,{headers:{'user-agent':UA,'accept':'text/html'},
    redirect:'follow',signal:AbortSignal.timeout(25000)});
  if(!r.ok) throw new Error('HTTP '+r.status);
  return await r.text();
}

(async()=>{
  const hallados=new Map(); const fallos=[];
  for(const [zona,url] of ZONAS){
    let html;
    try{ html=await lee(url); }
    catch(e){ fallos.push(zona+': '+e.message); continue; }
    /* enlace de programación con su número al final; el título es lo que
       lleva dentro el <a>, si es que lleva algo */
    const re=/href="((?:https?:\/\/lagenda\.org)?\/programacion\/[a-z0-9-]*?-(\d{3,}))"/gi;
    let m;
    while((m=re.exec(html))){
      const id=m[2];
      if(hallados.has(id)) continue;
      const u=m[1].startsWith('http')?m[1]:'https://lagenda.org'+m[1];
      hallados.set(id,{id,url:u,zona,titulo:deSlug(u).slice(0,110)});
    }
    /* una pausa corta entre páginas: son tres peticiones a la semana, pero
       aun así no se le entra a nadie a ráfagas */
    await new Promise(ok=>setTimeout(ok,1500));
  }

  const todo=[...hallados.values()];
  const nuevos=soloNuevos?todo.filter(x=>!vistos.has(x.id)):todo;
  nuevos.sort((a,b)=>(ES_FIESTA.test(b.url)?1:0)-(ES_FIESTA.test(a.url)?1:0)||(+b.id)-(+a.id));

  if(sembrar){
    /* Si el primer barrido no lee nada, mejor no crear el asunto con la
       memoria vacía: se calla, y la semana que viene lo intenta otra vez. */
    if(!todo.length){ console.error('no he podido leer nada: '+fallos.join(' | ')); return; }
    console.log('Aquí le voy a avisar de lo que salga nuevo en **lagenda.org** (zonas norte,');
    console.log('sur y metropolitano), una vez por semana.\n');
    console.log('De arranque me he apuntado los **'+todo.length+'** que hay colgados hoy, para no');
    console.log('mandarle un correo de cien líneas. A partir de ahora solo le digo los nuevos.');
    if(fallos.length) console.log('\n(no pude leer: '+fallos.join(' | ')+')');
    console.log('\n<!-- vistos: '+todo.map(x=>x.id).join(',')+' -->');
    return;
  }
  if(!soloNuevos){
    console.log('Encontrados '+todo.length+' eventos en las tres zonas de Tenerife'+
      (fallos.length?'  ·  fallos: '+fallos.join(' | '):'')+'\n');
    nuevos.forEach(x=>console.log((ES_FIESTA.test(x.url)?'★ ':'· ')+x.id.padEnd(7)+
      x.zona.padEnd(15)+x.titulo.slice(0,64)));
    return;
  }

  /* Si no se pudo leer NADA, se dice. Callarse sería lo peor: parecería que
     no hay novedades cuando lo que pasa es que la web ya no se deja leer.
     Como el aviso solo se comenta cuando el texto cambia, esto avisa una vez
     y luego se queda quieto mientras siga fallando. */
  if(!todo.length){
    console.log('**No he podido leer lagenda.org esta semana.**\n');
    fallos.forEach(f=>console.log('- '+f));
    console.log('\nPuede ser un fallo pasajero o puede que la web haya cambiado o');
    console.log('nos esté bloqueando. Si se repite varias semanas, hay que mirarlo.');
    console.log('\n<!-- vistos: '+[...vistos].join(',')+' -->');
    return;
  }
  if(!nuevos.length) return;           /* sin novedades no se escribe nada */

  console.log('Novedades en **lagenda.org** ('+nuevos.length+
    (nuevos.length===1?' evento nuevo':' eventos nuevos')+' en Tenerife):\n');
  nuevos.forEach(x=>console.log('- '+(ES_FIESTA.test(x.url)?'**⭐ ':'')+x.titulo+
    (ES_FIESTA.test(x.url)?'**':'')+' · '+x.zona+'  \n  '+x.url));
  console.log('\nLas marcadas con ⭐ huelen a fiesta de pueblo con programa, que es lo que');
  console.log('le sirve a Naira. Se abre el enlace, se copia el programa, se pega en');
  console.log('`pegar-eventos.html` eligiendo **«el programa de UNAS fiestas»**, y el fichero');
  console.log('que se baja es el que entra. Nada de esto entra solo: lo mira usted.');
  if(fallos.length) console.log('\n(no pude leer: '+fallos.join(' | ')+')');
  console.log('\n<!-- vistos: '+[...new Set([...vistos,...todo.map(x=>x.id)])].join(',')+' -->');
})();

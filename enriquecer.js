/* enriquecer.js — el encargo de los miradores y las áreas recreativas.

   DE DÓNDE VIENE. Zeben preguntó si teníamos algo del Parque de Las Mesas, en
   Los Campitos. Sí: dos fichas —«Mirador de Parque Las Mesas» y «Mirador de Los
   Campitos»—, las dos de los datos abiertos del Ayuntamiento de Santa Cruz y
   las dos fichadas como **Mirador**, 35 minutos y franja de atardecer. O sea
   que Naira ofrece asomarse a ver la vista y **nunca ir a pasar el día**, que
   es justo lo que él describía. Y del Cabildo no hay nada de ese sitio: ni
   equipamientos, ni puntos de interés, ni afluencia — solo paradas de guagua.
   Entonces dijo: «qué miradores y parques recreativos tiene, y yo hago un
   artefacto que complete la información que te falta».

   LO QUE ESTÁ MEDIDO, que es lo que decide qué se pregunta:
   · **88 miradores.** 63 sin `fx` (qué se ve), 87 sin `ninos`, 41 con la
     carretera marcada de curvas y 12 con aviso. Todos con `dur:35` y franja
     de atardecer, escritos de una tirada.
   · **14 áreas recreativas.** Todas con `dur:70`, `ninos:'Sí'` y la MISMA
     frase de plantilla —«Zona recreativa del Cabildo en X, con mesas y sitio
     para pasar el día»—. Ninguna dice si hay fogales ni si hacen falta.

   LO QUE NO SE PIDE, Y POR QUÉ. Esto es la mitad que importa:
   · **Coordenadas, NUNCA.** 41 miradores llevan `pos_aprox` y da rabia, pero
     un punto no se adivina: ya costó lo de Los Abrigos, donde vinieron dos
     versiones a 16,8 km una de otra y las dos estaban mal. Para eso está
     `buscar-miradores.html`, que se lo pregunta a OpenStreetMap.
   · **`aparca` y `espacio`: no los lee nadie.** Comprobado sobre el motor:
     cero apariciones. Pedir lo que nadie lee es pedir trabajo a cambio de
     nada, que es la lección de `ninos.js`.
   · **Paradas de guagua, líneas y fotos.** Ya tienen su herramienta
     (`guaguas.js`, `fotos.js`) y salen de un dato oficial, no de la memoria.
   · **Horarios que no se puedan confirmar.** Un mirador no cierra; si alguno
     tiene cancela, eso es `seg_tipo:'acceso'`, no un horario inventado.

       node enriquecer.js encargo          escribe enriquecer-encargo.md
       node enriquecer.js datos.json       ensayo: dice qué cambiaría
       node enriquecer.js datos.json meter lo aplica
       node enriquecer.js datos.json meter corrige  también lo que cambia algo ya escrito

   Y **lista y espera**, como todo lo de esta casa: lo que venga en blanco se
   queda como está, y lo que choque con algo ya escrito se canta y no se pisa.
*/
const fs=require('fs'), path=require('path');
const RAIZ=__dirname;
const c=require(path.join(RAIZ,'banco.js'));
const TIPOS=['Mirador','Área recreativa'];

/* Los campos que el motor SÍ lee, con lo que hace cada uno. Esto es lo que
   se copia al encargo: si alguien añade un campo aquí sin que el motor lo
   lea, está pidiendo trabajo para nada. */
const CAMPOS=[
  ['fx',       'Qué se ve o qué hay. Una o dos frases, de quien ha estado.'],
  ['tipo',     'SOLO si la ficha está mal clasificada (p.ej. es un parque donde se pasa el rato, no un mirador).'],
  ['dur',      'Minutos que se está allí de verdad.'],
  ['ninos',    '«Sí» / «Con cuidado» / «NO».'],
  ['carretera','«dura» si se llega por carretera de curvas.'],
  ['carretera_nota','Media frase que lo explique.'],
  ['seg',      'Lo que hay que saber, en una frase.'],
  ['seg_tipo', '«peligro» / «acceso» / «precaucion» / «nota».'],
  ['res',      '1 si hace falta permiso o reserva.'],
  ['res_texto','Qué permiso y dónde se pide.'],
  ['flex',     '1 si el sitio vale a cualquier hora del día.']
];

const norm=t=>String(t||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  .toLowerCase().replace(/[^a-z0-9]/g,'');

function encargo(){
  const L=c.LUGARES.filter(l=>TIPOS.includes(l.tipo));
  const porPueblo={};
  L.forEach(l=>(porPueblo[l.m]=porPueblo[l.m]||[]).push(l));
  const pueblos=Object.keys(porPueblo).sort((a,b)=>a.localeCompare(b,'es'));

  const F=[];
  F.push('# Miradores y áreas recreativas — lo que falta\n');
  F.push('Esto es un **encargo para otro** (Claude en Cowork, por ejemplo): la lista');
  F.push('de las '+L.length+' fichas de Naira que son un mirador o un área recreativa, con lo');
  F.push('que ya sabemos de cada una y los huecos. **Se rellena solo lo que se sepa de');
  F.push('verdad.** Lo que quede en blanco se queda como está, y eso está bien: una');
  F.push('ficha a medias es mejor que una ficha inventada.\n');

  F.push('## Las reglas, que son la mitad del encargo\n');
  F.push('**1 · No se inventa nada.** Si no se sabe si un mirador tiene barandilla, se');
  F.push('deja en blanco. Naira presume de que todo lo que dice sale de su ficha, y una');
  F.push('frase inventada se la cree el turista, va, y no lo reconoce.\n');
  F.push('**2 · Tiene que ser de ESE sitio exacto.** Hay dos «Montaña Negra» en la isla y');
  F.push('tres «Museo Etnográfico». El nombre solo no basta: cada ficha trae abajo su');
  F.push('municipio y sus coordenadas para no confundirla.\n');
  F.push('**3 · Coordenadas, paradas de guagua y fotos: NO.** No se piden y no se');
  F.push('aceptan. Los puntos salen de OpenStreetMap por su propia página, las paradas');
  F.push('del GTFS de TITSA y las fotos de Commons con su autor. Un par de grados');
  F.push('decimales escritos de memoria mueve el día entero al sitio equivocado.\n');
  F.push('**4 · Cuidado con `ninos:"Con cuidado"`, que es una penalización de');
  F.push('SEGURIDAD.** No significa «aquí un crío se aburre»: le resta puntos por riesgo');
  F.push('y en una playa o un charco saca la ficha del día. Si el sitio simplemente no');
  F.push('tiene nada que hacer para un niño, **se deja en blanco**.\n');
  F.push('**5 · Y `seg` no es siempre un peligro.** Es el campo de «hay algo que decir», y');
  F.push('`seg_tipo` dice de qué clase:\n');
  F.push('| `seg_tipo` | qué es | ejemplo |');
  F.push('|---|---|---|');
  F.push('| `peligro` | de verdad peligroso | «el borde no tiene barandilla y cae a pico» |');
  F.push('| `acceso` | cómo se llega | «los últimos 800 m son pista de tierra» |');
  F.push('| `precaucion` | se va igual, pero con niños hay que estar encima | «el murete es bajo» |');
  F.push('| `nota` | no avisa de nada, solo está bien saberlo | «hay cafetería al lado» |\n');
  F.push('Sin `seg_tipo` se trata como **peligro**, que es lo prudente. Poner `peligro`');
  F.push('donde no lo hay hace que Naira avise de algo que no pasa.\n');
  F.push('**6 · Se escribe en español.** Naira traduce al contarlo; las notas del catálogo');
  F.push('viven en español y se traducen al vuelo, nunca por plantilla.\n');

  F.push('## Cómo se devuelve\n');
  F.push('Un JSON con una lista de objetos. **El `n` tiene que ser el nombre exacto** tal');
  F.push('y como sale en esta lista, que es por donde se empareja. Solo se ponen los');
  F.push('campos que se sepan; lo demás se omite.\n');
  F.push('```json');
  F.push('[');
  F.push('  {');
  F.push('    "n": "Mirador de Parque Las Mesas",');
  F.push('    "tipo": "Área recreativa",');
  F.push('    "dur": 120,');
  F.push('    "fx": "Parque grande sobre la ciudad, con merendero, zona de juegos y el mirador al fondo.",');
  F.push('    "ninos": "Sí",');
  F.push('    "flex": 1');
  F.push('  },');
  F.push('  {');
  F.push('    "n": "Mirador de Chipeque",');
  F.push('    "carretera": "dura",');
  F.push('    "carretera_nota": "Se sube por la TF-24, de curvas cerradas.",');
  F.push('    "seg": "El borde no tiene barandilla.",');
  F.push('    "seg_tipo": "precaucion"');
  F.push('  }');
  F.push(']');
  F.push('```\n');
  F.push('Campos que se aceptan, y nada más:\n');
  CAMPOS.forEach(([k,d])=>F.push('- **`'+k+'`** — '+d));
  F.push('');
  F.push('Se devuelve con `node enriquecer.js ese-fichero.json` (ensayo) y luego `meter`.\n');
  F.push('---\n');

  let sinFx=0, sinNinos=0;
  pueblos.forEach(p=>{
    const l=porPueblo[p].sort((a,b)=>a.n.localeCompare(b.n,'es'));
    F.push('## '+p+' ('+l.length+')\n');
    l.forEach(x=>{
      F.push('### '+x.n);
      const ya=[];
      ya.push('tipo: '+x.tipo);
      ya.push('dura '+x.dur+' min');
      ya.push('franja: '+x.fr);
      if(x.flex) ya.push('vale a cualquier hora');
      if(x.ninos) ya.push('niños: '+x.ninos);
      if(x.carretera==='dura') ya.push('carretera de curvas');
      if(x.res) ya.push('con permiso');
      F.push('- **ya tiene:** '+ya.join(' · '));
      if(x.fx)  F.push('- *qué se ve:* '+x.fx);
      if(x.no)  F.push('- *nota:* '+x.no);
      if(x.seg) F.push('- *aviso ('+(x.seg_tipo||'sin clasificar')+'):* '+x.seg);
      const falta=[];
      if(!x.fx){falta.push('**qué se ve / qué hay**');sinFx++;}
      if(!x.ninos&&!x.ninos_visto){falta.push('**con niños**');sinNinos++;}
      if(x.tipo==='Área recreativa'&&!x.res) falta.push('**¿hacen falta los fogales? ¿se pide permiso?**');
      if(falta.length) F.push('- **falta:** '+falta.join(' · '));
      /* Las coordenadas van SOLO para poder distinguir dos sitios con el
         mismo nombre. No se piden de vuelta ni se aceptan. */
      F.push('- <sub>'+x.m+' · '+(x.la!=null?x.la.toFixed(4)+', '+x.lo.toFixed(4):'sin punto')
        +(x.pos_aprox?' (posición aproximada — NO la corrijas aquí)':'')+'</sub>');
      F.push('');
    });
  });
  const dest=path.join(RAIZ,'enriquecer-encargo.md');
  fs.writeFileSync(dest,F.join('\n'));
  console.log('enriquecer-encargo.md · '+L.length+' fichas de '+pueblos.length+' municipios');
  console.log('  '+c.LUGARES.filter(l=>l.tipo==='Mirador').length+' miradores · '+
    c.LUGARES.filter(l=>l.tipo==='Área recreativa').length+' áreas recreativas');
  console.log('  sin «qué se ve»: '+sinFx+' · sin decir nada de niños: '+sinNinos);
}

/* ── LA VUELTA: meter lo que venga ───────────────────────────────────────── */
const PERMITE={fx:1,tipo:1,dur:1,ninos:1,carretera:1,carretera_nota:1,seg:1,
  seg_tipo:1,res:1,res_texto:1,flex:1};
const VALE_NINOS=['Sí','Con cuidado','NO'];
const VALE_SEG=['peligro','acceso','precaucion','nota'];

function aplicar(ruta,hazlo,corrige){
  let D; try{ D=JSON.parse(fs.readFileSync(ruta,'utf8').replace(/^\uFEFF/,'')); }
  catch(e){ console.log('No se puede leer ese JSON: '+e.message); process.exit(1); }
  if(!Array.isArray(D)){ console.log('Tiene que ser una lista de objetos.'); process.exit(1); }
  const porNombre={}; c.LUGARES.forEach(l=>porNombre[norm(l.n)]=l);
  const cambios=[], quejas=[], choca=[];
  D.forEach(d=>{
    const l=porNombre[norm(d.n)];
    if(!l){ quejas.push('no existe ninguna ficha llamada «'+d.n+'»'); return; }
    if(!TIPOS.includes(l.tipo)&&!d.tipo){
      quejas.push('«'+l.n+'» no es un mirador ni un área recreativa: se salta'); return; }
    const pone={};
    Object.keys(d).forEach(k=>{
      if(k==='n') return;
      if(!PERMITE[k]){ quejas.push('«'+l.n+'»: el campo `'+k+'` no se acepta'); return; }
      let v=d[k];
      if(k==='ninos'&&VALE_NINOS.indexOf(v)<0){ quejas.push('«'+l.n+'»: ninos «'+v+'» no vale'); return; }
      if(k==='seg_tipo'&&VALE_SEG.indexOf(v)<0){ quejas.push('«'+l.n+'»: seg_tipo «'+v+'» no vale'); return; }
      if(k==='carretera'&&v!=='dura'){ quejas.push('«'+l.n+'»: carretera solo puede ser «dura»'); return; }
      if(k==='dur'){ v=parseInt(v,10); if(!(v>0&&v<=600)){ quejas.push('«'+l.n+'»: dur raro'); return; } }
      if(l[k]!=null&&String(l[k])===String(v)) return;   // ya lo tenía igual
      /* LO QUE YA ESTÁ ESCRITO NO SE PISA **SIN ENSEÑARLO**, que es distinto
         de no pisarlo nunca. Aquí no valía la regla de `guaguas.js` —el `bus`
         no se toca porque se recalcula solo—: esto es Zeben corrigiendo una
         ficha, y **todas** llevan ya `tipo`, `dur` y `fr` escritos de una
         tirada. Con la regla dura, el caso que motivó la herramienta —el
         Parque Las Mesas, fichado como mirador de 35 minutos siendo un parque
         donde se echa la mañana— no se podría arreglar nunca.
         Así que: se apartan, se cantan, y hace falta decir «corrige» a
         propósito para aplicarlas. Lista y espera, como todo aquí. */
      if(l[k]!=null&&l[k]!==''){ choca.push({l,k,v,antes:l[k]}); return; }
      pone[k]=v;
    });
    /* Un aviso sin clasificar SE TRATA COMO PELIGRO, así que esto no se
       queda en un aviso por pantalla: se **tira**. Avisarlo y escribirlo
       igual era lo peor de los dos mundos — se vio probándolo, y Naira habría
       acabado diciendo que un escalón es un peligro. */
    if(pone.seg&&!pone.seg_tipo&&!l.seg_tipo){
      quejas.push('«'+l.n+'»: viene `seg` sin `seg_tipo` — sin clasificar cuenta como PELIGRO, así que NO se mete');
      delete pone.seg;
    }
    if(Object.keys(pone).length) cambios.push({l,pone});
  });

  console.log(D.length+' fichas en el fichero · '+cambios.length+' con huecos que rellenar\n');
  cambios.forEach(({l,pone})=>console.log('  '+l.n+'\n      '+
    Object.entries(pone).map(([k,v])=>k+'='+JSON.stringify(v)).join('\n      ')));
  if(choca.length){
    console.log('\nY '+choca.length+' que CAMBIAN algo ya escrito. Esto lo decide usted:');
    choca.forEach(x=>console.log('  · '+x.l.n+' · `'+x.k+'`\n      ahora: '+JSON.stringify(x.antes)
      +'\n      vendría: '+JSON.stringify(x.v)));
    if(corrige) console.log('  → con «corrige» puesto, estas TAMBIÉN se escriben.');
    else console.log('  → se quedan como están. Para aplicarlas: … meter corrige');
  }
  if(quejas.length){
    console.log('\nLo que no se puede meter ('+quejas.length+'):');
    quejas.forEach(q=>console.log('  · '+q));
  }
  if(!hazlo){ console.log('\n(ensayo — no se ha tocado nada; añade «meter» para escribirlo)'); return; }
  if(corrige){
    const porFicha={};
    choca.forEach(x=>{ porFicha[x.l.n]=porFicha[x.l.n]||{l:x.l,pone:{}}; porFicha[x.l.n].pone[x.k]=x.v; });
    Object.values(porFicha).forEach(x=>{
      const ya=cambios.find(y=>y.l.n===x.l.n);
      if(ya) Object.assign(ya.pone,x.pone); else cambios.push(x);
    });
  }
  escribir(cambios);
}

/* Se escribe contando niveles de llave y no con una expresión regular de
   `[^{}]*`: desde que las fichas llevan `lleno:{…}` dentro, ese recorte se
   queda a medias y no encuentra la ficha. Costó un rato verlo. */
function escribir(cambios){
  const F=path.join(RAIZ,'datos','lugares.js');
  let t=fs.readFileSync(F,'utf8'); let hechas=0, perdidas=[];
  cambios.forEach(({l,pone})=>{
    const marca='"n":"'+l.n+'"', marca2="n:'"+l.n+"'";
    let i=t.indexOf(marca); if(i<0) i=t.indexOf(marca2);
    if(i<0){ perdidas.push(l.n); return; }
    let a=i,d=0;
    for(;a>=0;a--){ const ch=t[a]; if(ch==='}')d++; else if(ch==='{'){ if(!d) break; d--; } }
    let b=a,n=0;
    for(;b<t.length;b++){ const ch=t[b]; if(ch==='{')n++; else if(ch==='}'){ n--; if(!n){ b++; break; } } }
    const cuerpo=t.slice(a,b-1);
    const extra=Object.entries(pone).map(([k,v])=>','+k+':'+JSON.stringify(v)).join('');
    t=t.slice(0,a)+cuerpo+extra+'}'+t.slice(b);
    hechas++;
  });
  fs.writeFileSync(F,t);
  console.log('\nEscritas '+hechas+' fichas.');
  if(perdidas.length) console.log('No se encontró: '+perdidas.join(', '));
}

const arg=process.argv[2];
if(arg==='encargo') encargo();
else if(arg) aplicar(arg, process.argv[3]==='meter', process.argv[4]==='corrige');
else console.log('  node enriquecer.js encargo\n  node enriquecer.js datos.json [meter [corrige]]');

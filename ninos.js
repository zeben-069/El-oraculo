#!/usr/bin/env node
/* ninos.js — qué fichas valen con niños, y que lo diga quien lo sabe
   ══════════════════════════════════════════════════════════════════
   Esto sale de una frase de Zeben: «el MUNA también es un museo que está muy
   guapo para visitar con los niños, no sé si lo tienes metido». Estaba metido
   —con su foto, su crédito y hasta su dato curioso de las momias guanches—
   pero **sin `ninos`**, y por eso no salía nunca en un plan con niños.

   Por qué duele tanto ese campo vacío. El motor da, con niños:
     +9  a lo marcado «Sí» de tipo Playa/Charco/Piscina/Parque/Museo/Jardín
     +3  a todo lo marcado «Sí»
     +7  a lo que lleva la etiqueta `diversion`
   Una ficha sin marcar sale a competir con **hasta 19 puntos menos**, y el
   peso base de un museo bueno es 3,5 × 3 = 10,5. O sea que no es que pierda:
   es que no juega. El MUNA salía en 2 de 20 planes de prueba y con la marca
   pasa a 6.

   Y no es una ficha: de las 150 de esos tipos, **32 están sin marcar y 26 son
   museos**. Las playas y los charcos los repasó alguien en su día; los museos
   no. Eso es un campo escrito a mano que se pudre, igual que los `lug`/`rest`
   de `BASES` — pero **con una diferencia que manda**: aquello se podía contar
   del catálogo y esto no. Si un museo está guapo con un crío de siete años no
   lo dice ni el peso ni el tipo ni el Cabildo: lo dice quien ha estado.

   ── Y el vocabulario estaba MAL, lo corrigió él al rellenarla ──
   La primera versión ofrecía «Sí / cuidado / NO» y explicaba `cuidado` como
   «se puede ir, pero hay que tenerlos encima». Zeben lo rellenó y dijo: **«De
   resto todo bien; algún cuidado es por el aburrimiento, no porque sea
   peligroso»**. Y eso es un problema de verdad, no de redacción, porque
   `Con cuidado` en el motor **es una penalización de seguridad**:
     −6 con niños, y −12 si además tiene aviso de peligro
     y en un Charco o una Playa con `seg`, **queda excluido del día**
     y el motivo viaja al informe con `clase:'peligro'`
   O sea que marcar «cuidado» un museo aburrido le mete un castigo de riesgo a
   un sitio donde no hay riesgo ninguno, y Naira podría acabar avisando de algo
   que no pasa. Es el mismo fallo que ya está apuntado en `seg` —«en `seg` no
   todo es un peligro»— repitiéndose en otro campo.
   **Y el estado que hacía falta ya existía: no marcar nada.** Una ficha sin
   `ninos` no gana los +9/+3 y no pierde nada, que es exactamente «aquí un crío
   se aburre pero no pasa nada». Lo único que faltaba era **poder decir que ya
   se ha mirado**, para que no vuelva a salir en la lista la próxima vez. Eso es
   `ninos_visto`, un campo que **el motor no lee** y que solo existe para cerrar
   el ciclo de esta herramienta.
   Así que las casillas son ahora cuatro y cada una escribe una cosa distinta:
     Sí          → ninos:'Sí'            (+9 y +3)
     se aburren  → ninos_visto:1         (nada, y deja de preguntarse)
     cuidado     → ninos:'Con cuidado'   (−6 / −12, y es POR RIESGO)
     NO          → ninos:'NO'            (fuera, y se cuenta como aviso)

   ── Y no se pregunta por lo que el motor no va a ofrecer nunca ──
   En la primera lista iba la **Playa de Troche**, que está marcada `cerrado`:
   «DE USO PROHIBIDO en el registro oficial de zonas de baño». El motor la
   excluye del catálogo entero, así que preguntar si es buena con niños era
   hacerle perder el tiempo con una ficha que no sale jamás. Las cerradas se
   saltan.

   Así que la herramienta **lista y espera**, como `municipios-dudosos.md` y
   `actos-parecidos.md`:

       node ninos.js                       escribe ninos-sin-marcar.md
       node ninos.js meter ninos-sin-marcar.md   mete lo marcado

   Lo que no se marque se queda como está, que es lo de hoy: sin marcar. No
   hay manera de empeorar nada dejándolo a medias.

   Y una cosa que NO hace, a propósito: **no adivina**. Sería facilísimo marcar
   «Sí» todo lo que sea Museo y no tenga aviso de seguridad, y sería la regla
   de la casa rota por dentro — el mismo error que marcar una playa como buena
   para bañarse porque tiene arena. */

const fs=require('fs'), path=require('path');
const RAIZ=__dirname;

/* Los tipos que el motor premia con niños. Fuera de esta lista la marca no
   cambia el orden del día, así que preguntar por ellos sería pedirle trabajo
   a cambio de nada. */
const PREMIA=/Playa|Charco|Piscina|Parque|Museo|Jardín/;

function lugares(){
  const txt=fs.readFileSync(path.join(RAIZ,'datos/lugares.js'),'utf8');
  return eval(txt+';LUGARES');
}

function lista(){
  const L=lugares();
  /* Las cerradas fuera: el motor no las ofrece nunca, así que preguntar por
     ellas es pedir trabajo por nada. Y `ninos_visto` es «ya lo miré y no es de
     niños, pero tampoco pasa nada»: no vuelve a salir. */
  const dentro=L.filter(l=>PREMIA.test(l.tipo||'')&&!l.cerrado);
  const sin=dentro.filter(l=>!l.ninos&&!l.ninos_visto);
  if(!sin.length) return console.log('no queda ninguna sin marcar de los tipos que el motor premia.');

  /* Agrupadas por pueblo, que es como se leen: quien vive aquí repasa «los de
     La Laguna» de una vez y no una lista de treinta sueltos por orden de peso.
     Es la misma razón por la que `municipios-dudosos.md` va por nidos. */
  const por={};
  sin.forEach(l=>{ (por[l.m]=por[l.m]||[]).push(l); });
  const pueblos=Object.keys(por).sort((a,b)=>por[b].length-por[a].length||a.localeCompare(b,'es'));

  let t='# Qué vale con niños, y qué no\n\n'+
    'Estas **'+sin.length+' fichas** son de los tipos que el motor premia cuando el plan es\n'+
    'con niños —playa, charco, piscina, parque, museo, jardín— y **no dicen nada**\n'+
    'sobre si valen. Sin decirlo salen a competir con hasta 19 puntos menos, o sea\n'+
    'que en la práctica no salen: es lo que le pasaba al MUNA, que está fichado\n'+
    'con foto y con sus momias guanches y no aparecía en ningún plan de familia.\n\n'+
    'Marca **una** casilla de cada ficha y luego:\n\n'+
    '    node ninos.js meter ninos-sin-marcar.md\n\n'+
    'Lo que no marques se queda igual y volverá a salir la próxima vez.\n\n'+
    '## Las cuatro casillas, que NO son lo mismo\n\n'+
    '· **Sí** — un crío está a gusto ahí. Sube mucho en el plan con niños.\n'+
    '· **se aburren** — no es para ellos, pero **no pasa nada**: no hay riesgo.\n'+
    '  No se castiga, solo deja de premiarse — y no vuelvo a preguntarte por ella.\n'+
    '  Esta es la que hay que usar para un museo de pintura o una casa señorial.\n'+
    '· **cuidado** — **es por RIESGO**, no por aburrimiento: hay que tenerlos\n'+
    '  encima (roques, borde de mar, desnivel, corriente). El motor le mete un\n'+
    '  castigo de seguridad y en una playa o un charco lo puede sacar del día.\n'+
    '· **NO** — ahí no se lleva a un niño, y Naira lo dice.\n\n'+
    'Y aparte de esas cuatro, **`divertido`**: los que un crío disfruta de verdad\n'+
    '—de tocar, de mirar con la boca abierta—. Son 7 puntos más y es lo que separa\n'+
    'el Museo de la Ciencia de la casa-museo de un coleccionista.\n\n';

  pueblos.forEach(m=>{
    t+='## '+m+'  ('+por[m].length+')\n\n';
    por[m].sort((a,b)=>(b.w||0)-(a.w||0)).forEach(l=>{
      t+='- **'+l.n+'** · _'+(l.tipo||'')+'_\n';
      /* El dato curioso o la descripción van AQUÍ y no en una columna aparte:
         es lo único que le recuerda de qué museo estamos hablando cuando hay
         veintiséis seguidos y tres se llaman «Museo Etnográfico». */
      const q=l.fx||l.desc||l.nota;
      if(q) t+='  > '+String(q).replace(/\s+/g,' ').slice(0,150)+'\n';
      t+='  - [ ] Sí   - [ ] se aburren   - [ ] cuidado   - [ ] NO   · y además: [ ] divertido\n\n';
    });
  });
  fs.writeFileSync(path.join(RAIZ,'ninos-sin-marcar.md'),t);
  console.log('ninos-sin-marcar.md · '+sin.length+' fichas de '+pueblos.length+' pueblos.');
  console.log('De ellas, museos: '+sin.filter(l=>/Museo/.test(l.tipo||'')).length+'.');
  console.log('\nSe abre, se marca una casilla por ficha y luego:');
  console.log('  node ninos.js meter ninos-sin-marcar.md');
}

/* Se lee lo marcado. El nombre va en negrita en su propia línea y las casillas
   en la de abajo, así que se recuerda el último nombre visto — que es lo que
   hace `municipios.js`, solo que allí el nombre y la casilla van juntos. */
function leer(f){
  const out=[]; let nom=null;
  fs.readFileSync(f,'utf8').split('\n').forEach(l=>{
    const n=l.match(/^-\s+\*\*(.+?)\*\*\s*·/);
    if(n){ nom=n[1]; return; }
    if(!nom||!/\[[xX]\]/.test(l)) return;
    /* Una ficha, un valor. Si se marcan dos —«Sí» y «NO»— no se toca: elegir
       por él sería peor que dejarlo, que es la regla de siempre. */
    const vals=[];
    if(/\[[xX]\]\s*Sí/.test(l)) vals.push('Sí');
    /* «se aburren» NO escribe `ninos`: escribe `ninos_visto`, que el motor no
       lee. Ver la cabecera — marcarlo «Con cuidado» le metería un castigo de
       seguridad a un sitio donde no hay riesgo ninguno. */
    if(/\[[xX]\]\s*se aburren/.test(l)) vals.push('(se aburren)');
    if(/\[[xX]\]\s*cuidado/.test(l)) vals.push('Con cuidado');
    if(/\[[xX]\]\s*NO/.test(l)) vals.push('NO');
    const div=/\[[xX]\]\s*divertido/.test(l);
    if(vals.length===1)
      out.push(vals[0]==='(se aburren)' ? {n:nom,visto:true,div} : {n:nom,ninos:vals[0],div});
    else if(vals.length>1) out.push({n:nom,choque:vals});
    else if(div) out.push({n:nom,div:true});
    nom=null;
  });
  return out;
}

function meter(f){
  if(!f||!fs.existsSync(f)) return console.log('no encuentro '+f);
  const marcadas=leer(f);
  const choques=marcadas.filter(x=>x.choque);
  const buenas=marcadas.filter(x=>!x.choque);
  if(choques.length){
    console.log('CON DOS CASILLAS MARCADAS, no se tocan: '+choques.length);
    choques.forEach(x=>console.log('   · '+x.n+' → '+x.choque.join(' y ')));
    console.log('');
  }
  if(!buenas.length) return console.log('no hay ninguna marcada.');

  const fi=path.join(RAIZ,'datos/lugares.js');
  let txt=fs.readFileSync(fi,'utf8');
  const hechos=[], fallan=[];
  for(const x of buenas){
    const nom=x.n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    /* Se busca la ficha entera por su nombre EXACTO. Si el nombre sale dos
       veces no se toca: escribir en la que no era es peor que dejarlo. */
    const re=new RegExp('\\{"n":"'+nom+'"[^{]*?\\}','g');
    const trozos=txt.match(re)||[];
    if(trozos.length!==1){ fallan.push(x.n+' (sale '+trozos.length+' veces)'); continue; }
    let ficha=trozos[0];
    /* Mirado y no es de niños: no se toca `ninos` —el motor lo trata igual que
       hoy, ni premio ni castigo— y solo se apunta que ya se miró. */
    if(x.visto && !/"ninos_visto":/.test(ficha)) ficha=ficha.replace(/\}$/,',"ninos_visto":1}');
    if(x.ninos){
      ficha=/"ninos":/.test(ficha)
        ? ficha.replace(/"ninos":"[^"]*"/,'"ninos":"'+x.ninos+'"')
        : ficha.replace(/^\{"n":"/,'{"n":"').replace(/\}$/,',"ninos":"'+x.ninos+'"}');
    }
    if(x.div){
      /* `diversion` son 7 puntos y vive en `et`, junto a «museos» o «playa».
         Si la ficha no tiene `et` se le crea; si ya lleva la etiqueta, se deja. */
      if(/"et":\[/.test(ficha)){
        if(!/"diversion"/.test(ficha)) ficha=ficha.replace(/"et":\[/,'"et":["diversion",');
      } else ficha=ficha.replace(/\}$/,',"et":["diversion"]}');
    }
    txt=txt.replace(trozos[0],ficha);
    hechos.push(x);
  }
  if(hechos.length) fs.writeFileSync(fi,txt);
  console.log('MARCADAS: '+hechos.length);
  hechos.forEach(x=>console.log('   · '+x.n+' → '+
    (x.ninos||(x.visto?'se aburren (mirado, no se toca el motor)':'(solo divertido)'))+
    (x.div&&(x.ninos||x.visto)?' + divertido':'')));
  if(fallan.length){
    console.log('\nNO SE PUDIERON TOCAR: '+fallan.length);
    fallan.forEach(s=>console.log('   · '+s));
  }
  console.log('\nPasa ahora: node lote.js');
}

const arg=process.argv[2];
if(arg==='meter') meter(process.argv[3]);
else lista();

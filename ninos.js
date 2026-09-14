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
  const dentro=L.filter(l=>PREMIA.test(l.tipo||''));
  const sin=dentro.filter(l=>!l.ninos);
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
    'Lo que no marques se queda como está, o sea sin decir nada, que es lo de hoy.\n'+
    'Y si además es de los que un crío disfruta de verdad —de tocar, de mirar con\n'+
    'la boca abierta— marca también **`divertido`**: eso son 7 puntos más y es lo\n'+
    'que separa el Museo de la Ciencia de una casa-museo de un coleccionista.\n\n'+
    '· **Sí** — un crío está a gusto ahí.\n'+
    '· **cuidado** — se puede ir, pero hay que tenerlos encima (roques, borde de mar,\n'+
    '  desnivel). El motor lo trata como «no es de niños», no como peligro.\n'+
    '· **NO** — ahí no se lleva a un niño.\n\n';

  pueblos.forEach(m=>{
    t+='## '+m+'  ('+por[m].length+')\n\n';
    por[m].sort((a,b)=>(b.w||0)-(a.w||0)).forEach(l=>{
      t+='- **'+l.n+'** · _'+(l.tipo||'')+'_\n';
      /* El dato curioso o la descripción van AQUÍ y no en una columna aparte:
         es lo único que le recuerda de qué museo estamos hablando cuando hay
         veintiséis seguidos y tres se llaman «Museo Etnográfico». */
      const q=l.fx||l.desc||l.nota;
      if(q) t+='  > '+String(q).replace(/\s+/g,' ').slice(0,150)+'\n';
      t+='  - [ ] Sí   - [ ] cuidado   - [ ] NO   · y además: [ ] divertido\n\n';
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
    if(/\[[xX]\]\s*cuidado/.test(l)) vals.push('Con cuidado');
    if(/\[[xX]\]\s*NO/.test(l)) vals.push('NO');
    const div=/\[[xX]\]\s*divertido/.test(l);
    if(vals.length===1) out.push({n:nom,ninos:vals[0],div});
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
  hechos.forEach(x=>console.log('   · '+x.n+' → '+(x.ninos||'(solo divertido)')+(x.div&&x.ninos?' + divertido':'')));
  if(fallan.length){
    console.log('\nNO SE PUDIERON TOCAR: '+fallan.length);
    fallan.forEach(s=>console.log('   · '+s));
  }
  console.log('\nPasa ahora: node lote.js');
}

const arg=process.argv[2];
if(arg==='meter') meter(process.argv[3]);
else lista();
